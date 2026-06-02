import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly config: ConfigService,
  ) {}

  private getStripe(): Stripe {
    return new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-04-10',
    });
  }

  createBooking(learnerId: string, dto: CreateBookingDto) {
    return this.bookingsRepository.createBooking(learnerId, dto);
  }

  getMyBookings(userId: string, role: 'learner' | 'tutor') {
    return role === 'tutor'
      ? this.bookingsRepository.findByTutor(userId)
      : this.bookingsRepository.findByLearner(userId);
  }

  getBookingById(id: string) {
    return this.bookingsRepository.findById(id);
  }

  async cancelBooking(id: string, userId: string) {
    const { refundAmountCents, stripePaymentIntent } = await this.bookingsRepository.cancelBooking(
      id,
      userId,
    );

    if (refundAmountCents > 0 && stripePaymentIntent) {
      try {
        await this.getStripe().refunds.create({
          payment_intent: stripePaymentIntent,
          amount: refundAmountCents,
        });
        this.logger.log(`Refund of ${refundAmountCents} cents issued for booking ${id}`);
      } catch (err) {
        this.logger.error(`Stripe refund failed for booking ${id}`, err);
      }
    }

    return { cancelled: true, refundAmountCents };
  }
}
