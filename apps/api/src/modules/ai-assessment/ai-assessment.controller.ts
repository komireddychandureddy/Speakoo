import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiAssessmentService } from './ai-assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { GlobalJwtAuthGuard } from '../auth/guards/global-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(GlobalJwtAuthGuard)
@Controller('ai-assessment')
export class AiAssessmentController {
  constructor(private readonly aiAssessmentService: AiAssessmentService) {}

  /**
   * Submits placement-test answers and returns the learner's estimated CEFR level.
   * TODO (Phase 2): Full AI evaluation integration.
   */
  @Post('placement-test')
  assessCefrLevel(
    @CurrentUser() user: User,
    @Body() dto: CreateAssessmentDto,
  ): Promise<{ userId: string; cefrLevel: string }> {
    return this.aiAssessmentService.assessCefrLevel(user.id, dto);
  }
}
