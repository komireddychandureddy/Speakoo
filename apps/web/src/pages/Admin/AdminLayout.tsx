import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, LogOut, Shield, ClipboardList } from 'lucide-react';
import { listAdminUsers } from '../../core/network/adminApi';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/tutors', label: 'Tutors', icon: GraduationCap },
  { to: '/admin/learners', label: 'Learners', icon: Users },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    listAdminUsers(1, 200, 'tutor')
      .then((res) => {
        const count = res.data.filter((u) => !u.tutorProfile?.isApproved).length;
        setPendingCount(count);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('speakoo_user');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FBF0]">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1E2720] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2">
          <Shield size={18} className="text-[#76D275]" />
          <span className="text-white font-bold text-base">Speakoo</span>
          <span className="text-[#76D275] text-xs font-semibold bg-white/10 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const count = label === 'Applications' ? pendingCount : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#43A047] text-white font-medium'
                      : 'text-green-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span className="text-xs bg-amber-400 text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-6 py-4 text-green-400 hover:text-white text-sm transition-colors border-t border-white/10"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
