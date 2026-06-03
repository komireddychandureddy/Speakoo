import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { toApplicationReference } from '../../core/utils/applicationReference';
import {
  listAdminKycSubmissions,
  reviewKycSubmission,
  type AdminKycSubmission,
} from '../../core/network/adminApi';

type FilterKey = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_META: Record<'pending' | 'approved' | 'rejected', { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', badge: 'bg-[#E8F5E9] text-[#2E7D32]' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700' },
};

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminApplicationsPage() {
  const [submissions, setSubmissions] = useState<AdminKycSubmission[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = () => {
    listAdminKycSubmissions({ page: 1, limit: 200 })
      .then((res) => setSubmissions(res.items))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const countFor = (s: 'pending' | 'approved' | 'rejected') =>
    submissions.filter((u) => u.status === s).length;

  const filtered = submissions.filter((u) => {
    const name = (u.tutor.profile?.displayName ?? u.tutor.email).toLowerCase();
    const matchesQuery =
      name.includes(query.toLowerCase()) ||
      u.tutor.email.toLowerCase().includes(query.toLowerCase()) ||
      u.id.toLowerCase().includes(query.toLowerCase());
    const status = u.status;
    const matchesFilter =
      filter === 'all' ||
      filter === status;
    return matchesQuery && matchesFilter;
  });

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    await reviewKycSubmission(submissionId, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Tutor Applications</h1>
        <p className="text-[#616161] text-sm mt-1">
          {submissions.length} total · {countFor('pending')} pending review
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
            placeholder="Search by id, name or email..."
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
            {key !== 'all' && <span className="ml-1.5 text-xs opacity-80">({countFor(key)})</span>}
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
              const status = u.status;
              const isPending = status === 'pending';
              const reference = u.applicationRef ?? toApplicationReference(u.id);
              const displayName = u.tutor.profile?.displayName ?? u.tutor.email;
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
                        <p className="text-xs text-[#616161]">{u.tutor.email}</p>
                        <p className="text-[11px] text-[#616161]">#{reference}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#616161]">{u.tutor.tutorProfile?.languagesTaught?.join(', ') ?? '—'}</td>
                  <td className="px-5 py-3 text-[#616161]">
                    —
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
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleReview(u.id, 'approved')}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-[#43A047] text-white hover:bg-[#2E7D32] transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(u.id, 'rejected')}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </>
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
