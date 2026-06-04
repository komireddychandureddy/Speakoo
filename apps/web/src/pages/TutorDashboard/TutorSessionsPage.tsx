import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { getMyBookings, type Booking, type BookingStatus } from '../../core/network/bookingsApi';
import { endSession, startSession } from '../../core/network/sessionsApi';
import SessionProgress from '../../components/Sessions/SessionProgress';

type TutorTab = 'all' | 'confirmed' | 'in_session' | 'completed' | 'cancelled' | 'pending';

const TABS: Array<{ key: TutorTab; label: string }> = [
  { key: 'all', label: 'All Sessions' },
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'in_session', label: 'In Session' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'pending', label: 'Pending' },
];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending Payment',
  confirmed: 'Upcoming',
  in_session: 'In Session',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function TutorSessionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TutorTab>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const loadBookings = (withLoading = false) => {
    if (withLoading) {
      setLoading(true);
    }

    getMyBookings()
      .then((items) => {
        setBookings(items);
        setError(null);
        setLastUpdatedAt(Date.now());
      })
      .catch(() => {
        setBookings([]);
        setError('Could not load tutor sessions right now.');
      })
      .finally(() => {
        if (withLoading) {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    loadBookings(true);

    const refreshTimer = window.setInterval(() => loadBookings(false), 20_000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => loadBookings(false);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadBookings(false);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleStartSession = async (bookingId: string) => {
    setActionError(null);
    setActionBookingId(bookingId);
    try {
      await startSession(bookingId);
      loadBookings(false);
      navigate('/session-room/' + bookingId);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setActionError('This session cannot be started right now. Please refresh and try again.');
      } else {
        setActionError('Could not start session. Please try again.');
      }
    } finally {
      setActionBookingId(null);
    }
  };

  const handleEndSession = async (bookingId: string) => {
    setActionError(null);
    setActionBookingId(bookingId);
    try {
      await endSession(bookingId);
      loadBookings(false);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setActionError('This session is already ended or not in progress.');
      } else {
        setActionError('Could not end session. Please try again.');
      }
    } finally {
      setActionBookingId(null);
    }
  };

  const summary = useMemo(() => {
    const count = (status: BookingStatus) => bookings.filter((b) => b.status === status).length;
    return {
      all: bookings.length,
      upcoming: count('confirmed'),
      inSession: count('in_session'),
      completed: count('completed'),
      cancelled: count('cancelled'),
      pending: count('pending'),
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const scoped =
      activeTab === 'all' ? bookings : bookings.filter((booking) => booking.status === activeTab);
    return [...scoped].sort(
      (a, b) => new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime(),
    );
  }, [activeTab, bookings]);

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Tutor Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Real booking data from database with status tracking and join actions.
        </p>
        {lastUpdatedAt && (
          <p className="text-xs text-gray-500 mt-1">
            Last updated {new Date(lastUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        <button onClick={() => loadBookings(false)} className="btn-outline mt-3" aria-label="Refresh tutor sessions">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="All" value={summary.all} />
        <SummaryCard label="Upcoming" value={summary.upcoming} />
        <SummaryCard label="In Session" value={summary.inSession} />
        <SummaryCard label="Completed" value={summary.completed} />
        <SummaryCard label="Cancelled" value={summary.cancelled} />
        <SummaryCard label="Pending" value={summary.pending} />
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-[#EEEEEE] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-[#43A047] text-white shadow'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="card p-3 border border-red-200 bg-red-50 text-red-700 text-sm">{actionError}</div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-gray-400">Loading sessions…</div>
      ) : error ? (
        <div className="card p-6 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No sessions for selected status.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const start = new Date(booking.slot.startTime);
            const end = new Date(booking.slot.endTime);
            const learnerName = booking.learner?.profile?.displayName?.trim() || 'Learner';
            const learnerEmail = booking.learner?.email || null;
            const canJoin = booking.status === 'confirmed' || booking.status === 'in_session';

            return (
              <div key={booking.id} className="card px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{booking.language} Session</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {start.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' · '}
                      {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Learner: {learnerName}</p>
                    {learnerEmail && <p className="text-xs text-gray-500 mt-1">Email: {learnerEmail}</p>}
                    <p className="text-xs text-gray-500 mt-1">Booking ID: {booking.id}</p>
                    <p className="text-xs text-gray-500 mt-1">Room: {booking.livekitRoom}</p>
                    <p className="text-xs text-gray-500 mt-1">Duration: {Math.round((end.getTime() - start.getTime()) / 60_000)} mins</p>
                    <SessionProgress status={booking.status} />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                      {STATUS_LABEL[booking.status]}
                    </span>
                    <p className="text-sm font-semibold text-gray-700">
                      ₹{(booking.priceCents / 100).toFixed(0)}
                    </p>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => void handleStartSession(booking.id)}
                        className="btn-primary"
                        disabled={actionBookingId === booking.id}
                      >
                        {actionBookingId === booking.id ? 'Starting…' : 'Start Session'}
                      </button>
                    )}
                    {booking.status === 'in_session' && (
                      <>
                        <button
                          onClick={() => navigate('/session-room/' + booking.id)}
                          className="btn-primary"
                        >
                          Join Session
                        </button>
                        <button
                          onClick={() => void handleEndSession(booking.id)}
                          className="btn-outline"
                          disabled={actionBookingId === booking.id}
                        >
                          {actionBookingId === booking.id ? 'Ending…' : 'End Session'}
                        </button>
                      </>
                    )}
                    {booking.status === 'pending' ? (
                      <p className="text-xs text-amber-700 font-semibold">Waiting for learner payment</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-3 py-3">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-extrabold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
