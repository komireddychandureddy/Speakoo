import { useNavigate } from 'react-router-dom';
import { SESSIONS, NOTIFICATIONS } from '../../data/mockData';

const QUICK_TILES = [
  { icon: '📅', label: 'My Sessions', to: '/mySession', color: '#E6D7FF' },
  { icon: '📖', label: 'Book Session', to: '/myClass', color: '#BBF7D0' },
  { icon: '👩‍🏫', label: 'All Tutors', to: '/allTutors', color: '#FFF8C8' },
  { icon: '📚', label: 'EY Resource', to: '/ey-resource', color: '#E6D7FF' },
  { icon: '📋', label: 'Curriculum', to: '/Curriculum', color: '#BBF7D0' },
  { icon: '🏆', label: 'My Level', to: '/Leaderboard', color: '#FFFBE4' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const upcoming = SESSIONS.filter((s) => s.status === 'upcoming').slice(0, 2);
  const unread = NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome Banner */}
      <div className="card px-6 py-5 bg-gradient-to-r from-[#43A047] to-[#43A047] text-white rounded-2xl">
        <p className="text-purple-200 text-sm font-medium mb-1">Good morning 👋</p>
        <h2 className="text-2xl font-extrabold">Hello, Rahul!</h2>
        <p className="text-purple-200 text-sm mt-1">Keep practising to improve your English skills!</p>
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">142</p>
            <p className="text-xs text-purple-200">Sessions Done</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold">Bronze</p>
            <p className="text-xs text-purple-200">Current League</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold">₹240</p>
            <p className="text-xs text-purple-200">Wallet Balance</p>
          </div>
          {unread > 0 && (
            <>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{unread}</p>
                <p className="text-xs text-purple-200">Notifications</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-base">Upcoming Sessions</h3>
          <button
            onClick={() => navigate('/mySession')}
            className="text-sm text-[#43A047] font-medium hover:underline"
          >
            View all →
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="card p-6 text-center text-gray-400 text-sm">
            No upcoming sessions. <button onClick={() => navigate('/myClass')} className="text-[#43A047] hover:underline">Book one now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((session) => (
              <div key={session.id} className="card px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#43A047] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {session.tutorAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">Session #{session.sessionNumber}</p>
                  <p className="text-sm text-gray-500">{session.tutorName} · {session.date}</p>
                  <p className="text-xs text-gray-400">{session.timeSlot}</p>
                </div>
                <button className="btn-primary flex-shrink-0">Join</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Access Tiles */}
      <section>
        <h3 className="font-bold text-gray-900 text-base mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_TILES.map((tile) => (
            <button
              key={tile.to}
              onClick={() => navigate(tile.to)}
              className="card p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow text-left"
              style={{ borderTopColor: tile.color, borderTopWidth: 3 }}
            >
              <span className="text-2xl">{tile.icon}</span>
              <span className="text-sm font-semibold text-gray-800">{tile.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Progress Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-[#43A047]">142</p>
          <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-[#14783D]">19/24</p>
          <p className="text-xs text-gray-500 mt-1">Last Session Score</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-[#FAC847]">🥉 Bronze</p>
          <p className="text-xs text-gray-500 mt-1">League Rank</p>
        </div>
      </section>
    </div>
  );
}
