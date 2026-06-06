import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useLocale } from '../../core/locale/LocaleContext';
import { getMyProfile, upsertMyProfile } from '../../core/network/tutorsApi';

const DURATIONS = [30, 45, 60, 90] as const;
const PLATFORM_FEE_PERCENT = 5;

function getDurationBasePrice(hourlyRateCents: number, duration: number): number {
  return Math.round((hourlyRateCents * duration) / 60);
}

export default function TutorPricingPage() {
  const { t } = useI18n();
  const { fmtPrice } = useLocale();

  const [hourlyRateCents, setHourlyRateCents] = useState(0);
  const [languagesTaught, setLanguagesTaught] = useState<string[]>([]);
  const [cefrSpecialties, setCefrSpecialties] = useState<string[]>([]);
  const [addons, setAddons] = useState<Record<number, number>>(
    () => ({ 30: 50, 45: 80, 60: 100, 90: 150 }),
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        setHourlyRateCents(profile.hourlyRateCents);
        setLanguagesTaught(profile.languagesTaught);
        setCefrSpecialties(profile.cefrSpecialties);
      })
      .catch(() => {
        setError('Unable to load your current pricing profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  const computedBaseByDuration = useMemo(() => {
    return DURATIONS.reduce<Record<number, number>>((acc, duration) => {
      acc[duration] = getDurationBasePrice(hourlyRateCents, duration);
      return acc;
    }, {});
  }, [hourlyRateCents]);

  const handleSave = async () => {
    if (hourlyRateCents <= 0 || languagesTaught.length === 0 || cefrSpecialties.length === 0) {
      setError('Complete your tutor profile before saving pricing.');
      return;
    }

    const suggestedHourly = Math.max(100, addons[60] + computedBaseByDuration[60]);

    try {
      await upsertMyProfile({
        hourlyRateCents: suggestedHourly,
        languagesTaught,
        cefrSpecialties,
      });
      setHourlyRateCents(suggestedHourly);
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Unable to save pricing right now. Please try again.');
    }
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-5 bg-[#F5F5F5] text-xs font-semibold text-[#616161] px-5 py-3 uppercase tracking-wide">
          <span>Duration</span>
          <span>{t('fee_base')}</span>
          <span>{t('fee_addon')}</span>
          <span>{t('fee_total')}</span>
          <span>{t('fee_you_earn')}</span>
        </div>

        {loading ? (
          <div className="px-5 py-6 text-sm text-[#616161]">Loading pricing...</div>
        ) : DURATIONS.map((dur) => {
          const base = computedBaseByDuration[dur] ?? 0;
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
          onClick={() => void handleSave()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#43A047] hover:bg-[#2E7D32] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Save size={15} />
          {saved ? 'Saved ✓' : t('fee_save')}
        </button>
      </div>
    </div>
  );
}
