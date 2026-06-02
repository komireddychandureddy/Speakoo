import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '@prisma/client';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get(':bookingId/token')
  getToken(@Param('bookingId') bookingId: string, @CurrentUser() user: User) {
    return this.sessionsService.generateToken(bookingId, user.id);
  }

  @Roles('tutor')
  @Post(':bookingId/start')
  startSession(@Param('bookingId') bookingId: string, @CurrentUser() user: User) {
    return this.sessionsService.startSession(bookingId, user.id);
  }

  @Roles('tutor')
  @Post(':bookingId/end')
  endSession(@Param('bookingId') bookingId: string, @CurrentUser() user: User) {
    return this.sessionsService.endSession(bookingId, user.id);
  }

  @Post(':bookingId/recording/start')
  startRecording(@Param('bookingId') bookingId: string, @CurrentUser() user: User) {
    return this.sessionsService.startRecording(bookingId, user.id);
  }

  @Post(':bookingId/recording/stop')
  stopRecording(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: User,
    @Body() body: { recordingUrl?: string },
  ) {
    return this.sessionsService.stopRecording(bookingId, user.id, body.recordingUrl);
  }
}
