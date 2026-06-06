import apiClient from './apiClient';

export interface PracticeSession {
  id: string;
  language: string;
  level: string;
  title: string;
  topic: string;
  type: string;
  scheduledAt: string;
  durationMinutes: number;
  maxParticipants: number;
  creditCost: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  host: {
    id: string;
    profile?: {
      displayName?: string | null;
      avatarUrl?: string | null;
      countryCode?: string | null;
    } | null;
  };
  _count?: {
    participants: number;
  };
}

export async function listPracticeSessions(language?: string): Promise<PracticeSession[]> {
  const { data } = await apiClient.get<PracticeSession[]>('practice-sessions', {
    params: {
      ...(language && language !== 'All' ? { language } : {}),
    },
  });
  return data;
}

export async function joinPracticeSession(id: string): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>(`practice-sessions/${id}/join`);
  return data;
}
