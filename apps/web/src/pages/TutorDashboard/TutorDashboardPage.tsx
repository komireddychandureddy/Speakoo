import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, DollarSign, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { getMyBookings, type Booking } from '../../core/network/bookingsApi';

const QUICK_ACTIONS = [
  { label: 'Manage Schedule', to: '/tutor-schedule', icon: Calendar },
  { label: 'View Earnings', to: '/tutor-earnings', icon: DollarSign },
  { label: 'All Sessions', to: '/tutor-sessions', icon: Clock },
];

export default function TutorDashboardPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .sort((a, b) => new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime())
    .slice(0, 5);

  const todaySessions = bookings.filter((b) => {
    const d = new Date(b.slot.startTime);
    return d.toDateString() === now.toDateString() && b.status !== 'cancelled';
  }).length;

  const monthEarnings = bookings
    .filter((b) => {
      const d = new Date(b.slot.startTime);
      return b.status === 'completed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + b.priceCents - b.platformFeeCents, 0);

  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  const stats = [
    { icon: Calendar, label: "Today's Sessions", value: String(todaySessions), sub: 'Scheduled', color: '#E8F5E9', iconColor: '#43A047' },
    { icon: DollarSign, label: 'This Month', value: `$${(monthEarnings / 100).toFixed(0)}`, sub: 'Net earnings', color: '#E8F5E9', iconColor: '#2E7D32' },
    { icon: Star, label: 'Avg Rating', value: '–', sub: 'See feedback page', color: '#FFF8E1', iconColor: '#FF8F00' },
    { icon: Users, label: 'Sessions Done', value: String(completedCount), sub: 'Total completed', color: '#E8F5E9', iconColor: '#43A047' },
  ];

  const formatSlotTime = (iso: string) => {
    const d = new Date(iso);
    const today = d.toDateString() === now.toDateString();
    const tomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    const prefix = today ? 'Today' : tomorrow ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${prefix}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const durationMin = (b: Booking) => {
    const ms = new Date(b.slot.endTime).getTime() - new Date(b.slot.startTime).getTime();
    return `${Math.round(ms / 60000)} min`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white px-6 py-6">
        <p className="text-green-200 text-sm font-medium mb-1">Good morning 👋</p>
        <h2 className="text-2xl font-extrabold">Welcome back!</h2>
        <p className="text-green-100 text-sm mt-1">You have {todaySessions} session{todaySessions !== 1 ? 's' : ''} scheduled today.</p>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => navigate('/tutor-schedule')}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
          >
            <Calendar size={14} /> Manage Schedule
          </button>
          <button
            onClick={() => navigate('/tutor-earnings')}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
          >
            <TrendingUp size={14} /> View Earnings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card px-4 py-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: stat.color }}
            >
              <stat.icon size={18} style={{ color: stat.iconColor }} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-[#43A047] font-medium mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 card px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Upcoming Sessions</h3>
            <button
              onClick={() => navigate('/tutor-sessions')}
              className="text-xs text-[#43A047] font-semibold flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No upcoming sessions.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-[#F8FBF0] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#43A047] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {b.language.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{b.language}</p>
                      <p className="text-xs text-gray-500">{durationMin(b)}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-xs text-gray-600 font-medium">{formatSlotTime(b.slot.startTime)}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
                        b.status === 'confirmed'
                          ? 'bg-[#BBF7D0] text-[#14783D]'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {b.status}
                    </span>
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => navigate('/session-room/' + b.id)}
                        className="text-xs bg-[#43A047] text-white px-3 py-1 rounded-lg font-semibold hover:bg-[#2E7D32] transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Tip */}
        <div className="space-y-4">
          <div className="card px-5 py-5">
            <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.to)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#E8F5E9] transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <a.icon size={15} className="text-[#43A047]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{a.label}</span>
                  <ArrowRight size={14} className="text-gray-400 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          <div className="card px-5 py-4 bg-[#E8F5E9] border-[#A5D6A7]">
            <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-1">Tip of the Day</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Tutors who respond to booking requests within 2 hours get 40% more repeat students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
