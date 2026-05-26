import { Module } from '@nestjs/common';
import { GroupSessionsController } from './group-sessions.controller';
import { GroupSessionsService } from './group-sessions.service';

@Module({
  controllers: [GroupSessionsController],
  providers: [GroupSessionsService],
})
export class GroupSessionsModule {}
