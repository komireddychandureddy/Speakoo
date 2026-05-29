import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSIONS } from '../../data/mockData';
import type { Session } from '../../data/mockData';
import SessionReportModal from './SessionReportModal';
import SessionChatModal from './SessionChatModal';

type TabStatus = 'upcoming' | 'completed' | 'cancelled' | 'missed' | 'pending';
const TABS: { key: TabStatus; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'missed', label: 'Missed' },
  { key: 'pending', label: 'Pending' },
];

const STATUS_COLORS: Record<TabStatus, string> = {
  upcoming: 'bg-[#E6D7FF] text-[#43A047]',
  completed: 'bg-[#BBF7D0] text-[#14783D]',
  cancelled: 'bg-red-100 text-red-600',
  missed: 'bg-orange-100 text-orange-600',
  pending: 'bg-yellow-100 text-yellow-700',
};

export default function MySessionsPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>('upcoming');
  const navigate = useNavigate();
  const [reportSession, setReportSession] = useState<Session | null>(null);
  const [chatSession, setChatSession] = useState<Session | null>(null);

  const filtered = SESSIONS.filter((s) => s.status === activeTab);

  const handleDownloadNotes = (session: Session) => {
    const content = `Session Notes\n\nSession #${session.sessionNumber}\nTutor: ${session.tutorName}\nDate: ${session.date} at ${session.timeSlot}\nStatus: ${session.status}\n\nNotes:\n- Practiced conversation on daily topics\n- Worked on pronunciation of difficult words\n- Grammar focus: Past Perfect Tense\n- Vocabulary: 10 new words covered\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.sessionNumber}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl space-y-5">
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
          <p className="text-gray-500 font-medium">No {activeTab} sessions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((session) => (
            <div key={session.id} className="card px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {session.tutorAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">Session #{session.sessionNumber}</p>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[session.status as TabStatus]}`}
                    >
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                    {session.feedbackSubmitted && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#BBF7D0] text-[#14783D]">
                        Feedback Submitted ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{session.tutorName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{session.date} · {session.timeSlot}</p>

                  {session.status === 'completed' && session.score !== undefined && (
                    <p className="text-sm font-semibold text-[#14783D] mt-1">
                      Score: {session.score}/24
                    </p>
                  )}

                  {session.status === 'cancelled' && (
                    <p className="text-xs text-orange-600 mt-1">Session cancelled. Refund processed.</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {session.status === 'upcoming' && (
                  <button className="btn-primary" onClick={() => navigate('/session-room/' + session.id)}>Join Session</button>
                )}
                {session.status === 'completed' && (
                  <>
                    {!session.feedbackSubmitted && (
                      <button
                        onClick={() => setReportSession(session)}
                        className="btn-primary"
                      >
                        Give Feedback
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadNotes(session)}
                      className="btn-outline"
                    >
                      📄 Session Notes
                    </button>
                    <button
                      onClick={() => setChatSession(session)}
                      className="btn-outline"
                    >
                      💬 Session Chat
                    </button>
                    {session.hasRecording && (
                      <button className="btn-outline">▶ Recording</button>
                    )}
                  </>
                )}
                {(session.status === 'missed' || session.status === 'pending') && (
                  <button className="btn-outline">Contact Support</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {reportSession && (
        <SessionReportModal
          session={reportSession}
          onClose={() => setReportSession(null)}
        />
      )}
      {chatSession && (
        <SessionChatModal
          session={chatSession}
          onClose={() => setChatSession(null)}
        />
      )}
    </div>
  );
}
