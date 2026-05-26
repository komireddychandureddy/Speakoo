import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ThreadCategory } from '@prisma/client';

@Injectable()
export class CommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findThreads(language?: string, category?: string) {
    return this.prisma.communityThread.findMany({
      where: {
        ...(language ? { language } : {}),
        ...(category ? { category: category as ThreadCategory } : {}),
      },
      include: { author: { include: { profile: true } } },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
  }

  async findThread(id: string) {
    const thread = await this.prisma.communityThread.findUnique({
      where: { id },
      include: {
        author: { include: { profile: true } },
        replies: {
          include: { author: { include: { profile: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  async createThread(authorId: string, dto: CreateThreadDto) {
    return this.prisma.communityThread.create({
      data: {
        authorId,
        language: dto.language,
        title: dto.title,
        body: dto.body,
        category: dto.category,
        tags: dto.tags ?? [],
      },
    });
  }

  async addReply(threadId: string, authorId: string, dto: CreateReplyDto) {
    const thread = await this.prisma.communityThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Thread not found');
    return this.prisma.$transaction(async (tx) => {
      const reply = await tx.communityReply.create({
        data: { threadId, authorId, body: dto.body },
      });
      await tx.communityThread.update({
        where: { id: threadId },
        data: { replyCount: { increment: 1 } },
      });
      return reply;
    });
  }

  async likeThread(id: string) {
    const thread = await this.prisma.communityThread.findUnique({ where: { id } });
    if (!thread) throw new NotFoundException('Thread not found');
    return this.prisma.communityThread.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
  }
}
