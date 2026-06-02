import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssignHomeworkDto } from './dto/assign-homework.dto';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { CreateLearningStepDto } from './dto/create-learning-step.dto';
import { CreateSessionNoteDto } from './dto/create-session-note.dto';
import { ReviewHomeworkDto } from './dto/review-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { LearningService } from './learning.service';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post('paths')
  @Roles('admin')
  createPath(@Body() dto: CreateLearningPathDto) {
    return this.learningService.createPath(dto);
  }

  @Post('paths/:pathId/steps')
  @Roles('admin')
  addPathStep(@Param('pathId') pathId: string, @Body() dto: CreateLearningStepDto) {
    return this.learningService.addPathStep(pathId, dto);
  }

  @Get('paths/me')
  @Roles('learner')
  listMyPaths(@CurrentUser() user: User) {
    return this.learningService.listPathsForLearner(user.id);
  }

  @Post('paths/:pathId/enroll')
  @Roles('learner')
  enrollInPath(@CurrentUser() user: User, @Param('pathId') pathId: string) {
    return this.learningService.enrollInPath(user.id, pathId);
  }

  @Post('session-notes')
  @Roles('tutor', 'admin')
  upsertSessionNote(@CurrentUser() user: User, @Body() dto: CreateSessionNoteDto) {
    return this.learningService.upsertSessionNote(user.id, user.role as UserRole, dto);
  }

  @Get('session-notes/me')
  @Roles('learner')
  listMySessionNotes(@CurrentUser() user: User) {
    return this.learningService.listSessionNotesForLearner(user.id);
  }

  @Post('homework')
  @Roles('tutor', 'admin')
  assignHomework(@CurrentUser() user: User, @Body() dto: AssignHomeworkDto) {
    return this.learningService.assignHomework(user.id, user.role as UserRole, dto);
  }

  @Get('homework/me')
  @Roles('learner')
  listMyHomework(@CurrentUser() user: User) {
    return this.learningService.listHomeworkForLearner(user.id);
  }

  @Patch('homework/:homeworkId/submit')
  @Roles('learner')
  submitHomework(
    @CurrentUser() user: User,
    @Param('homeworkId') homeworkId: string,
    @Body() dto: SubmitHomeworkDto,
  ) {
    return this.learningService.submitHomework(user.id, homeworkId, dto);
  }

  @Patch('homework/:homeworkId/review')
  @Roles('tutor', 'admin')
  reviewHomework(
    @CurrentUser() user: User,
    @Param('homeworkId') homeworkId: string,
    @Body() dto: ReviewHomeworkDto,
  ) {
    return this.learningService.reviewHomework(user.id, user.role as UserRole, homeworkId, dto);
  }
}
