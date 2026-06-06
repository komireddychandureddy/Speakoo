import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  listFaqItems() {
    return this.prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listResources(category?: string) {
    return this.prisma.learningResource.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listPracticeReadings(level?: string) {
    return this.prisma.practiceReadingPassage.findMany({
      where: {
        isActive: true,
        ...(level ? { cefrLevel: level.toUpperCase() } : {}),
      },
      orderBy: [{ cefrLevel: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listPracticeExerciseContent(mode?: string) {
    return this.prisma.practiceExerciseContent.findMany({
      where: {
        isActive: true,
        ...(mode ? { mode } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }
}
