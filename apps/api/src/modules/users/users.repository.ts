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
}
