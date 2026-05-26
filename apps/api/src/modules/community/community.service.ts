import { Injectable } from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

  listThreads(language?: string, category?: string) {
    return this.communityRepository.findThreads(language, category);
  }

  getThread(id: string) {
    return this.communityRepository.findThread(id);
  }

  createThread(authorId: string, dto: CreateThreadDto) {
    return this.communityRepository.createThread(authorId, dto);
  }

  addReply(threadId: string, authorId: string, dto: CreateReplyDto) {
    return this.communityRepository.addReply(threadId, authorId, dto);
  }

  likeThread(id: string) {
    return this.communityRepository.likeThread(id);
  }
}
