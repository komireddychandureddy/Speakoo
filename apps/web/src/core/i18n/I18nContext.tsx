import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { TRANSLATIONS, LANG_META, type LangCode, type TKey } from './translations';

interface I18nCtx {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: TKey) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const stored = (localStorage.getItem('speakoo_lang') as LangCode | null) ?? 'en';
  const [lang, setLangState] = useState<LangCode>(stored);

  const setLang = useCallback((l: LangCode) => {
    localStorage.setItem('speakoo_lang', l);
    setLangState(l);
  }, []);

  const t = useCallback(
    (key: TKey): string =>
      TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key,
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be inside I18nProvider');
  return ctx;
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] text-sm font-medium transition-colors"
        aria-label="Select language"
      >
        <Globe size={14} />
        <span>{LANG_META[lang].native}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[140px]">
          {(Object.entries(LANG_META) as [LangCode, (typeof LANG_META)[LangCode]][]).map(([code, meta]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E8F5E9] transition-colors ${
                lang === code ? 'text-[#43A047] font-semibold' : 'text-gray-700'
              }`}
            >
              {meta.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
