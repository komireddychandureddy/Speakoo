import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { SearchTutorsDto } from './dto/search-tutors.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { CreatePublicTutorApplicationDto } from './dto/create-public-tutor-application.dto';
import { CreateBulkSlotsDto } from './dto/create-bulk-slots.dto';

const BCRYPT_ROUNDS = 12;

function buildLegacyStyleRef(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let index = 0; index < 5; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `TUT-${code}`;
}

@Injectable()
export class TutorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueApplicationRef(
    tx: PrismaService | Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = buildLegacyStyleRef();
      const existing = await tx.tutorKycSubmission.findUnique({
        where: { applicationRef: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }

    throw new ConflictException('Could not allocate a unique tutor application reference');
  }

  private async backfillMissingApplicationRefs(): Promise<void> {
    const pending = await this.prisma.tutorKycSubmission.findMany({
      where: { applicationRef: null },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    for (const item of pending) {
      const reference = await this.generateUniqueApplicationRef();
      await this.prisma.tutorKycSubmission.update({
        where: { id: item.id },
        data: { applicationRef: reference },
      });
    }
  }

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

    const overlap = await this.prisma.availabilitySlot.findFirst({
      where: {
        tutorId: tutorProfile.id,
        status: { not: 'blocked' },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (overlap) {
      throw new ConflictException('Slot overlaps with an existing availability slot');
    }

    return this.prisma.availabilitySlot.create({
      data: { tutorId: tutorProfile.id, startTime: start, endTime: end },
    });
  }

  async findAvailableSlots(userId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutorProfile) throw new NotFoundException('Tutor profile not found');

    return this.prisma.availabilitySlot.findMany({
      where: { tutorId: tutorProfile.id },
      orderBy: { startTime: 'asc' },
    });
  }

  async deleteSlot(userId: string, slotId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutorProfile) throw new NotFoundException('Tutor profile not found');

    const slot = await this.prisma.availabilitySlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.tutorId !== tutorProfile.id) {
      throw new ConflictException('You can only remove your own slots');
    }
    if (slot.status === 'booked') {
      throw new ConflictException('Booked slots cannot be removed');
    }

    await this.prisma.availabilitySlot.delete({ where: { id: slotId } });
    return { deleted: true };
  }

  async createBulkSlots(userId: string, dto: CreateBulkSlotsDto) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutorProfile) throw new NotFoundException('Tutor profile not found');

    const slots = await Promise.all(
      dto.slots.map((slot: { startTime: string; endTime: string }) =>
        this.prisma.availabilitySlot.create({
          data: {
            tutorId: tutorProfile.id,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            status: 'available',
          },
        }),
      ),
    );

    return slots;
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
        include: {
          user: {
            select: {
              id: true,
              role: true,
              profile: {
                select: { displayName: true, avatarUrl: true, bio: true, countryCode: true },
              },
            },
          },
        },
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
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: { displayName: true, avatarUrl: true, bio: true, countryCode: true },
            },
          },
        },
      },
    });
  }

  async findPublicSlots(userId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutorProfile) throw new NotFoundException('Tutor profile not found');

    return this.prisma.availabilitySlot.findMany({
      where: { tutorId: tutorProfile.id, status: 'available', startTime: { gte: new Date() } },
      orderBy: { startTime: 'asc' },
    });
  }

  async findRecommendedTutors(
    learnerId: string,
    options: { language?: string; maxCents?: number; limit: number },
  ) {
    const learner = await this.prisma.user.findUnique({
      where: { id: learnerId },
      select: {
        profile: {
          select: {
            nativeLanguage: true,
          },
        },
      },
    });

    const candidates = await this.prisma.tutorProfile.findMany({
      where: {
        isApproved: true,
        ...(options.language ? { languagesTaught: { has: options.language } } : {}),
        ...(options.maxCents !== undefined ? { hourlyRateCents: { lte: options.maxCents } } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
                bio: true,
                countryCode: true,
              },
            },
          },
        },
      },
      take: 200,
    });

    if (candidates.length === 0) {
      return [];
    }

    const tutorIds = candidates.map((c) => c.userId);

    const ratingStats = await this.prisma.sessionFeedback.groupBy({
      by: ['revieweeId'],
      where: {
        revieweeId: { in: tutorIds },
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const ratingMap = new Map(
      ratingStats.map((r) => [
        r.revieweeId,
        { avg: r._avg.rating ?? 0, count: r._count._all ?? 0 },
      ]),
    );

    const targetLanguage = options.language?.toLowerCase();
    const learnerNativeLanguage = learner?.profile?.nativeLanguage?.toLowerCase();

    const ranked = candidates
      .map((candidate) => {
        const stats = ratingMap.get(candidate.userId);
        const avgRating = stats?.avg ?? 0;
        const ratingCount = stats?.count ?? 0;

        const priceScore = Math.max(0, 1 - candidate.hourlyRateCents / 20000);
        const ratingScore = avgRating > 0 ? avgRating / 5 : 0.5;
        const socialProofScore = Math.min(1, ratingCount / 20);
        const languageMatch =
          targetLanguage &&
          candidate.languagesTaught.some((lang) => lang.toLowerCase() === targetLanguage)
            ? 1
            : 0;
        const nativeLanguageBonus =
          learnerNativeLanguage &&
          candidate.languagesTaught.some((lang) => lang.toLowerCase() === learnerNativeLanguage)
            ? 0.05
            : 0;

        const score =
          languageMatch * 0.35 +
          ratingScore * 0.35 +
          socialProofScore * 0.15 +
          priceScore * 0.15 +
          nativeLanguageBonus;

        return {
          ...candidate,
          recommendationScore: Number(score.toFixed(4)),
          rating: {
            average: Number(avgRating.toFixed(2)),
            count: ratingCount,
          },
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, options.limit);

    return ranked;
  }

  async submitPublicApplication(dto: CreatePublicTutorApplicationDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const displayName = `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim();
    const phone = dto.phone?.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { tutorProfile: true },
    });

    if (existingUser && existingUser.role !== UserRole.tutor) {
      throw new ConflictException('Email is already registered with a non-tutor account');
    }

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS),
          role: UserRole.tutor,
          ...(phone ? { phoneNumber: phone } : {}),
        },
      }));

    await this.prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName,
        bio: dto.bio.trim(),
        ...(phone ? { phoneNumber: phone } : {}),
      },
      update: {
        displayName,
        bio: dto.bio.trim(),
        ...(phone ? { phoneNumber: phone } : {}),
      },
    });

    await this.prisma.tutorProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        languagesTaught: dto.languages,
        hourlyRateCents: 2500,
        cefrSpecialties: [dto.proficiency],
        isApproved: false,
      },
      update: {
        languagesTaught: dto.languages,
        cefrSpecialties: [dto.proficiency],
        isApproved: false,
      },
    });

    const submission = await this.prisma.tutorKycSubmission.create({
      data: {
        applicationRef: await this.generateUniqueApplicationRef(),
        tutorUserId: user.id,
        documentType: 'public_tutor_application',
        documentFrontUrl: 'https://speakoo.duckdns.org/tutor-apply',
        note: [
          `Public apply form`,
          `Location: ${dto.city ? `${dto.city}, ` : ''}${dto.country}`,
          `Experience: ${dto.yearsExp}`,
          `Certifications: ${dto.certifications?.join(', ') || 'None'}`,
          `Teaching style: ${dto.teachingStyle || 'Not provided'}`,
          `Max sessions: ${dto.maxSessions || 'Not provided'}`,
          `Availability: ${dto.availability.join(', ')}`,
        ].join(' | '),
      },
      include: {
        tutor: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    return {
      submissionId: submission.id,
      tutorUserId: user.id,
      status: submission.status,
      applicationReference: submission.applicationRef,
      tutor: submission.tutor,
    };
  }

  async submitKyc(userId: string, dto: SubmitKycDto) {
    return this.prisma.tutorKycSubmission.create({
      data: {
        applicationRef: await this.generateUniqueApplicationRef(),
        tutorUserId: userId,
        documentType: dto.documentType,
        documentFrontUrl: dto.documentFrontUrl,
        ...(dto.documentBackUrl ? { documentBackUrl: dto.documentBackUrl } : {}),
        ...(dto.selfieUrl ? { selfieUrl: dto.selfieUrl } : {}),
        ...(dto.note ? { note: dto.note } : {}),
      },
      include: {
        tutor: { select: { id: true, email: true, profile: true } },
      },
    });
  }

  async listMyKycSubmissions(userId: string) {
    await this.backfillMissingApplicationRefs();
    return this.prisma.tutorKycSubmission.findMany({
      where: { tutorUserId: userId },
      include: {
        reviewedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listKycSubmissionsForAdmin(params: {
    status?: 'pending' | 'approved' | 'rejected';
    page: number;
    limit: number;
  }) {
    await this.backfillMissingApplicationRefs();

    const where = params.status ? { status: params.status } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tutorKycSubmission.findMany({
        where,
        include: {
          tutor: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true, countryCode: true } },
              tutorProfile: { select: { isApproved: true, languagesTaught: true } },
            },
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true } },
            },
          },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.tutorKycSubmission.count({ where }),
    ]);

    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  }

  async reviewKycSubmission(
    submissionId: string,
    reviewerId: string,
    status: 'approved' | 'rejected',
    note?: string,
  ) {
    const submission = await this.prisma.tutorKycSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('KYC submission not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.tutorKycSubmission.update({
        where: { id: submissionId },
        data: {
          status,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          ...(note ? { note } : {}),
        },
        include: {
          tutor: {
            select: {
              id: true,
              email: true,
              profile: true,
              tutorProfile: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true } },
            },
          },
        },
      });

      if (status === 'approved') {
        await tx.tutorProfile.updateMany({
          where: { userId: submission.tutorUserId },
          data: { isApproved: true },
        });
      }

      return updated;
    });
  }
}
