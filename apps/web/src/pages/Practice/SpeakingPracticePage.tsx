import { useNavigate } from 'react-router-dom';
import {
  Mic, BookOpen, Headphones, Volume2, Puzzle, AlignLeft,
  Users, Clock, Gem, CheckCircle, Video, Library, GraduationCap, Mic2,
} from 'lucide-react';
import { PRACTICE_SESSIONS, type CEFRLevel } from '../../data/mockData';

const EXERCISE_TYPES = [
  { type: 'speaking',    icon: Mic,           label: 'Speaking',        desc: 'Live group calls',            color: '#43A047', bg: '#E8F5E9' },
  { type: 'reading',     icon: BookOpen,      label: 'Reading',         desc: 'Levelled texts A1–C1',        color: '#1565C0', bg: '#E3F2FD' },
  { type: 'listening',   icon: Headphones,    label: 'Listening',       desc: 'Audio drills & exercises',    color: '#7B1FA2', bg: '#F3E5F5' },
  { type: 'phonetics',   icon: Volume2,       label: 'Phonetics',       desc: 'IPA sounds & pronunciation',  color: '#E65100', bg: '#FFF3E0' },
  { type: 'word-puzzle', icon: Puzzle,        label: 'Word Puzzles',    desc: 'Sentence ordering games',     color: '#00838F', bg: '#E0F7FA' },
  { type: 'sentence',    icon: AlignLeft,     label: 'Sentence Build',  desc: 'Fill in the blanks',          color: '#AD1457', bg: '#FCE4EC' },
  { type: 'vocabulary',  icon: Library,       label: 'Vocabulary',      desc: 'Flashcard trainer',           color: '#0277BD', bg: '#E1F5FE' },
  { type: 'grammar',     icon: GraduationCap, label: 'Grammar Drills',  desc: 'Tenses, prepositions & more', color: '#6A1B9A', bg: '#EDE7F6' },
  { type: 'dictation',   icon: Mic2,          label: 'Dictation',       desc: 'Listen & type what you hear', color: '#B71C1C', bg: '#FFEBEE' },
] as const;

const LEVEL_COLOR: Record<CEFRLevel, string> = {
  A1: 'bg-green-100 text-green-700',
  A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-indigo-100 text-indigo-700',
  C1: 'bg-purple-100 text-purple-700',
  C2: 'bg-red-100 text-red-700',
};

export default function SpeakingPracticePage() {
  const navigate = useNavigate();
  const userCredits = 120;
  const demoCompleted = true;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] p-5 text-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Video size={20} /> Free Speaking Practice
          </h1>
          <p className="text-green-100 text-sm mt-1">
            Group sessions, exercises, and puzzles — all in your language, at your level.
          </p>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${demoCompleted ? 'bg-white/20' : 'bg-red-500/30'}`}>
              <CheckCircle size={12} /> Demo {demoCompleted ? 'Completed ✓' : 'Required'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20">
              <Gem size={12} /> {userCredits} credits available
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-green-200">Group session fee</p>
          <p className="text-2xl font-bold">5 <span className="text-sm font-normal">credits</span></p>
          <p className="text-xs text-green-200">per session · up to 8 learners</p>
        </div>
      </div>

      {/* Exercise Modes Grid */}
      <div>
        <h2 className="text-base font-bold text-[#212121] mb-3">Practice Modes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EXERCISE_TYPES.map(({ type, icon: Icon, label, desc, color, bg }) => (
            <button
              key={type}
              onClick={() => navigate(`/practice/exercise?mode=${type}`)}
              className="text-left p-4 rounded-xl border border-gray-200 hover:border-[#43A047] hover:shadow-md transition-all"
              style={{ backgroundColor: bg }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: color }}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="font-semibold text-sm text-[#212121]">{label}</p>
              <p className="text-xs text-[#616161] mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Group Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#212121]">Upcoming Group Sessions</h2>
          <span className="text-xs text-[#43A047] font-semibold">{PRACTICE_SESSIONS.length} scheduled</span>
        </div>
        <div className="space-y-3">
          {PRACTICE_SESSIONS.map((s) => {
            const dt = new Date(s.scheduledAt);
            const spotsLeft = s.maxParticipants - s.currentParticipants;
            return (
              <div key={s.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-lg">{s.flag}</span>
                    <span className="font-semibold text-sm text-[#212121] truncate">{s.title}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${LEVEL_COLOR[s.level]}`}>{s.level}</span>
                  </div>
                  <p className="text-xs text-[#616161] mb-2">🗣 {s.topic} · hosted by {s.hostName}</p>
                  <div className="flex items-center gap-4 text-xs text-[#616161] flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={11} /> {dt.toLocaleDateString()} {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {s.currentParticipants}/{s.maxParticipants}</span>
                    <span className="flex items-center gap-1"><Gem size={11} /> {s.creditCost} credits</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/practice/join/${s.id}`)}
                  disabled={spotsLeft === 0}
                  className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${spotsLeft > 0 ? 'bg-[#43A047] hover:bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {spotsLeft > 0 ? `Join (${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left)` : 'Full'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="card p-5 bg-[#F8FBF0]">
        <h3 className="font-bold text-sm text-[#212121] mb-3">How it works</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-[#616161]">
          <div><span className="font-semibold text-[#43A047]">1. Choose a mode</span><br />Pick speaking, reading, listening, phonetics, or puzzles.</div>
          <div><span className="font-semibold text-[#43A047]">2. Join a session</span><br />Group calls use LiveKit video — requires demo completion and credits.</div>
          <div><span className="font-semibold text-[#43A047]">3. Earn XP</span><br />Complete exercises and sessions to earn experience points.</div>
        </div>
      </div>
    </div>
  );
}
