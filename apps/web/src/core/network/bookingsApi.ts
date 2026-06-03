import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_session'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  learnerId: string;
  tutorId: string;
  slotId: string;
  language: string;
  status: BookingStatus;
  priceCents: number;
  platformFeeCents: number;
  livekitRoom: string;
  createdAt: string;
  slot: {
    startTime: string;
    endTime: string;
  };
  session?: {
    id: string;
    recordingUrl: string | null;
    startedAt: string | null;
    endedAt: string | null;
    durationMinutes: number | null;
  } | null;
}

export interface CreateBookingPayload {
  slotId: string;
  tutorId: string;
  language: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentMode?: 'stripe' | 'mock';
  mockReference?: string;
}

export type WalletTransactionType = 'credit' | 'debit' | 'refund' | 'payout';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amountCents: number;
  balanceAfter: number;
  referenceId?: string | null;
  createdAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await apiClient.post<Booking>('bookings', payload);
  return data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>('bookings');
  return data;
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  const { data } = await apiClient.get<Booking>(`bookings/${bookingId}`);
  return data;
}

export async function cancelBooking(bookingId: string): Promise<{ cancelled: boolean; refundAmountCents: number }> {
  const { data } = await apiClient.delete<{ cancelled: boolean; refundAmountCents: number }>(
    `bookings/${bookingId}/cancel`,
  );
  return data;
}

export async function createPaymentIntent(
  bookingId: string,
): Promise<CreatePaymentIntentResponse> {
  const { data } = await apiClient.post<CreatePaymentIntentResponse>(
    `payments/bookings/${bookingId}/intent`,
  );
  return data;
}

export async function getWalletTransactions(): Promise<{ items: WalletTransaction[]; total: number }> {
  const { data } = await apiClient.get<{ items: WalletTransaction[]; total: number }>(
    'payments/wallet/transactions',
  );
  return data;
}
