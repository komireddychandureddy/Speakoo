import apiClient from './apiClient';

export type SubscriptionInterval = 'monthly' | 'yearly';
export type UserSubscriptionStatus = 'active' | 'past_due' | 'canceled';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  interval: SubscriptionInterval;
  priceCents: number;
  includedCredits: number;
  stripePriceId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: UserSubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}

export interface WalletBalance {
  balanceCents: number;
}

export interface CreditBundle {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  isActive: boolean;
}

export interface CreditPurchaseIntentResponse {
  clientSecret: string;
  paymentMode?: 'stripe' | 'mock';
  mockReference?: string;
}

export interface MockPaymentConfirmPayload {
  kind: 'booking' | 'credit_purchase' | 'wallet_topup';
  bookingId?: string;
  bundleId?: string;
  amountCents?: number;
}

export interface TutorPayoutAccount {
  id: string;
  tutorUserId: string;
  accountHolderName: string;
  accountNumberLast4: string;
  bankName: string;
  routingCode: string;
  currency: string;
  countryCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TutorPayoutSummary {
  currentBalanceCents: number;
  pendingWithdrawalCents: number;
  availableToWithdrawCents: number;
  lifetimePayoutCents: number;
  minimumWithdrawalCents: number;
  hasPayoutAccount: boolean;
}

export interface WithdrawalRequest {
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
}

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await apiClient.get<SubscriptionPlan[]>('payments/subscriptions/plans');
  return data;
}

export async function getMySubscription(): Promise<UserSubscription | null> {
  const { data } = await apiClient.get<UserSubscription | null>('payments/subscriptions/me');
  return data;
}

export async function subscribePlan(
  planId: string,
  paymentMethodId: string,
): Promise<UserSubscription> {
  const { data } = await apiClient.post<UserSubscription>('payments/subscriptions/subscribe', {
    planId,
    paymentMethodId,
  });
  return data;
}

export async function cancelMySubscription(reason?: string): Promise<UserSubscription> {
  const { data } = await apiClient.post<UserSubscription>('payments/subscriptions/cancel', {
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  });
  return data;
}

export async function getWalletBalance(): Promise<WalletBalance> {
  const { data } = await apiClient.get<WalletBalance>('payments/wallet');
  return data;
}

export async function listCreditBundles(): Promise<CreditBundle[]> {
  const { data } = await apiClient.get<CreditBundle[]>('payments/credit-bundles');
  return data;
}

export async function purchaseCredits(bundleId: string): Promise<CreditPurchaseIntentResponse> {
  const { data } = await apiClient.post<CreditPurchaseIntentResponse>('payments/wallet/credits', {
    bundleId,
  });
  return data;
}

export async function confirmMockPayment(payload: MockPaymentConfirmPayload): Promise<{ confirmed: boolean }> {
  const { data } = await apiClient.post<{ confirmed: boolean }>('payments/mock/confirm', payload);
  return data;
}

export async function getTutorPayoutAccount(): Promise<TutorPayoutAccount | null> {
  const { data } = await apiClient.get<TutorPayoutAccount | null>('payments/tutor/payout-account');
  return data;
}

export async function upsertTutorPayoutAccount(payload: {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  routingCode: string;
  currency?: string;
  countryCode?: string;
}): Promise<TutorPayoutAccount> {
  const { data } = await apiClient.post<TutorPayoutAccount>('payments/tutor/payout-account', payload);
  return data;
}

export async function getTutorPayoutSummary(): Promise<TutorPayoutSummary> {
  const { data } = await apiClient.get<TutorPayoutSummary>('payments/tutor/payouts/summary');
  return data;
}

export async function listTutorWithdrawals(): Promise<WithdrawalRequest[]> {
  const { data } = await apiClient.get<WithdrawalRequest[]>('payments/tutor/withdrawals');
  return data;
}

export async function createTutorWithdrawalRequest(amountCents: number): Promise<WithdrawalRequest> {
  const { data } = await apiClient.post<WithdrawalRequest>('payments/tutor/withdrawals', { amountCents });
  return data;
}
