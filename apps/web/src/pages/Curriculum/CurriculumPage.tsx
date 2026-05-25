import { useState } from 'react';
import { CURRICULUM_NOTES } from '../../data/mockData';

const FEATURE_CARDS = [
  {
    color: '#E6D7FF',
    icon: '📝',
    title: 'Session Notes',
    desc: 'Access detailed notes from every session with your tutor.',
  },
  {
    color: '#BBF7D0',
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Track your improvement over time with session scores.',
  },
  {
    color: '#FFF8C8',
    icon: '🎯',
    title: 'Personalised Goals',
    desc: 'Set and monitor your language learning milestones.',
  },
];

const NOTES_PER_PAGE = 6;

export default function CurriculumPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(CURRICULUM_NOTES.length / NOTES_PER_PAGE);
  const paginatedNotes = CURRICULUM_NOTES.slice(
    (page - 1) * NOTES_PER_PAGE,
    page * NOTES_PER_PAGE
  );

  const handleDownload = (noteId: string, topic: string) => {
    const content = `Session Notes\n\nTopic: ${topic}\n\n[PDF content would be here]\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note-${noteId}-${topic.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-5 shadow-sm border border-[#EEEEEE]"
            style={{ backgroundColor: card.color }}
          >
            <span className="text-3xl">{card.icon}</span>
            <h3 className="font-bold text-gray-900 mt-2">{card.title}</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Session Notes Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Session Notes</h3>
          <p className="text-xs text-gray-400">{CURRICULUM_NOTES.length} sessions total</p>
        </div>
        <div className="space-y-3">
          {paginatedNotes.map((note) => (
            <div key={note.id} className="card px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <span className="text-[#43A047] font-bold text-sm">#{note.sessionNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{note.topic}</p>
                <p className="text-xs text-gray-400 mt-0.5">{note.date}</p>
              </div>
              <button
                onClick={() => handleDownload(note.id, note.topic)}
                className="btn-outline flex-shrink-0 text-xs"
              >
                ⬇ PDF
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                  page === p ? 'bg-[#43A047] text-white' : 'bg-white border border-[#EEEEEE] text-gray-600 hover:border-[#43A047]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
