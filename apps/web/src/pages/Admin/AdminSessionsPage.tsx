import { useEffect, useMemo, useState } from 'react';
import {
  listAdminBookings,
  updateAdminBookingStatus,
  type AdminBooking,
} from '../../core/network/adminApi';

type SessionFilter = 'all' | 'confirmed' | 'in_session' | 'completed' | 'cancelled' | 'pending';

const FILTERS: SessionFilter[] = [
  'all',
  'confirmed',
  'in_session',
  'completed',
  'cancelled',
  'pending',
];

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AdminBooking[]>([]);
  const [filter, setFilter] = useState<SessionFilter>('all');
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null);

  const load = () => {
    listAdminBookings(1, 200).then((res) => setSessions(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return sessions;
    return sessions.filter((session) => session.status === filter);
  }, [sessions, filter]);

  const count = (status: SessionFilter) => {
    if (status === 'all') return sessions.length;
    return sessions.filter((session) => session.status === status).length;
  };

  const getActionsForStatus = (status: AdminBooking['status']) => {
    if (status === 'pending') return ['confirmed', 'cancelled'] as const;
    if (status === 'confirmed') return ['in_session', 'cancelled'] as const;
    if (status === 'in_session') return ['completed', 'cancelled'] as const;
    return [] as const;
  };

  const actionLabel: Record<AdminBooking['status'], string> = {
    pending: 'Mark Pending',
    confirmed: 'Confirm',
    in_session: 'Start Session',
    completed: 'Complete',
    cancelled: 'Cancel',
  };

  const handleTransition = async (bookingId: string, status: AdminBooking['status']) => {
    setBusyBookingId(bookingId);
    try {
      await updateAdminBookingStatus(bookingId, status);
      load();
    } finally {
      setBusyBookingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Session Control</h1>
        <p className="text-[#616161] text-sm mt-1">
          Track currently booked, in-session, completed and missed/cancelled sessions
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-[#43A047] text-white'
                : 'bg-white border border-gray-200 text-[#616161] hover:border-[#43A047]'
            }`}
          >
            {status.replace('_', ' ')} ({count(status)})
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FBF0]">
            <tr>
              {['Learner', 'Tutor', 'Language', 'When', 'Price', 'Status', 'Actions'].map((header) => (
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
            {filtered.map((session) => {
              const learner = session.learner.profile?.displayName ?? session.learner.email;
              const tutor = session.tutor.profile?.displayName ?? session.tutor.email;
              const start = new Date(session.slot.startTime);
              const actions = getActionsForStatus(session.status);
              return (
                <tr key={session.id} className="hover:bg-[#F8FBF0] transition-colors">
                  <td className="px-4 py-3 text-[#212121] font-medium">{learner}</td>
                  <td className="px-4 py-3 text-[#212121] font-medium">{tutor}</td>
                  <td className="px-4 py-3 text-[#616161]">{session.language}</td>
                  <td className="px-4 py-3 text-[#616161]">{start.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[#616161]">₹{(session.priceCents / 100).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200 text-[#616161]">
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {actions.length === 0 && (
                        <span className="text-xs text-[#9E9E9E]">No actions</span>
                      )}
                      {actions.map((nextStatus) => (
                        <button
                          key={`${session.id}-${nextStatus}`}
                          onClick={() => handleTransition(session.id, nextStatus)}
                          disabled={busyBookingId === session.id}
                          className="text-xs px-2 py-1 rounded-md bg-white border border-gray-200 text-[#616161] hover:border-[#43A047] disabled:opacity-50"
                        >
                          {actionLabel[nextStatus]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#616161]">
                  No sessions found for this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
