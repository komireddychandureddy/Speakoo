import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, BookingStatus } from '@prisma/client';

const mockPaymentIntentsCreate = jest.fn();
const mockWebhooksConstructEvent = jest.fn();

jest.mock('stripe', () => {
  const MockStripe = jest.fn().mockImplementation(() => ({
    paymentIntents: { create: mockPaymentIntentsCreate },
    webhooks: { constructEvent: mockWebhooksConstructEvent },
  }));
  return { default: MockStripe };
});

const mockPrisma = {
  booking: {
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    upsert: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  walletTransaction: {
    aggregate: jest.fn(),
  },
  creditBundle: {
    findUniqueOrThrow: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockNotifications = { scheduleBookingNotifications: jest.fn() };
const mockConfig = { getOrThrow: jest.fn().mockReturnValue('sk_test_dummy') };

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
    mockConfig.getOrThrow.mockReturnValue('sk_test_dummy');
  });

  describe('createPaymentIntent', () => {
    it('throws if booking does not belong to learner', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'other-user',
        priceCents: 5000,
      });

      await expect(service.createPaymentIntent('b1', 'l1')).rejects.toThrow(BadRequestException);
    });

    it('creates payment intent and upserts payment record', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'l1',
        priceCents: 5000,
      });
      mockPaymentIntentsCreate.mockResolvedValue({ id: 'pi_1', client_secret: 'secret_1' });
      mockPrisma.payment.upsert.mockResolvedValue({ id: 'pay1' });

      const result = await service.createPaymentIntent('b1', 'l1');

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'usd',
        metadata: { bookingId: 'b1', learnerId: 'l1' },
      });
      expect(result).toEqual({ clientSecret: 'secret_1' });
    });
  });

  describe('handleWebhook', () => {
    it('throws BadRequestException on invalid signature', async () => {
      mockConfig.getOrThrow.mockReturnValue('whsec_test');
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        service.handleWebhook(Buffer.from('body'), 'bad-sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('returns received:true and processes payment_intent.succeeded', async () => {
      mockConfig.getOrThrow.mockReturnValue('whsec_test');
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_1',
            metadata: { bookingId: 'b1' },
          },
        },
      });
      mockPrisma.$transaction.mockResolvedValue([]);
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        slot: { startTime: new Date() },
      });
      mockNotifications.scheduleBookingNotifications.mockResolvedValue(undefined);

      const result = await service.handleWebhook(Buffer.from('body'), 'sig');

      expect(result).toEqual({ received: true });
    });

    it('processes charge.refunded event', async () => {
      mockConfig.getOrThrow.mockReturnValue('whsec_test');
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'charge.refunded',
        data: { object: { payment_intent: 'pi_1' } },
      });
      mockPrisma.payment.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.handleWebhook(Buffer.from('body'), 'sig');

      expect(mockPrisma.payment.updateMany).toHaveBeenCalledWith({
        where: { stripePaymentIntent: 'pi_1' },
        data: { status: PaymentStatus.refunded },
      });
      expect(result).toEqual({ received: true });
    });
  });

  describe('getWalletBalance', () => {
    it('returns summed balance', async () => {
      mockPrisma.walletTransaction.aggregate.mockResolvedValue({ _sum: { amountCents: 2000 } });

      const result = await service.getWalletBalance('u1');

      expect(result).toEqual({ balanceCents: 2000 });
    });

    it('returns 0 when no transactions', async () => {
      mockPrisma.walletTransaction.aggregate.mockResolvedValue({ _sum: { amountCents: null } });

      const result = await service.getWalletBalance('u1');

      expect(result).toEqual({ balanceCents: 0 });
    });
  });

  describe('purchaseCredits', () => {
    it('creates payment intent for credit bundle', async () => {
      mockPrisma.creditBundle.findUniqueOrThrow.mockResolvedValue({
        id: 'bundle1',
        priceCents: 9900,
      });
      mockPaymentIntentsCreate.mockResolvedValue({ id: 'pi_2', client_secret: 'secret_2' });

      const result = await service.purchaseCredits('u1', 'bundle1');

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
        amount: 9900,
        currency: 'usd',
        metadata: { userId: 'u1', bundleId: 'bundle1', type: 'credit_purchase' },
      });
      expect(result).toEqual({ clientSecret: 'secret_2' });
    });
  });
});
