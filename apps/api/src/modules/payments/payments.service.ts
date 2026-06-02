import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  BookingStatus,
  NotificationChannel,
  NotificationType,
  PaymentStatus,
  WalletTransactionType,
} from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getStripe(): Stripe {
    return new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-04-10',
    });
  }

  async createPaymentIntent(bookingId: string, learnerId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

    if (booking.learnerId !== learnerId) {
      throw new BadRequestException('Booking does not belong to this learner');
    }

    const intent = await this.getStripe().paymentIntents.create({
      amount: booking.priceCents,
      currency: 'usd',
      metadata: { bookingId, learnerId },
    });

    await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        stripePaymentIntent: intent.id,
        amountCents: booking.priceCents,
        status: PaymentStatus.pending,
      },
      update: { stripePaymentIntent: intent.id, status: PaymentStatus.pending },
    });

    return { clientSecret: intent.client_secret };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await this.onPaymentSucceeded(intent);
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      await this.onChargeRefunded(charge);
    }

    return { received: true };
  }

  private async onPaymentSucceeded(intent: Stripe.PaymentIntent) {
    const bookingId = intent.metadata['bookingId'];
    if (!bookingId) return;

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { bookingId },
        data: { status: PaymentStatus.succeeded },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.confirmed },
      }),
    ]);

    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { slot: true },
    });

    await this.notificationsService.scheduleBookingNotifications(bookingId, booking.slot.startTime);

    this.logger.log(`Payment succeeded for booking ${bookingId}`);
  }

  private async onChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string;
    await this.prisma.payment.updateMany({
      where: { stripePaymentIntent: paymentIntentId },
      data: { status: PaymentStatus.refunded },
    });
  }

  async getWalletBalance(userId: string): Promise<{ balanceCents: number }> {
    const result = await this.prisma.walletTransaction.aggregate({
      where: { userId },
      _sum: { amountCents: true },
    });
    return { balanceCents: result._sum.amountCents ?? 0 };
  }

  async purchaseCredits(userId: string, bundleId: string): Promise<{ clientSecret: string }> {
    const bundle = await this.prisma.creditBundle.findUniqueOrThrow({ where: { id: bundleId } });

    const intent = await this.getStripe().paymentIntents.create({
      amount: bundle.priceCents,
      currency: 'usd',
      metadata: { userId, bundleId, type: 'credit_purchase' },
    });

    this.logger.log(`Credit purchase intent created for user ${userId}, bundle ${bundleId}`);
    return { clientSecret: intent.client_secret as string };
  }

  async getWalletTransactions(userId: string) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.walletTransaction.count({ where: { userId } }),
    ]);

    return { items, total };
  }

  async topupWallet(userId: string, amountCents: number): Promise<{ clientSecret: string }> {
    const intent = await this.getStripe().paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { userId, type: 'wallet_topup' },
    });

    return { clientSecret: intent.client_secret as string };
  }

  async createConnectOnboarding(userId: string): Promise<{ accountId: string; onboardingUrl: string }> {
    const tutorProfile = await this.prisma.tutorProfile.findUniqueOrThrow({ where: { userId } });

    const stripe = this.getStripe();
    let accountId = tutorProfile.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await this.prisma.tutorProfile.update({
        where: { userId },
        data: { stripeAccountId: accountId },
      });
    }

    const appUrl = this.config.get<string>('APP_URL') ?? 'https://speakoo.duckdns.org';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/tutor-payout`,
      return_url: `${appUrl}/tutor-payout`,
      type: 'account_onboarding',
    });

    return { accountId, onboardingUrl: accountLink.url };
  }

  async payoutToTutor(bookingId: string): Promise<{ transferred: boolean; amountCents: number }> {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (booking.status !== BookingStatus.completed || booking.payment?.status !== PaymentStatus.succeeded) {
      return { transferred: false, amountCents: 0 };
    }

    const existingPayout = await this.prisma.walletTransaction.findFirst({
      where: {
        userId: booking.tutorId,
        type: WalletTransactionType.payout,
        referenceId: bookingId,
      },
    });
    if (existingPayout) {
      return { transferred: false, amountCents: existingPayout.amountCents };
    }

    const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId: booking.tutorId } });
    if (!tutorProfile?.stripeAccountId) {
      this.logger.warn(`Skipping payout for booking ${bookingId}: tutor has no Stripe account`);
      return { transferred: false, amountCents: 0 };
    }

    const amountCents = booking.priceCents - booking.platformFeeCents;
    if (amountCents <= 0) {
      return { transferred: false, amountCents: 0 };
    }

    await this.getStripe().transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: tutorProfile.stripeAccountId,
      metadata: { bookingId, tutorId: booking.tutorId },
    });

    const balance = await this.prisma.walletTransaction.aggregate({
      where: { userId: booking.tutorId },
      _sum: { amountCents: true },
    });
    const previousBalance = balance._sum.amountCents ?? 0;

    await this.prisma.walletTransaction.create({
      data: {
        userId: booking.tutorId,
        type: WalletTransactionType.payout,
        amountCents,
        balanceAfter: previousBalance + amountCents,
        referenceId: bookingId,
      },
    });

    await this.prisma.notificationLog.create({
      data: {
        userId: booking.tutorId,
        bookingId,
        type: NotificationType.payout,
        channel: NotificationChannel.email,
        idempotencyKey: `${bookingId}:${NotificationType.payout}:${NotificationChannel.email}`,
      },
    });

    this.logger.log(`Payout transfer completed for booking ${bookingId}: ${amountCents} cents`);
    return { transferred: true, amountCents };
  }
}
