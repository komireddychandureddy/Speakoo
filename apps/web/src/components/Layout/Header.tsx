import { useState } from 'react';
import { Bell, Gem } from 'lucide-react';
import NotificationsPanel from '../Notifications/NotificationsPanel';
import { NOTIFICATIONS, MOCK_CREDIT_BALANCE } from '../../data/mockData';
import { LanguageSwitcher } from '../../core/i18n/I18nContext';
import { useLocale } from '../../core/locale/LocaleContext';

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => !n.isRead).length;
  const { fmtCredits } = useLocale();
  const balance = Number(localStorage.getItem('speakoo_credits') ?? MOCK_CREDIT_BALANCE);

  const userInitial = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('speakoo_user') ?? '{}');
      return (u.name as string | undefined)?.trim()[0]?.toUpperCase() ?? 'U';
    } catch { return 'U'; }
  })();

  return (
    <>
      <header className="h-14 bg-white border-b border-[#EEEEEE] flex items-center px-6 gap-4">
        {/* Hamburger (mobile) */}
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <span className="text-xl">☰</span>
        </button>

        <h1 className="text-lg font-bold text-gray-900 flex-1">{title}</h1>

        {/* Credits */}
        <div className="flex items-center gap-1.5 bg-[#E8F5E9] px-3 py-1.5 rounded-full">
          <Gem size={14} className="text-[#2E7D32]" />
          <span className="text-sm font-semibold text-[#2E7D32]">{balance} ≈ {fmtCredits(balance)}</span>
        </div>

        <LanguageSwitcher />

        {/* Notification Bell */}
        <button
          onClick={() => setShowNotifs(true)}
          className="relative p-2 rounded-full bg-[#FFFBE4] hover:bg-yellow-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-gray-700" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#43A047] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#43A047] flex items-center justify-center text-white text-xs font-bold">
          {userInitial}
        </div>
      </header>

      {showNotifs && (
        <NotificationsPanel onClose={() => setShowNotifs(false)} />
      )}
    </>
  );
}
