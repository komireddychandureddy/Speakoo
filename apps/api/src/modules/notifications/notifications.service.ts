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
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue<NotificationJobData>,
    private readonly prisma: PrismaService,
  ) {}

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
      channel: NotificationChannel.whatsapp,
    });
    await this.enqueue({
      userId: booking.tutorId,
      bookingId,
      type: NotificationType.booking_confirmed,
      channel: NotificationChannel.email,
    });

    // Delayed reminders
    const reminder60 = new Date(sessionStartTime.getTime() - 60 * 60 * 1000);
    const reminder10 = new Date(sessionStartTime.getTime() - 10 * 60 * 1000);
    const now = Date.now();

    if (reminder60.getTime() > now) {
      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_60min,
          channel: NotificationChannel.email,
        },
        reminder60.getTime() - now,
      );

      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_60min,
          channel: NotificationChannel.whatsapp,
        },
        reminder60.getTime() - now,
      );
    }

    if (reminder10.getTime() > now) {
      await this.enqueue(
        {
          userId: booking.learnerId,
          bookingId,
          type: NotificationType.reminder_10min,
          channel: NotificationChannel.email,
        },
        reminder10.getTime() - now,
      );
    }
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
    const idempotencyKey = `${data.bookingId}:${data.type}:${data.channel}`;

    const alreadySent = await this.prisma.notificationLog.findUnique({
      where: { idempotencyKey },
    });
    if (alreadySent) return;

    await this.queue.add(data, { delay: delayMs, attempts: 3, backoff: 5000 });
    this.logger.log(`Queued notification ${idempotencyKey} delay=${delayMs}ms`);
  }
}
