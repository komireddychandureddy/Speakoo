import { useEffect, useState } from 'react';
import { CheckCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { listPracticeExerciseContent } from '../../core/network/contentApi';

type VocabularyItem = { word: string; sentence: string; opts: string[]; ans: number };

export default function VocabularyTrainerExercise() {
  const [vocab, setVocab] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [known, setKnown] = useState<boolean[]>([]);

  useEffect(() => {
    listPracticeExerciseContent('vocabulary')
      .then((items) => {
        const payload = (items[0]?.payload ?? null) as
          | Array<{ word?: string; sentence?: string; opts?: string[]; ans?: number }>
          | null;

        if (Array.isArray(payload) && payload.length > 0) {
          const normalized = payload
            .filter(
              (item) =>
                item.word && item.sentence && Array.isArray(item.opts) && typeof item.ans === 'number',
            )
            .map((item) => ({
              word: item.word as string,
              sentence: item.sentence as string,
              opts: item.opts as string[],
              ans: item.ans as number,
            }));

          if (normalized.length > 0) {
            setVocab(normalized);
            setIndex(0);
            setChosen(null);
            setXp(0);
            setKnown([]);
          }
        }
      })
      .catch(() => {
        setVocab([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card p-4 text-sm text-[#616161]">Loading vocabulary exercise...</div>;
  }

  if (vocab.length === 0) {
    return <div className="card p-4 text-sm text-[#616161]">No vocabulary exercise content available.</div>;
  }

  const word = vocab[index];
  const submitted = chosen !== null;
  const isCorrect = chosen === word?.ans;
  const done = index >= vocab.length;

  const handleChoice = (i: number) => {
    if (submitted) return;
    setChosen(i);
    if (i === word.ans) setXp((x) => x + 15);
  };

  const next = (markKnown: boolean) => {
    setKnown([...known, markKnown]);
    setChosen(null);
    setIndex((i) => i + 1);
  };

  const reset = () => { setIndex(0); setChosen(null); setXp(0); setKnown([]); };

  if (done) {
    return (
      <div className="card p-8 text-center space-y-3">
        <CheckCircle size={32} className="text-[#43A047] mx-auto" />
        <p className="text-xl font-bold text-[#212121]">{known.filter(Boolean).length}/{vocab.length} words mastered!</p>
        <p className="text-sm text-[#616161]">You earned {xp} XP this session.</p>
        <button onClick={reset} className="inline-flex items-center gap-1 text-sm text-[#43A047] hover:underline">
          <RotateCcw size={13} /> Practice again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#616161]">Word {index + 1} of {vocab.length}</span>
        <span className="font-semibold text-[#43A047]">{xp} XP earned</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#43A047] rounded-full transition-all" style={{ width: `${(index / vocab.length) * 100}%` }} />
      </div>

      <div className="card p-6 text-center bg-gradient-to-br from-[#F8FBF0] to-white">
        <p className="text-3xl font-extrabold text-[#212121] mb-2">{word.word}</p>
        <p className="text-sm text-[#616161] italic">"{word.sentence}"</p>
        <p className="text-xs text-[#43A047] font-semibold mt-3">What does this word mean?</p>
      </div>

      <div className="grid gap-2">
        {word.opts.map((opt, i) => {
          const isChosen = chosen === i;
          const correct = submitted && i === word.ans;
          const wrong = submitted && isChosen && i !== word.ans;
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => handleChoice(i)}
              className={`text-left px-4 py-3 rounded-xl text-sm border transition-all ${
                correct ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                  : wrong ? 'border-red-400 bg-red-50 text-red-600'
                  : isChosen ? 'border-[#43A047] bg-[#E8F5E9]'
                  : 'border-gray-200 hover:border-[#43A047] hover:bg-[#F8FBF0]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`card p-3 text-sm font-medium ${isCorrect ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'}`}>
          {isCorrect ? '✓ Correct! +15 XP' : `✗ The correct answer is: "${word.opts[word.ans]}"`}
        </div>
      )}

      {submitted && (
        <div className="flex gap-3">
          <button
            onClick={() => next(false)}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-[#616161] hover:bg-gray-50 transition-colors"
          >
            🔁 Review later
          </button>
          <button
            onClick={() => next(true)}
            className="flex-1 py-2.5 rounded-xl bg-[#43A047] hover:bg-[#2E7D32] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1"
          >
            Got it! <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
