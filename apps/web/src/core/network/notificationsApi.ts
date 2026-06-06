import apiClient from './apiClient';

export type NotificationType =
  | 'booking_confirmed'
  | 'reminder_60min'
  | 'reminder_10min'
  | 'session_summary'
  | 'payout';

export type NotificationChannel = 'email' | 'whatsapp' | 'push';

export interface NotificationItem {
  id: string;
  userId: string;
  bookingId: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  sentAt: string;
  idempotencyKey: string;
}

export async function getMyNotifications(page = 1, limit = 20): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationItem[]>('notifications/me', {
    params: { page, limit },
  });
  return data;
}
