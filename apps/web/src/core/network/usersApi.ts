import apiClient from './apiClient';

export interface UserProfile {
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  countryCode: string | null;
  timezone: string;
  nativeLanguage: string | null;
  targetLanguage: string | null;
  learningGoals: string | null;
  maxBudgetCents: number | null;
}

export interface MeResponse {
  id: string;
  email: string;
  role: 'learner' | 'tutor' | 'admin';
  profile: UserProfile | null;
}

export interface UpdateProfilePayload {
  timezone?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  learningGoals?: string;
  maxBudgetCents?: number;
  bio?: string;
  countryCode?: string;
  avatarUrl?: string;
  displayName?: string;
  phoneNumber?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface UserProgressSummary {
  completedSessions: number;
  totalPoints: number;
  currentStreakDays: number;
  badgesCount: number;
  latestCefr: string | null;
}

export interface UserCefrHistoryItem {
  id: string;
  level: string;
  assessedAt: string;
  source: string;
}

export interface UserProgressTimelineItem {
  bookingId: string;
  startsAt: string;
  status: string;
  tutor: {
    id: string;
    name: string;
  };
  feedback: {
    rating: number;
    comment: string | null;
    cefrBefore: string | null;
    cefrAfter: string | null;
  } | null;
}

export interface UserProgressResponse {
  summary: UserProgressSummary;
  cefrHistory: UserCefrHistoryItem[];
  timeline: UserProgressTimelineItem[];
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('users/me');
  return data;
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.patch('users/me/profile', payload);
  return data;
}

export async function getMyBadges(): Promise<UserBadge[]> {
  const { data } = await apiClient.get<UserBadge[]>('users/me/badges');
  return data;
}

export async function getMyProgress(): Promise<UserProgressResponse> {
  const { data } = await apiClient.get<UserProgressResponse>('users/me/progress');
  return data;
}
