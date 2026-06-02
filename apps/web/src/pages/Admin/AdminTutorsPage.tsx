import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { listAdminUsers, suspendUser, unsuspendUser, approveTutor, type AdminUser } from '../../core/network/adminApi';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');

  useEffect(() => {
    listAdminUsers(1, 100, 'tutor')
      .then((res) => setTutors(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (user: AdminUser) => {
    try {
      if (user.isSuspended) {
        await unsuspendUser(user.id);
        setTutors((prev) => prev.map((t) => (t.id === user.id ? { ...t, isSuspended: false } : t)));
      } else {
        await suspendUser(user.id);
        setTutors((prev) => prev.map((t) => (t.id === user.id ? { ...t, isSuspended: true } : t)));
      }
    } catch {
      // keep UI in sync — ignore error silently
    }
  };

  const handleApprove = async (user: AdminUser) => {
    try {
      await approveTutor(user.id);
      setTutors((prev) =>
        prev.map((t) =>
          t.id === user.id && t.tutorProfile
            ? { ...t, tutorProfile: { ...t.tutorProfile, isApproved: true } }
            : t,
        ),
      );
    } catch {
      // ignore
    }
  };

  const filtered = tutors.filter((t) => {
    const name = t.profile?.displayName ?? t.email;
    const matchesQuery =
      name.toLowerCase().includes(query.toLowerCase()) ||
      t.email.toLowerCase().includes(query.toLowerCase()) ||
      (t.tutorProfile?.languagesTaught ?? []).some((l) =>
        l.toLowerCase().includes(query.toLowerCase()),
      );
    const matchesFilter =
      filter === 'all' ||
      (filter === 'suspended' ? t.isSuspended : !t.isSuspended);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Manage Tutors</h1>
        <p className="text-[#616161] text-sm mt-1">{tutors.length} tutors registered on the platform</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or language…"
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
          <p className="px-5 py-8 text-[#616161] text-sm">Loading tutors…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8FBF0]">
              <tr>
                {['Tutor', 'Email', 'Languages', 'Rate / hr', 'Approved', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[#616161] font-medium text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-[#F8FBF0] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs font-bold">
                        {(t.profile?.displayName ?? t.email).charAt(0).toUpperCase()}
                      </span>
                      <p className="font-medium text-[#212121]">{t.profile?.displayName ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#616161]">{t.email}</td>
                  <td className="px-5 py-3 text-[#616161]">
                    {(t.tutorProfile?.languagesTaught ?? []).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3 text-[#212121] font-medium">
                    {t.tutorProfile
                      ? `₹${((t.tutorProfile.hourlyRateCents ?? 0) / 100).toLocaleString('en-IN')}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    {t.tutorProfile?.isApproved ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#E8F5E9] text-[#2E7D32]">
                        Yes
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApprove(t)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        t.isSuspended ? 'bg-red-100 text-red-700' : 'bg-[#E8F5E9] text-[#2E7D32]'
                      }`}
                    >
                      {t.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(t)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        t.isSuspended
                          ? 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {t.isSuspended ? 'Activate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#616161]">
                    No tutors match your search.
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

