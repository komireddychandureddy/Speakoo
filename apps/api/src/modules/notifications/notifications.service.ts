import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';

export const NOTIFICATION_QUEUE = 'notifications';

export interface NotificationJobData {
  userId: string;
  bookingId: string;
  type: NotificationType;
  channel: NotificationChannel;
  scheduledFor?: Date;
  subjectOverride?: string;
  bodyOverride?: string;
  idempotencySuffix?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private deviceTokensTableReady?: Promise<void>;

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue<NotificationJobData>,
    private readonly prisma: PrismaService,
  ) {}

  private buildIdempotencyKey(data: NotificationJobData): string {
    const base = `${data.bookingId}:${data.userId}:${data.type}:${data.channel}`;
    return data.idempotencySuffix ? `${base}:${data.idempotencySuffix}` : base;
  }

  private async ensureDeviceTokensTable() {
    if (!this.deviceTokensTableReady) {
      this.deviceTokensTableReady = this.prisma
        .$executeRawUnsafe(
          `
        CREATE TABLE IF NOT EXISTS device_tokens (
          user_id UUID NOT NULL,
          token TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, token)
        )
      `,
        )
        .then(() => undefined);
    }
    await this.deviceTokensTableReady;
  }

  async scheduleBookingNotifications(bookingId: string, sessionStartTime: Date) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

    // Immediate notifications
    await this.enqueue({
      userId: booking.learnerId,
      bookingId,
      type: NotificationType.booking_confirmed,
      channel: NotificationChannel.email,
    });
    await this.enqueue({
      userId: booking.learnerId,
      bookingId,
      type: NotificationType.booking_confirmed,
      channel: NotificationChannel.push,
    });
    await this.enqueue({
      userId: booking.learnerId,
      bookingId,
      type: NotificationType.booking_confirmed,
      channel: NotificationChannel.whatsapp,
    });
    await this.enqueue({
      userId: booking.tutorId,
      bookingId,
      type: NotificationType.booking_confirmed,
      channel: NotificationChannel.email,
    });
    await this.enqueue({
      userId: booking.tutorId,
      bookingId,
      type: NotificationType.booking_confirmed,
      channel: NotificationChannel.push,
    });

    // Delayed reminders
    const reminder60 = new Date(sessionStartTime.getTime() - 60 * 60 * 1000);
    const reminder10 = new Date(sessionStartTime.getTime() - 10 * 60 * 1000);
    const now = Date.now();

    if (reminder60.getTime() > now) {
      const delay = reminder60.getTime() - now;

      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_60min,
          channel: NotificationChannel.email,
        },
        delay,
      );
      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_60min,
          channel: NotificationChannel.whatsapp,
        },
        delay,
      );
      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_60min,
          channel: NotificationChannel.push,
        },
        delay,
      );

      await this.enqueue(
        {
          userId: booking.tutorId,
          bookingId,
          type: NotificationType.reminder_60min,
          channel: NotificationChannel.email,
        },
        delay,
      );
      await this.enqueue(
        {
          userId: booking.tutorId,
          bookingId,
          type: NotificationType.reminder_60min,
          channel: NotificationChannel.push,
        },
        delay,
      );
    }

    if (reminder10.getTime() > now) {
      const delay = reminder10.getTime() - now;

      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_10min,
          channel: NotificationChannel.email,
        },
        delay,
      );
      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_10min,
          channel: NotificationChannel.push,
        },
        delay,
      );

      await this.enqueue(
        {
          userId: booking.tutorId,
          bookingId,
          type: NotificationType.reminder_10min,
          channel: NotificationChannel.email,
        },
        delay,
      );
      await this.enqueue(
        {
          userId: booking.tutorId,
          bookingId,
          type: NotificationType.reminder_10min,
          channel: NotificationChannel.push,
        },
        delay,
      );
    }
  }

  async sendSessionJoinNudge(params: {
    bookingId: string;
    targetUserId: string;
    message: string;
    senderUserId: string;
    channel?: NotificationChannel;
  }): Promise<void> {
    const channel = params.channel ?? NotificationChannel.push;
    const timeBucket = Math.floor(Date.now() / 60_000);

    await this.enqueue({
      userId: params.targetUserId,
      bookingId: params.bookingId,
      type: NotificationType.session_summary,
      channel,
      subjectOverride: 'Session started, please join',
      bodyOverride: params.message,
      idempotencySuffix: `session-nudge:${params.senderUserId}:${timeBucket}`,
    });
  }

  async registerDeviceToken(userId: string, token: string): Promise<{ registered: boolean }> {
    await this.ensureDeviceTokensTable();
    await this.prisma.$executeRaw`
      INSERT INTO device_tokens (user_id, token)
      VALUES (${userId}::uuid, ${token})
      ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id
    `;
    return { registered: true };
  }

  async getDeviceTokens(userId: string): Promise<string[]> {
    await this.ensureDeviceTokensTable();
    const rows = await this.prisma.$queryRaw<{ token: string }[]>`
      SELECT token FROM device_tokens WHERE user_id = ${userId}::uuid
    `;
    return rows.map((row) => row.token);
  }

  async cancelBookingNotifications(bookingId: string) {
    const jobs = await this.queue.getJobs(['delayed', 'waiting']);
    for (const job of jobs) {
      if (job.data.bookingId === bookingId) {
        await job.remove();
      }
    }
  }

  private async enqueue(data: NotificationJobData, delayMs = 0) {
    const idempotencyKey = this.buildIdempotencyKey(data);

    const alreadySent = await this.prisma.notificationLog.findUnique({
      where: { idempotencyKey },
    });
    if (alreadySent) return;

    await this.queue.add(data, { delay: delayMs, attempts: 3, backoff: 5000 });
    this.logger.log(`Queued notification ${idempotencyKey} delay=${delayMs}ms`);
  }
}
