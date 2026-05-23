import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, SlotStatus } from '@prisma/client';

const PLATFORM_FEE_PERCENT = Number(process.env['PLATFORM_FEE_PERCENT'] ?? 5);

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(learnerId: string, dto: CreateBookingDto) {
    return this.prisma.$transaction(async (tx) => {
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

      await tx.availabilitySlot.update({
        where: { id: dto.slotId },
        data: { status: SlotStatus.booked },
      });

      const priceCents = tutorProfile.hourlyRateCents;
      const platformFeeCents = Math.round((priceCents * PLATFORM_FEE_PERCENT) / 100);

      const booking = await tx.booking.create({
        data: {
          learnerId,
          tutorId: tutorProfile.userId,
          slotId: dto.slotId,
          language: dto.language,
          priceCents,
          platformFeeCents,
          livekitRoom: `session-pending`,
          status: BookingStatus.pending,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: { livekitRoom: `session-${booking.id}` },
      });

      return tx.booking.findUniqueOrThrow({
        where: { id: booking.id },
        include: { slot: true, tutor: { include: { profile: true } } },
      });
    });
  }

  findByLearner(learnerId: string) {
    return this.prisma.booking.findMany({
      where: { learnerId },
      include: { slot: true, tutor: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByTutor(tutorId: string) {
    return this.prisma.booking.findMany({
      where: { tutorId },
      include: { slot: true, learner: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.booking.findUniqueOrThrow({
      where: { id },
      include: {
        slot: true,
        learner: { include: { profile: true } },
        tutor: { include: { profile: true } },
        session: true,
        payment: true,
      },
    });
  }

  async cancelBooking(id: string, userId: string): Promise<{ refundAmountCents: number; stripePaymentIntent: string | null }> {
    return this.prisma.$transaction(async (tx) => {
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

