import { useState } from 'react';
import { Save } from 'lucide-react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useLocale } from '../../core/locale/LocaleContext';
import { BASE_SESSION_PRICES, PLATFORM_FEE_PERCENT } from '../../data/mockData';

const DURATIONS = [30, 45, 60, 90] as const;

export default function TutorPricingPage() {
  const { t } = useI18n();
  const { fmtPrice } = useLocale();

  const [addons, setAddons] = useState<Record<number, number>>(
    () => ({ 30: 50, 45: 80, 60: 100, 90: 150 }),
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#212121]">Session Pricing</h1>
        <p className="text-sm text-[#616161] mt-1">
          Set your add-on fee per session. The platform deducts a {PLATFORM_FEE_PERCENT}% fee from
          the total learner price.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-5 bg-[#F5F5F5] text-xs font-semibold text-[#616161] px-5 py-3 uppercase tracking-wide">
          <span>Duration</span>
          <span>{t('fee_base')}</span>
          <span>{t('fee_addon')}</span>
          <span>{t('fee_total')}</span>
          <span>{t('fee_you_earn')}</span>
        </div>

        {DURATIONS.map((dur) => {
          const base = BASE_SESSION_PRICES[dur];
          const addon = addons[dur] ?? 0;
          const total = base + addon;
          const platformFee = Math.round(total * PLATFORM_FEE_PERCENT / 100);
          const youEarn = total - platformFee;
          return (
            <div
              key={dur}
              className="grid grid-cols-5 items-center px-5 py-4 border-t border-gray-50"
            >
              <span className="font-medium text-[#212121]">{dur} min</span>
              <span className="text-[#616161]">{fmtPrice(base)}</span>
              <div>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={addon}
                  onChange={(e) =>
                    setAddons((prev) => ({ ...prev, [dur]: Math.max(0, Number(e.target.value)) }))
                  }
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                />
              </div>
              <span className="font-semibold text-[#212121]">{fmtPrice(total)}</span>
              <div>
                <div className="font-bold text-[#43A047]">{fmtPrice(youEarn)}</div>
                <div className="text-xs text-[#616161]">
                  {t('fee_platform')}: {fmtPrice(platformFee)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#43A047] hover:bg-[#2E7D32] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Save size={15} />
          {saved ? 'Saved ✓' : t('fee_save')}
        </button>
      </div>
    </div>
  );
}
