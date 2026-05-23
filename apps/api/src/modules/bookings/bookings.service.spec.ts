import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';
import { ConfigService } from '@nestjs/config';

jest.mock('stripe', () => {
  const refundsCreate = jest.fn();
  const MockStripe = jest.fn().mockImplementation(() => ({ refunds: { create: refundsCreate } }));
  (MockStripe as any).__refundsCreate = refundsCreate;
  return { default: MockStripe };
});

import Stripe from 'stripe';
const mockRefundsCreate = (Stripe as any).__refundsCreate as jest.Mock;

const mockRepo = {
  createBooking: jest.fn(),
  findByLearner: jest.fn(),
  findByTutor: jest.fn(),
  findById: jest.fn(),
  cancelBooking: jest.fn(),
};

const mockConfig = { getOrThrow: jest.fn().mockReturnValue('sk_test_dummy') };

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: BookingsRepository, useValue: mockRepo },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('delegates to repository', async () => {
      const booking = { id: 'b1', learnerId: 'l1' };
      mockRepo.createBooking.mockResolvedValue(booking);

      const result = await service.createBooking('l1', { slotId: 's1', tutorId: 't1', language: 'English' });

      expect(mockRepo.createBooking).toHaveBeenCalledWith('l1', { slotId: 's1', tutorId: 't1', language: 'English' });
      expect(result).toBe(booking);
    });
  });

  describe('getMyBookings', () => {
    it('queries by tutor when role is tutor', async () => {
      mockRepo.findByTutor.mockResolvedValue([{ id: 'b1' }]);
      await service.getMyBookings('t1', 'tutor');
      expect(mockRepo.findByTutor).toHaveBeenCalledWith('t1');
    });

    it('queries by learner when role is learner', async () => {
      mockRepo.findByLearner.mockResolvedValue([{ id: 'b1' }]);
      await service.getMyBookings('l1', 'learner');
      expect(mockRepo.findByLearner).toHaveBeenCalledWith('l1');
    });
  });

  describe('getBookingById', () => {
    it('delegates to repository', async () => {
      const booking = { id: 'b1' };
      mockRepo.findById.mockResolvedValue(booking);

      const result = await service.getBookingById('b1');

      expect(mockRepo.findById).toHaveBeenCalledWith('b1');
      expect(result).toBe(booking);
    });
  });

  describe('cancelBooking', () => {
    it('cancels booking and triggers Stripe refund when applicable', async () => {
      mockRepo.cancelBooking.mockResolvedValue({
        refundAmountCents: 5000,
        stripePaymentIntent: 'pi_test_123',
      });
      mockRefundsCreate.mockResolvedValue({ id: 'ref_1' });

      const result = await service.cancelBooking('b1', 'l1');

      expect(mockRepo.cancelBooking).toHaveBeenCalledWith('b1', 'l1');
      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: 5000,
      });
      expect(result).toEqual({ cancelled: true, refundAmountCents: 5000 });
    });

    it('skips Stripe refund when refundAmountCents is 0', async () => {
      mockRepo.cancelBooking.mockResolvedValue({
        refundAmountCents: 0,
        stripePaymentIntent: 'pi_test_123',
      });

      const result = await service.cancelBooking('b1', 'l1');

      expect(mockRefundsCreate).not.toHaveBeenCalled();
      expect(result).toEqual({ cancelled: true, refundAmountCents: 0 });
    });

    it('skips Stripe refund when no stripePaymentIntent', async () => {
      mockRepo.cancelBooking.mockResolvedValue({
        refundAmountCents: 5000,
        stripePaymentIntent: null,
      });

      const result = await service.cancelBooking('b1', 'l1');

      expect(mockRefundsCreate).not.toHaveBeenCalled();
      expect(result).toEqual({ cancelled: true, refundAmountCents: 5000 });
    });

    it('logs error but does not throw when Stripe refund fails', async () => {
      mockRepo.cancelBooking.mockResolvedValue({
        refundAmountCents: 1000,
        stripePaymentIntent: 'pi_test_fail',
      });
      mockRefundsCreate.mockRejectedValue(new Error('Stripe error'));

      await expect(service.cancelBooking('b1', 'l1')).resolves.toEqual({
        cancelled: true,
        refundAmountCents: 1000,
      });
    });
  });
});
