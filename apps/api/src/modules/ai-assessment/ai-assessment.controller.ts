import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiAssessmentService } from './ai-assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { GlobalJwtAuthGuard } from '../auth/guards/global-jwt-auth.guard';

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
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateAssessmentDto,
  ): Promise<{ userId: string; cefrLevel: string }> {
    return this.aiAssessmentService.assessCefrLevel(req.user.userId, dto);
  }
}
