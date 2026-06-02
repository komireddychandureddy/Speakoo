import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message { id: number; from: 'me' | 'them'; text: string; time: string; }
interface Conversation { id: string; name: string; avatar: string; role: string; lastMsg: string; unread: number; messages: Message[]; }

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', name: 'Sarah Johnson', avatar: 'SJ', role: 'Tutor', lastMsg: 'See you tomorrow!', unread: 2,
    messages: [
      { id: 1, from: 'them', text: 'Hi! Looking forward to our session tomorrow at 10 AM.', time: '10:30 AM' },
      { id: 2, from: 'me', text: 'Me too! I have been practising the vocabulary we covered last week.', time: '10:32 AM' },
      { id: 3, from: 'them', text: 'Excellent! We will build on that. See you tomorrow!', time: '10:35 AM' },
    ],
  },
  {
    id: 'c2', name: 'Rahul Sharma', avatar: 'RS', role: 'Tutor', lastMsg: 'Assignment sent.', unread: 0,
    messages: [
      { id: 1, from: 'them', text: 'Great session today! I have sent your speaking assignment via email.', time: 'Yesterday' },
      { id: 2, from: 'me', text: 'Thank you, Rahul! I will complete it before our next session.', time: 'Yesterday' },
    ],
  },
  {
    id: 'c3', name: 'Speakoo Support', avatar: '🎧', role: 'Support', lastMsg: 'How can we help?', unread: 1,
    messages: [
      { id: 1, from: 'them', text: 'Hello! Welcome to Speakoo. How can we help you today?', time: '2 days ago' },
    ],
  },
];

function fmt() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

export default function MessagesPage() {
  const [convos, setConvos] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState(convos[0].id);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const active = convos.find((c) => c.id === activeId)!;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active.messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const newMsg: Message = { id: Date.now(), from: 'me', text, time: fmt() };
    setConvos((prev) => prev.map((c) => c.id === activeId ? { ...c, lastMsg: text, messages: [...c.messages, newMsg] } : c));
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations List */}
      <aside className="w-72 flex-shrink-0 card overflow-y-auto divide-y divide-[#EEEEEE]">
        {convos.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`w-full flex items-start gap-3 p-4 text-left hover:bg-[#F9FBF9] transition-colors ${c.id === activeId ? 'bg-[#F0F9F0]' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 text-sm truncate">{c.name}</span>
                {c.unread > 0 && <span className="ml-2 bg-[#43A047] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMsg}</p>
            </div>
          </button>
        ))}
      </aside>

      {/* Chat Panel */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#EEEEEE] flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-sm">{active.avatar}</div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{active.name}</p>
            <p className="text-xs text-gray-500">{active.role}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {active.messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === 'me' ? 'bg-[#43A047] text-white rounded-br-sm' : 'bg-[#F3F4F6] text-gray-800 rounded-bl-sm'}`}>
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-white/70 text-right' : 'text-gray-400'}`}>{m.time}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-[#EEEEEE] flex-shrink-0">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#EEEEEE] bg-[#F9FBF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30 focus:border-[#43A047]"
          />
          <button onClick={handleSend} disabled={!draft.trim()} className="p-2.5 rounded-xl bg-[#43A047] text-white hover:bg-[#388E3C] disabled:opacity-40 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
