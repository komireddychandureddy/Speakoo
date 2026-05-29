import { useNavigate } from 'react-router-dom';
import { Star, Calendar, DollarSign, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';

const UPCOMING_SESSIONS = [
  { id: '1', student: 'Aryan K.', lang: 'English', time: 'Today, 10:00 AM', duration: '60 min', status: 'confirmed' },
  { id: '2', student: 'Fatima A.', lang: 'English', time: 'Today, 2:00 PM', duration: '45 min', status: 'confirmed' },
  { id: '3', student: 'Liam P.', lang: 'English', time: 'Tomorrow, 9:00 AM', duration: '60 min', status: 'pending' },
];

const STATS = [
  { icon: Calendar, label: "Today's Sessions", value: '3', sub: '+1 pending', color: '#E8F5E9', iconColor: '#43A047' },
  { icon: DollarSign, label: 'This Month', value: '$840', sub: '↑ 12% vs last month', color: '#E8F5E9', iconColor: '#2E7D32' },
  { icon: Star, label: 'Avg Rating', value: '4.9', sub: 'From 128 reviews', color: '#FFF8E1', iconColor: '#FF8F00' },
  { icon: Users, label: 'Total Students', value: '47', sub: '8 active this week', color: '#E8F5E9', iconColor: '#43A047' },
];

const QUICK_ACTIONS = [
  { label: 'Manage Schedule', to: '/tutor-schedule', icon: Calendar },
  { label: 'View Earnings', to: '/tutor-earnings', icon: DollarSign },
  { label: 'All Sessions', to: '/tutor-sessions', icon: Clock },
];

export default function TutorDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white px-6 py-6">
        <p className="text-green-200 text-sm font-medium mb-1">Good morning 👋</p>
        <h2 className="text-2xl font-extrabold">Welcome back, Priya!</h2>
        <p className="text-green-100 text-sm mt-1">You have 3 sessions scheduled today. Keep it up!</p>
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
        {STATS.map((stat) => (
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
          <div className="space-y-3">
            {UPCOMING_SESSIONS.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-[#F8FBF0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#43A047] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {s.student.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.student}</p>
                    <p className="text-xs text-gray-500">{s.lang} · {s.duration}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-xs text-gray-600 font-medium">{s.time}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
                      s.status === 'confirmed'
                        ? 'bg-[#BBF7D0] text-[#14783D]'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {s.status}
                  </span>
                  {s.status === 'confirmed' && (
                    <button
                      onClick={() => navigate('/session-room/' + s.id)}
                      className="text-xs bg-[#43A047] text-white px-3 py-1 rounded-lg font-semibold hover:bg-[#2E7D32] transition-colors"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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

      {/* Earnings Summary */}
      <div className="card px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Earnings This Week</h3>
          <button
            onClick={() => navigate('/tutor-earnings')}
            className="text-xs text-[#43A047] font-semibold hover:underline flex items-center gap-1"
          >
            Full report <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-1 items-end h-24">
          {[
            { day: 'Mon', amount: 60, sessions: 2 },
            { day: 'Tue', amount: 90, sessions: 3 },
            { day: 'Wed', amount: 30, sessions: 1 },
            { day: 'Thu', amount: 120, sessions: 4 },
            { day: 'Fri', amount: 60, sessions: 2 },
            { day: 'Sat', amount: 150, sessions: 5 },
            { day: 'Sun', amount: 0, sessions: 0 },
          ].map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">${d.amount}</span>
              <div
                className="w-full rounded-t-md bg-[#43A047] transition-all"
                style={{ height: `${(d.amount / 150) * 64}px`, minHeight: d.amount ? '4px' : '0' }}
                title={`${d.sessions} sessions`}
              />
              <span className="text-xs text-gray-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
