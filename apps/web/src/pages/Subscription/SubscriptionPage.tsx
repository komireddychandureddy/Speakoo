import { useEffect, useMemo, useState } from 'react';
import {
  cancelMySubscription,
  getMySubscription,
  listSubscriptionPlans,
  subscribePlan,
  type SubscriptionPlan,
  type UserSubscription,
} from '../../core/network/paymentsApi';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [mySubscription, setMySubscription] = useState<UserSubscription | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState('pm_card_visa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listSubscriptionPlans(), getMySubscription()])
      .then(([plansResponse, subscription]) => {
        setPlans(plansResponse);
        setMySubscription(subscription);
        setSelectedPlanId(subscription?.planId ?? plansResponse[0]?.id ?? null);
      })
      .catch((err: unknown) => {
        setError((err as { message?: string })?.message ?? 'Failed to load subscription data');
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const handleSubscribe = async () => {
    if (!selectedPlanId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await subscribePlan(selectedPlanId, paymentMethodId.trim());
      setMySubscription(updated);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Unable to start subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await cancelMySubscription('Cancelled from web subscription page');
      setMySubscription(updated);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Unable to cancel subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#43A047] to-[#43A047] text-white rounded-2xl px-6 py-5">
        <h2 className="text-xl font-extrabold">Choose Your Plan</h2>
        <p className="text-purple-200 text-sm mt-1">
          Unlock unlimited sessions and accelerate your English fluency.
        </p>
      </div>

      {loading && <div className="card p-4 text-sm text-gray-500">Loading plans...</div>}
      {error && <div className="card p-4 text-sm text-red-600">{error}</div>}

      {mySubscription && (
        <div className="card p-5 border border-green-200 bg-green-50">
          <p className="text-sm text-[#2E7D32] font-semibold">Active Subscription</p>
          <p className="text-lg font-bold text-[#212121] mt-1">{mySubscription.plan.name}</p>
          <p className="text-sm text-[#616161] mt-1">
            Renews until {new Date(mySubscription.currentPeriodEnd).toLocaleDateString('en-IN')}
          </p>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            {saving ? 'Processing...' : 'Cancel Subscription'}
          </button>
        </div>
      )}

      {/* Plan Selector */}
      <section>
        <h3 className="font-bold text-gray-900 mb-3">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isActive = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`card p-5 text-left border-2 transition-all ${
                  isActive ? 'border-[#43A047] bg-[#E8F5E9]' : 'border-[#EEEEEE] hover:border-[#43A047]'
                }`}
              >
                <p className="text-lg font-bold text-gray-900">{plan.name}</p>
                <p className="text-sm text-gray-500 mt-0.5 uppercase">{plan.interval}</p>
                <p className="text-2xl font-extrabold text-[#43A047] mt-3">
                  ₹{Math.round(plan.priceCents / 100).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{plan.includedCredits} credits per cycle</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Pricing Summary Card */}
      <div className="card px-6 py-5 border-2 border-[#43A047]">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-gray-900">
              {selectedPlan?.name ?? 'No plan selected'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedPlan ? `${selectedPlan.includedCredits} credits / ${selectedPlan.interval}` : 'Choose a plan'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-[#43A047]">
              ₹{selectedPlan ? Math.round(selectedPlan.priceCents / 100).toLocaleString('en-IN') : 0}
            </p>
            <p className="text-xs text-gray-400">total</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-gray-500 block mb-1">Payment Method ID</label>
          <input
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="pm_card_visa"
          />
        </div>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          {['Live 1-on-1 sessions with expert tutors', 'Session recordings & notes', 'Progress tracking & reports', '24/7 support'].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-[#14783D]">✓</span> {f}
            </li>
          ))}
        </ul>
        <button
          onClick={handleSubscribe}
          disabled={!selectedPlan || saving || !!mySubscription}
          className="btn-primary w-full py-3 mt-5 disabled:opacity-60"
        >
          {saving
            ? 'Processing...'
            : mySubscription
              ? 'Already Subscribed'
              : `Subscribe Now · ₹${selectedPlan ? Math.round(selectedPlan.priceCents / 100).toLocaleString('en-IN') : 0}`}
        </button>
      </div>
    </div>
  );
}
