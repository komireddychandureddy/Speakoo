import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, CheckCircle, RefreshCw } from 'lucide-react';

const READING_DATA = {
  passage: 'Remote work has transformed the modern workplace. Since 2020, millions of professionals found that working from home can be as productive as office work — sometimes more so. Companies are rethinking space requirements while employees save on commuting costs and gain back personal time.',
  questions: [
    { q: 'What has transformed the modern workplace?', opts: ['Social media', 'Remote work', 'Automation'], ans: 1 },
    { q: 'Since when did this shift accelerate?', opts: ['2015', '2020', '2023'], ans: 1 },
    { q: 'What benefit do employees enjoy?', opts: ['Higher salaries', 'Saved commuting time', 'Bigger offices'], ans: 1 },
  ],
};

const PHONETICS = [
  { ipa: '/iː/', word: 'see', eg: 'tree, feel' },    { ipa: '/ɪ/', word: 'sit', eg: 'big, hit' },
  { ipa: '/e/', word: 'ten', eg: 'bed, red' },        { ipa: '/æ/', word: 'cat', eg: 'hat, map' },
  { ipa: '/ɑː/', word: 'car', eg: 'far, dark' },      { ipa: '/ʌ/', word: 'cup', eg: 'bus, run' },
  { ipa: '/ɜː/', word: 'bird', eg: 'her, word' },     { ipa: '/ɔː/', word: 'saw', eg: 'four, door' },
];

const PUZZLE_WORDS = ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
const PUZZLE_ANS = 'The quick brown fox jumps over the lazy dog';

const FILL = [
  { s: 'She ___ to school every day.',       opts: ['go', 'goes', 'going'],    ans: 1 },
  { s: 'They ___ playing football right now.', opts: ['is', 'are', 'was'],     ans: 1 },
  { s: 'He has already ___ his homework.',   opts: ['finish', 'finishes', 'finished'], ans: 2 },
];

const LISTEN_TEXT = 'Good morning! I would like to order a large coffee with a little milk and no sugar, please.';

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

function ReadingExercise() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const score = answers.filter((a, i) => a === READING_DATA.questions[i].ans).length;
  return (
    <div className="space-y-4">
      <div className="bg-[#F8FBF0] border border-[#C8E6C9] rounded-xl p-4 text-sm text-[#212121] leading-relaxed">{READING_DATA.passage}</div>
      {READING_DATA.questions.map((q, qi) => (
        <div key={qi} className="card p-4">
          <p className="font-semibold text-sm mb-3">{qi + 1}. {q.q}</p>
          <div className="grid gap-2">
            {q.opts.map((o, oi) => {
              const chosen = answers[qi] === oi;
              const correct = submitted && oi === q.ans;
              const wrong = submitted && chosen && oi !== q.ans;
              return (
                <button key={oi} disabled={submitted} onClick={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${correct ? 'border-green-500 bg-green-50 text-green-700 font-semibold' : wrong ? 'border-red-400 bg-red-50 text-red-700' : chosen ? 'border-[#43A047] bg-[#E8F5E9]' : 'border-gray-200 hover:border-[#43A047]'}`}>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button disabled={answers.length < READING_DATA.questions.length} onClick={() => setSubmitted(true)} className="btn-primary w-full py-2.5 disabled:opacity-40">Submit Answers</button>
      ) : (
        <div className="card p-4 text-center bg-[#E8F5E9]">
          <CheckCircle size={24} className="text-[#43A047] mx-auto mb-1" />
          <p className="font-bold text-lg text-[#2E7D32]">{score}/{READING_DATA.questions.length} Correct!</p>
          <p className="text-sm text-[#616161]">You earned {score * 10} XP</p>
        </div>
      )}
    </div>
  );
}

function ListeningExercise() {
  const [revealed, setRevealed] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const opts = ['Tea without milk', 'Large coffee with milk', 'Small black coffee'];
  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <p className="text-sm text-[#616161] mb-4">Press play to hear the audio, then answer the question below.</p>
        <button onClick={() => speak(LISTEN_TEXT)} className="inline-flex items-center gap-2 bg-[#43A047] hover:bg-[#2E7D32] text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          <Volume2 size={18} /> Play Audio
        </button>
        <button onClick={() => setRevealed(!revealed)} className="block mx-auto mt-3 text-xs text-[#43A047] underline">
          {revealed ? 'Hide' : 'Show'} Transcript
        </button>
        {revealed && <p className="mt-3 text-sm text-[#212121] bg-[#F8FBF0] rounded-lg p-3 text-left">{LISTEN_TEXT}</p>}
      </div>
      <div className="card p-4">
        <p className="font-semibold text-sm mb-3">What did the person order?</p>
        <div className="grid gap-2">
          {opts.map((o, i) => (
            <button key={i} onClick={() => setChosen(i)}
              className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${chosen === i ? 'border-[#43A047] bg-[#E8F5E9] font-semibold' : 'border-gray-200 hover:border-[#43A047]'}`}>
              {o}
            </button>
          ))}
        </div>
        {chosen === 1 && <p className="mt-3 text-sm text-green-700 font-semibold flex items-center gap-1"><CheckCircle size={14} /> Correct! +10 XP</p>}
        {chosen !== null && chosen !== 1 && <p className="mt-3 text-sm text-red-600">Not quite — try listening again.</p>}
      </div>
    </div>
  );
}

function PhoneticsDrill() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#616161]">Tap a phoneme card to hear it. Practice by repeating each sound aloud.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PHONETICS.map((p) => (
          <button key={p.ipa} onClick={() => speak(`${p.word}. ${p.word}.`)}
            className="card p-3 hover:border-[#43A047] hover:shadow-md transition-all text-center group">
            <span className="block text-2xl font-mono font-bold text-[#43A047]">{p.ipa}</span>
            <span className="block text-sm font-semibold text-[#212121] mt-1">{p.word}</span>
            <span className="block text-xs text-[#616161]">{p.eg}</span>
            <Volume2 size={11} className="mx-auto mt-1 text-[#C8E6C9]" />
          </button>
        ))}
      </div>
      <p className="text-xs text-[#616161]">💡 Tip: Use headphones and slow down the sound in your mind before speaking.</p>
    </div>
  );
}

