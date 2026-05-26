import { Injectable } from '@nestjs/common';
import { PracticeRepository } from './practice.repository';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';

@Injectable()
export class PracticeService {
  constructor(private readonly practiceRepository: PracticeRepository) {}

  list(language?: string) {
    return this.practiceRepository.findAll(language);
  }

  getById(id: string) {
    return this.practiceRepository.findById(id);
  }

  create(hostId: string, dto: CreatePracticeSessionDto) {
    return this.practiceRepository.create(hostId, dto);
  }

  join(sessionId: string, learnerId: string) {
    return this.practiceRepository.join(sessionId, learnerId);
  }

  leave(sessionId: string, learnerId: string) {
    return this.practiceRepository.leave(sessionId, learnerId);
  }
}
