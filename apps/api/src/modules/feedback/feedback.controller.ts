import { Controller, Post, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Roles('learner', 'tutor')
  @Post()
  submitFeedback(@CurrentUser() user: User, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.submitFeedback(user.id, dto);
  }
}
