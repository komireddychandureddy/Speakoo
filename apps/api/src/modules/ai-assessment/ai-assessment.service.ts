import { Injectable, Logger } from '@nestjs/common';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

/**
 * TODO (Phase 2): Integrate an AI/ML provider (e.g. OpenAI) to evaluate learner
 * responses and map them to a CEFR level (A1–C2).
 */
@Injectable()
export class AiAssessmentService {
  private readonly logger = new Logger(AiAssessmentService.name);

  async assessCefrLevel(
    userId: string,
    dto: CreateAssessmentDto,
  ): Promise<{ userId: string; cefrLevel: string }> {
    this.logger.log(
      `Assessing CEFR level for user ${userId} with ${dto.answers?.length ?? 0} answers — AI integration pending`,
    );

    // TODO: call AI provider with dto.answers and return evaluated CEFR level
    return { userId, cefrLevel: 'A1' };
  }
}
