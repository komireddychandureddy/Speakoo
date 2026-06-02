import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, type Booking } from '../../core/network/bookingsApi';
import {
  getRecommendedTutors,
  type RecommendedTutor,
} from '../../core/network/tutorsApi';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedTutors, setRecommendedTutors] = useState<RecommendedTutor[]>([]);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(() => {/* silently ignore — user may not be logged in */});

    getRecommendedTutors({ limit: 4 })
      .then(setRecommendedTutors)
      .catch(() => {
        setRecommendedTutors([]);
      });
  }, []);

  const upcoming = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'in_session')
    .slice(0, 2);
  const totalCompleted = bookings.filter((b) => b.status === 'completed').length;

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('speakoo_user') ?? '{}'); } catch { return {}; }
  })();
  const userName: string = storedUser.name || 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome Banner */}
      <div className="card px-6 py-5 bg-gradient-to-r from-[#43A047] to-[#43A047] text-white rounded-2xl">
        <p className="text-purple-200 text-sm font-medium mb-1">{greeting} 👋</p>
        <h2 className="text-2xl font-extrabold">Hello, {userName}!</h2>
        <p className="text-purple-200 text-sm mt-1">Keep practising to improve your English skills!</p>
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalCompleted}</p>
            <p className="text-xs text-purple-200">Sessions Done</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold">{bookings.length}</p>
            <p className="text-xs text-purple-200">Total Bookings</p>
          </div>
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
            {upcoming.map((booking) => {
              const start = new Date(booking.slot.startTime);
              return (
                <div key={booking.id} className="card px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#43A047] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {booking.language.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{booking.language} Session</p>
                    <p className="text-sm text-gray-500">
                      {start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button className="btn-primary flex-shrink-0" onClick={() => navigate(`/session/${booking.id}`)}>Join</button>
                </div>
              );
            })}
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

      {/* Recommended Tutors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-base">Recommended Tutors</h3>
          <button
            onClick={() => navigate('/allTutors')}
            className="text-sm text-[#43A047] font-medium hover:underline"
          >
            View all →
          </button>
        </div>

        {recommendedTutors.length === 0 ? (
          <div className="card p-6 text-center text-gray-400 text-sm">
            Tutor recommendations will appear after your first few sessions.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedTutors.map((tutor) => {
              const name = tutor.user.profile?.displayName ?? 'Tutor';
              return (
                <button
                  key={tutor.id}
                  onClick={() => navigate(`/TutorDetailsView/${tutor.userId}`)}
                  className="card p-4 text-left hover:shadow-md transition-shadow"
                >
                  <p className="font-semibold text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {tutor.languagesTaught.join(', ')}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-semibold text-[#43A047]">
                      ₹{Math.round(tutor.hourlyRateCents / 100)} / hr
                    </span>
                    <span className="text-xs text-gray-500">
                      {tutor.rating.average.toFixed(1)}★ ({tutor.rating.count})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Progress Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-[#43A047]">{totalCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Completed Sessions</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-[#14783D]">{bookings.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Bookings</p>
        </div>
      </section>
    </div>
  );
}
