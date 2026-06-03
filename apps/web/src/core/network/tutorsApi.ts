import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TutorProfile {
  id: string;
  userId: string;
  languagesTaught: string[];
  hourlyRateCents: number;
  cefrSpecialties: string[];
  isApproved: boolean;
  user: {
    id: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
      bio: string | null;
      countryCode: string | null;
    } | null;
  };
}

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'blocked';
  startTimeLocal?: string;
  endTimeLocal?: string;
  timezone?: string;
}

export interface TutorSearchResult {
  items: TutorProfile[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchTutorsParams {
  language?: string;
  minCents?: number;
  maxCents?: number;
  page?: number;
  limit?: number;
}

export interface RecommendedTutor extends TutorProfile {
  recommendationScore: number;
  rating: {
    average: number;
    count: number;
  };
}

export interface RecommendTutorsParams {
  language?: string;
  maxCents?: number;
  limit?: number;
}

export interface PublicTutorApplicationPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  city?: string;
  languages: string[];
  proficiency: string;
  certifications?: string[];
  yearsExp: string;
  bio: string;
  teachingStyle?: string;
  maxSessions?: string;
  availability: string[];
}

export interface PublicTutorApplicationResponse {
  submissionId: string;
  tutorUserId: string;
  status: 'pending' | 'approved' | 'rejected';
  applicationReference: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function searchTutors(params: SearchTutorsParams = {}): Promise<TutorSearchResult> {
  const { data } = await apiClient.get<TutorSearchResult>('tutors', { params });
  return data;
}

export async function getTutorProfile(userId: string): Promise<TutorProfile> {
  const { data } = await apiClient.get<TutorProfile>(`tutors/${userId}`);
  return data;
}

export async function getTutorSlots(userId: string, timezone?: string): Promise<AvailabilitySlot[]> {
  const { data } = await apiClient.get<AvailabilitySlot[]>(`tutors/${userId}/slots`, {
    params: { ...(timezone ? { timezone } : {}) },
  });
  return data;
}

export async function upsertMyProfile(
  dto: Partial<Pick<TutorProfile, 'languagesTaught' | 'hourlyRateCents' | 'cefrSpecialties'>>,
): Promise<TutorProfile> {
  const { data } = await apiClient.post<TutorProfile>('tutors/profile', dto);
  return data;
}

export async function getMyProfile(): Promise<TutorProfile> {
  const { data } = await apiClient.get<TutorProfile>('tutors/profile');
  return data;
}

export async function createSlot(
  slot: Pick<AvailabilitySlot, 'startTime' | 'endTime'>,
): Promise<AvailabilitySlot> {
  const { data } = await apiClient.post<AvailabilitySlot>('tutors/slots', slot);
  return data;
}

export async function getMySlots(timezone?: string): Promise<AvailabilitySlot[]> {
  const { data } = await apiClient.get<AvailabilitySlot[]>('tutors/slots', {
    params: { ...(timezone ? { timezone } : {}) },
  });
  return data;
}

export async function deleteMySlot(slotId: string): Promise<{ deleted: boolean }> {
  const { data } = await apiClient.delete<{ deleted: boolean }>(`tutors/slots/${slotId}`);
  return data;
}

export async function getRecommendedTutors(
  params: RecommendTutorsParams = {},
): Promise<RecommendedTutor[]> {
  const { data } = await apiClient.get<RecommendedTutor[]>('tutors/recommendations/me', {
    params,
  });
  return data;
}

export async function submitPublicTutorApplication(
  payload: PublicTutorApplicationPayload,
): Promise<PublicTutorApplicationResponse> {
  const { data } = await apiClient.post<PublicTutorApplicationResponse>('tutors/applications', payload);
  return data;
}
