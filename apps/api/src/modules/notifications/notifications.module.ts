import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService, NOTIFICATION_QUEUE } from './notifications.service';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
