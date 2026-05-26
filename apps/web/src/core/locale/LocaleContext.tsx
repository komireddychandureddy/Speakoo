import React, { createContext, useContext, useMemo } from 'react';

interface CountryLocale {
  code: string;
  currency: string;
  symbol: string;
  taxRate: number;
  taxLabel: string;
}

const TZ_LOCALE: Record<string, CountryLocale> = {
  'Asia/Kolkata': { code: 'IN', currency: 'INR', symbol: '₹', taxRate: 0.18, taxLabel: 'GST 18%' },
  'Asia/Calcutta': { code: 'IN', currency: 'INR', symbol: '₹', taxRate: 0.18, taxLabel: 'GST 18%' },
  'Europe/London': { code: 'GB', currency: 'GBP', symbol: '£', taxRate: 0.20, taxLabel: 'VAT 20%' },
  'America/New_York': { code: 'US', currency: 'USD', symbol: '$', taxRate: 0, taxLabel: '' },
  'America/Los_Angeles': { code: 'US', currency: 'USD', symbol: '$', taxRate: 0, taxLabel: '' },
  'America/Chicago': { code: 'US', currency: 'USD', symbol: '$', taxRate: 0, taxLabel: '' },
  'America/Denver': { code: 'US', currency: 'USD', symbol: '$', taxRate: 0, taxLabel: '' },
  'Europe/Paris': { code: 'EU', currency: 'EUR', symbol: '€', taxRate: 0.20, taxLabel: 'VAT 20%' },
  'Europe/Berlin': { code: 'EU', currency: 'EUR', symbol: '€', taxRate: 0.20, taxLabel: 'VAT 20%' },
  'Europe/Rome': { code: 'EU', currency: 'EUR', symbol: '€', taxRate: 0.22, taxLabel: 'VAT 22%' },
  'Australia/Sydney': { code: 'AU', currency: 'AUD', symbol: 'A$', taxRate: 0.10, taxLabel: 'GST 10%' },
  'Australia/Melbourne': { code: 'AU', currency: 'AUD', symbol: 'A$', taxRate: 0.10, taxLabel: 'GST 10%' },
  'America/Toronto': { code: 'CA', currency: 'CAD', symbol: 'C$', taxRate: 0.05, taxLabel: 'GST 5%' },
  'America/Vancouver': { code: 'CA', currency: 'CAD', symbol: 'C$', taxRate: 0.05, taxLabel: 'GST 5%' },
  'Asia/Dubai': { code: 'AE', currency: 'AED', symbol: 'د.إ', taxRate: 0.05, taxLabel: 'VAT 5%' },
  'Asia/Singapore': { code: 'SG', currency: 'SGD', symbol: 'S$', taxRate: 0.09, taxLabel: 'GST 9%' },
  'Asia/Tokyo': { code: 'JP', currency: 'JPY', symbol: '¥', taxRate: 0.10, taxLabel: 'Tax 10%' },
};

/** 1 credit ≈ 1 INR base value. FX rates vs INR. */
const CREDIT_FX: Record<string, number> = {
  INR: 1, GBP: 0.0095, USD: 0.012, EUR: 0.011,
  AUD: 0.018, CAD: 0.016, AED: 0.044, SGD: 0.016, JPY: 1.82,
};

interface LocaleCtx extends CountryLocale {
  userTz: string;
  fmtCredits: (credits: number) => string;
  fmtPrice: (inr: number) => string;
  taxedPrice: (inr: number) => number;
}

const LocaleContext = createContext<LocaleCtx | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const loc = TZ_LOCALE[userTz] ?? { code: 'US', currency: 'USD', symbol: '$', taxRate: 0, taxLabel: '' };

  const value = useMemo<LocaleCtx>(() => {
    const fx = CREDIT_FX[loc.currency] ?? CREDIT_FX.USD;

    const fmt = (amount: number) => {
      if (loc.currency === 'JPY' || loc.currency === 'INR') return `${loc.symbol}${Math.round(amount)}`;
      return `${loc.symbol}${amount.toFixed(2)}`;
    };

    return {
      ...loc,
      userTz,
      fmtCredits: (credits: number) => fmt(credits * fx),
      fmtPrice: (inr: number) => fmt(inr * fx),
      taxedPrice: (inr: number) => Math.round(inr * (1 + loc.taxRate)),
    };
  }, [userTz, loc]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be inside LocaleProvider');
  return ctx;
}
