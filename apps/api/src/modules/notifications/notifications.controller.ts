import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { User } from '@prisma/client';
import { Body, Post } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('me')
  getMyNotifications(@CurrentUser() user: User, @Query() query: NotificationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.prisma.notificationLog.findMany({
      where: { userId: user.id },
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  @Post('device-token')
  async registerDeviceToken(@CurrentUser() user: User, @Body() dto: RegisterDeviceTokenDto) {
    return this.notificationsService.registerDeviceToken(user.id, dto.token);
  }
}
