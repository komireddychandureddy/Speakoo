import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { apiLogout } from '../../core/network/authApi';

const LEARNER_ITEMS = [
  { icon: '🏠', key: 'nav_dashboard', to: '/dashboard' },
  { icon: '📅', key: 'nav_sessions', to: '/mySession' },
  { icon: '📖', key: 'nav_book', to: '/myClass' },
  { icon: '👩‍🏫', key: 'nav_tutors', to: '/allTutors' },
  { icon: '📚', key: 'nav_resources', to: '/ey-resource' },
  { icon: '📋', key: 'nav_curriculum', to: '/Curriculum' },
  { icon: '💎', key: 'nav_credits', to: '/my-credits' },
  { icon: '👤', key: 'nav_profile', to: '/myProfile' },
  { icon: '🎁', key: 'nav_refer', to: '/reffer_earn' },
  { icon: '🏆', key: 'nav_leaderboard', to: '/Leaderboard' },
  { icon: '❓', key: 'nav_faq', to: '/faq' },
  { icon: '🎙️', key: 'nav_practice', to: '/practice' },
  { icon: '🌐', key: 'nav_community', to: '/community' },
  { icon: '❤️', key: 'nav_favorites', to: '/favorites' },
  { icon: '💬', key: 'nav_messages', to: '/messages' },
  { icon: '🧪', key: 'nav_language_test', to: '/language-test' },
  { icon: '⚙️', key: 'nav_settings', to: '/settings' },
] as const;

const TUTOR_ITEMS = [
  { icon: '📊', label: 'Tutor Dashboard', to: '/tutor-dashboard' },
  { icon: '💰', label: 'Tutor Earnings', to: '/tutor-earnings' },
  { icon: '🗓️', label: 'Schedule', to: '/tutor-schedule' },
  { icon: '🧾', label: 'All Sessions', to: '/tutor-sessions' },
  { icon: '💲', label: 'My Pricing', to: '/tutor-pricing' },
  { icon: '💸', label: 'Payouts', to: '/tutor-payout' },
  { icon: '⚙️', label: 'Settings', to: '/settings' },
];

function getUser(): { name?: string; role?: string } {
  try {
    return JSON.parse(localStorage.getItem('speakoo_user') ?? '{}');
  } catch {
    return {};
  }
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useI18n();
  const user = getUser();
  const isTutor = user.role === 'tutor';

  const handleLogout = () => {
    void apiLogout().finally(() => navigate('/'));
  };

  const visibleItems = isTutor
    ? TUTOR_ITEMS.map((item) => ({
        icon: item.icon,
        to: item.to,
        label: item.label,
      }))
    : LEARNER_ITEMS.map((item) => ({
        icon: item.icon,
        to: item.to,
        label: t(item.key),
      }));

  return (
    <aside className="fixed top-0 left-0 h-full w-56 flex flex-col bg-[#1E2720] z-20 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-white text-2xl font-extrabold tracking-tight">
          Speakoo
        </span>
        <span className="block text-[#76D275] text-xs font-medium mt-0.5">Language Learning</span>
      </div>

      {/* Role-specific nav items */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#141A16] text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="leading-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        {showConfirm ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-300 text-center">Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 text-xs py-1.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 text-xs py-1.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30"
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="text-base">🚪</span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
