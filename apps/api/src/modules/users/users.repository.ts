import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { profile: true },
    });
  }

  findPublicProfile(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            bio: true,
            countryCode: true,
            nativeLanguage: true,
            targetLanguage: true,
            learningGoals: true,
            maxBudgetCents: true,
          },
        },
      },
    });
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  getPoints(userId: string) {
    return this.prisma.learnerPoints.findUnique({ where: { learnerId: userId } });
  }

  getBadges(userId: string) {
    return this.prisma.learnerBadge.findMany({
      where: { learnerId: userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async getLearningProgress(userId: string) {
    const [bookings, points, badgesCount] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where: {
          learnerId: userId,
          status: 'completed',
        },
        include: {
          slot: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
          session: {
            include: {
              feedback: {
                where: { revieweeId: userId },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      this.prisma.learnerPoints.findUnique({ where: { learnerId: userId } }),
      this.prisma.learnerBadge.count({ where: { learnerId: userId } }),
    ]);

    const timeline = bookings.map((booking) => {
      const latestFeedback = booking.session?.feedback?.[0];
      return {
        bookingId: booking.id,
        language: booking.language,
        completedAt: booking.slot.endTime,
        sessionStart: booking.slot.startTime,
        sessionEnd: booking.slot.endTime,
        rating: latestFeedback?.rating ?? null,
        cefrAssessment: latestFeedback?.cefrAssessment ?? null,
        tutorFeedback: latestFeedback?.comment ?? null,
      };
    });

    const cefrHistory = timeline
      .filter((item) => item.cefrAssessment)
      .map((item) => ({
        date: item.completedAt,
        cefrAssessment: item.cefrAssessment,
      }));

    const latestCefr = cefrHistory[0]?.cefrAssessment ?? null;

    return {
      summary: {
        completedSessions: bookings.length,
        totalPoints: points?.points ?? 0,
        streakDays: points?.streakDays ?? 0,
        badgesCount,
        latestCefr,
      },
      cefrHistory,
      timeline,
    };
  }
}
