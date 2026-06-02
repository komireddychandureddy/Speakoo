import { useEffect, useState } from 'react';
import { Users, GraduationCap, CalendarCheck, TrendingUp, FileCheck } from 'lucide-react';
import { getAdminStats, type AdminStats } from '../../core/network/adminApi';

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-[#E8F5E9] text-[#2E7D32]',
  cancelled: 'bg-red-100 text-red-700',
  missed: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-600',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Tutors', value: stats.tutors, icon: GraduationCap, color: 'bg-[#E8F5E9] text-[#2E7D32]' },
        { label: 'Total Learners', value: stats.learners, icon: Users, color: 'bg-blue-50 text-blue-700' },
        { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'bg-amber-50 text-amber-700' },
        {
          label: 'Total Revenue',
          value: `₹${(stats.totalRevenueCents / 100).toLocaleString('en-IN')}`,
          icon: TrendingUp,
          color: 'bg-purple-50 text-purple-700',
        },
        { label: 'Pending Tutors', value: stats.pendingTutors, icon: FileCheck, color: 'bg-amber-50 text-amber-700' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Admin Dashboard</h1>
        <p className="text-[#616161] text-sm mt-1">Platform overview and key metrics</p>
      </div>

      {loading ? (
        <p className="text-[#616161] text-sm">Loading stats…</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
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
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-5 col-span-1">
                <p className="text-sm text-[#616161] mb-1">Total Users</p>
                <p className="text-3xl font-bold text-[#43A047]">{stats.totalUsers}</p>
              </div>
              <div className="card p-5 col-span-1">
                <p className="text-sm text-[#616161] mb-1">Tutors</p>
                <p className="text-3xl font-bold text-[#43A047]">{stats.tutors}</p>
                <p className="text-xs text-[#616161] mt-1">of {stats.totalUsers} total</p>
              </div>
              <div className="card p-5 col-span-1">
                <p className="text-sm text-[#616161] mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingTutors}</p>
                <p className="text-xs text-[#616161] mt-1">tutor applications</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

