import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard', to: '/dashboard' },
  { icon: '📅', label: 'My Sessions', to: '/mySession' },
  { icon: '📖', label: 'Book Session', to: '/myClass' },
  { icon: '👩‍🏫', label: 'All Tutors', to: '/allTutors' },
  { icon: '📚', label: 'EY Resource', to: '/ey-resource' },
  { icon: '📋', label: 'Curriculum', to: '/Curriculum' },
  { icon: '💳', label: 'Choose a Subscription', to: '/chooseSubscription' },
  { icon: '👤', label: 'My Profile', to: '/myProfile' },
  { icon: '🎁', label: 'Refer & Earn', to: '/reffer_earn' },
  { icon: '🏆', label: 'My Level', to: '/Leaderboard' },
  { icon: '❓', label: 'FAQs', to: '/faq' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('speakoo_user');
    navigate('/');
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-56 flex flex-col bg-[#1E2720] z-20 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-white text-2xl font-extrabold tracking-tight">
          Speakoo
        </span>
        <span className="block text-purple-300 text-xs font-medium mt-0.5">English Learning Platform</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => (
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
