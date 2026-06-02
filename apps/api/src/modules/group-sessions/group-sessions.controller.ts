import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { GroupSessionsService, GroupSessionSummary } from './group-sessions.service';
import { CreateGroupSessionDto } from './dto/create-group-session.dto';
import { GlobalJwtAuthGuard } from '../auth/guards/global-jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('group-sessions')
export class GroupSessionsController {
  constructor(private readonly groupSessionsService: GroupSessionsService) {}

  /**
   * Returns all upcoming public group sessions. No auth required.
   */
  @Public()
  @Get()
  listGroupSessions(): Promise<GroupSessionSummary[]> {
    return this.groupSessionsService.listGroupSessions();
  }

  /**
   * Tutor creates a new group session.
   * TODO (Phase 2): LiveKit multi-participant room creation.
   */
  @UseGuards(GlobalJwtAuthGuard, RolesGuard)
  @Roles('tutor')
  @Post()
  createGroupSession(
    @CurrentUser() user: User,
    @Body() dto: CreateGroupSessionDto,
  ): Promise<GroupSessionSummary> {
    return this.groupSessionsService.createGroupSession(user.id, dto);
  }
}
