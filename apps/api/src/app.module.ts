import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TutorsModule } from './modules/tutors/tutors.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiAssessmentModule } from './modules/ai-assessment/ai-assessment.module';
import { OnDemandModule } from './modules/on-demand/on-demand.module';
import { GroupSessionsModule } from './modules/group-sessions/group-sessions.module';
import { HealthModule } from './modules/health/health.module';
import { PracticeModule } from './modules/practice/practice.module';
import { CommunityModule } from './modules/community/community.module';
import { SafetyModule } from './modules/safety/safety.module';
import { LearningModule } from './modules/learning/learning.module';
import { ContentModule } from './modules/content/content.module';
import { GlobalJwtAuthGuard } from './modules/auth/guards/global-jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
    }),

    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 60,
      },
      {
        name: 'auth',
        ttl: 15 * 60_000,
        limit: 5,
      },
    ]),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.getOrThrow<string>('REDIS_URL'),
      }),
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    TutorsModule,
    BookingsModule,
    SessionsModule,
    PaymentsModule,
    NotificationsModule,
    FeedbackModule,
    AdminModule,
    AiAssessmentModule,
    OnDemandModule,
    GroupSessionsModule,
    HealthModule,
    PracticeModule,
    CommunityModule,
    SafetyModule,
    LearningModule,
    ContentModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GlobalJwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
