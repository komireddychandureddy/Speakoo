import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { NotificationsService, NOTIFICATION_QUEUE } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';

const mockQueueAdd = jest.fn();
const mockQueueGetJobs = jest.fn();

const mockQueue = {
  add: mockQueueAdd,
  getJobs: mockQueueGetJobs,
};

const mockPrisma = {
  booking: { findUniqueOrThrow: jest.fn() },
  notificationLog: { findUnique: jest.fn() },
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken(NOTIFICATION_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('scheduleBookingNotifications', () => {
    it('queues immediate booking_confirmed notifications for learner, tutor + delayed reminders', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'l1',
        tutorId: 't1',
      });
      mockPrisma.notificationLog.findUnique.mockResolvedValue(null);
      mockQueueAdd.mockResolvedValue({});

      const sessionStart = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hrs from now
      await service.scheduleBookingNotifications('b1', sessionStart);

      const addCalls = mockQueueAdd.mock.calls.map((c) => c[0]);
      const immediate = addCalls.filter((d) => d.type === NotificationType.booking_confirmed);
      const reminders60 = addCalls.filter((d) => d.type === NotificationType.reminder_60min);
      const reminders10 = addCalls.filter((d) => d.type === NotificationType.reminder_10min);

      // 3 immediate: learner email, learner whatsapp, tutor email
      expect(immediate).toHaveLength(3);
      // 60min: learner email + whatsapp
      expect(reminders60).toHaveLength(2);
      expect(reminders60.some((d) => d.channel === NotificationChannel.whatsapp)).toBe(true);
      // 10min: learner email only
      expect(reminders10).toHaveLength(1);
      expect(reminders10[0].channel).toBe(NotificationChannel.email);
    });

    it('skips notifications that have already been sent (idempotency)', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'l1',
        tutorId: 't1',
      });
      mockPrisma.notificationLog.findUnique.mockResolvedValue({ id: 'log1' });

      const sessionStart = new Date(Date.now() + 3 * 60 * 60 * 1000);
      await service.scheduleBookingNotifications('b1', sessionStart);

      expect(mockQueueAdd).not.toHaveBeenCalled();
    });

    it('skips reminder scheduling when session start is in the past', async () => {
      mockPrisma.booking.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        learnerId: 'l1',
        tutorId: 't1',
      });
      mockPrisma.notificationLog.findUnique.mockResolvedValue(null);
      mockQueueAdd.mockResolvedValue({});

      const pastStart = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
      await service.scheduleBookingNotifications('b1', pastStart);

      const addCalls = mockQueueAdd.mock.calls.map((c) => c[0]);
      const reminders = addCalls.filter(
        (d) =>
          d.type === NotificationType.reminder_60min || d.type === NotificationType.reminder_10min,
      );
      expect(reminders).toHaveLength(0);
    });
  });

  describe('cancelBookingNotifications', () => {
    it('removes delayed jobs that match bookingId', async () => {
      const mockJobRemove = jest.fn();
      mockQueueGetJobs.mockResolvedValue([
        { data: { bookingId: 'b1' }, remove: mockJobRemove },
        { data: { bookingId: 'b1' }, remove: mockJobRemove },
        { data: { bookingId: 'other' }, remove: jest.fn() },
      ]);

      await service.cancelBookingNotifications('b1');

      expect(mockJobRemove).toHaveBeenCalledTimes(2);
    });

    it('does nothing when no jobs match the bookingId', async () => {
      const otherJobRemove = jest.fn();
      mockQueueGetJobs.mockResolvedValue([
        { data: { bookingId: 'different' }, remove: otherJobRemove },
      ]);

      await service.cancelBookingNotifications('b1');

      expect(otherJobRemove).not.toHaveBeenCalled();
    });
  });
});
