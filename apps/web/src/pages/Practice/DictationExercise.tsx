import { useEffect, useState } from 'react';
import { Volume2, CheckCircle, RotateCcw } from 'lucide-react';
import { listPracticeExerciseContent } from '../../core/network/contentApi';

type DictationItem = { text: string; level: string };

function speak(text: string, rate: number) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

export default function DictationExercise() {
  const [items, setItems] = useState<DictationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    listPracticeExerciseContent('dictation')
      .then((entries) => {
        const payload = (entries[0]?.payload ?? null) as Array<{ text?: string; level?: string }> | null;
        if (!Array.isArray(payload) || payload.length === 0) return;
        const normalized = payload
          .filter((item) => item.text && item.level)
          .map((item) => ({ text: item.text as string, level: item.level as string }));
        if (normalized.length > 0) {
          setItems(normalized);
          setIndex(0);
          setTyped('');
          setSubmitted(false);
          setScore(0);
          setSlow(false);
        }
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card p-4 text-sm text-[#616161]">Loading dictation exercise...</div>;
  }

  if (items.length === 0) {
    return <div className="card p-4 text-sm text-[#616161]">No dictation content available.</div>;
  }

  const item = items[index];
  const isCorrect = normalize(typed) === normalize(item.text);
  const done = submitted && index === items.length - 1;

  const handleSubmit = () => {
    if (isCorrect) setScore((s) => s + 10);
    setSubmitted(true);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setTyped('');
    setSubmitted(false);
    setSlow(false);
  };

  const reset = () => { setIndex(0); setTyped(''); setSubmitted(false); setScore(0); setSlow(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#616161]">
          Item {index + 1} of {items.length}
          <span className="ml-2 text-xs font-semibold text-[#43A047] bg-[#E8F5E9] px-1.5 py-0.5 rounded-full">{item.level}</span>
        </p>
        <span className="text-xs font-semibold text-[#43A047]">{score} XP</span>
      </div>

      <div className="card p-6 text-center space-y-4">
        <p className="text-sm text-[#616161]">Listen carefully and type exactly what you hear.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => speak(item.text, slow ? 0.65 : 0.85)}
            className="inline-flex items-center gap-2 bg-[#43A047] hover:bg-[#2E7D32] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
          >
            <Volume2 size={16} /> Play
          </button>
          <button
            onClick={() => setSlow(!slow)}
            className={`text-sm px-4 py-2.5 rounded-xl border transition-all font-semibold ${
              slow ? 'border-[#43A047] bg-[#E8F5E9] text-[#2E7D32]' : 'border-gray-200 text-[#616161] hover:border-[#43A047]'
            }`}
          >
            {slow ? '🐢 Slow' : '🐇 Normal'}
          </button>
        </div>
      </div>

      <textarea
        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#43A047] resize-none"
        rows={3}
        placeholder="Type what you hear…"
        value={typed}
        onChange={(e) => !submitted && setTyped(e.target.value)}
        disabled={submitted}
      />

      {!submitted ? (
        <button
          disabled={typed.trim().length === 0}
          onClick={handleSubmit}
          className="btn-primary w-full py-2.5 disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <div className={`card p-4 ${isCorrect ? 'bg-[#E8F5E9]' : 'bg-[#FFF3E0]'}`}>
          {isCorrect ? (
            <p className="text-sm font-semibold text-[#2E7D32] flex items-center gap-2">
              <CheckCircle size={16} /> Perfect! +10 XP
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#E65100] mb-1">Not quite. The correct sentence was:</p>
              <p className="text-sm text-[#212121] italic">"{item.text}"</p>
            </>
          )}
        </div>
      )}

      {submitted && !done && (
        <button onClick={next} className="btn-primary w-full py-2.5">
          Next →
        </button>
      )}

      {done && (
        <div className="card p-4 text-center bg-[#E8F5E9]">
          <p className="font-bold text-lg text-[#2E7D32]">Session complete! You earned {score} XP</p>
          <button onClick={reset} className="mt-2 inline-flex items-center gap-1 mx-auto text-sm text-[#43A047] hover:underline">
            <RotateCcw size={13} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}
