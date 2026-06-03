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

export interface AdminBooking {
  id: string;
  learnerId: string;
  tutorId: string;
  slotId: string;
  language: string;
  status: 'pending' | 'confirmed' | 'in_session' | 'completed' | 'cancelled';
  priceCents: number;
  createdAt: string;
  slot: {
    startTime: string;
    endTime: string;
  };
  learner: {
    id: string;
    email: string;
    profile: {
      displayName: string | null;
      countryCode: string | null;
    } | null;
  };
  tutor: {
    id: string;
    email: string;
    profile: {
      displayName: string | null;
      countryCode: string | null;
    } | null;
  };
  payment?: {
    id: string;
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    amountCents: number;
    currency: string;
  } | null;
  session?: {
    id: string;
    startedAt: string | null;
    endedAt: string | null;
    durationMinutes: number | null;
  } | null;
}

export interface AdminBookingList {
  data: AdminBooking[];
  total: number;
  page: number;
  limit: number;
}

export type KycSubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface AdminKycSubmission {
  id: string;
  applicationRef: string | null;
  status: KycSubmissionStatus;
  documentType: string;
  documentFrontUrl: string;
  documentBackUrl: string | null;
  selfieUrl: string | null;
  note: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tutor: {
    id: string;
    email: string;
    profile: {
      displayName: string | null;
      countryCode: string | null;
    } | null;
    tutorProfile: {
      isApproved: boolean;
      languagesTaught: string[];
    } | null;
  };
  reviewedBy: {
    id: string;
    email: string;
    profile: {
      displayName: string | null;
    } | null;
  } | null;
}

export interface AdminKycSubmissionList {
  items: AdminKycSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type IncidentCategory =
  | 'abuse'
  | 'harassment'
  | 'no_show'
  | 'payment_dispute'
  | 'technical_issue'
  | 'other';

export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentUserSummary {
  id: string;
  email: string;
  profile: {
    displayName: string | null;
  } | null;
}

export interface AdminIncident {
  id: string;
  bookingId: string | null;
  reporterId: string;
  reportedUserId: string | null;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: IncidentPriority;
  description: string;
  evidenceUrls: string[];
  adminNote: string | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: IncidentUserSummary;
  reportedUser: IncidentUserSummary | null;
}

export interface AdminIncidentList {
  items: AdminIncident[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionRiskItem {
  level: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  metadata: Record<string, unknown>;
}

export interface TransactionRiskSummary {
  totalRisks: number;
  byLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface TransactionRiskResponse {
  lookbackDays: number;
  since: string;
  summary: TransactionRiskSummary;
  risks: TransactionRiskItem[];
}

export interface AdminWithdrawalRequest {
  id: string;
  tutorUserId: string;
  amountCents: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  adminNote: string | null;
  reviewedById: string | null;
  externalTransferId: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  tutorEmail?: string;
  tutorName?: string | null;
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

export async function listAdminBookings(
  page = 1,
  limit = 50,
  status?: string,
): Promise<AdminBookingList> {
  const { data } = await apiClient.get<AdminBookingList>('admin/bookings', {
    params: { page, limit, ...(status ? { status } : {}) },
  });
  return data;
}

export async function updateAdminBookingStatus(
  bookingId: string,
  status: AdminBooking['status'],
): Promise<AdminBooking> {
  const { data } = await apiClient.patch<AdminBooking>(`admin/bookings/${bookingId}/status`, {
    status,
  });
  return data;
}

export async function approveTutor(userId: string): Promise<{ approved: boolean }> {
  const { data } = await apiClient.patch<{ approved: boolean }>(`admin/tutors/${userId}/approve`);
  return data;
}

export async function listAdminKycSubmissions(params?: {
  status?: KycSubmissionStatus;
  page?: number;
  limit?: number;
}): Promise<AdminKycSubmissionList> {
  const { data } = await apiClient.get<AdminKycSubmissionList>('tutors/kyc/submissions', {
    params,
  });
  return data;
}

export async function reviewKycSubmission(
  submissionId: string,
  payload: { status: KycSubmissionStatus; note?: string },
): Promise<AdminKycSubmission> {
  const { data } = await apiClient.post<AdminKycSubmission>(
    `tutors/kyc/submissions/${submissionId}/review`,
    payload,
  );
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

export async function listIncidents(params?: {
  page?: number;
  limit?: number;
  status?: IncidentStatus;
  priority?: IncidentPriority;
  category?: IncidentCategory;
}): Promise<AdminIncidentList> {
  const { data } = await apiClient.get<AdminIncidentList>('safety/incidents', {
    params,
  });
  return data;
}

export async function getIncidentById(incidentId: string): Promise<AdminIncident> {
  const { data } = await apiClient.get<AdminIncident>(`safety/incidents/${incidentId}`);
  return data;
}

export async function triageIncident(
  incidentId: string,
  payload: {
    status?: IncidentStatus;
    priority?: IncidentPriority;
    adminNote?: string;
  },
): Promise<AdminIncident> {
  const { data } = await apiClient.patch<AdminIncident>(
    `safety/incidents/${incidentId}/triage`,
    payload,
  );
  return data;
}

export async function getTransactionRisks(days = 7): Promise<TransactionRiskResponse> {
  const { data } = await apiClient.get<TransactionRiskResponse>('payments/risks/transactions', {
    params: { days },
  });
  return data;
}

export async function listAdminWithdrawals(params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
}): Promise<AdminWithdrawalRequest[]> {
  const { data } = await apiClient.get<AdminWithdrawalRequest[]>('payments/admin/withdrawals', {
    params,
  });
  return data;
}

export async function reviewAdminWithdrawal(
  withdrawalId: string,
  payload: { action: 'approve' | 'reject'; note?: string },
): Promise<{ reviewed: boolean; status: 'rejected' | 'paid'; transferId?: string; amountCents?: number }> {
  const { data } = await apiClient.post<{ reviewed: boolean; status: 'rejected' | 'paid'; transferId?: string; amountCents?: number }>(
    `payments/admin/withdrawals/${withdrawalId}/review`,
    payload,
  );
  return data;
}
