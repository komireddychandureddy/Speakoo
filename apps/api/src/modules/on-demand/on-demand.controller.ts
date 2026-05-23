import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OnDemandService } from './on-demand.service';
import { CreateOnDemandRequestDto } from './dto/create-on-demand-request.dto';
import { GlobalJwtAuthGuard } from '../auth/guards/global-jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(GlobalJwtAuthGuard, RolesGuard)
@Controller('on-demand')
export class OnDemandController {
  constructor(private readonly onDemandService: OnDemandService) {}

  /**
   * Learner requests an on-demand session with an available tutor.
   * TODO (Phase 2): Real-time matching and WebSocket notifications.
   */
  @Roles('learner')
  @Post('request')
  requestTutor(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateOnDemandRequestDto,
  ): Promise<{ requestId: string; status: string }> {
    return this.onDemandService.requestTutor(req.user.userId, dto);
  }
}
