import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { SearchTutorsDto } from './dto/search-tutors.dto';

@Injectable()
export class TutorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertProfile(userId: string, dto: CreateTutorProfileDto) {
    return this.prisma.tutorProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  findProfileByUserId(userId: string) {
    return this.prisma.tutorProfile.findUniqueOrThrow({ where: { userId } });
  }

  async createSlot(userId: string, dto: CreateAvailabilitySlotDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutorProfile) throw new NotFoundException('Tutor profile not found');

    return this.prisma.availabilitySlot.create({
      data: { tutorId: tutorProfile.id, startTime: start, endTime: end },
    });
  }

  async findAvailableSlots(userId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutorProfile) throw new NotFoundException('Tutor profile not found');

    return this.prisma.availabilitySlot.findMany({
      where: { tutorId: tutorProfile.id, status: 'available' },
      orderBy: { startTime: 'asc' },
    });
  }

  async searchTutors(dto: SearchTutorsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.tutorProfile.findMany({
        where: {
          isApproved: true,
          ...(dto.language ? { languagesTaught: { has: dto.language } } : {}),
          ...(dto.minCents !== undefined ? { hourlyRateCents: { gte: dto.minCents } } : {}),
          ...(dto.maxCents !== undefined ? { hourlyRateCents: { lte: dto.maxCents } } : {}),
        },
        include: { user: { select: { id: true, role: true, profile: { select: { displayName: true, avatarUrl: true, bio: true, countryCode: true } } } } },
        orderBy: { hourlyRateCents: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tutorProfile.count({
        where: {
          isApproved: true,
          ...(dto.language ? { languagesTaught: { has: dto.language } } : {}),
          ...(dto.minCents !== undefined ? { hourlyRateCents: { gte: dto.minCents } } : {}),
          ...(dto.maxCents !== undefined ? { hourlyRateCents: { lte: dto.maxCents } } : {}),
        },
      }),
    ]);
    return { items, total, page, limit };
  }

  findPublicTutorProfile(userId: string) {
    return this.prisma.tutorProfile.findUniqueOrThrow({
      where: { userId },
      include: { user: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true, bio: true, countryCode: true } } } } },
    });
  }
}
