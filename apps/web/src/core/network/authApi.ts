import { isAxiosError } from 'axios';
import apiClient, { setAccessToken } from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'tutor' | 'admin';
}

interface AuthResponse {
  accessToken: string;
}

interface MeResponse {
  id: string;
  email: string;
  role: 'learner' | 'tutor' | 'admin';
  profile: {
    displayName: string | null;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function persistAuthState(accessToken: string, user: AuthUser): void {
  localStorage.setItem('speakoo_access_token', accessToken);
  localStorage.setItem('speakoo_user', JSON.stringify(user));
  setAccessToken(accessToken);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Registers a new learner account with email (and optionally phone number).
 * Returns the authenticated user and stores the access token.
 */
export async function apiRegister(
  displayName: string,
  email: string,
  password: string,
  captchaToken?: string,
  phoneNumber?: string,
): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('auth/register', {
    displayName,
    email,
    password,
    ...(captchaToken && { captchaToken }),
    ...(phoneNumber && { phoneNumber }),
  });
  setAccessToken(data.accessToken);

  const me = await apiClient.get<MeResponse>('users/me');
  const user: AuthUser = {
    id: me.data.id,
    name: me.data.profile?.displayName ?? displayName,
    email: me.data.email,
    role: me.data.role,
  };
  persistAuthState(data.accessToken, user);
  return user;
}

/**
 * Logs in with email OR phone + password.
 * Returns the authenticated user and stores the access token.
 */
export async function apiLogin(
  identifier: string,
  password: string,
  captchaToken?: string,
): Promise<AuthUser> {
  // Detect if identifier is email or phone (phone starts with +)
  const isPhone = identifier.trim().startsWith('+');
  const payload: Record<string, string> = {
    password,
    ...(isPhone ? { phone: identifier.trim() } : { email: identifier.trim().toLowerCase() }),
    ...(captchaToken && { captchaToken }),
  };

  const { data } = await apiClient.post<AuthResponse>('auth/login', payload);
  setAccessToken(data.accessToken);

  const me = await apiClient.get<MeResponse>('users/me');
  const user: AuthUser = {
    id: me.data.id,
    name: me.data.profile?.displayName ?? (isPhone ? identifier : identifier.split('@')[0]),
    email: me.data.email,
    role: me.data.role,
  };
  persistAuthState(data.accessToken, user);
  return user;
}

/**
 * Logs out the current user. Clears the refresh cookie and local auth state.
 */
export async function apiLogout(): Promise<void> {
  try {
    await apiClient.post('auth/logout');
  } catch {
    // Best-effort — always clear local state
  }
  setAccessToken(null);
  localStorage.removeItem('speakoo_access_token');
  localStorage.removeItem('speakoo_user');
}

/**
 * Call once on app startup to restore the access token from localStorage
 * so in-flight requests are authenticated before the first 401.
 */
export function bootstrapAuth(): void {
  const token = localStorage.getItem('speakoo_access_token');
  if (token) {
    setAccessToken(token);
  }
}

/**
 * Verifies the email OTP code sent after registration.
 */
export async function apiVerifyEmailOtp(code: string): Promise<void> {
  await apiClient.post('auth/verify-email', { code });
}

/**
 * Registers a new account via phone number (sends SMS OTP).
 */
export async function apiRegisterPhone(
  phone: string,
  fullName: string,
  role?: string,
): Promise<void> {
  await apiClient.post('auth/register-phone', { phone, fullName, role });
}

/**
 * Verifies the phone OTP and returns the authenticated user.
 */
export async function apiVerifyPhoneOtp(phone: string, otp: string): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('auth/verify-phone', { phone, otp });
  setAccessToken(data.accessToken);

  const me = await apiClient.get<MeResponse>('users/me');
  const user: AuthUser = {
    id: me.data.id,
    name: me.data.profile?.displayName ?? phone,
    email: me.data.email,
    role: me.data.role,
  };
  persistAuthState(data.accessToken, user);
  return user;
}

/**
 * Returns a human-readable error message from an auth API error.
 */
export function parseAuthError(err: unknown): string {
  if (isAxiosError(err)) {
    if (!err.response) return 'Cannot reach the server. Please check your connection and try again.';
    const status = err.response.status;
    const message: unknown = err.response.data?.message;
    if (status === 409) return 'An account with this email or phone number already exists.';
    if (status === 401) return 'Invalid credentials. Please check your email/phone and password.';
    if (status === 429) return 'Too many attempts. Please wait 15 minutes.';
    if (typeof message === 'string' && message.length > 0) return message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0] as string;
  }
  return 'Something went wrong. Please try again.';
}
