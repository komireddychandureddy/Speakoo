import { Users, GraduationCap, CalendarCheck, TrendingUp, FileCheck, Clock } from 'lucide-react';
import { TUTORS, LEARNERS, SESSIONS, TUTOR_APPLICATIONS, TutorApplication } from '../../data/mockData';

function getPendingCount(): number {
  const stored = JSON.parse(localStorage.getItem('speakoo_applications') || 'null') as TutorApplication[] | null;
  return (stored ?? TUTOR_APPLICATIONS).filter((a) => a.status === 'pending').length;
}

const STATS = [
  { label: 'Total Tutors', value: TUTORS.length, icon: GraduationCap, color: 'bg-[#E8F5E9] text-[#2E7D32]' },
  { label: 'Total Learners', value: LEARNERS.length, icon: Users, color: 'bg-blue-50 text-blue-700' },
  { label: 'Sessions This Month', value: 142, icon: CalendarCheck, color: 'bg-amber-50 text-amber-700' },
  { label: 'Monthly Revenue', value: '₹1,24,500', icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
  { label: 'Pending Applications', value: getPendingCount(), icon: FileCheck, color: 'bg-amber-50 text-amber-700' },
];

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-[#E8F5E9] text-[#2E7D32]',
  cancelled: 'bg-red-100 text-red-700',
  missed: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-600',
};

const recentSessions = SESSIONS.slice(0, 5);
const availableTutors = TUTORS.filter((t) => t.isAvailable).length;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Admin Dashboard</h1>
        <p className="text-[#616161] text-sm mt-1">Platform overview and key metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-[#212121]">{value}</p>
            <p className="text-[#616161] text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick info row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 col-span-1">
          <p className="text-sm text-[#616161] mb-1">Available Tutors</p>
          <p className="text-3xl font-bold text-[#43A047]">{availableTutors}</p>
          <p className="text-xs text-[#616161] mt-1">of {TUTORS.length} total</p>
        </div>
        <div className="card p-5 col-span-1">
          <p className="text-sm text-[#616161] mb-1">Active Learners</p>
          <p className="text-3xl font-bold text-[#43A047]">
            {LEARNERS.filter((l) => l.status === 'active').length}
          </p>
          <p className="text-xs text-[#616161] mt-1">of {LEARNERS.length} total</p>
        </div>
        <div className="card p-5 col-span-1">
          <p className="text-sm text-[#616161] mb-1">Pending Sessions</p>
          <p className="text-3xl font-bold text-amber-600">
            {SESSIONS.filter((s) => s.status === 'pending' || s.status === 'upcoming').length}
          </p>
          <p className="text-xs text-[#616161] mt-1">need attention</p>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock size={16} className="text-[#43A047]" />
          <h2 className="font-semibold text-[#212121]">Recent Sessions</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#F8FBF0]">
            <tr>
              {['#', 'Topic', 'Tutor', 'Date', 'Status'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[#616161] font-medium text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentSessions.map((s) => (
              <tr key={s.id} className="hover:bg-[#F8FBF0] transition-colors">
                <td className="px-5 py-3 text-[#616161]">#{s.sessionNumber}</td>
                <td className="px-5 py-3 font-medium text-[#212121]">{s.topic}</td>
                <td className="px-5 py-3 text-[#616161]">{s.tutorName}</td>
                <td className="px-5 py-3 text-[#616161]">{s.date}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
