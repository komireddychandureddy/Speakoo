import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

const POINTS_PER_SESSION = 10;
const BADGE_SLUGS = {
  FIRST_SESSION: 'first_session',
  TEN_SESSIONS: 'ten_sessions',
  THIRTY_DAY_STREAK: '30_day_streak',
};

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(reviewerId: string, dto: CreateFeedbackDto) {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: dto.bookingId },
      include: { session: true },
    });

    if (booking.learnerId !== reviewerId) {
      throw new BadRequestException('You can only submit feedback for your own bookings');
    }

    if (!booking.session) {
      throw new BadRequestException('No session found for this booking');
    }

    return this.prisma.sessionFeedback.create({
      data: {
        sessionId: booking.session.id,
        reviewerId,
        revieweeId: booking.tutorId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async upsertPointsAndAwardBadges(learnerId: string) {
    const existing = await this.prisma.learnerPoints.findUnique({ where: { learnerId } });

    const now = new Date();
    const lastSession = existing?.lastSession;
    const daysSinceLast = lastSession
      ? (now.getTime() - lastSession.getTime()) / 86_400_000
      : null;

    const streakDays =
      daysSinceLast !== null && daysSinceLast <= 1
        ? (existing?.streakDays ?? 0) + 1
        : 1;

    const updated = await this.prisma.learnerPoints.upsert({
      where: { learnerId },
      create: { learnerId, points: POINTS_PER_SESSION, streakDays, lastSession: now },
      update: {
        points: { increment: POINTS_PER_SESSION },
        streakDays,
        lastSession: now,
      },
    });

    const totalSessions = Math.floor(updated.points / POINTS_PER_SESSION);
    await this.checkAndAwardBadges(learnerId, totalSessions, updated.streakDays);

    return updated;
  }

  private async checkAndAwardBadges(learnerId: string, totalSessions: number, streakDays: number) {
    const slugsToAward: string[] = [];

    if (totalSessions === 1) slugsToAward.push(BADGE_SLUGS.FIRST_SESSION);
    if (totalSessions === 10) slugsToAward.push(BADGE_SLUGS.TEN_SESSIONS);
    if (streakDays >= 30) slugsToAward.push(BADGE_SLUGS.THIRTY_DAY_STREAK);

    if (!slugsToAward.length) return;

    for (const slug of slugsToAward) {
      const badge = await this.prisma.badge.findUnique({ where: { slug } });
      if (!badge) continue;
      await this.prisma.learnerBadge.upsert({
        where: { learnerId_badgeId: { learnerId, badgeId: badge.id } },
        create: { learnerId, badgeId: badge.id },
        update: {},
      });
    }
  }
}
