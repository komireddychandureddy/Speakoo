import { useState } from 'react';
import { Search } from 'lucide-react';
import { LEARNERS, Learner } from '../../data/mockData';

type LearnerStatus = 'active' | 'suspended';

const initialStatuses = Object.fromEntries(
  LEARNERS.map((l) => [l.id, l.status] as [string, LearnerStatus]),
);

export default function AdminLearnersPage() {
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<Record<string, LearnerStatus>>(initialStatuses);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const toggle = (id: string) =>
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === 'active' ? 'suspended' : 'active' }));

  const filtered = LEARNERS.filter((l: Learner) => {
    const matchesQuery =
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.email.toLowerCase().includes(query.toLowerCase()) ||
      l.country.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || statuses[l.id] === filter;
    return matchesQuery && matchesFilter;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Manage Learners</h1>
        <p className="text-[#616161] text-sm mt-1">{LEARNERS.length} learners registered on the platform</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or country…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30"
          />
        </div>
        {(['all', 'active', 'suspended'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#43A047] text-white'
                : 'bg-white border border-gray-200 text-[#616161] hover:border-[#43A047]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FBF0]">
            <tr>
              {['Learner', 'Email', 'Sessions', 'Language', 'Country', 'Joined', 'Status', 'Action'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#616161] font-medium text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-[#F8FBF0] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs font-bold">
                      {l.avatar}
                    </span>
                    <p className="font-medium text-[#212121]">{l.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#616161]">{l.email}</td>
                <td className="px-4 py-3 text-[#212121] font-medium">{l.sessionsCompleted}</td>
                <td className="px-4 py-3 text-[#616161]">{l.language}</td>
                <td className="px-4 py-3 text-[#616161]">{l.country}</td>
                <td className="px-4 py-3 text-[#616161]">{formatDate(l.joinedDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      statuses[l.id] === 'active'
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {statuses[l.id]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(l.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      statuses[l.id] === 'active'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-green-100'
                    }`}
                  >
                    {statuses[l.id] === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[#616161]">
                  No learners match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
