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
