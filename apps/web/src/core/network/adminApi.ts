import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  tutors: number;
  learners: number;
  totalBookings: number;
  pendingTutors: number;
  totalRevenueCents: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'learner' | 'tutor' | 'admin';
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  profile: {
    displayName: string | null;
    bio: string | null;
    countryCode: string | null;
  } | null;
  tutorProfile: {
    id: string;
    isApproved: boolean;
    languagesTaught: string[];
    hourlyRateCents: number;
  } | null;
}

export interface AdminUserList {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>('admin/stats');
  return data;
}

export async function listAdminUsers(
  page = 1,
  limit = 20,
  role?: string,
): Promise<AdminUserList> {
  const { data } = await apiClient.get<AdminUserList>('admin/users', {
    params: { page, limit, ...(role && { role }) },
  });
  return data;
}

export async function approveTutor(userId: string): Promise<{ approved: boolean }> {
  const { data } = await apiClient.patch<{ approved: boolean }>(`admin/tutors/${userId}/approve`);
  return data;
}

export async function suspendUser(userId: string): Promise<{ suspended: boolean }> {
  const { data } = await apiClient.patch<{ suspended: boolean }>(`admin/users/${userId}/suspend`);
  return data;
}

export async function unsuspendUser(userId: string): Promise<{ suspended: boolean }> {
  const { data } = await apiClient.patch<{ suspended: boolean }>(
    `admin/users/${userId}/unsuspend`,
  );
  return data;
}
