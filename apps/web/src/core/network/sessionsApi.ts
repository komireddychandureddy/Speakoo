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

export async function startSessionRecording(bookingId: string): Promise<{ recording: boolean }> {
  const { data } = await apiClient.post<{ recording: boolean }>(
    `sessions/${bookingId}/recording/start`,
  );
  return data;
}

export async function stopSessionRecording(
  bookingId: string,
  recordingUrl?: string,
): Promise<{ recording: boolean; recordingUrl: string | null }> {
  const { data } = await apiClient.post<{ recording: boolean; recordingUrl: string | null }>(
    `sessions/${bookingId}/recording/stop`,
    { ...(recordingUrl ? { recordingUrl } : {}) },
  );
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

export async function sendSessionNudge(
  bookingId: string,
  payload?: { message?: string; channel?: 'push' | 'email' },
): Promise<{ sent: boolean; channel: 'push' | 'email'; reason?: 'target_already_joined' }> {
  const { data } = await apiClient.post<{
    sent: boolean;
    channel: 'push' | 'email';
    reason?: 'target_already_joined';
  }>(
    `sessions/${bookingId}/nudge`,
    {
      ...(payload?.message?.trim() ? { message: payload.message.trim() } : {}),
      ...(payload?.channel ? { channel: payload.channel } : {}),
    },
  );
  return data;
}

export async function updateSessionPresence(
  bookingId: string,
  status: 'joined' | 'left',
): Promise<{ updated: boolean; status: 'joined' | 'left' }> {
  const { data } = await apiClient.post<{ updated: boolean; status: 'joined' | 'left' }>(
    `sessions/${bookingId}/presence`,
    { status },
  );
  return data;
}

