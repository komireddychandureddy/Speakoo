import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly config: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getStripe(): Stripe {
    return new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-04-10',
    });
  }

  async createBooking(learnerId: string, dto: CreateBookingDto) {
    const booking = await this.bookingsRepository.createBooking(learnerId, dto);

    // Wallet-paid bookings are confirmed immediately and need reminder scheduling.
    if (booking.status === BookingStatus.confirmed) {
      await this.notificationsService.scheduleBookingNotifications(
        booking.id,
        booking.slot.startTime,
      );
    }

    return booking;
  }

  getMyBookings(userId: string, role: 'learner' | 'tutor') {
    return role === 'tutor'
      ? this.bookingsRepository.findByTutor(userId)
      : this.bookingsRepository.findByLearner(userId);
  }

  async getBookingById(id: string, userId: string, role: 'learner' | 'tutor' | 'admin') {
    const booking = await this.bookingsRepository.findById(id);
    if (role === 'admin') {
      return booking;
    }

    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You can only access your own booking details');
    }

    return booking;
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
