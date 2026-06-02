import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateGroupSessionDto } from './dto/create-group-session.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PracticeSessionStatus, PracticeSessionType } from '@prisma/client';

export interface GroupSessionSummary {
  id: string;
  title: string;
  language: string;
  scheduledAt: string;
  maxParticipants: number;
  priceCents: number;
  tutorId: string;
}

/**
 * Group sessions are persisted using the existing PracticeSession model.
 */
@Injectable()
export class GroupSessionsService {
  private readonly logger = new Logger(GroupSessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createGroupSession(
    tutorId: string,
    dto: CreateGroupSessionDto,
  ): Promise<GroupSessionSummary> {
    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid scheduledAt');
    }
    if (scheduledAt <= new Date()) {
      throw new BadRequestException('scheduledAt must be in the future');
    }

    const session = await this.prisma.practiceSession.create({
      data: {
        hostId: tutorId,
        language: dto.language,
        level: 'mixed',
        title: dto.title,
        topic: dto.title,
        type: PracticeSessionType.speaking,
        status: PracticeSessionStatus.scheduled,
        scheduledAt,
        durationMinutes: 60,
        maxParticipants: dto.maxParticipants,
        creditCost: Math.max(1, Math.round(dto.priceCents / 100)),
        livekitRoom: `group-${Date.now()}`,
      },
    });

    this.logger.log(`Tutor ${tutorId} created group session ${session.id}`);

    return {
      id: session.id,
      title: session.title,
      language: session.language,
      scheduledAt: session.scheduledAt.toISOString(),
      maxParticipants: session.maxParticipants,
      priceCents: dto.priceCents,
      tutorId,
    };
  }

  async listGroupSessions(): Promise<GroupSessionSummary[]> {
    const sessions = await this.prisma.practiceSession.findMany({
      where: {
        status: { in: [PracticeSessionStatus.scheduled, PracticeSessionStatus.live] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 100,
    });

    return sessions.map((session) => ({
      id: session.id,
      title: session.title,
      language: session.language,
      scheduledAt: session.scheduledAt.toISOString(),
      maxParticipants: session.maxParticipants,
      priceCents: session.creditCost * 100,
      tutorId: session.hostId,
    }));
  }
}
