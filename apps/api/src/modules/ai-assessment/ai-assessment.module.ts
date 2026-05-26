import { Module } from '@nestjs/common';
import { AiAssessmentController } from './ai-assessment.controller';
import { AiAssessmentService } from './ai-assessment.service';

@Module({
  controllers: [AiAssessmentController],
  providers: [AiAssessmentService],
})
export class AiAssessmentModule {}
