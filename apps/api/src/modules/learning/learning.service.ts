import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AssignHomeworkDto } from './dto/assign-homework.dto';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { CreateLearningStepDto } from './dto/create-learning-step.dto';
import { CreateSessionNoteDto } from './dto/create-session-note.dto';
import { ReviewHomeworkDto } from './dto/review-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { LearningRepository } from './learning.repository';

@Injectable()
export class LearningService {
  constructor(private readonly learningRepository: LearningRepository) {}

  async createPath(dto: CreateLearningPathDto) {
    return this.learningRepository.createPath({
      slug: dto.slug.trim().toLowerCase(),
      title: dto.title.trim(),
      description: dto.description.trim(),
      language: dto.language.trim(),
      cefrLevel: dto.cefrLevel.trim().toUpperCase(),
      isActive: dto.isActive ?? true,
    });
  }

  async addPathStep(pathId: string, dto: CreateLearningStepDto) {
    return this.learningRepository.addPathStep(pathId, {
      stepOrder: dto.stepOrder,
      title: dto.title.trim(),
      description: dto.description.trim(),
      skill: dto.skill.trim(),
    });
  }

  async listPathsForLearner(learnerId: string) {
    const [paths, enrollments] = await Promise.all([
      this.learningRepository.listActivePaths(),
      this.learningRepository.listEnrollmentsForLearner(learnerId),
    ]);

    const enrollmentMap = new Map(enrollments.map((e) => [e.pathId, e]));
    return paths.map((path) => {
      const enrollment = enrollmentMap.get(path.id);
      return {
        ...path,
        enrollment: enrollment
          ? {
              currentStepOrder: enrollment.currentStepOrder,
              progressPercent: enrollment.progressPercent,
              startedAt: enrollment.startedAt,
            }
          : null,
      };
    });
  }

  async enrollInPath(learnerId: string, pathId: string) {
    return this.learningRepository.enrollLearnerInPath(learnerId, pathId);
  }

  async upsertSessionNote(actorId: string, actorRole: UserRole, dto: CreateSessionNoteDto) {
    const booking = await this.learningRepository.findBookingById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const isTutorOwner = booking.tutorId === actorId;
    const canWrite = actorRole === UserRole.admin || isTutorOwner;
    if (!canWrite) {
      throw new ForbiddenException('You cannot write notes for this session');
    }

    return this.learningRepository.createSessionNote({
      bookingId: booking.id,
      learnerId: booking.learnerId,
      tutorId: booking.tutorId,
      summary: dto.summary.trim(),
      strengths: dto.strengths?.trim(),
      weaknesses: dto.weaknesses?.trim(),
      nextSteps: dto.nextSteps?.trim(),
    });
  }

  async listSessionNotesForLearner(learnerId: string) {
    return this.learningRepository.listSessionNotesForLearner(learnerId);
  }

  async assignHomework(actorId: string, actorRole: UserRole, dto: AssignHomeworkDto) {
    if (dto.bookingId) {
      const booking = await this.learningRepository.findBookingById(dto.bookingId);
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.learnerId !== dto.learnerId) {
        throw new BadRequestException('Booking learner mismatch');
      }

      const isTutorOwner = booking.tutorId === actorId;
      const canAssign = actorRole === UserRole.admin || isTutorOwner;
      if (!canAssign) {
        throw new ForbiddenException('You cannot assign homework for this booking');
      }

      return this.learningRepository.createHomework({
        learnerId: dto.learnerId,
        tutorId: booking.tutorId,
        bookingId: booking.id,
        title: dto.title.trim(),
        description: dto.description.trim(),
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      });
    }

    if (actorRole !== UserRole.admin && !dto.tutorId) {
      throw new BadRequestException('tutorId is required when bookingId is not provided');
    }

    return this.learningRepository.createHomework({
      learnerId: dto.learnerId,
      tutorId: dto.tutorId,
      title: dto.title.trim(),
      description: dto.description.trim(),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    });
  }

  async listHomeworkForLearner(learnerId: string) {
    await this.learningRepository.markOverdueHomework(new Date());
    return this.learningRepository.listHomeworkForLearner(learnerId);
  }

  async submitHomework(learnerId: string, homeworkId: string, dto: SubmitHomeworkDto) {
    const homework = await this.learningRepository.getHomeworkById(homeworkId);
    if (!homework) {
      throw new NotFoundException('Homework assignment not found');
    }

    if (homework.learnerId !== learnerId) {
      throw new ForbiddenException('You can only submit your own homework');
    }

    return this.learningRepository.submitHomework(homeworkId, dto.submissionText.trim());
  }

  async reviewHomework(
    actorId: string,
    actorRole: UserRole,
    homeworkId: string,
    dto: ReviewHomeworkDto,
  ) {
    const homework = await this.learningRepository.getHomeworkById(homeworkId);
    if (!homework) {
      throw new NotFoundException('Homework assignment not found');
    }

    const canReview = actorRole === UserRole.admin || homework.tutorId === actorId;
    if (!canReview) {
      throw new ForbiddenException('You cannot review this homework');
    }

    return this.learningRepository.reviewHomework(homeworkId, dto.feedbackText.trim());
  }
}
