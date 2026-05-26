import { Injectable } from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  async submitFeedback(reviewerId: string, dto: CreateFeedbackDto) {
    const feedback = await this.feedbackRepository.createFeedback(reviewerId, dto);
    await this.feedbackRepository.upsertPointsAndAwardBadges(reviewerId);
    return feedback;
  }
}
