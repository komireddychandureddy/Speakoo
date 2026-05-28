import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { NotificationProcessor } from './notification.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { NotificationJobData } from '../notifications.service';

const mockResendEmailsSend = jest.fn();
const mockTwilioMessagesCreate = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockResendEmailsSend },
  })),
}));

jest.mock('twilio', () =>
  jest.fn().mockImplementation(() => ({
    messages: { create: mockTwilioMessagesCreate },
  })),
);

const mockPrisma = {
  notificationLog: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  user: { findUniqueOrThrow: jest.fn() },
};

const mockConfig = {
  getOrThrow: jest.fn().mockImplementation((key: string) => {
    const vals: Record<string, string> = {
      RESEND_API_KEY: 're_test',
      TWILIO_ACCOUNT_SID: 'ACtest',
      TWILIO_AUTH_TOKEN: 'authtest',
      TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886',
    };
    return vals[key] ?? 'default';
  }),
};

function makeJob(data: NotificationJobData) {
  return { data } as unknown as Job<NotificationJobData>;
}

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    jest.clearAllMocks();
  });

  const baseJobData = {
    userId: 'u1',
    bookingId: 'b1',
    type: NotificationType.booking_confirmed,
    channel: NotificationChannel.email,
  };

  it('skips processing if notification already sent (idempotency)', async () => {
    mockPrisma.notificationLog.findUnique.mockResolvedValue({ id: 'log1' });

    await processor.handle(makeJob(baseJobData));

    expect(mockPrisma.user.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(mockResendEmailsSend).not.toHaveBeenCalled();
  });

  it('sends email notification and creates log entry', async () => {
    mockPrisma.notificationLog.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'u1',
      email: 'learner@test.com',
      profile: { displayName: 'Alice', phoneNumber: null },
    });
    mockResendEmailsSend.mockResolvedValue({ id: 'email1' });
    mockPrisma.notificationLog.create.mockResolvedValue({ id: 'log2' });

    await processor.handle(makeJob(baseJobData));

    expect(mockResendEmailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'learner@test.com' }),
    );
    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ idempotencyKey: 'b1:booking_confirmed:email' }),
    });
  });

  it('sends WhatsApp notification when channel is whatsapp and phone exists', async () => {
    mockPrisma.notificationLog.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'u1',
      email: 'learner@test.com',
      profile: { displayName: 'Alice', phoneNumber: '+15005550006' },
    });
    mockTwilioMessagesCreate.mockResolvedValue({ sid: 'SM1' });
    mockPrisma.notificationLog.create.mockResolvedValue({});

    await processor.handle(makeJob({ ...baseJobData, channel: NotificationChannel.whatsapp }));

    expect(mockTwilioMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'whatsapp:+15005550006' }),
    );
    expect(mockPrisma.notificationLog.create).toHaveBeenCalled();
  });

  it('skips WhatsApp and continues when phone number is missing', async () => {
    mockPrisma.notificationLog.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'u1',
      email: 'learner@test.com',
      profile: { displayName: 'Alice', phoneNumber: null },
    });
    mockPrisma.notificationLog.create.mockResolvedValue({});

    await processor.handle(makeJob({ ...baseJobData, channel: NotificationChannel.whatsapp }));

    expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
    expect(mockPrisma.notificationLog.create).toHaveBeenCalled();
  });
});
