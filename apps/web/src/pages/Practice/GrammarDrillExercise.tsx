import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { listPracticeExerciseContent } from '../../core/network/contentApi';

const CATEGORIES = ['Verb Tenses', 'Prepositions', 'Pronouns', 'Conditionals'] as const;
type GrammarCategory = (typeof CATEGORIES)[number];

type DrillQuestion = { s: string; opts: string[]; ans: number; exp: string };
type DrillMap = Record<GrammarCategory, DrillQuestion[]>;

const EMPTY_DRILLS: DrillMap = {
  'Verb Tenses': [],
  Prepositions: [],
  Pronouns: [],
  Conditionals: [],
};

export default function GrammarDrillExercise() {
  const [drills, setDrills] = useState(EMPTY_DRILLS);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<GrammarCategory>('Verb Tenses');
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    listPracticeExerciseContent('grammar')
      .then((items) => {
        const payload = (items[0]?.payload ?? null) as
          | Partial<Record<GrammarCategory, Array<{ s?: string; opts?: string[]; ans?: number; exp?: string }>>>
          | null;

        if (!payload || typeof payload !== 'object') return;

        const next: DrillMap = { ...EMPTY_DRILLS };
        for (const category of CATEGORIES) {
          const list = payload[category];
          if (!Array.isArray(list)) continue;
          const normalized = list
            .filter(
              (item) => item.s && Array.isArray(item.opts) && typeof item.ans === 'number' && item.exp,
            )
            .map((item) => ({
              s: item.s as string,
              opts: item.opts as string[],
              ans: item.ans as number,
              exp: item.exp as string,
            }));

          if (normalized.length > 0) {
            next[category] = normalized;
          }
        }

        setDrills(next);
        setAnswers([]);
        setSubmitted(false);
      })
      .catch(() => {
        setDrills(EMPTY_DRILLS);
      })
      .finally(() => setLoading(false));
  }, []);

  const qs = useMemo(() => drills[cat], [drills, cat]);
  const score = answers.filter((a, i) => a === qs[i].ans).length;

  const reset = () => { setAnswers([]); setSubmitted(false); };
  const changeCategory = (c: GrammarCategory) => { setCat(c); setAnswers([]); setSubmitted(false); };

  if (loading) {
    return <div className="card p-4 text-sm text-[#616161]">Loading grammar drills...</div>;
  }

  if (qs.length === 0) {
    return <div className="card p-4 text-sm text-[#616161]">No grammar drills available for this category.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => changeCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              cat === c ? 'bg-[#43A047] text-white border-[#43A047]' : 'border-gray-300 text-[#616161] hover:border-[#43A047]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {qs.map((q, qi) => (
        <div key={`${cat}-${qi}`} className="card p-4">
          <p className="font-semibold text-sm mb-3">{qi + 1}. {q.s}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {q.opts.map((o, oi) => {
              const isChosen = answers[qi] === oi;
              const correct = submitted && oi === q.ans;
              const wrong = submitted && isChosen && oi !== q.ans;
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    correct ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : wrong ? 'border-red-400 bg-red-50 text-red-600'
                      : isChosen ? 'border-[#43A047] bg-[#E8F5E9]'
                      : 'border-gray-200 hover:border-[#43A047]'
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {submitted && (
            <p className={`text-xs mt-1 ${answers[qi] === q.ans ? 'text-green-700' : 'text-[#E65100]'}`}>
              {answers[qi] === q.ans ? '✓ Correct — ' : `✗ Answer: "${q.opts[q.ans]}" — `}
              {q.exp}
            </p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          disabled={answers.length < qs.length}
          onClick={() => setSubmitted(true)}
          className="btn-primary w-full py-2.5 disabled:opacity-40"
        >
          Submit Answers
        </button>
      ) : (
        <div className="card p-4 text-center bg-[#E8F5E9]">
          <CheckCircle size={24} className="text-[#43A047] mx-auto mb-1" />
          <p className="font-bold text-lg text-[#2E7D32]">{score}/{qs.length} Correct! +{score * 15} XP</p>
          <button onClick={reset} className="mt-2 inline-flex items-center gap-1 text-sm text-[#43A047] hover:underline">
            <RotateCcw size={13} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}