function WordPuzzle() {
  const [bank, setBank] = useState(() => [...PUZZLE_WORDS].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState<string[]>([]);
  const done = selected.join(' ') === PUZZLE_ANS;

  const addWord = (i: number) => {
    setSelected([...selected, bank[i]]);
    setBank(bank.filter((_, idx) => idx !== i));
  };
  const removeWord = (i: number) => {
    setBank([...bank, selected[i]]);
    setSelected(selected.filter((_, idx) => idx !== i));
  };
  const reset = () => { setSelected([]); setBank([...PUZZLE_WORDS].sort(() => Math.random() - 0.5)); };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#616161]">Tap words to build the correct sentence in order.</p>
      <div className="min-h-14 bg-[#F8FBF0] border-2 border-dashed border-[#C8E6C9] rounded-xl p-3 flex flex-wrap gap-2">
        {selected.map((w, i) => (
          <button key={i} onClick={() => removeWord(i)} className="px-2.5 py-1 bg-[#43A047] text-white rounded-lg text-sm font-medium hover:bg-[#2E7D32]">{w}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((w, i) => (
          <button key={i} onClick={() => addWord(i)} className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-[#E8F5E9] hover:border-[#43A047]">{w}</button>
        ))}
      </div>
      {done && (
        <div className="card p-3 text-center bg-[#E8F5E9]">
          <CheckCircle size={20} className="text-[#43A047] mx-auto mb-1" />
          <p className="font-bold text-[#2E7D32]">Perfect sentence! +20 XP</p>
        </div>
      )}
      <button onClick={reset} className="flex items-center gap-2 text-sm text-[#616161] hover:text-[#43A047]"><RefreshCw size={14} /> Reset puzzle</button>
    </div>
  );
}

function FillBlank() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const score = answers.filter((a, i) => a === FILL[i].ans).length;
  return (
    <div className="space-y-4">
      {FILL.map((q, qi) => (
        <div key={qi} className="card p-4">
          <p className="font-semibold text-sm mb-3">{q.s}</p>
          <div className="flex flex-wrap gap-2">
            {q.opts.map((o, oi) => {
              const chosen = answers[qi] === oi;
              const correct = submitted && oi === q.ans;
              const wrong = submitted && chosen && oi !== q.ans;
              return (
                <button key={oi} disabled={submitted} onClick={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${correct ? 'border-green-500 bg-green-50 text-green-700 font-semibold' : wrong ? 'border-red-400 bg-red-50 text-red-600' : chosen ? 'border-[#43A047] bg-[#E8F5E9]' : 'border-gray-200 hover:border-[#43A047]'}`}>{o}</button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button disabled={answers.length < FILL.length} onClick={() => setSubmitted(true)} className="btn-primary w-full py-2.5 disabled:opacity-40">Submit</button>
      ) : (
        <div className="card p-4 text-center bg-[#E8F5E9]">
          <p className="font-bold text-lg text-[#2E7D32]">{score}/{FILL.length} Correct! +{score * 15} XP</p>
        </div>
      )}
    </div>
  );
}

const MODE_MAP: Record<string, { label: string; el: JSX.Element }> = {
  reading:      { label: 'Reading Comprehension', el: <ReadingExercise /> },
  listening:    { label: 'Listening Exercise',    el: <ListeningExercise /> },
  phonetics:    { label: 'Phonetics Drill',        el: <PhoneticsDrill /> },
  'word-puzzle':{ label: 'Word Puzzle',            el: <WordPuzzle /> },
  sentence:     { label: 'Fill in the Blank',      el: <FillBlank /> },
};

export default function PracticeExercisePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get('mode') ?? 'reading';
  const current = MODE_MAP[mode];

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/practice')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-[#212121]">{current?.label ?? 'Exercise'}</h1>
          <p className="text-xs text-[#616161]">Complete to earn XP</p>
        </div>
      </div>

      {mode === 'speaking' ? (
        <div className="card p-8 text-center space-y-3">
          <p className="text-3xl">🎙️</p>
          <p className="font-semibold text-[#212121]">Speaking practice is done via live group sessions.</p>
          <p className="text-sm text-[#616161]">Join a scheduled group session with other learners and a host facilitator.</p>
          <button onClick={() => navigate('/practice')} className="btn-primary px-6 py-2 text-sm">Browse Group Sessions</button>
        </div>
      ) : current ? current.el : (
        <p className="text-[#616161]">Exercise type not found.</p>
      )}
    </div>
  );
}
