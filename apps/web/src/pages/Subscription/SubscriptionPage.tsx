import { useState } from 'react';
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_DURATIONS,
  SUBSCRIPTION_PRICES,
} from '../../data/mockData';

export default function SubscriptionPage() {
  const [selectedSessions, setSelectedSessions] = useState<72 | 96 | 120>(120);
  const [selectedDuration, setSelectedDuration] = useState(SUBSCRIPTION_DURATIONS[0]);

  const price =
    SUBSCRIPTION_PRICES[selectedDuration]?.[selectedSessions] ?? 0;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#43A047] to-[#43A047] text-white rounded-2xl px-6 py-5">
        <h2 className="text-xl font-extrabold">Choose Your Plan</h2>
        <p className="text-purple-200 text-sm mt-1">
          Unlock unlimited sessions and accelerate your English fluency.
        </p>
      </div>

      {/* Session Count Selector */}
      <section>
        <h3 className="font-bold text-gray-900 mb-3">Number of Sessions</h3>
        <div className="grid grid-cols-3 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isActive = selectedSessions === plan.sessions;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedSessions(plan.sessions as 72 | 96 | 120)}
                className={`relative card p-5 text-center border-2 transition-all ${
                  isActive
                    ? 'border-[#43A047] bg-[#E8F5E9]'
                    : 'border-[#EEEEEE] hover:border-[#43A047]'
                }`}
              >
                {plan.isRecommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FAC847] text-[#7A5200] text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Recommended
                  </span>
                )}
                <p className={`text-3xl font-extrabold ${isActive ? 'text-[#43A047]' : 'text-gray-900'}`}>
                  {plan.sessions}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">Sessions</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Duration Selector */}
      <section>
        <h3 className="font-bold text-gray-900 mb-3">Duration</h3>
        <div className="flex flex-wrap gap-2">
          {SUBSCRIPTION_DURATIONS.map((dur) => (
            <button
              key={dur}
              onClick={() => setSelectedDuration(dur)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                selectedDuration === dur
                  ? 'bg-[#43A047] border-[#43A047] text-white'
                  : 'bg-white border-[#EEEEEE] text-gray-700 hover:border-[#43A047]'
              }`}
            >
              {dur}
            </button>
          ))}
        </div>
      </section>

      {/* Pricing Summary Card */}
      <div className="card px-6 py-5 border-2 border-[#43A047]">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-gray-900">{selectedSessions} Sessions · {selectedDuration}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              ≈ ₹{Math.round(price / selectedSessions).toLocaleString()} per session
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-[#43A047]">₹{price.toLocaleString()}</p>
            <p className="text-xs text-gray-400">total</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          {['Live 1-on-1 sessions with expert tutors', 'Session recordings & notes', 'Progress tracking & reports', '24/7 support'].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-[#14783D]">✓</span> {f}
            </li>
          ))}
        </ul>
        <button className="btn-primary w-full py-3 mt-5">Subscribe Now · ₹{price.toLocaleString()}</button>
      </div>
    </div>
  );
}
