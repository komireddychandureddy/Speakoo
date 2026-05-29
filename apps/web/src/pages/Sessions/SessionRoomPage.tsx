import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare,
  Monitor, Hand, Users, MoreVertical, Copy, Check,
} from 'lucide-react';
import { SESSIONS } from '../../data/mockData';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

const DEMO_MESSAGES: ChatMessage[] = [
  { id: 'c1', sender: 'Priya Sharma', text: "Welcome to today's session! Let's get started.", time: '9:00 AM', isMe: false },
  { id: 'c2', sender: 'You', text: 'Thank you! Ready to learn.', time: '9:01 AM', isMe: true },
];

export default function SessionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const session = SESSIONS.find((s) => s.id === id) ?? {
    id: id ?? 'demo',
    sessionNumber: 142,
    topic: "Live Session",
    tutorName: 'Priya Sharma',
    tutorAvatar: 'PS',
    date: new Date().toISOString().slice(0, 10),
    timeSlot: 'Now',
    duration: 25,
    status: 'upcoming' as const,
  };

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: `c${Date.now()}`, sender: 'You', text: inputText.trim(), time: now, isMe: true },
    ]);
    setInputText('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/session-room/${session.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    navigate('/mySession');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <div>
            <p className="text-sm font-bold leading-none">Session #{session.sessionNumber} — {session.topic}</p>
            <p className="text-xs text-gray-400 mt-0.5">with {session.tutorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono bg-gray-700 px-3 py-1 rounded-lg text-green-400">
            {formatTime(elapsed)}
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className="text-gray-400 hover:text-white">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
          {/* Tutor Video (main) */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center min-h-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-gray-800" />
            {/* Avatar placeholder */}
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#43A047] flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
                {session.tutorAvatar}
              </div>
              <p className="text-lg font-semibold text-white/80">{session.tutorName}</p>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-300">Camera connecting…</span>
              </div>
            </div>
            {/* Name tag */}
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold">
              {session.tutorName} (Tutor)
            </div>
          </div>

          {/* Local Video (self) */}
          <div className="h-32 relative rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
            {camOn ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-lg">
                    You
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-xs font-semibold">
                  You
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <VideoOff size={24} />
                <span className="text-xs">Camera off</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-72 flex flex-col bg-gray-800 border-l border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="font-semibold text-sm">Session Chat</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  {!msg.isMe && (
                    <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>
                  )}
                  <div
                    className={`max-w-[200px] px-3 py-2 rounded-xl text-sm ${
                      msg.isMe ? 'bg-[#43A047] text-white' : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-gray-700 flex gap-2">
              <input
                className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm outline-none placeholder-gray-500 focus:ring-1 focus:ring-[#43A047]"
                placeholder="Type a message…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <button
                onClick={handleSend}
                className="bg-[#43A047] hover:bg-[#2E7D32] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Participants strip (minimised) */}
      <div className="flex items-center gap-2 px-5 py-2 bg-gray-800/60 border-t border-gray-700 text-xs text-gray-400">
        <Users size={13} />
        <span>2 participants</span>
        {handRaised && (
          <span className="ml-3 text-yellow-400 font-semibold animate-bounce">✋ Hand raised</span>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-4 px-6 py-4 bg-gray-800 border-t border-gray-700">
        <button
          onClick={() => setMicOn((v) => !v)}
          title={micOn ? 'Mute' : 'Unmute'}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'
          }`}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={() => setCamOn((v) => !v)}
          title={camOn ? 'Stop Video' : 'Start Video'}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            camOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'
          }`}
        >
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button
          title="Share Screen"
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
        >
          <Monitor size={20} />
        </button>
        <button
          onClick={() => setHandRaised((v) => !v)}
          title="Raise Hand"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            handRaised ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Hand size={20} />
        </button>
        <button
          onClick={() => setShowChat((v) => !v)}
          title="Toggle Chat"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            showChat ? 'bg-[#43A047] hover:bg-[#2E7D32]' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <MessageSquare size={20} />
        </button>

        {/* End Call */}
        <button
          onClick={() => setShowLeaveConfirm(true)}
          title="Leave Session"
          className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors ml-4"
        >
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Leave Session?</h3>
            <p className="text-sm text-gray-400 mb-5">
              Are you sure you want to leave? The session will continue for the other participant.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-semibold transition-colors"
              >
                Stay
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
