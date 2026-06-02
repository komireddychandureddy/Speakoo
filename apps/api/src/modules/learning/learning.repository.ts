import { Injectable } from '@nestjs/common';
import { HomeworkStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPath(data: Prisma.LearningPathCreateInput) {
    return this.prisma.learningPath.create({ data });
  }

  addPathStep(pathId: string, data: Omit<Prisma.LearningPathStepUncheckedCreateInput, 'pathId'>) {
    return this.prisma.learningPathStep.create({
      data: {
        ...data,
        pathId,
      },
    });
  }

  listActivePaths() {
    return this.prisma.learningPath.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });
  }

  enrollLearnerInPath(learnerId: string, pathId: string) {
    return this.prisma.learnerPathEnrollment.upsert({
      where: {
        learnerId_pathId: {
          learnerId,
          pathId,
        },
      },
      create: {
        learnerId,
        pathId,
      },
      update: {
        updatedAt: new Date(),
      },
      include: {
        path: {
          include: {
            steps: {
              orderBy: { stepOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  listEnrollmentsForLearner(learnerId: string) {
    return this.prisma.learnerPathEnrollment.findMany({
      where: { learnerId },
      orderBy: { updatedAt: 'desc' },
      include: {
        path: {
          include: {
            steps: {
              orderBy: { stepOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  createSessionNote(data: Prisma.SessionNoteUncheckedCreateInput) {
    return this.prisma.sessionNote.upsert({
      where: { bookingId: data.bookingId },
      create: data,
      update: {
        summary: data.summary,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        nextSteps: data.nextSteps,
      },
      include: {
        booking: {
          select: {
            id: true,
            slot: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });
  }

  listSessionNotesForLearner(learnerId: string) {
    return this.prisma.sessionNote.findMany({
      where: { learnerId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            slot: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });
  }

  createHomework(data: Prisma.HomeworkAssignmentUncheckedCreateInput) {
    return this.prisma.homeworkAssignment.create({
      data,
      include: {
        booking: {
          select: {
            id: true,
            slot: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });
  }

  listHomeworkForLearner(learnerId: string) {
    return this.prisma.homeworkAssignment.findMany({
      where: { learnerId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        booking: {
          select: {
            id: true,
            slot: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });
  }

  getHomeworkById(id: string) {
    return this.prisma.homeworkAssignment.findUnique({ where: { id } });
  }

  submitHomework(id: string, submissionText: string) {
    return this.prisma.homeworkAssignment.update({
      where: { id },
      data: {
        submissionText,
        status: HomeworkStatus.submitted,
        updatedAt: new Date(),
      },
    });
  }

  reviewHomework(id: string, feedbackText: string) {
    return this.prisma.homeworkAssignment.update({
      where: { id },
      data: {
        feedbackText,
        status: HomeworkStatus.reviewed,
        reviewedAt: new Date(),
      },
    });
  }

  markOverdueHomework(now: Date) {
    return this.prisma.homeworkAssignment.updateMany({
      where: {
        status: HomeworkStatus.assigned,
        dueAt: {
          lt: now,
        },
      },
      data: {
        status: HomeworkStatus.overdue,
      },
    });
  }

  findBookingById(id: string) {
    return this.prisma.booking.findUnique({ where: { id } });
  }
}
