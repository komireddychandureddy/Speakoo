import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  SlotStatus,
  WalletTransactionType,
} from '@prisma/client';

const PLATFORM_FEE_PERCENT = Number(process.env['PLATFORM_FEE_PERCENT'] ?? 5);
const PENDING_HOLD_MINUTES = 5;

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getPendingHoldCutoff(): Date {
    return new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000);
  }

  private async releaseExpiredPendingBookings(
    tx: Prisma.TransactionClient,
    slotId?: string,
  ): Promise<void> {
    const cutoff = this.getPendingHoldCutoff();
    const expired = await tx.booking.findMany({
      where: {
        status: BookingStatus.pending,
        createdAt: { lte: cutoff },
        ...(slotId ? { slotId } : {}),
      },
      select: { id: true, slotId: true },
      take: 100,
    });

    for (const booking of expired) {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.cancelled },
      });

      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { status: SlotStatus.available },
      });

      await tx.payment.updateMany({
        where: { bookingId: booking.id, status: PaymentStatus.pending },
        data: { status: PaymentStatus.failed },
      });
    }
  }

  async createBooking(learnerId: string, dto: CreateBookingDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.releaseExpiredPendingBookings(tx, dto.slotId);

      const slot = await tx.availabilitySlot.findUnique({ where: { id: dto.slotId } });

      if (!slot) throw new NotFoundException('Slot not found');
      if (slot.status !== SlotStatus.available) {
        throw new ConflictException('Slot is no longer available');
      }

      // Load the TutorProfile that owns this slot (slot.tutorId is TutorProfile.id)
      const tutorProfile = await tx.tutorProfile.findUnique({ where: { id: slot.tutorId } });
      if (!tutorProfile) throw new NotFoundException('Tutor profile not found');

      // Validate the caller-provided tutorId matches the slot's actual tutor
      if (tutorProfile.userId !== dto.tutorId) {
        throw new BadRequestException('Slot does not belong to the specified tutor');
      }

      const priceCents = tutorProfile.hourlyRateCents;
      const platformFeeCents = Math.round((priceCents * PLATFORM_FEE_PERCENT) / 100);

      const learnerBalance = await tx.walletTransaction.aggregate({
        where: { userId: learnerId },
        _sum: { amountCents: true },
      });
      const balanceCents = learnerBalance._sum.amountCents ?? 0;
      const canPayFromWallet = balanceCents >= priceCents;

      await tx.availabilitySlot.update({
        where: { id: dto.slotId },
        data: { status: SlotStatus.booked },
      });

      const booking = await tx.booking.create({
        data: {
          learnerId,
          tutorId: tutorProfile.userId,
          slotId: dto.slotId,
          language: dto.language,
          priceCents,
          platformFeeCents,
          livekitRoom: `session-pending`,
          status: canPayFromWallet ? BookingStatus.confirmed : BookingStatus.pending,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: { livekitRoom: `session-${booking.id}` },
      });

      if (canPayFromWallet) {
        await tx.walletTransaction.create({
          data: {
            userId: learnerId,
            type: WalletTransactionType.debit,
            amountCents: -priceCents,
            balanceAfter: balanceCents - priceCents,
            referenceId: `booking:${booking.id}`,
          },
        });

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amountCents: priceCents,
            status: PaymentStatus.succeeded,
          },
        });
      }

      return tx.booking.findUniqueOrThrow({
        where: { id: booking.id },
        include: { slot: true, tutor: { include: { profile: true } } },
      });
    });
  }

  findByLearner(learnerId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.releaseExpiredPendingBookings(tx);
      return tx.booking.findMany({
        where: { learnerId },
        include: { slot: true, tutor: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  findByTutor(tutorId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.releaseExpiredPendingBookings(tx);
      return tx.booking.findMany({
        where: { tutorId },
        include: { slot: true, learner: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  findById(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.releaseExpiredPendingBookings(tx);
      return tx.booking.findUniqueOrThrow({
        where: { id },
        include: {
          slot: true,
          learner: { include: { profile: true } },
          tutor: { include: { profile: true } },
          session: true,
          payment: true,
        },
      });
    });
  }

  async cancelBooking(
    id: string,
    userId: string,
  ): Promise<{ refundAmountCents: number; stripePaymentIntent: string | null }> {
    return this.prisma.$transaction(async (tx) => {
      await this.releaseExpiredPendingBookings(tx);

      const booking = await tx.booking.findUniqueOrThrow({
        where: { id },
        include: { slot: true, payment: true },
      });

      if (booking.learnerId !== userId) {
        throw new ForbiddenException('Only the learner who made this booking can cancel it');
      }

      const cancellable: BookingStatus[] = [BookingStatus.pending, BookingStatus.confirmed];
      if (!cancellable.includes(booking.status)) {
        throw new ConflictException(`Booking cannot be cancelled in status: ${booking.status}`);
      }

      const hoursUntilSession = (booking.slot.startTime.getTime() - Date.now()) / 3_600_000;
      let refundAmountCents = 0;
      if (hoursUntilSession > 24) {
        refundAmountCents = booking.priceCents;
      } else if (hoursUntilSession >= 2) {
        refundAmountCents = Math.round(booking.priceCents / 2);
      }

      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { status: SlotStatus.available },
      });

      await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.cancelled },
      });

      return {
        refundAmountCents,
        stripePaymentIntent: booking.payment?.stripePaymentIntent ?? null,
      };
    });
  }
}
