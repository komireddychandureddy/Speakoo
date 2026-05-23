import { Injectable, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async generateToken(bookingId: string, userId: string): Promise<string> {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
    });

    const isParticipant = booking.learnerId === userId || booking.tutorId === userId;
    if (!isParticipant) throw new ForbiddenException('Not a participant of this session');

    if (booking.status === BookingStatus.cancelled) {
      throw new ConflictException('Booking is cancelled');
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

    return token.toJwt();
  }

  async startSession(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

    if (booking.tutorId !== userId) throw new ForbiddenException('Only tutor can start session');
    if (booking.status !== BookingStatus.confirmed) {
      throw new ConflictException('Booking must be confirmed before starting');
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.in_session },
    });

    return this.prisma.session.upsert({
      where: { bookingId },
      create: { bookingId, startedAt: new Date() },
      update: { startedAt: new Date() },
    });
  }

  async endSession(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

    if (booking.tutorId !== userId) throw new ForbiddenException('Only tutor can end session');
    if (booking.status !== BookingStatus.in_session) {
      throw new ConflictException('Session is not in progress');
    }

    const session = await this.prisma.session.findUniqueOrThrow({ where: { bookingId } });
    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - (session.startedAt?.getTime() ?? endedAt.getTime())) / 60_000,
    );

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.completed },
    });

    return this.prisma.session.update({
      where: { bookingId },
      data: { endedAt, durationMinutes },
    });
  }
}
