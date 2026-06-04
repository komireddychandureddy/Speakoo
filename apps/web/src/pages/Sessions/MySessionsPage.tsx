import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, type Booking, type BookingStatus } from '../../core/network/bookingsApi';
import { getSessionRecordingDownload } from '../../core/network/sessionsApi';
import SessionReportModal from './SessionReportModal';
import SessionChatModal from './SessionChatModal';
import SessionProgress from '../../components/Sessions/SessionProgress';

const HOLD_WINDOW_MS = 5 * 60 * 1000;

function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms);
  const minutes = Math.floor(clamped / 60_000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((clamped % 60_000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

type TabStatus = 'all' | 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'in_session';
const TABS: { key: TabStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'in_session', label: 'In Session' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'pending', label: 'Pending' },
];

const STATUS_COLORS: Record<TabStatus, string> = {
  all: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-[#E6D7FF] text-[#43A047]',
  in_session: 'bg-blue-100 text-blue-700',
  completed: 'bg-[#BBF7D0] text-[#14783D]',
  cancelled: 'bg-red-100 text-red-600',
  pending: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Upcoming',
  in_session: 'In Session',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function MySessionsPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reportBooking, setReportBooking] = useState<Booking | null>(null);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const loadBookings = () => {
    getMyBookings()
      .then((items) => {
        setBookings(items);
        setLastUpdatedAt(Date.now());
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadBookings();

    // Keep booking statuses in sync (e.g., pending hold expiry) without manual reload.
    const refreshTimer = window.setInterval(loadBookings, 20_000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => loadBookings();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadBookings();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = bookings.filter((booking) => {
    if (activeTab === 'all') {
      return true;
    }

    if (activeTab === 'confirmed') return booking.status === 'confirmed';
    return booking.status === activeTab;
  });

  const handleDownloadNotes = (booking: Booking) => {
    const start = new Date(booking.slot.startTime);
    const content = `Session Notes\n\nBooking ID: ${booking.id}\nLanguage: ${booking.language}\nDate: ${start.toLocaleDateString()} at ${start.toLocaleTimeString()}\nStatus: ${booking.status}\n\nNotes:\n- Practiced conversation on daily topics\n- Worked on pronunciation of difficult words\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${booking.id.slice(0, 8)}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRecording = async (booking: Booking) => {
    try {
      setDownloadLoadingId(booking.id);
      const { recordingUrl } = await getSessionRecordingDownload(booking.id);
      window.open(recordingUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // keep UX resilient if recording is not yet available
    } finally {
      setDownloadLoadingId(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">My Sessions</h1>
        <div className="flex items-center gap-3">
          {lastUpdatedAt && (
            <p className="text-xs text-gray-500">
              Updated {new Date(lastUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <button onClick={loadBookings} className="btn-outline" aria-label="Refresh sessions">
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-[#EEEEEE] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-fit px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-[#43A047] text-white shadow'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Session Cards */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500 font-medium">No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} sessions</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/myClass')}>
            Book a Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const start = new Date(booking.slot.startTime);
            const end = new Date(booking.slot.endTime);
            const holdExpiresAt = new Date(booking.createdAt).getTime() + HOLD_WINDOW_MS;
            const holdMsLeft = holdExpiresAt - nowMs;
            const holdActive = booking.status === 'pending' && holdMsLeft > 0;
            const holdExpired = booking.status === 'pending' && holdMsLeft <= 0;
            return (
              <div key={booking.id} className="card px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {booking.language.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{booking.language} Session</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[booking.status as TabStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} · {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}–{end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {booking.tutor?.profile?.displayName && (
                      <p className="text-xs text-gray-400 mt-0.5">Tutor: {booking.tutor.profile.displayName}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">₹{(booking.priceCents / 100).toFixed(0)}</p>
                    {holdActive && (
                      <p className="text-xs text-amber-700 mt-1 font-semibold">
                        Payment hold: {formatCountdown(holdMsLeft)} remaining
                      </p>
                    )}
                    {holdExpired && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">
                        Payment window expired. Rebook this slot.
                      </p>
                    )}
                    <SessionProgress status={booking.status} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {(booking.status === 'confirmed' || booking.status === 'in_session') && (
                    <button className="btn-primary" onClick={() => navigate('/session-room/' + booking.id)}>Join Session</button>
                  )}
                  {booking.status === 'completed' && (
                    <>
                      <button onClick={() => setReportBooking(booking)} className="btn-primary">Give Feedback</button>
                      {booking.session?.recordingUrl && (
                        <button
                          onClick={() => void handleDownloadRecording(booking)}
                          className="btn-outline"
                          disabled={downloadLoadingId === booking.id}
                        >
                          {downloadLoadingId === booking.id ? 'Preparing recording…' : '🎥 Download Recording'}
                        </button>
                      )}
                      <button onClick={() => handleDownloadNotes(booking)} className="btn-outline">📄 Session Notes</button>
                      <button onClick={() => setChatBooking(booking)} className="btn-outline">💬 Session Chat</button>
                    </>
                  )}
                  {(booking.status === 'pending' || booking.status === 'cancelled') && (
                    <>
                      {booking.status === 'pending' && holdActive && (
                        <button className="btn-primary" onClick={() => navigate('/checkout/' + booking.id)}>
                          Complete Payment
                        </button>
                      )}
                      <button className="btn-outline">Contact Support</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {reportBooking && (
        <SessionReportModal
          booking={reportBooking}
          onClose={() => setReportBooking(null)}
        />
      )}
      {chatBooking && (
        <SessionChatModal
          booking={chatBooking}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  );
}
