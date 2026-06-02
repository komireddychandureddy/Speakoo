import { useState } from 'react';
import { X } from 'lucide-react';
import type { Booking } from '../../core/network/bookingsApi';

interface Props {
  booking: Booking;
  onClose: () => void;
}

const FEEDBACK_CATEGORIES = [
  { key: 'pace', label: 'Pace Of Speech', max: 3 },
  { key: 'length', label: 'Length Of Answers', max: 3 },
  { key: 'vocabulary', label: 'Vocabulary Spectrum', max: 3 },
  { key: 'grammar', label: 'Communicative Grammar', max: 3 },
  { key: 'presentation', label: 'Presentation Skills', max: 3 },
  { key: 'nonVerbal', label: 'Non Verbal Skills', max: 3 },
  { key: 'enthusiasm', label: 'Enthusiasm Level', max: 3 },
  { key: 'pronunciation', label: 'Pronunciation', max: 3 },
];

export default function SessionReportModal({ booking, onClose }: Props) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(FEEDBACK_CATEGORIES.map((c) => [c.key, 0]))
  );
  const [submitted, setSubmitted] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxTotal = FEEDBACK_CATEGORIES.reduce((a, c) => a + c.max, 0);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <div>
            <h2 className="font-bold text-gray-900">Session Report</h2>
            <p className="text-xs text-gray-500">{booking.language} Session · {new Date(booking.slot.startTime).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#BBF7D0] flex items-center justify-center text-3xl mb-4">
              ✓
            </div>
            <p className="font-bold text-gray-900 text-lg">Feedback Submitted!</p>
            <p className="text-sm text-gray-500 mt-1">Total Score: {total}/{maxTotal}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="bg-[#FFFBE4] rounded-xl p-3 text-center">
                <p className="text-sm text-gray-700 font-medium">Total Score</p>
                <p className="text-3xl font-extrabold text-[#43A047]">{total}<span className="text-lg text-gray-400">/{maxTotal}</span></p>
              </div>

              {FEEDBACK_CATEGORIES.map((cat) => (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-800">{cat.label}</label>
                    <span className="text-sm font-bold text-[#43A047]">{scores[cat.key]}/{cat.max}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: cat.max }, (_, i) => i + 1).map((v) => (
                      <button
                        key={v}
                        onClick={() => setScores((prev) => ({ ...prev, [cat.key]: v }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                          scores[cat.key] >= v
                            ? 'bg-[#BBF7D0] border-[#14783D] text-[#14783D]'
                            : 'bg-white border-[#EEEEEE] text-gray-400 hover:border-[#43A047]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-[#EEEEEE]">
              <button onClick={handleSubmit} className="btn-primary w-full py-3">
                Submit Feedback
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
