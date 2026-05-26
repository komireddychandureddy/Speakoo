import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { TUTOR_APPLICATIONS, TutorApplication, ApplicationStatus } from '../../data/mockData';

const STORAGE_KEY = 'speakoo_applications';

function getApps(): TutorApplication[] {
  return (JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as TutorApplication[] | null) ?? TUTOR_APPLICATIONS;
}

const STATUS_META: Record<ApplicationStatus, { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', badge: 'bg-[#E8F5E9] text-[#2E7D32]' },
  amendment_requested: { label: 'Needs Changes', badge: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700' },
};

const FILTERS: Array<{ key: 'all' | ApplicationStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'amendment_requested', label: 'Needs Changes' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminApplicationsPage() {
  const apps = getApps();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');

  const countFor = (s: ApplicationStatus) => apps.filter((a) => a.status === s).length;

  const filtered = apps.filter((a) => {
    const name = `${a.firstName} ${a.lastName}`.toLowerCase();
    const matchesQuery =
      name.includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Tutor Applications</h1>
        <p className="text-[#616161] text-sm mt-1">
          {apps.length} total · {countFor('pending')} pending review
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { label: 'Pending', s: 'pending' as const, color: 'border-amber-400 bg-amber-50 text-amber-700' },
          { label: 'Approved', s: 'approved' as const, color: 'border-[#43A047] bg-[#E8F5E9] text-[#2E7D32]' },
          { label: 'Needs Changes', s: 'amendment_requested' as const, color: 'border-blue-400 bg-blue-50 text-blue-700' },
          { label: 'Rejected', s: 'rejected' as const, color: 'border-red-400 bg-red-50 text-red-700' },
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
              <span className="ml-1.5 text-xs opacity-80">({countFor(key as ApplicationStatus)})</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FBF0]">
            <tr>
              {['Applicant', 'Languages', 'Country', 'Exp.', 'Submitted', 'Status', ''].map((h) => (
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
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-[#F8FBF0] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs font-bold shrink-0">
                      {a.firstName[0]}{a.lastName[0]}
                    </span>
                    <div>
                      <p className="font-medium text-[#212121]">{a.firstName} {a.lastName}</p>
                      <p className="text-xs text-[#616161]">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#616161]">{a.languages.join(', ')}</td>
                <td className="px-5 py-3 text-[#616161]">{a.country}</td>
                <td className="px-5 py-3 text-[#616161]">{a.yearsExp} yrs</td>
                <td className="px-5 py-3 text-[#616161]">
                  {new Date(a.submittedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_META[a.status].badge}`}>
                    {STATUS_META[a.status].label}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Link
                    to={`/admin/applications/${a.id}`}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-[#E8F5E9] text-[#2E7D32] hover:bg-green-100 transition-colors"
                  >
                    <FileText size={13} /> Review
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[#616161]">
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
