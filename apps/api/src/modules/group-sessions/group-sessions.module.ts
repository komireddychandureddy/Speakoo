import { Module } from '@nestjs/common';
import { GroupSessionsController } from './group-sessions.controller';
import { GroupSessionsService } from './group-sessions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GroupSessionsController],
  providers: [GroupSessionsService],
})
export class GroupSessionsModule {}
