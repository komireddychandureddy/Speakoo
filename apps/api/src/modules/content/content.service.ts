import { Injectable } from '@nestjs/common';
import { ContentRepository } from './content.repository';

@Injectable()
export class ContentService {
  constructor(private readonly contentRepository: ContentRepository) {}

  listFaqItems() {
    return this.contentRepository.listFaqItems();
  }

  listResources(category?: string) {
    return this.contentRepository.listResources(category);
  }

  listPracticeReadings(level?: string) {
    return this.contentRepository.listPracticeReadings(level);
  }

  listPracticeExerciseContent(mode?: string) {
    return this.contentRepository.listPracticeExerciseContent(mode);
  }
}
