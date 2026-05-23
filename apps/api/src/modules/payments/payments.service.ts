import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });
  }

  async createPaymentIntent(bookingId: string, learnerId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

    if (booking.learnerId !== learnerId) {
      throw new BadRequestException('Booking does not belong to this learner');
    }

    const intent = await this.stripe.paymentIntents.create({
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
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
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

    const intent = await this.stripe.paymentIntents.create({
      amount: bundle.priceCents,
      currency: 'usd',
      metadata: { userId, bundleId, type: 'credit_purchase' },
    });

    this.logger.log(`Credit purchase intent created for user ${userId}, bundle ${bundleId}`);
    return { clientSecret: intent.client_secret as string };
  }
}
