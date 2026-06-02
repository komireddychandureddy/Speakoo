import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentReportDto } from './dto/create-incident-report.dto';
import { QueryIncidentsDto } from './dto/query-incidents.dto';
import { TriageIncidentDto } from './dto/triage-incident.dto';
import { SafetyRepository } from './safety.repository';

@Injectable()
export class SafetyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safetyRepository: SafetyRepository,
  ) {}

  private defaultPriority(category: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (category) {
      case 'abuse':
      case 'harassment':
        return 'critical';
      case 'payment_dispute':
        return 'high';
      case 'technical_issue':
        return 'medium';
      case 'no_show':
      case 'other':
      default:
        return 'low';
    }
  }

  async createIncident(reporterId: string, dto: CreateIncidentReportDto) {
    const reporter = await this.prisma.user.findUnique({ where: { id: reporterId } });
    if (!reporter) {
      throw new NotFoundException('Reporter not found');
    }

    let booking: { id: string; learnerId: string; tutorId: string } | null = null;
    if (dto.bookingId) {
      booking = await this.prisma.booking.findUnique({
        where: { id: dto.bookingId },
        select: { id: true, learnerId: true, tutorId: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.learnerId !== reporterId && booking.tutorId !== reporterId) {
        throw new BadRequestException('You can only report incidents for your own bookings');
      }
    }

    let reportedUserId = dto.reportedUserId;
    if (booking && !reportedUserId) {
      reportedUserId = booking.learnerId === reporterId ? booking.tutorId : booking.learnerId;
    }

    if (reportedUserId) {
      if (reportedUserId === reporterId) {
        throw new BadRequestException('You cannot report yourself');
      }

      const reportedUser = await this.prisma.user.findUnique({ where: { id: reportedUserId } });
      if (!reportedUser) {
        throw new NotFoundException('Reported user not found');
      }

      if (booking && reportedUserId !== booking.learnerId && reportedUserId !== booking.tutorId) {
        throw new BadRequestException('Reported user must belong to the selected booking');
      }
    }

    const createData = {
      category: dto.category,
      description: dto.description.trim(),
      priority: dto.priority ?? this.defaultPriority(dto.category),
      evidenceUrls: dto.evidenceUrls ?? [],
      reporter: { connect: { id: reporterId } },
      ...(dto.bookingId ? { booking: { connect: { id: dto.bookingId } } } : {}),
      ...(reportedUserId ? { reportedUser: { connect: { id: reportedUserId } } } : {}),
    };

    return this.safetyRepository.createIncident(createData);
  }

  getMyIncidents(userId: string) {
    return this.safetyRepository.findMine(userId);
  }

  listIncidentsForAdmin(query: QueryIncidentsDto) {
    return this.safetyRepository.findForAdmin({
      status: query.status,
      priority: query.priority,
      category: query.category,
      page: query.page ?? 1,
      limit: Math.min(query.limit ?? 20, 100),
    });
  }

  getIncidentById(id: string) {
    return this.safetyRepository.findIncidentById(id);
  }

  async triageIncident(id: string, adminId: string, dto: TriageIncidentDto) {
    await this.safetyRepository.findIncidentById(id);

    const shouldSetResolvedBy = dto.status === 'resolved' || dto.status === 'dismissed';

    const data = {
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.priority ? { priority: dto.priority } : {}),
      ...(dto.adminNote?.trim() ? { adminNote: dto.adminNote.trim() } : {}),
      ...(shouldSetResolvedBy
        ? {
            resolvedBy: { connect: { id: adminId } },
            resolvedAt: new Date(),
          }
        : {}),
    };

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No triage fields provided');
    }

    return this.safetyRepository.updateIncident(id, data);
  }
}
