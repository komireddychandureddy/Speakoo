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

// ─── API calls ────────────────────────────────────────────────────────────────

export async function searchTutors(params: SearchTutorsParams = {}): Promise<TutorSearchResult> {
  const { data } = await apiClient.get<TutorSearchResult>('tutors', { params });
  return data;
}

export async function getTutorProfile(userId: string): Promise<TutorProfile> {
  const { data } = await apiClient.get<TutorProfile>(`tutors/${userId}`);
  return data;
}

export async function getTutorSlots(userId: string): Promise<AvailabilitySlot[]> {
  const { data } = await apiClient.get<AvailabilitySlot[]>(`tutors/${userId}/slots`);
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

export async function getMySlots(): Promise<AvailabilitySlot[]> {
  const { data } = await apiClient.get<AvailabilitySlot[]>('tutors/slots');
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
