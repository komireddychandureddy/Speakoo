import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { PracticeSessionStatus } from '@prisma/client';

@Injectable()
export class PracticeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(language?: string) {
    return this.prisma.practiceSession.findMany({
      where: {
        status: { in: [PracticeSessionStatus.scheduled, PracticeSessionStatus.live] },
        ...(language ? { language } : {}),
      },
      include: {
        host: { include: { profile: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.practiceSession.findUnique({
      where: { id },
      include: {
        host: { include: { profile: true } },
        participants: { include: { learner: { include: { profile: true } } } },
      },
    });
    if (!session) throw new NotFoundException('Practice session not found');
    return session;
  }

  async create(hostId: string, dto: CreatePracticeSessionDto) {
    return this.prisma.practiceSession.create({
      data: {
        hostId,
        language: dto.language,
        level: dto.level,
        title: dto.title,
        topic: dto.topic,
        type: dto.type,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes ?? 30,
        maxParticipants: dto.maxParticipants ?? 6,
        creditCost: dto.creditCost ?? 5,
      },
    });
  }

  async join(sessionId: string, learnerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.practiceSession.findUnique({
        where: { id: sessionId },
        include: { _count: { select: { participants: true } } },
      });
      if (!session) throw new NotFoundException('Practice session not found');
      if (session.status === PracticeSessionStatus.completed || session.status === PracticeSessionStatus.cancelled) {
        throw new ConflictException('Session is no longer open for joining');
      }
      if (session._count.participants >= session.maxParticipants) {
        throw new ConflictException('Session is full');
      }
      if (session.hostId === learnerId) {
        throw new ForbiddenException('Host cannot join as participant');
      }
      return tx.practiceParticipant.create({
        data: { sessionId, learnerId, creditCharged: session.creditCost },
      });
    });
  }

  async leave(sessionId: string, learnerId: string) {
    const participant = await this.prisma.practiceParticipant.findUnique({
      where: { sessionId_learnerId: { sessionId, learnerId } },
    });
    if (!participant) throw new NotFoundException('Participant record not found');
    return this.prisma.practiceParticipant.delete({
      where: { sessionId_learnerId: { sessionId, learnerId } },
    });
  }
}
