import { useState } from 'react';
import { X, Send } from 'lucide-react';
import type { Session } from '../../data/mockData';

interface Props {
  session: Session;
  onClose: () => void;
}

interface Message {
  id: number;
  sender: 'me' | 'tutor';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'tutor', text: 'Hello! Great session today. Keep practicing!', time: '10:02 AM' },
  { id: 2, sender: 'me', text: 'Thank you! I will work on my pronunciation.', time: '10:03 AM' },
  { id: 3, sender: 'tutor', text: 'Focus on the "th" sound. Listen to native speakers daily.', time: '10:04 AM' },
];

export default function SessionChatModal({ session, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'me', text, time }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col h-[70vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EEEEEE]">
          <div className="w-9 h-9 rounded-full bg-[#43A047] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {session.tutorAvatar}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">{session.tutorName}</p>
            <p className="text-xs text-gray-400">Session #{session.sessionNumber} · {session.date}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'me'
                    ? 'bg-[#43A047] text-white rounded-br-sm'
                    : 'bg-[#E8F5E9] text-gray-800 rounded-bl-sm'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-purple-200' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#EEEEEE] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-[#43A047] text-white flex items-center justify-center hover:bg-[#2E7D32] disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
