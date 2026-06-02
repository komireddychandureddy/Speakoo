import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentCategory, IncidentPriority, IncidentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SafetyRepository {
  constructor(private readonly prisma: PrismaService) {}

  createIncident(data: Prisma.IncidentReportCreateInput) {
    return this.prisma.incidentReport.create({
      data,
      include: {
        booking: true,
        reporter: { include: { profile: true } },
        reportedUser: { include: { profile: true } },
      },
    });
  }

  async findIncidentById(id: string) {
    const incident = await this.prisma.incidentReport.findUnique({
      where: { id },
      include: {
        booking: true,
        reporter: { include: { profile: true } },
        reportedUser: { include: { profile: true } },
        resolvedBy: { include: { profile: true } },
      },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return incident;
  }

  findMine(userId: string) {
    return this.prisma.incidentReport.findMany({
      where: {
        OR: [{ reporterId: userId }, { reportedUserId: userId }],
      },
      include: {
        booking: true,
        reporter: { include: { profile: true } },
        reportedUser: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForAdmin(params: {
    status?: IncidentStatus;
    priority?: IncidentPriority;
    category?: IncidentCategory;
    page: number;
    limit: number;
  }) {
    const where: Prisma.IncidentReportWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.priority ? { priority: params.priority } : {}),
      ...(params.category ? { category: params.category } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.incidentReport.findMany({
        where,
        include: {
          booking: true,
          reporter: { include: { profile: true } },
          reportedUser: { include: { profile: true } },
          resolvedBy: { include: { profile: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.incidentReport.count({ where }),
    ]);

    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  }

  updateIncident(id: string, data: Prisma.IncidentReportUpdateInput) {
    return this.prisma.incidentReport.update({
      where: { id },
      data,
      include: {
        booking: true,
        reporter: { include: { profile: true } },
        reportedUser: { include: { profile: true } },
        resolvedBy: { include: { profile: true } },
      },
    });
  }
}
