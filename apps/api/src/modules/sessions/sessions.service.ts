import {
  Injectable,
  ForbiddenException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, NotificationChannel } from '@prisma/client';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendSessionNudgeDto } from './dto/send-session-nudge.dto';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private static readonly JOIN_EARLY_WINDOW_MS = 5 * 60_000;
  private static readonly BUFFER_WINDOW_MS = 5 * 60_000;
  private presenceTableReady?: Promise<void>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async ensurePresenceTable() {
    if (!this.presenceTableReady) {
      this.presenceTableReady = this.prisma
        .$executeRawUnsafe(
          `
          CREATE TABLE IF NOT EXISTS session_presence (
            booking_id UUID NOT NULL,
            user_id UUID NOT NULL,
            joined_at TIMESTAMPTZ,
            left_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (booking_id, user_id)
          )
        `,
        )
        .then(() => undefined);
    }
    await this.presenceTableReady;
  }

  private async hasUserJoinedSession(bookingId: string, userId: string): Promise<boolean> {
    await this.ensurePresenceTable();
    const rows = await this.prisma.$queryRaw<
      Array<{ joined_at: Date | null; left_at: Date | null }>
    >`
      SELECT joined_at, left_at
      FROM session_presence
      WHERE booking_id = ${bookingId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `;

    if (!rows.length) return false;
    const entry = rows[0];
    if (!entry.joined_at) return false;
    if (!entry.left_at) return true;
    return entry.joined_at.getTime() > entry.left_at.getTime();
  }

  private getJoinWindowStart(startTime: Date): Date {
    return new Date(startTime.getTime() - SessionsService.JOIN_EARLY_WINDOW_MS);
  }

  private getEarliestManualEnd(endTime: Date): Date {
    return new Date(endTime.getTime() - SessionsService.BUFFER_WINDOW_MS);
  }

  private async autoCompleteSessionIfPastEnd(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true, session: true },
    });
    if (!booking) return;

    if (booking.status !== BookingStatus.confirmed && booking.status !== BookingStatus.in_session) {
      return;
    }

    const now = new Date();
    if (now.getTime() < booking.slot.endTime.getTime()) {
      return;
    }

    const startedAt = booking.session?.startedAt ?? booking.slot.startTime;
    const endedAt = booking.slot.endTime;
    const durationMinutes = Math.max(
      0,
      Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000),
    );

    await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.completed },
      }),
      this.prisma.session.upsert({
        where: { bookingId },
        create: {
          bookingId,
          startedAt,
          endedAt,
          durationMinutes,
        },
        update: {
          startedAt,
          endedAt,
          durationMinutes,
        },
      }),
    ]);

    await this.paymentsService.payoutToTutor(bookingId);
  }

  async generateToken(
    bookingId: string,
    userId: string,
  ): Promise<{ token: string; wsUrl: string }> {
    await this.autoCompleteSessionIfPastEnd(bookingId);

    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { slot: true },
    });

    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) throw new ForbiddenException('Not a participant of this session');

    if (booking.status === BookingStatus.cancelled) {
      throw new ConflictException('Booking is cancelled');
    }

    if (booking.status === BookingStatus.pending) {
      throw new ConflictException('Session is not available until payment is completed');
    }

    if (booking.status === BookingStatus.completed) {
      throw new ConflictException('Session has already completed');
    }

    const now = new Date();
    const joinWindowStart = this.getJoinWindowStart(booking.slot.startTime);
    if (now.getTime() < joinWindowStart.getTime()) {
      throw new ConflictException('Join is enabled only 5 minutes before session start');
    }

    if (now.getTime() >= booking.slot.endTime.getTime()) {
      throw new ConflictException('Session has ended');
    }

    const apiKey = this.config.getOrThrow<string>('LIVEKIT_API_KEY');
    const apiSecret = this.config.getOrThrow<string>('LIVEKIT_API_SECRET');

    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      ttl: '4h',
    });

    token.addGrant({
      roomJoin: true,
      room: booking.livekitRoom,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();
    const wsUrl = this.config.getOrThrow<string>('LIVEKIT_WS_URL');
    this.logger.log(`Token generated for user ${userId} in room ${booking.livekitRoom}`);
    return { token: jwt, wsUrl };
  }

  async startSession(bookingId: string, userId: string) {
    await this.autoCompleteSessionIfPastEnd(bookingId);

    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (booking.tutorId !== userId) throw new ForbiddenException('Only tutor can start session');
    if (booking.status !== BookingStatus.confirmed) {
      throw new ConflictException('Booking must be confirmed before starting');
    }

    const now = new Date();
    const joinWindowStart = this.getJoinWindowStart(booking.slot.startTime);
    if (now.getTime() < joinWindowStart.getTime()) {
      throw new ConflictException('Session can be started only within 5 minutes of start time');
    }

    if (now.getTime() >= booking.slot.endTime.getTime()) {
      throw new ConflictException('Session has already ended');
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.in_session },
    });

    const learnerJoined = await this.hasUserJoinedSession(bookingId, booking.learnerId);
    if (!learnerJoined) {
      await this.notificationsService.sendSessionJoinNudge({
        bookingId,
        targetUserId: booking.learnerId,
        senderUserId: userId,
        message: 'Your tutor has joined the session. Please join now.',
        channel: NotificationChannel.push,
      });
    }

    return this.prisma.session.upsert({
      where: { bookingId },
      create: { bookingId, startedAt: now },
      update: { startedAt: now },
    });
  }

  async endSession(bookingId: string, userId: string) {
    await this.autoCompleteSessionIfPastEnd(bookingId);

    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (booking.tutorId !== userId) throw new ForbiddenException('Only tutor can end session');
    if (booking.status !== BookingStatus.in_session) {
      throw new ConflictException('Session is not in progress');
    }

    const session = await this.prisma.session.findUniqueOrThrow({ where: { bookingId } });
    const now = new Date();
    const earliestManualEnd = this.getEarliestManualEnd(booking.slot.endTime);
    if (now.getTime() < earliestManualEnd.getTime()) {
      throw new ConflictException('Session can be ended only in the final 5-minute buffer');
    }

    const endedAt = now.getTime() > booking.slot.endTime.getTime() ? booking.slot.endTime : now;
    const durationMinutes = Math.round(
      (endedAt.getTime() - (session.startedAt?.getTime() ?? endedAt.getTime())) / 60_000,
    );

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.completed },
    });

    const updatedSession = await this.prisma.session.update({
      where: { bookingId },
      data: { endedAt, durationMinutes },
    });

    await this.paymentsService.payoutToTutor(bookingId);

    return updatedSession;
  }

  async startRecording(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) throw new ForbiddenException('Not a participant of this session');

    if (booking.status !== BookingStatus.in_session) {
      throw new ConflictException('Recording can only start while session is in progress');
    }

    await this.prisma.session.upsert({
      where: { bookingId },
      create: { bookingId, startedAt: new Date() },
      update: {},
    });

    return { recording: true };
  }

  async stopRecording(bookingId: string, userId: string, recordingUrl?: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) throw new ForbiddenException('Not a participant of this session');

    const session = await this.prisma.session.findUniqueOrThrow({ where: { bookingId } });
    await this.prisma.session.update({
      where: { id: session.id },
      data: { recordingUrl: recordingUrl ?? session.recordingUrl ?? null },
    });

    return { recording: false, recordingUrl: recordingUrl ?? session.recordingUrl ?? null };
  }

  async sendSessionNudge(bookingId: string, userId: string, dto: SendSessionNudgeDto) {
    await this.autoCompleteSessionIfPastEnd(bookingId);

    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant of this session');
    }

    if (booking.status === BookingStatus.cancelled || booking.status === BookingStatus.completed) {
      throw new ConflictException('Session is no longer active');
    }

    const senderIsTutor = booking.tutorId === userId;
    const targetUserId = senderIsTutor ? booking.learnerId : booking.tutorId;
    const targetJoined = await this.hasUserJoinedSession(bookingId, targetUserId);
    if (targetJoined) {
      return { sent: false, channel: dto.channel ?? 'push', reason: 'target_already_joined' };
    }

    const defaultMessage = senderIsTutor
      ? 'Your tutor has joined the session. Please join now.'
      : 'Your learner has joined the session. Please join now.';

    const channel = dto.channel === 'email' ? NotificationChannel.email : NotificationChannel.push;

    await this.notificationsService.sendSessionJoinNudge({
      bookingId,
      targetUserId,
      senderUserId: userId,
      message: dto.message?.trim() || defaultMessage,
      channel,
    });

    return { sent: true, channel };
  }

  async updatePresence(bookingId: string, userId: string, status: 'joined' | 'left') {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant of this session');
    }

    await this.ensurePresenceTable();
    if (status === 'joined') {
      await this.prisma.$executeRaw`
        INSERT INTO session_presence (booking_id, user_id, joined_at, left_at, updated_at)
        VALUES (${bookingId}::uuid, ${userId}::uuid, NOW(), NULL, NOW())
        ON CONFLICT (booking_id, user_id)
        DO UPDATE SET joined_at = NOW(), left_at = NULL, updated_at = NOW()
      `;
      return { updated: true, status };
    }

    await this.prisma.$executeRaw`
      INSERT INTO session_presence (booking_id, user_id, joined_at, left_at, updated_at)
      VALUES (${bookingId}::uuid, ${userId}::uuid, NULL, NOW(), NOW())
      ON CONFLICT (booking_id, user_id)
      DO UPDATE SET left_at = NOW(), updated_at = NOW()
    `;
    return { updated: true, status };
  }

  async getRecordingDownload(bookingId: string, userId: string): Promise<{ recordingUrl: string }> {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { session: true },
    });

    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant of this session');
    }

    if (booking.status !== BookingStatus.completed) {
      throw new ConflictException('Recording is available only after session completion');
    }

    const recordingUrl = booking.session?.recordingUrl;
    if (!recordingUrl) {
      throw new NotFoundException('Recording is not available for this session');
    }

    return { recordingUrl };
  }
}
