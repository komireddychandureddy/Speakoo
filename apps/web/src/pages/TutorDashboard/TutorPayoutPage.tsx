import { useState } from 'react';
import { Landmark, Clock } from 'lucide-react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useLocale } from '../../core/locale/LocaleContext';

const MOCK_PENDING_INR = 3250;
const MOCK_SCHEDULED_DATE = '2026-07-01';

export default function TutorPayoutPage() {
  const { t } = useI18n();
  const { fmtPrice } = useLocale();
  const [schedule, setSchedule] = useState<'biweekly' | 'monthly'>('biweekly');
  const [requested, setRequested] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#212121]">{t('payout_title')}</h1>
        <p className="text-sm text-[#616161] mt-1">
          Payouts are processed via Stripe Connect to your registered bank account.
          Minimum withdrawal is $50 USD equivalent.
        </p>
      </div>

      {/* Pending Payout Card */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm opacity-80">{t('payout_pending')}</div>
          <div className="text-4xl font-bold mt-1">{fmtPrice(MOCK_PENDING_INR)}</div>
          <div className="flex items-center gap-1.5 mt-2 text-sm opacity-75">
            <Clock size={14} />
            <span>Next payout: {MOCK_SCHEDULED_DATE}</span>
          </div>
        </div>
        <button
          onClick={() => setRequested(true)}
          disabled={requested}
          className="px-5 py-2.5 bg-white text-[#2E7D32] font-semibold rounded-xl hover:bg-[#E8F5E9] disabled:opacity-60 transition-colors text-sm"
        >
          {requested ? 'Requested ✓' : t('payout_request')}
        </button>
      </div>

      {/* Payout Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-[#212121]">
          <Landmark size={18} className="text-[#43A047]" />
          <span>{t('payout_schedule')}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {(['biweekly', 'monthly'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSchedule(opt)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                schedule === opt
                  ? 'border-[#43A047] bg-[#E8F5E9] text-[#2E7D32]'
                  : 'border-gray-200 text-[#616161] hover:border-[#43A047]'
              }`}
            >
              {t(opt === 'biweekly' ? 'payout_biweekly' : 'payout_monthly')}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#616161]">
          {schedule === 'biweekly'
            ? 'Payouts are sent on the 1st and 15th of each month.'
            : 'Payouts are sent on the 1st of each month.'}
        </p>
      </div>

      {/* Payout History stub */}
      <div>
        <h2 className="text-lg font-bold text-[#212121] mb-3">Payout History</h2>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {[
            { date: '2026-06-15', amount: 2800, status: 'Completed' },
            { date: '2026-06-01', amount: 3100, status: 'Completed' },
            { date: '2026-05-15', amount: 1950, status: 'Completed' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <div className="font-medium text-[#212121]">{p.date}</div>
                <div className="text-xs text-green-600 font-medium mt-0.5">{p.status}</div>
              </div>
              <div className="font-bold text-[#212121]">{fmtPrice(p.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
