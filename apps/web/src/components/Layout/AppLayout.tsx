import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/mySession': 'My Sessions',
  '/myClass': 'Book Session',
  '/allTutors': 'All Tutors',
  '/ey-resource': 'EY Resource',
  '/Curriculum': 'Curriculum',
  '/my-credits': 'My Credits',
  '/myProfile': 'My Profile',
  '/reffer_earn': 'Refer & Earn',
  '/Leaderboard': 'My Level',
  '/faq': 'FAQs',
  '/tutor-dashboard': 'Tutor Dashboard',
  '/tutor-earnings': 'Tutor Earnings',
  '/tutor-schedule': 'Tutor Schedule',
  '/tutor-sessions': 'Tutor Sessions',
  '/tutor-pricing': 'My Pricing',
  '/tutor-payout': 'Payout Settings',
  '/practice': 'Speaking Practice',
  '/community': 'Community',
  '/favorites': 'Saved Tutors',
  '/messages': 'Messages',
  '/settings': 'Settings',
  '/language-test': 'Language Test',
};

export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/TutorDetailsView')
      ? 'Tutor Details'
      : location.pathname.startsWith('/session-room/')
        ? 'Live Session'
        : 'Speakoo');

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Sidebar – desktop always visible */}
      <div className="hidden lg:block w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar – mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute top-0 left-0 h-full w-56">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
