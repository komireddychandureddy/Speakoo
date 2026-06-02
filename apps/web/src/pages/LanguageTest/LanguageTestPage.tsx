import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface Question { id: number; prompt: string; options: string[]; correct: number; }

const QUESTIONS: Question[] = [
  { id: 1, prompt: 'Which sentence is grammatically correct?', options: ['She don\'t like coffee.', 'She doesn\'t like coffee.', 'She not like coffee.', 'She no like coffee.'], correct: 1 },
  { id: 2, prompt: 'What is the past tense of "go"?', options: ['goed', 'gone', 'went', 'going'], correct: 2 },
  { id: 3, prompt: 'Choose the correct preposition: "I am interested ___ learning French."', options: ['at', 'on', 'in', 'for'], correct: 2 },
  { id: 4, prompt: '"The book was written ___ Shakespeare." — Fill in the blank.', options: ['from', 'by', 'with', 'of'], correct: 1 },
  { id: 5, prompt: 'Which word means "to make something better"?', options: ['deteriorate', 'maintain', 'improve', 'ignore'], correct: 2 },
  { id: 6, prompt: 'Identify the synonym of "eloquent".', options: ['silent', 'articulate', 'confused', 'dull'], correct: 1 },
  { id: 7, prompt: 'Choose the sentence in the Present Perfect tense.', options: ['I ate breakfast.', 'I eat breakfast.', 'I have eaten breakfast.', 'I was eating breakfast.'], correct: 2 },
];

const LEVELS: { label: string; min: number; colour: string }[] = [
  { label: 'A1 – Beginner', min: 0, colour: '#EF4444' },
  { label: 'A2 – Elementary', min: 2, colour: '#F97316' },
  { label: 'B1 – Intermediate', min: 3, colour: '#EAB308' },
  { label: 'B2 – Upper Intermediate', min: 5, colour: '#22C55E' },
  { label: 'C1 – Advanced', min: 6, colour: '#3B82F6' },
  { label: 'C2 – Proficient', min: 7, colour: '#8B5CF6' },
];

function getLevel(score: number) {
  return [...LEVELS].reverse().find((l) => score >= l.min) ?? LEVELS[0];
}

export default function LanguageTestPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[current];
  const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const level = getLevel(score);

  const handleOption = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const updated = [...answers];
    updated[current] = idx;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="max-w-md mx-auto mt-8 card px-8 py-10 flex flex-col items-center text-center space-y-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black" style={{ background: level.colour }}>
          {level.label.split(' – ')[0]}
        </div>
        <h2 className="text-2xl font-black text-gray-900">{level.label}</h2>
        <p className="text-gray-500 text-sm">You answered <span className="font-bold text-gray-800">{score} out of {QUESTIONS.length}</span> questions correctly.</p>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(score / QUESTIONS.length) * 100}%`, background: level.colour }} />
        </div>
        <p className="text-xs text-gray-400 italic">This is an indicative assessment. Book a session with a tutor for an official evaluation.</p>
        <div className="flex gap-3 mt-2">
          <button onClick={handleRetake} className="px-5 py-2 rounded-lg border border-[#43A047] text-[#43A047] text-sm font-semibold hover:bg-[#F0F9F0] transition-colors">Retake Test</button>
          <a href="/allTutors" className="btn-primary text-sm">Find a Tutor</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-[#43A047] rounded-full transition-all" style={{ width: `${((current) / QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{current + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Question Card */}
      <div className="card px-6 py-7 space-y-5">
        <p className="font-bold text-gray-900 text-base leading-relaxed">{q.prompt}</p>
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ';
            if (selected === null) {
              cls += 'border-[#EEEEEE] bg-white hover:border-[#43A047] hover:bg-[#F0F9F0] cursor-pointer';
            } else if (idx === q.correct) {
              cls += 'border-green-400 bg-green-50 text-green-800 cursor-default';
            } else if (idx === selected) {
              cls += 'border-red-300 bg-red-50 text-red-700 cursor-default';
            } else {
              cls += 'border-[#EEEEEE] bg-white opacity-50 cursor-default';
            }
            return (
              <button key={idx} onClick={() => handleOption(idx)} className={cls}>
                <span className="flex items-center gap-3">
                  {selected !== null && idx === q.correct && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                  {selected !== null && idx === selected && idx !== q.correct && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                  {(selected === null || (idx !== q.correct && idx !== selected)) && <span className="w-4" />}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button onClick={handleNext} className="btn-primary w-full mt-2">
            {current < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Level'}
          </button>
        )}
      </div>
    </div>
  );
}
