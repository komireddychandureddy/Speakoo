import { useState } from 'react';
import { CheckCircle, RotateCcw, ChevronRight } from 'lucide-react';

const VOCAB = [
  {
    word: 'Eloquent',
    sentence: 'The speaker gave an ___ speech that moved the entire audience.',
    opts: ['Angry and emotional', 'Fluent and persuasive in speaking', 'Short and unclear', 'Loud and aggressive'],
    ans: 1,
  },
  {
    word: 'Ambiguous',
    sentence: 'The contract clause was ___ and required legal clarification.',
    opts: ['Extremely clear', 'Having more than one possible meaning', 'Written in legal terms', 'Short and simple'],
    ans: 1,
  },
  {
    word: 'Meticulous',
    sentence: 'She was ___ in her research, checking every single source.',
    opts: ['Very lazy and careless', 'Easily distracted', 'Showing great attention to detail', 'Done very quickly'],
    ans: 2,
  },
  {
    word: 'Resilient',
    sentence: 'Despite many setbacks, the entrepreneur remained ___ and kept moving forward.',
    opts: ['Extremely stubborn', 'Able to recover quickly from difficulties', 'Easily discouraged', 'Very cautious'],
    ans: 1,
  },
  {
    word: 'Pragmatic',
    sentence: 'He took a ___ approach and focused on what would actually work.',
    opts: ['Idealistic and dreamy', 'Dealing with things sensibly and realistically', 'Based on theory only', 'Overly emotional'],
    ans: 1,
  },
  {
    word: 'Verbose',
    sentence: 'His ___ writing style made the report much longer than necessary.',
    opts: ['Very clear and concise', 'Using more words than needed', 'Written in a foreign language', 'Extremely technical'],
    ans: 1,
  },
];

export default function VocabularyTrainerExercise() {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [known, setKnown] = useState<boolean[]>([]);

  const word = VOCAB[index];
  const submitted = chosen !== null;
  const isCorrect = chosen === word?.ans;
  const done = index >= VOCAB.length;

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
        <p className="text-xl font-bold text-[#212121]">{known.filter(Boolean).length}/{VOCAB.length} words mastered!</p>
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
        <span className="text-[#616161]">Word {index + 1} of {VOCAB.length}</span>
        <span className="font-semibold text-[#43A047]">{xp} XP earned</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#43A047] rounded-full transition-all" style={{ width: `${(index / VOCAB.length) * 100}%` }} />
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
