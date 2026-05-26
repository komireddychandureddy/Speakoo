import { useState } from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';

const CATEGORIES = ['Verb Tenses', 'Prepositions', 'Pronouns', 'Conditionals'] as const;
type GrammarCategory = (typeof CATEGORIES)[number];

const DRILLS: Record<GrammarCategory, { s: string; opts: string[]; ans: number; exp: string }[]> = {
  'Verb Tenses': [
    { s: 'By next year, she ___ at this company for a decade.', opts: ['works', 'will have worked', 'has worked'], ans: 1, exp: 'Future Perfect: action completed before a future point.' },
    { s: 'He ___ his homework when she called.', opts: ['was doing', 'has done', 'did'], ans: 0, exp: 'Past Continuous: an ongoing action interrupted by another.' },
    { s: 'I ___ English since I was six years old.', opts: ['learn', 'have been learning', 'learned'], ans: 1, exp: 'Present Perfect Continuous: action started in the past, still ongoing.' },
  ],
  'Prepositions': [
    { s: 'She arrived ___ the airport just in time.', opts: ['to', 'at', 'in'], ans: 1, exp: '"at" is used for specific locations like airports, stations, and schools.' },
    { s: 'The meeting is scheduled ___ Monday morning.', opts: ['in', 'on', 'at'], ans: 1, exp: '"on" is used with days of the week.' },
    { s: 'He has been working ___ this project for months.', opts: ['at', 'with', 'on'], ans: 2, exp: '"work on" is the correct collocation for projects and tasks.' },
  ],
  'Pronouns': [
    { s: '___ is the person who called last night?', opts: ['Whom', 'Who', 'Whose'], ans: 1, exp: '"Who" is a subject pronoun — it is the subject of "called".' },
    { s: 'Give the package to ___ is responsible.', opts: ['whoever', 'whomever', "whoever's"], ans: 0, exp: '"Whoever" is the subject of "is responsible".' },
    { s: 'The results surprised both him and ___.', opts: ['I', 'me', 'myself'], ans: 1, exp: 'In objective position (after "and"), use the object pronoun "me".' },
  ],
  'Conditionals': [
    { s: 'If she ___ harder, she would pass the exam.', opts: ['studies', 'studied', 'had studied'], ans: 1, exp: 'Type 2 Conditional: hypothetical present/future situation.' },
    { s: 'If it ___ tomorrow, we will cancel the event.', opts: ['rains', 'rained', 'had rained'], ans: 0, exp: 'Type 1 Conditional: real or likely future condition.' },
    { s: 'If they ___ the map, they would not have gotten lost.', opts: ['bring', 'brought', 'had brought'], ans: 2, exp: 'Type 3 Conditional: hypothetical past situation.' },
  ],
};

export default function GrammarDrillExercise() {
  const [cat, setCat] = useState<GrammarCategory>('Verb Tenses');
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const qs = DRILLS[cat];
  const score = answers.filter((a, i) => a === qs[i].ans).length;

  const reset = () => { setAnswers([]); setSubmitted(false); };
  const changeCategory = (c: GrammarCategory) => { setCat(c); setAnswers([]); setSubmitted(false); };

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
