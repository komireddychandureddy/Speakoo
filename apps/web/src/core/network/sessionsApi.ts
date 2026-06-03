import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionToken {
  token: string;
  wsUrl: string;
}

export interface Session {
  id: string;
  bookingId: string;
  startedAt: string | null;
  endedAt: string | null;
  durationMinutes: number | null;
  recordingUrl: string | null;
}

export interface FeedbackPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface Feedback {
  id: string;
  bookingId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getSessionToken(bookingId: string): Promise<SessionToken> {
  const { data } = await apiClient.get<SessionToken>(`sessions/${bookingId}/token`);
  return data;
}

export async function startSession(bookingId: string): Promise<Session> {
  const { data } = await apiClient.post<Session>(`sessions/${bookingId}/start`);
  return data;
}

export async function endSession(bookingId: string): Promise<Session> {
  const { data } = await apiClient.post<Session>(`sessions/${bookingId}/end`);
  return data;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<Feedback> {
  const { data } = await apiClient.post<Feedback>(`feedback`, payload);
  return data;
}

export async function getSessionRecordingDownload(
  bookingId: string,
): Promise<{ recordingUrl: string }> {
  const { data } = await apiClient.get<{ recordingUrl: string }>(
    `sessions/${bookingId}/recording`,
  );
  return data;
}

