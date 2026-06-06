import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, CheckCircle, RefreshCw } from 'lucide-react';
import {
  listPracticeExerciseContent,
  listPracticeReadings,
  type PracticeReadingPassage,
} from '../../core/network/contentApi';
import VocabularyTrainerExercise from './VocabularyTrainerExercise';
import GrammarDrillExercise from './GrammarDrillExercise';
import DictationExercise from './DictationExercise';

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

function ReadingExercise() {
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [reading, setReading] = useState<PracticeReadingPassage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listPracticeReadings(level)
      .then((items) => {
        setReading(items[0] ?? null);
      })
      .finally(() => setLoading(false));
  }, [level]);

  const data = reading;
  const questions = data?.questions ?? [];
  const score = answers.filter((a, i) => a === questions[i]?.ans).length;

  const changeLevel = async (l: CEFRLevel) => {
    setLevel(l);
    setAnswers([]);
    setSubmitted(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CEFR_LEVELS.map((l) => (
          <button key={l} onClick={() => void changeLevel(l)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${level === l ? 'bg-[#43A047] text-white border-[#43A047]' : 'border-gray-300 text-[#616161] hover:border-[#43A047]'}`}>
            {l}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="card p-4 text-sm text-[#616161]">Loading reading passage...</div>
      ) : !data ? (
        <div className="card p-4 text-sm text-[#616161]">No reading passage found for this CEFR level yet.</div>
      ) : (
        <>
      <p className="text-xs font-semibold text-[#616161]">{data.title}</p>
      <div className="bg-[#F8FBF0] border border-[#C8E6C9] rounded-xl p-4 text-sm text-[#212121] leading-relaxed">{data.passage}</div>
      {questions.map((q, qi) => (
        <div key={`${level}-${qi}`} className="card p-4">
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
        <button disabled={answers.length < questions.length} onClick={() => setSubmitted(true)} className="btn-primary w-full py-2.5 disabled:opacity-40">Submit Answers</button>
      ) : (
        <div className="card p-4 text-center bg-[#E8F5E9]">
          <CheckCircle size={24} className="text-[#43A047] mx-auto mb-1" />
          <p className="font-bold text-lg text-[#2E7D32]">{score}/{questions.length} Correct!</p>
          <p className="text-sm text-[#616161]">You earned {score * 10} XP</p>
        </div>
      )}
      </>
      )}
    </div>
  );
}

function ListeningExercise() {
  const [listenText, setListenText] = useState('');
  const [opts, setOpts] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    listPracticeExerciseContent('listening')
      .then((items) => {
        const payload = (items[0]?.payload ?? null) as
          | { transcript?: string; options?: string[]; answerIndex?: number }
          | null;
        setListenText(payload?.transcript ?? '');
        setOpts(payload?.options ?? []);
        setCorrectIndex(typeof payload?.answerIndex === 'number' ? payload.answerIndex : 0);
      })
      .catch(() => {
        setListenText('');
        setOpts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card p-4 text-sm text-[#616161]">Loading listening exercise...</div>;
  }

  if (!listenText || opts.length === 0) {
    return <div className="card p-4 text-sm text-[#616161]">No listening exercise content available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <p className="text-sm text-[#616161] mb-4">Press play to hear the audio, then answer the question below.</p>
        <button onClick={() => speak(listenText)} className="inline-flex items-center gap-2 bg-[#43A047] hover:bg-[#2E7D32] text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          <Volume2 size={18} /> Play Audio
        </button>
        <button onClick={() => setRevealed(!revealed)} className="block mx-auto mt-3 text-xs text-[#43A047] underline">
          {revealed ? 'Hide' : 'Show'} Transcript
        </button>
        {revealed && <p className="mt-3 text-sm text-[#212121] bg-[#F8FBF0] rounded-lg p-3 text-left">{listenText}</p>}
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
        {chosen === correctIndex && <p className="mt-3 text-sm text-green-700 font-semibold flex items-center gap-1"><CheckCircle size={14} /> Correct! +10 XP</p>}
        {chosen !== null && chosen !== correctIndex && <p className="mt-3 text-sm text-red-600">Not quite — try listening again.</p>}
      </div>
    </div>
  );
}

function PhoneticsDrill() {
  const [phonetics, setPhonetics] = useState<Array<{ ipa: string; word: string; eg: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPracticeExerciseContent('phonetics')
      .then((items) => {
        const payload = (items[0]?.payload ?? null) as
          | Array<{ ipa?: string; word?: string; eg?: string }>
          | null;
        if (Array.isArray(payload) && payload.length > 0) {
          const normalized = payload
            .filter((item) => item.ipa && item.word)
            .map((item) => ({ ipa: item.ipa as string, word: item.word as string, eg: item.eg ?? '' }));
          setPhonetics(normalized);
        }
      })
      .catch(() => {
        setPhonetics([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card p-4 text-sm text-[#616161]">Loading phonetics drill...</div>;
  }

  if (phonetics.length === 0) {
    return <div className="card p-4 text-sm text-[#616161]">No phonetics content available.</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#616161]">Tap a phoneme card to hear it. Practice by repeating each sound aloud.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {phonetics.map((p) => (
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
  const [puzzleWords, setPuzzleWords] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [bank, setBank] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const done = selected.join(' ') === answer;

  useEffect(() => {
    listPracticeExerciseContent('word-puzzle')
      .then((items) => {
        const payload = (items[0]?.payload ?? null) as
          | { words?: string[]; answer?: string }
          | null;
        const words = payload?.words ?? [];
        if (words.length > 0) {
          setPuzzleWords(words);
          setBank([...words].sort(() => Math.random() - 0.5));
        }
        if (payload?.answer) setAnswer(payload.answer);
      })
      .catch(() => {
        setPuzzleWords([]);
        setBank([]);
        setAnswer('');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card p-4 text-sm text-[#616161]">Loading word puzzle...</div>;
  }

  if (puzzleWords.length === 0 || !answer) {
    return <div className="card p-4 text-sm text-[#616161]">No word puzzle content available.</div>;
  }

  const addWord = (i: number) => {
    setSelected([...selected, bank[i]]);
    setBank(bank.filter((_, idx) => idx !== i));
  };
  const removeWord = (i: number) => {
    setBank([...bank, selected[i]]);
    setSelected(selected.filter((_, idx) => idx !== i));
  };
  const reset = () => { setSelected([]); setBank([...puzzleWords].sort(() => Math.random() - 0.5)); };

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
  const [fill, setFill] = useState<Array<{ s: string; opts: string[]; ans: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    listPracticeExerciseContent('sentence')
      .then((items) => {
        const payload = (items[0]?.payload ?? null) as
          | Array<{ s?: string; opts?: string[]; ans?: number }>
          | null;
        if (Array.isArray(payload) && payload.length > 0) {
          const normalized = payload
            .filter((q) => q.s && Array.isArray(q.opts) && typeof q.ans === 'number')
            .map((q) => ({ s: q.s as string, opts: q.opts as string[], ans: q.ans as number }));
          setFill(normalized);
        }
      })
      .catch(() => {
        setFill([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const score = answers.filter((a, i) => a === fill[i].ans).length;

  if (loading) {
    return <div className="card p-4 text-sm text-[#616161]">Loading sentence exercise...</div>;
  }

  if (fill.length === 0) {
    return <div className="card p-4 text-sm text-[#616161]">No sentence exercise content available.</div>;
  }
  return (
    <div className="space-y-4">
      {fill.map((q, qi) => (
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
        <button disabled={answers.length < fill.length} onClick={() => setSubmitted(true)} className="btn-primary w-full py-2.5 disabled:opacity-40">Submit</button>
      ) : (
        <div className="card p-4 text-center bg-[#E8F5E9]">
          <p className="font-bold text-lg text-[#2E7D32]">{score}/{fill.length} Correct! +{score * 15} XP</p>
        </div>
      )}
    </div>
  );
}

const MODE_MAP: Record<string, { label: string; el: JSX.Element }> = {
  reading:    { label: 'Reading Comprehension', el: <ReadingExercise /> },
  listening:  { label: 'Listening Exercise',    el: <ListeningExercise /> },
  phonetics:  { label: 'Phonetics Drill',       el: <PhoneticsDrill /> },
  'word-puzzle': { label: 'Word Puzzle',        el: <WordPuzzle /> },
  sentence:   { label: 'Fill in the Blank',     el: <FillBlank /> },
  vocabulary: { label: 'Vocabulary Trainer',    el: <VocabularyTrainerExercise /> },
  grammar:    { label: 'Grammar Drills',        el: <GrammarDrillExercise /> },
  dictation:  { label: 'Dictation',             el: <DictationExercise /> },
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
