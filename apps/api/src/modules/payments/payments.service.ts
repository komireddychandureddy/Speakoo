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
  SubscriptionInterval,
  UserSubscriptionStatus,
  WalletTransactionType,
} from '@prisma/client';
import { UpsertSubscriptionPlanDto } from './dto/upsert-subscription-plan.dto';

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

  private nextCycleStartEnd(
    start: Date,
    interval: SubscriptionInterval,
  ): { start: Date; end: Date } {
    const nextStart = new Date(start);
    const nextEnd = new Date(start);

    if (interval === SubscriptionInterval.monthly) {
      nextEnd.setUTCMonth(nextEnd.getUTCMonth() + 1);
    } else {
      nextEnd.setUTCFullYear(nextEnd.getUTCFullYear() + 1);
    }

    return { start: nextStart, end: nextEnd };
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const existing = await this.prisma.userSubscription.findFirst({
      where: { userId, stripeCustomerId: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing?.stripeCustomerId) {
      return existing.stripeCustomerId;
    }

    const stripe = this.getStripe();
    const search = await stripe.customers.list({ email: user.email, limit: 1 });
    if (search.data.length > 0) {
      return search.data[0].id;
    }

    const created = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });

    return created.id;
  }

  private async grantCreditsForPeriod(
    userId: string,
    subscriptionId: string,
    periodStart: Date,
    credits: number,
  ): Promise<boolean> {
    if (credits <= 0) return false;

    const referenceId = `subscription:${subscriptionId}:${periodStart.toISOString()}`;
    const exists = await this.prisma.walletTransaction.findFirst({
      where: { userId, type: WalletTransactionType.credit, referenceId },
      select: { id: true },
    });
    if (exists) return false;

    const balanceAgg = await this.prisma.walletTransaction.aggregate({
      where: { userId },
      _sum: { amountCents: true },
    });
    const previousBalance = balanceAgg._sum.amountCents ?? 0;

    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: WalletTransactionType.credit,
        amountCents: credits,
        balanceAfter: previousBalance + credits,
        referenceId,
      },
    });

    return true;
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

  async listCreditBundles() {
    return this.prisma.creditBundle.findMany({
      where: { isActive: true },
      orderBy: { credits: 'asc' },
    });
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

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      await this.onStripeSubscriptionUpdated(subscription);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await this.onStripeSubscriptionDeleted(subscription);
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      await this.onInvoicePaid(invoice);
    }

    return { received: true };
  }

  private toUserSubscriptionStatus(status: Stripe.Subscription.Status): UserSubscriptionStatus {
    if (status === 'active' || status === 'trialing') {
      return UserSubscriptionStatus.active;
    }

    if (status === 'past_due' || status === 'unpaid' || status === 'paused') {
      return UserSubscriptionStatus.past_due;
    }

    return UserSubscriptionStatus.canceled;
  }

  private async onStripeSubscriptionUpdated(subscription: Stripe.Subscription) {
    const local = await this.prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { plan: true },
    });
    if (!local) return;

    const updateData: {
      status: UserSubscriptionStatus;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      canceledAt?: Date | null;
    } = {
      status: this.toUserSubscriptionStatus(subscription.status),
    };

    if (subscription.current_period_start) {
      updateData.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    }

    if (subscription.current_period_end) {
      updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }

    if (subscription.status === 'canceled') {
      updateData.canceledAt = new Date();
    }

    await this.prisma.userSubscription.update({
      where: { id: local.id },
      data: updateData,
    });
  }

  private async onStripeSubscriptionDeleted(subscription: Stripe.Subscription) {
    const local = await this.prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { id: true },
    });
    if (!local) return;

    await this.prisma.userSubscription.update({
      where: { id: local.id },
      data: {
        status: UserSubscriptionStatus.canceled,
        canceledAt: new Date(),
      },
    });
  }

  private async onInvoicePaid(invoice: Stripe.Invoice) {
    const stripeSubscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : null;
    if (!stripeSubscriptionId) return;

    const local = await this.prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId },
      include: { plan: true },
    });
    if (!local) return;

    const periodStartUnix = invoice.period_start ?? undefined;
    const periodEndUnix = invoice.period_end ?? undefined;
    const periodStart = periodStartUnix
      ? new Date(periodStartUnix * 1000)
      : local.currentPeriodStart;
    const periodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : local.currentPeriodEnd;

    await this.grantCreditsForPeriod(
      local.userId,
      local.id,
      periodStart,
      local.plan.includedCredits,
    );

    await this.prisma.userSubscription.update({
      where: { id: local.id },
      data: {
        status: UserSubscriptionStatus.active,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  private async onPaymentSucceeded(intent: Stripe.PaymentIntent) {
    const paymentType = intent.metadata['type'];

    if (paymentType === 'credit_purchase') {
      const userId = intent.metadata['userId'];
      const bundleId = intent.metadata['bundleId'];
      if (!userId || !bundleId) return;

      const bundle = await this.prisma.creditBundle.findUnique({ where: { id: bundleId } });
      if (!bundle) return;

      const referenceId = `credit_purchase:${intent.id}`;
      const existing = await this.prisma.walletTransaction.findFirst({
        where: { userId, referenceId, type: WalletTransactionType.credit },
        select: { id: true },
      });
      if (existing) return;

      const balanceAgg = await this.prisma.walletTransaction.aggregate({
        where: { userId },
        _sum: { amountCents: true },
      });
      const prevBalance = balanceAgg._sum.amountCents ?? 0;

      await this.prisma.walletTransaction.create({
        data: {
          userId,
          type: WalletTransactionType.credit,
          amountCents: bundle.credits,
          balanceAfter: prevBalance + bundle.credits,
          referenceId,
        },
      });

      this.logger.log(`Credits granted for payment intent ${intent.id}`);
      return;
    }

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

  async createConnectOnboarding(
    userId: string,
  ): Promise<{ accountId: string; onboardingUrl: string }> {
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

  async listSubscriptionPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ interval: 'asc' }, { priceCents: 'asc' }],
    });
  }

  async upsertSubscriptionPlan(dto: UpsertSubscriptionPlanDto) {
    if (dto.id) {
      return this.prisma.subscriptionPlan.update({
        where: { id: dto.id },
        data: {
          code: dto.code,
          name: dto.name,
          interval: dto.interval,
          priceCents: dto.priceCents,
          includedCredits: dto.includedCredits,
          ...(dto.stripePriceId?.trim() ? { stripePriceId: dto.stripePriceId.trim() } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    }

    return this.prisma.subscriptionPlan.create({
      data: {
        code: dto.code,
        name: dto.name,
        interval: dto.interval,
        priceCents: dto.priceCents,
        includedCredits: dto.includedCredits,
        ...(dto.stripePriceId?.trim() ? { stripePriceId: dto.stripePriceId.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async getMySubscription(userId: string) {
    return this.prisma.userSubscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async subscribePlan(userId: string, planId: string, paymentMethodId: string) {
    const plan = await this.prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: planId } });
    if (!plan.isActive) {
      throw new BadRequestException('Subscription plan is not active');
    }

    const existingActive = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: { in: [UserSubscriptionStatus.active, UserSubscriptionStatus.past_due] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existingActive) {
      throw new BadRequestException('User already has an active subscription');
    }

    const stripe = this.getStripe();
    const customerId = await this.getOrCreateStripeCustomer(userId);

    let stripeSubscriptionId: string | null = null;
    let periodStart = new Date();
    let periodEnd = this.nextCycleStartEnd(periodStart, plan.interval).end;

    if (plan.stripePriceId) {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: plan.stripePriceId }],
        default_payment_method: paymentMethodId,
        payment_behavior: 'default_incomplete',
      });
      stripeSubscriptionId = subscription.id;

      if (subscription.current_period_start && subscription.current_period_end) {
        periodStart = new Date(subscription.current_period_start * 1000);
        periodEnd = new Date(subscription.current_period_end * 1000);
      }
    }

    const created = await this.prisma.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        status: UserSubscriptionStatus.active,
        stripeCustomerId: customerId,
        ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    await this.grantCreditsForPeriod(userId, created.id, periodStart, plan.includedCredits);

    return created;
  }

  async cancelMySubscription(userId: string, reason?: string) {
    const current = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: { in: [UserSubscriptionStatus.active, UserSubscriptionStatus.past_due] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!current) {
      throw new BadRequestException('No active subscription found');
    }

    if (reason?.trim()) {
      this.logger.log(`Subscription cancel requested by user ${userId}: ${reason.trim()}`);
    }

    if (current.stripeSubscriptionId) {
      try {
        await this.getStripe().subscriptions.cancel(current.stripeSubscriptionId);
      } catch (error) {
        this.logger.warn(
          `Failed to cancel stripe subscription ${current.stripeSubscriptionId}: ${(error as Error).message}`,
        );
      }
    }

    return this.prisma.userSubscription.update({
      where: { id: current.id },
      data: {
        status: UserSubscriptionStatus.canceled,
        canceledAt: new Date(),
      },
      include: { plan: true },
    });
  }

  async runSubscriptionCreditGrants() {
    const now = new Date();
    const due = await this.prisma.userSubscription.findMany({
      where: {
        status: UserSubscriptionStatus.active,
        currentPeriodEnd: { lte: now },
      },
      include: { plan: true },
      take: 500,
    });

    let grantedCount = 0;

    for (const sub of due) {
      const nextPeriod = this.nextCycleStartEnd(sub.currentPeriodEnd, sub.plan.interval);
      const granted = await this.grantCreditsForPeriod(
        sub.userId,
        sub.id,
        nextPeriod.start,
        sub.plan.includedCredits,
      );

      await this.prisma.userSubscription.update({
        where: { id: sub.id },
        data: {
          currentPeriodStart: nextPeriod.start,
          currentPeriodEnd: nextPeriod.end,
        },
      });

      if (granted) grantedCount += 1;
    }

    return {
      scanned: due.length,
      grantedCount,
    };
  }

  async getTransactionRiskSignals(days: number) {
    const lookbackDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 90) : 7;
    const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    const [recentTx, burstByUser, duplicatePayoutRefs] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where: { createdAt: { gte: since } },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: { select: { displayName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      this.prisma.walletTransaction.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: since } },
        orderBy: { userId: 'asc' },
        _count: { _all: true },
        _sum: { amountCents: true },
      }),
      this.prisma.walletTransaction.groupBy({
        by: ['referenceId'],
        where: {
          createdAt: { gte: since },
          type: WalletTransactionType.payout,
          referenceId: { not: null },
        },
        orderBy: { referenceId: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const burstRows = burstByUser as Array<{
      userId: string;
      _count: { _all: number | null };
      _sum: { amountCents: number | null };
    }>;

    const duplicateRefRows = duplicatePayoutRefs as Array<{
      referenceId: string | null;
      _count: { _all: number | null };
    }>;

    const risks: Array<{
      level: 'low' | 'medium' | 'high' | 'critical';
      type: string;
      message: string;
      metadata: Record<string, unknown>;
    }> = [];

    for (const tx of recentTx) {
      const absAmount = Math.abs(tx.amountCents);
      if (absAmount >= 100000) {
        risks.push({
          level: 'high',
          type: 'high_value_transaction',
          message: `High-value ${tx.type} transaction detected for user ${tx.user.email}`,
          metadata: {
            transactionId: tx.id,
            userId: tx.userId,
            userEmail: tx.user.email,
            type: tx.type,
            amountCents: tx.amountCents,
            createdAt: tx.createdAt,
          },
        });
      }
    }

    const suspiciousBursts = burstRows.filter((item) => (item._count._all ?? 0) >= 8);
    if (suspiciousBursts.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: suspiciousBursts.map((s) => s.userId) } },
        select: { id: true, email: true, role: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      for (const burst of suspiciousBursts) {
        const user = userMap.get(burst.userId);
        risks.push({
          level: 'medium',
          type: 'rapid_transaction_burst',
          message: `Rapid transaction burst detected for user ${user?.email ?? burst.userId}`,
          metadata: {
            userId: burst.userId,
            userEmail: user?.email ?? null,
            txCount: burst._count._all ?? 0,
            totalAmountCents: burst._sum.amountCents ?? 0,
            lookbackDays,
          },
        });
      }
    }

    const duplicatedRefs = duplicateRefRows.filter((item) => (item._count._all ?? 0) > 1);
    for (const dup of duplicatedRefs) {
      risks.push({
        level: 'critical',
        type: 'duplicate_payout_reference',
        message: `Duplicate payout transactions share booking reference ${dup.referenceId}`,
        metadata: {
          referenceId: dup.referenceId,
          count: dup._count._all ?? 0,
        },
      });
    }

    const payoutRefs = Array.from(
      new Set(
        recentTx
          .filter((tx) => tx.type === WalletTransactionType.payout && tx.referenceId)
          .map((tx) => tx.referenceId as string),
      ),
    );

    if (payoutRefs.length > 0) {
      const bookings = await this.prisma.booking.findMany({
        where: { id: { in: payoutRefs } },
        select: { id: true, status: true },
      });
      const bookingMap = new Map(bookings.map((b) => [b.id, b]));

      for (const referenceId of payoutRefs) {
        const booking = bookingMap.get(referenceId);
        if (!booking) {
          risks.push({
            level: 'critical',
            type: 'orphan_payout_reference',
            message: `Payout transaction references missing booking ${referenceId}`,
            metadata: { referenceId },
          });
          continue;
        }

        if (booking.status !== BookingStatus.completed) {
          risks.push({
            level: 'high',
            type: 'payout_before_completion',
            message: `Payout reference ${referenceId} points to booking with status ${booking.status}`,
            metadata: {
              referenceId,
              bookingStatus: booking.status,
            },
          });
        }
      }
    }

    const byLevel = risks.reduce(
      (acc, item) => {
        acc[item.level] += 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0, critical: 0 },
    );

    return {
      lookbackDays,
      since,
      summary: {
        totalRisks: risks.length,
        byLevel,
      },
      risks,
    };
  }

  async payoutToTutor(bookingId: string): Promise<{ transferred: boolean; amountCents: number }> {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (
      booking.status !== BookingStatus.completed ||
      booking.payment?.status !== PaymentStatus.succeeded
    ) {
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

    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId: booking.tutorId },
    });
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
