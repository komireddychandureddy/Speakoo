import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
          tutorProfile: { select: { id: true, isApproved: true, languagesTaught: true, hourlyRateCents: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users, total, page, limit };
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
