import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import Twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';
import { NOTIFICATION_QUEUE, NotificationJobData } from '../notifications.service';
import { NotificationChannel } from '@prisma/client';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly resend: Resend;
  private readonly twilio: ReturnType<typeof Twilio>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
    this.twilio = Twilio(
      this.config.getOrThrow('TWILIO_ACCOUNT_SID'),
      this.config.getOrThrow('TWILIO_AUTH_TOKEN'),
    );
  }

  @Process()
  async handle(job: Job<NotificationJobData>) {
    const { userId, bookingId, type, channel } = job.data;
    const idempotencyKey = `${bookingId}:${type}:${channel}`;

    const alreadySent = await this.prisma.notificationLog.findUnique({ where: { idempotencyKey } });
    if (alreadySent) return;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true },
    });

    if (channel === NotificationChannel.email) {
      await this.resend.emails.send({
        from: this.config.getOrThrow('RESEND_FROM_EMAIL'),
        to: user.email,
        subject: this.getSubject(type),
        text: this.getBody(type, user.profile?.displayName ?? 'Learner'),
      });
    }

    if (channel === NotificationChannel.whatsapp) {
      const phoneNumber = user.profile?.phoneNumber;
      if (!phoneNumber) {
        this.logger.warn(`Skipping WhatsApp for user ${userId}: no phone number on profile`);
        return;
      }
      await this.twilio.messages.create({
        from: this.config.getOrThrow('TWILIO_WHATSAPP_FROM'),
        to: `whatsapp:${phoneNumber}`,
        body: this.getBody(type, user.profile?.displayName ?? 'there'),
      });
    }

    await this.prisma.notificationLog.create({
      data: { userId, bookingId, type, channel, idempotencyKey },
    });

    this.logger.log(`Notification sent: ${idempotencyKey}`);
  }

  private getSubject(type: string): string {
    const subjects: Record<string, string> = {
      booking_confirmed: 'Your Speakoo session is confirmed!',
      reminder_60min: 'Your session starts in 60 minutes',
      reminder_10min: 'Your session starts in 10 minutes',
      session_summary: 'Session summary',
      payout: 'Payout processed',
    };
    return subjects[type] ?? 'Speakoo notification';
  }

  private getBody(type: string, name: string): string {
    const bodies: Record<string, string> = {
      booking_confirmed: `Hi ${name}, your session has been confirmed. See you soon!`,
      reminder_60min: `Hi ${name}, your session starts in 60 minutes. Get ready!`,
      reminder_10min: `Hi ${name}, your session starts in 10 minutes. Join now!`,
      session_summary: `Hi ${name}, here is your session summary.`,
      payout: `Hi ${name}, your payout has been processed.`,
    };
    return bodies[type] ?? `Hi ${name}, you have a notification from Speakoo.`;
  }
}
