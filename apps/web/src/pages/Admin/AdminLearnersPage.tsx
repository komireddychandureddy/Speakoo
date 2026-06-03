import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { listAdminUsers, suspendUser, unsuspendUser, type AdminUser } from '../../core/network/adminApi';

export default function AdminLearnersPage() {
  const [learners, setLearners] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const refreshInFlight = useRef(false);

  const loadLearners = async (isBackground = false) => {
    if (refreshInFlight.current) return;

    refreshInFlight.current = true;
    if (isBackground) {
      setRefreshing(true);
    }

    try {
      const res = await listAdminUsers(1, 100, 'learner');
      setLearners(res.data);
      const now = Date.now();
      setLastUpdatedAt(now);
      setSecondsSinceUpdate(0);
    } finally {
      refreshInFlight.current = false;
      setLoading(false);
      if (isBackground) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadLearners();

    // Keep learner list live without manual refresh.
    const refreshTimer = window.setInterval(() => {
      void loadLearners(true);
    }, 20_000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    if (!lastUpdatedAt) return;

    const timer = window.setInterval(() => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastUpdatedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lastUpdatedAt]);

  const handleToggle = async (user: AdminUser) => {
    try {
      if (user.isSuspended) {
        await unsuspendUser(user.id);
        setLearners((prev) => prev.map((l) => (l.id === user.id ? { ...l, isSuspended: false } : l)));
      } else {
        await suspendUser(user.id);
        setLearners((prev) => prev.map((l) => (l.id === user.id ? { ...l, isSuspended: true } : l)));
      }
    } catch {
      // ignore
    }
  };

  const filtered = learners.filter((l) => {
    const name = l.profile?.displayName ?? l.email;
    const matchesQuery =
      name.toLowerCase().includes(query.toLowerCase()) ||
      l.email.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'suspended' ? l.isSuspended : !l.isSuspended);
    return matchesQuery && matchesFilter;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Manage Learners</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[#616161] text-sm">{learners.length} learners registered on the platform</p>
          {refreshing && <span className="text-xs text-[#616161]">Refreshing…</span>}
          {!refreshing && lastUpdatedAt && <span className="text-xs text-[#616161]">Last updated {secondsSinceUpdate}s ago</span>}
        </div>
      </div>

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

      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-[#616161] text-sm">Loading learners…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8FBF0]">
              <tr>
                {['Learner', 'Email', 'Joined', 'Status', 'Action'].map((h) => (
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
                        {(l.profile?.displayName ?? l.email).charAt(0).toUpperCase()}
                      </span>
                      <p className="font-medium text-[#212121]">{l.profile?.displayName ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#616161]">{l.email}</td>
                  <td className="px-4 py-3 text-[#616161]">{formatDate(l.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        l.isSuspended ? 'bg-red-100 text-red-700' : 'bg-[#E8F5E9] text-[#2E7D32]'
                      }`}
                    >
                      {l.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(l)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        l.isSuspended
                          ? 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {l.isSuspended ? 'Activate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[#616161]">
                    No learners match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

