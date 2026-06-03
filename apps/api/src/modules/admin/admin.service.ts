import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingStatus, SlotStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly statusTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.pending]: [BookingStatus.confirmed, BookingStatus.cancelled],
    [BookingStatus.confirmed]: [BookingStatus.in_session, BookingStatus.cancelled],
    [BookingStatus.in_session]: [BookingStatus.completed, BookingStatus.cancelled],
    [BookingStatus.completed]: [],
    [BookingStatus.cancelled]: [],
  };

  async approveTutor(tutorId: string) {
    await this.prisma.tutorProfile.update({
      where: { userId: tutorId },
      data: { isApproved: true },
    });
    return { approved: true };
  }

  async suspendUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
    });
    return { suspended: true };
  }

  async unsuspendUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false },
    });
    return { suspended: false };
  }

  async listUsers(page: number, limit: number, role?: string) {
    const skip = (page - 1) * limit;
    const where = role ? { role: role as import('@prisma/client').UserRole } : {};
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          isSuspended: true,
          createdAt: true,
          profile: { select: { displayName: true, bio: true, countryCode: true } },
          tutorProfile: {
            select: { id: true, isApproved: true, languagesTaught: true, hourlyRateCents: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users, total, page, limit };
  }

  async listBookings(page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const where =
      status && Object.values(BookingStatus).includes(status as BookingStatus)
        ? { status: status as BookingStatus }
        : {};

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          slot: true,
          learner: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true, countryCode: true } },
            },
          },
          tutor: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true, countryCode: true } },
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              amountCents: true,
              currency: true,
            },
          },
          session: {
            select: {
              id: true,
              startedAt: true,
              endedAt: true,
              durationMinutes: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: bookings, total, page, limit };
  }

  async updateBookingStatus(bookingId: string, targetStatus: BookingStatus) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUniqueOrThrow({
        where: { id: bookingId },
        include: { slot: true, session: true },
      });

      const allowedTargets = this.statusTransitions[booking.status] ?? [];
      if (!allowedTargets.includes(targetStatus)) {
        throw new BadRequestException(
          `Invalid transition from ${booking.status} to ${targetStatus}`,
        );
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: targetStatus },
      });

      if (targetStatus === BookingStatus.cancelled && booking.status !== BookingStatus.in_session) {
        await tx.availabilitySlot.update({
          where: { id: booking.slotId },
          data: { status: SlotStatus.available },
        });
      }

      if (targetStatus === BookingStatus.in_session) {
        const startedAt = new Date();
        if (booking.session) {
          await tx.session.update({
            where: { bookingId: booking.id },
            data: { startedAt },
          });
        } else {
          await tx.session.create({
            data: {
              bookingId: booking.id,
              startedAt,
            },
          });
        }
      }

      if (targetStatus === BookingStatus.completed) {
        const endedAt = new Date();
        const startedAt = booking.session?.startedAt;
        const durationMinutes = startedAt
          ? Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
          : null;

        if (booking.session) {
          await tx.session.update({
            where: { bookingId: booking.id },
            data: { endedAt, durationMinutes: durationMinutes ?? undefined },
          });
        } else {
          await tx.session.create({
            data: {
              bookingId: booking.id,
              startedAt: endedAt,
              endedAt,
              durationMinutes: durationMinutes ?? undefined,
            },
          });
        }
      }

      return tx.booking.findUniqueOrThrow({
        where: { id: bookingId },
        include: {
          slot: true,
          learner: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true, countryCode: true } },
            },
          },
          tutor: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true, countryCode: true } },
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              amountCents: true,
              currency: true,
            },
          },
          session: {
            select: {
              id: true,
              startedAt: true,
              endedAt: true,
              durationMinutes: true,
            },
          },
        },
      });
    });
  }

  async getStats() {
    const [totalUsers, tutorCount, learnerCount, totalBookings, pendingTutors] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'tutor' } }),
      this.prisma.user.count({ where: { role: 'learner' } }),
      this.prisma.booking.count(),
      this.prisma.tutorProfile.count({ where: { isApproved: false } }),
    ]);
    const revenue = await this.prisma.payment.aggregate({
      _sum: { amountCents: true },
      where: { status: 'succeeded' },
    });
    return {
      totalUsers,
      tutors: tutorCount,
      learners: learnerCount,
      totalBookings,
      pendingTutors,
      totalRevenueCents: revenue._sum.amountCents ?? 0,
    };
  }
}
