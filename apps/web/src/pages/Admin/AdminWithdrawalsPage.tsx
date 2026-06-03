import { useEffect, useMemo, useState } from 'react';
import {
  listAdminWithdrawals,
  reviewAdminWithdrawal,
  type AdminWithdrawalRequest,
} from '../../core/network/adminApi';

type WithdrawalFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'paid';

const FILTERS: WithdrawalFilter[] = ['all', 'pending', 'approved', 'rejected', 'paid'];

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState<AdminWithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WithdrawalFilter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      setLoading(true);
      const data = await listAdminWithdrawals(filter === 'all' ? undefined : { status: filter });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [filter]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  const statusClass = (status: AdminWithdrawalRequest['status']) => {
    if (status === 'paid') return 'bg-[#E8F5E9] text-[#2E7D32]';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    if (status === 'approved') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      setBusyId(id);
      await reviewAdminWithdrawal(id, {
        action,
        ...(noteById[id]?.trim() ? { note: noteById[id].trim() } : {}),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Withdrawal Requests</h1>
        <p className="text-[#616161] text-sm mt-1">
          Review tutor withdrawal requests and approve/reject payouts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-[#43A047] text-white'
                : 'bg-white border border-gray-200 text-[#616161] hover:border-[#43A047]'
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-4 py-8 text-sm text-[#616161]">Loading withdrawals…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8FBF0]">
              <tr>
                {['Tutor', 'Amount', 'Requested', 'Status', 'Note', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className="text-left px-4 py-3 text-[#616161] font-medium text-xs uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FBF0] transition-colors align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#212121]">{item.tutorName ?? item.tutorEmail ?? item.tutorUserId}</p>
                    {item.tutorEmail && <p className="text-xs text-[#616161] mt-0.5">{item.tutorEmail}</p>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#212121]">
                    ₹{(item.amountCents / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-[#616161]">
                    {new Date(item.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-[260px]">
                    <textarea
                      value={noteById[item.id] ?? item.adminNote ?? ''}
                      onChange={(event) =>
                        setNoteById((prev) => ({ ...prev, [item.id]: event.target.value }))
                      }
                      placeholder="Optional review note"
                      rows={2}
                      disabled={item.status !== 'pending'}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-[#616161] disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleReview(item.id, 'approve')}
                          disabled={busyId === item.id}
                          className="text-xs px-3 py-1.5 rounded-md bg-[#E8F5E9] text-[#2E7D32] font-medium hover:bg-green-100 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void handleReview(item.id, 'reject')}
                          disabled={busyId === item.id}
                          className="text-xs px-3 py-1.5 rounded-md bg-red-50 text-red-600 font-medium hover:bg-red-100 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#9E9E9E]">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#616161]">
                    No withdrawal requests found.
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
