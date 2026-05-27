import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService, NOTIFICATION_QUEUE } from './notifications.service';
import { NotificationProcessor } from './processors/notification.processor';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
