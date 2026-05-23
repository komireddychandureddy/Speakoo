import { Injectable, Logger } from '@nestjs/common';
import { CreateOnDemandRequestDto } from './dto/create-on-demand-request.dto';

/**
 * TODO (Phase 2): Implement real-time tutor matching for on-demand session requests.
 * Integrate with a presence/availability service and notify available tutors via WebSocket.
 */
@Injectable()
export class OnDemandService {
  private readonly logger = new Logger(OnDemandService.name);

  async requestTutor(
    learnerId: string,
    dto: CreateOnDemandRequestDto,
  ): Promise<{ requestId: string; status: string }> {
    this.logger.log(`On-demand tutor request from learner ${learnerId} — matching pending`);

    // TODO: find an available online tutor for dto.language/dto.topic and notify them
    const requestId = `odr_${Date.now()}`;
    return { requestId, status: 'searching' };
  }
}
