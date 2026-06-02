import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Resend } from 'resend';
import Twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NOTIFICATION_QUEUE,
  NotificationJobData,
  NotificationsService,
} from '../notifications.service';
import { NotificationChannel } from '@prisma/client';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
      const resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
      await resend.emails.send({
        from: this.config.getOrThrow('RESEND_FROM_EMAIL'),
        to: user.email,
        subject: this.getSubject(type),
        text: this.getBody(type, user.profile?.displayName ?? 'Learner'),
      });
    }

    if (channel === NotificationChannel.whatsapp) {
      if (this.config.get('NODE_ENV') !== 'production') {
        this.logger.log(
          `Skipping WhatsApp notification for user ${userId} (non-production environment)`,
        );
        return;
      }
      const phoneNumber = user.profile?.phoneNumber;
      if (!phoneNumber) {
        this.logger.warn(`Skipping WhatsApp for user ${userId}: no phone number on profile`);
        return;
      }
      const twilio = Twilio(
        this.config.getOrThrow('TWILIO_ACCOUNT_SID'),
        this.config.getOrThrow('TWILIO_AUTH_TOKEN'),
      );
      await twilio.messages.create({
        from: this.config.getOrThrow('TWILIO_WHATSAPP_FROM'),
        to: `whatsapp:${phoneNumber}`,
        body: this.getBody(type, user.profile?.displayName ?? 'there'),
      });
    }

    if (channel === NotificationChannel.push) {
      const serverKey = this.config.get<string>('FCM_SERVER_KEY');
      const tokens = await this.notificationsService.getDeviceTokens(userId);
      if (!serverKey || tokens.length === 0) {
        this.logger.warn(
          `Skipping push notification for user ${userId}: missing FCM key or device token`,
        );
        return;
      }

      const title = this.getSubject(type);
      const body = this.getBody(type, user.profile?.displayName ?? 'there');

      await Promise.all(
        tokens.map(async (token) => {
          try {
            await axios.post(
              'https://fcm.googleapis.com/fcm/send',
              {
                to: token,
                notification: { title, body },
                data: { bookingId, type },
              },
              {
                headers: {
                  Authorization: `key=${serverKey}`,
                  'Content-Type': 'application/json',
                },
              },
            );
          } catch (error) {
            this.logger.warn(`Push send failed for user ${userId}: ${String(error)}`);
          }
        }),
      );
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
