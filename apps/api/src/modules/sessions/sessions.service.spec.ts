import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, ConflictException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BookingStatus } from '@prisma/client';

const mockToJwt = jest.fn().mockReturnValue('livekit-token');
const mockAddGrant = jest.fn();

jest.mock('livekit-server-sdk', () => ({
  AccessToken: jest.fn().mockImplementation(() => ({
    addGrant: mockAddGrant,
    toJwt: mockToJwt,
  })),
}));

const mockPrisma = {
  booking: {
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  },
  session: {
    upsert: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  },
};

const mockConfig = {
  getOrThrow: jest.fn().mockImplementation((key: string) => {
    const map: Record<string, string> = {
      LIVEKIT_API_KEY: 'devkey',
      LIVEKIT_API_SECRET: 'devsecret',
    };
    return map[key] ?? 'default';
  }),
};

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    jest.clearAllMocks();
    mockConfig.getOrThrow.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        LIVEKIT_API_KEY: 'devkey',
        LIVEKIT_API_SECRET: 'devsecret',
      };
      return map[key] ?? 'default';
    });
    mockToJwt.mockReturnValue('livekit-token');
  });

  describe('generateToken', () => {
    it('returns LiveKit JWT for booking participant', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'l1',
        tutorId: 't1',
        status: BookingStatus.confirmed,
        livekitRoom: 'session-b1',
      });

      const token = await service.generateToken('b1', 'l1');

      expect(token).toBe('livekit-token');
      expect(mockAddGrant).toHaveBeenCalledWith(expect.objectContaining({ room: 'session-b1' }));
    });

    it('throws ForbiddenException when user is not participant', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'l1',
        tutorId: 't1',
        status: BookingStatus.confirmed,
        livekitRoom: 'session-b1',
      });

      await expect(service.generateToken('b1', 'stranger')).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException for cancelled booking', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'l1',
        tutorId: 't1',
        status: BookingStatus.cancelled,
        livekitRoom: 'session-b1',
      });

      await expect(service.generateToken('b1', 'l1')).rejects.toThrow(ConflictException);
    });
  });

  describe('startSession', () => {
    it('updates booking to in_session and upserts session', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        tutorId: 't1',
        status: BookingStatus.confirmed,
      });
      mockPrisma.booking.update.mockResolvedValue({});
      mockPrisma.session.upsert.mockResolvedValue({ bookingId: 'b1' });

      const result = await service.startSession('b1', 't1');

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'b1' },
        data: { status: BookingStatus.in_session },
      });
      expect(result).toEqual({ bookingId: 'b1' });
    });

    it('throws ForbiddenException when non-tutor tries to start', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        tutorId: 't1',
        status: BookingStatus.confirmed,
      });

      await expect(service.startSession('b1', 'l1')).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when booking is not confirmed', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        tutorId: 't1',
        status: BookingStatus.pending,
      });

      await expect(service.startSession('b1', 't1')).rejects.toThrow(ConflictException);
    });
  });

  describe('endSession', () => {
    it('updates session and booking to completed', async () => {
      const startedAt = new Date(Date.now() - 60_000 * 45);
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        tutorId: 't1',
        status: BookingStatus.in_session,
      });
      mockPrisma.session.findUniqueOrThrow.mockResolvedValue({ bookingId: 'b1', startedAt });
      mockPrisma.booking.update.mockResolvedValue({});
      mockPrisma.session.update.mockResolvedValue({ bookingId: 'b1', durationMinutes: 45 });

      const result = await service.endSession('b1', 't1');

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'b1' },
        data: { status: BookingStatus.completed },
      });
      expect(result).toEqual({ bookingId: 'b1', durationMinutes: 45 });
    });

    it('throws ForbiddenException when non-tutor tries to end', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        tutorId: 't1',
        status: BookingStatus.in_session,
      });

      await expect(service.endSession('b1', 'stranger')).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when session is not in_session status', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        tutorId: 't1',
        status: BookingStatus.completed,
      });

      await expect(service.endSession('b1', 't1')).rejects.toThrow(ConflictException);
    });
  });
});
