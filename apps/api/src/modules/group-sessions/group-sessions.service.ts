import { Injectable, Logger } from '@nestjs/common';
import { CreateGroupSessionDto } from './dto/create-group-session.dto';

export interface GroupSessionSummary {
  id: string;
  title: string;
  language: string;
  scheduledAt: string;
  maxParticipants: number;
  priceCents: number;
  tutorId: string;
}

/**
 * TODO (Phase 2): Persist group sessions to the database via a GroupSessionsRepository
 * and integrate with LiveKit multi-participant room creation.
 */
@Injectable()
export class GroupSessionsService {
  private readonly logger = new Logger(GroupSessionsService.name);

  async createGroupSession(
    tutorId: string,
    dto: CreateGroupSessionDto,
  ): Promise<GroupSessionSummary> {
    this.logger.log(`Tutor ${tutorId} creating group session — DB integration pending`);

    // TODO: persist to group_sessions table and generate LiveKit room
    return { id: `gs_${Date.now()}`, tutorId, ...dto };
  }

  async listGroupSessions(): Promise<GroupSessionSummary[]> {
    this.logger.log('Listing group sessions — DB integration pending');

    // TODO: query group_sessions table with upcoming filter
    return [];
  }
}
