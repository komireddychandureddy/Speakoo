import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { listAdminUsers, approveTutor, type AdminUser } from '../../core/network/adminApi';

type FilterKey = 'all' | 'pending' | 'approved';

const STATUS_META: Record<'pending' | 'approved', { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', badge: 'bg-[#E8F5E9] text-[#2E7D32]' },
};

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
];

export default function AdminApplicationsPage() {
  const [tutors, setTutors] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = () => {
    listAdminUsers(1, 100, 'tutor').then((res) => setTutors(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const countFor = (s: 'pending' | 'approved') =>
    tutors.filter((u) => (s === 'pending' ? u.tutorProfile?.isApproved === false : u.tutorProfile?.isApproved === true)).length;

  const filtered = tutors.filter((u) => {
    const name = (u.profile?.displayName ?? u.email).toLowerCase();
    const matchesQuery = name.includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    const isApproved = u.tutorProfile?.isApproved === true;
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !isApproved) ||
      (filter === 'approved' && isApproved);
    return matchesQuery && matchesFilter;
  });

  const handleApprove = async (userId: string) => {
    await approveTutor(userId);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Tutor Applications</h1>
        <p className="text-[#616161] text-sm mt-1">
          {tutors.length} total · {countFor('pending')} pending review
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { label: 'Pending', s: 'pending' as const, color: 'border-amber-400 bg-amber-50 text-amber-700' },
          { label: 'Approved', s: 'approved' as const, color: 'border-[#43A047] bg-[#E8F5E9] text-[#2E7D32]' },
        ]).map(({ label, s, color }) => (
          <div key={label} className={`card p-4 border-l-4 ${color}`}>
            <p className="text-2xl font-bold">{countFor(s)}</p>
            <p className="text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30"
          />
        </div>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-[#43A047] text-white'
                : 'bg-white border border-gray-200 text-[#616161] hover:border-[#43A047]'
            }`}
          >
            {label}
            {key !== 'all' && (
              <span className="ml-1.5 text-xs opacity-80">({countFor(key as 'pending' | 'approved')})</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FBF0]">
            <tr>
              {['Applicant', 'Languages', 'Rate (₹/hr)', 'Joined', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-[#616161] font-medium text-xs uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => {
              const isApproved = u.tutorProfile?.isApproved === true;
              const status = isApproved ? 'approved' : 'pending';
              const displayName = u.profile?.displayName ?? u.email;
              const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <tr key={u.id} className="hover:bg-[#F8FBF0] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </span>
                      <div>
                        <p className="font-medium text-[#212121]">{displayName}</p>
                        <p className="text-xs text-[#616161]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#616161]">{u.tutorProfile?.languagesTaught?.join(', ') ?? '—'}</td>
                  <td className="px-5 py-3 text-[#616161]">
                    {u.tutorProfile?.hourlyRateCents != null
                      ? `₹${Math.round(u.tutorProfile.hourlyRateCents / 100)}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-[#616161]">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_META[status].badge}`}>
                      {STATUS_META[status].label}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex items-center gap-2">
                    <Link
                      to={`/admin/applications/${u.id}`}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-[#E8F5E9] text-[#2E7D32] hover:bg-green-100 transition-colors"
                    >
                      <FileText size={13} /> View
                    </Link>
                    {!isApproved && (
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-[#43A047] text-white hover:bg-[#2E7D32] transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#616161]">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

}
