import apiClient from './apiClient';

export interface SessionNoteItem {
  id: string;
  bookingId: string;
  summary: string;
  strengths: string | null;
  weaknesses: string | null;
  nextSteps: string | null;
  createdAt: string;
  booking?: {
    id: string;
    slot?: {
      startTime: string;
      endTime: string;
    } | null;
  } | null;
}

export async function listMySessionNotes(): Promise<SessionNoteItem[]> {
  const { data } = await apiClient.get<SessionNoteItem[]>('learning/session-notes/me');
  return data;
}
