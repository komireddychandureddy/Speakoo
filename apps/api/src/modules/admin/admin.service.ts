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

  async listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          isSuspended: true,
          createdAt: true,
          profile: { select: { displayName: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, total, page, limit };
  }
}
