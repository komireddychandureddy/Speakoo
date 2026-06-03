import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  Copy,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MoreVertical,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import { Room, RoomEvent, Track, type RemoteTrack } from 'livekit-client';
import { endSession, getSessionToken, startSession } from '../../core/network/sessionsApi';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export default function SessionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const MAX_RECONNECT_ATTEMPTS = 3;

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('connecting');
  const [remoteIdentity, setRemoteIdentity] = useState<string>('Waiting for participant…');
  const [participantCount, setParticipantCount] = useState(1);
  const [sessionNonce, setSessionNonce] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const isLeavingRef = useRef(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('speakoo_user') ?? '{}') as {
        id?: string;
        role?: 'learner' | 'tutor' | 'admin';
        name?: string;
      };
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    const scheduleReconnect = (errorMessage?: string) => {
      if (!mounted || isLeavingRef.current) return;

      setReconnectAttempts((previous) => {
        const next = previous + 1;
        if (next > MAX_RECONNECT_ATTEMPTS) {
          setConnectionStatus('disconnected');
          if (errorMessage) setTokenError(errorMessage);
          return previous;
        }

        setConnectionStatus('reconnecting');
        if (errorMessage) setTokenError(errorMessage);

        if (reconnectTimerRef.current) {
          window.clearTimeout(reconnectTimerRef.current);
        }
        reconnectTimerRef.current = window.setTimeout(() => {
          setSessionNonce((value) => value + 1);
        }, 2000);

        return next;
      });
    };

    const connect = async () => {
      try {
        setTokenError(null);
        setConnectionStatus(reconnectAttempts > 0 ? 'reconnecting' : 'connecting');
        const { token, wsUrl } = await getSessionToken(id);
        const room = new Room();
        roomRef.current = room;

        room.on(RoomEvent.Connected, async () => {
          if (!mounted) return;
          setConnectionStatus('connected');
          setReconnectAttempts(0);
          setParticipantCount(1 + room.remoteParticipants.size);
          await room.localParticipant.setMicrophoneEnabled(true);
          await room.localParticipant.setCameraEnabled(true);
        });

        room.on(RoomEvent.Reconnecting, () => {
          if (!mounted || isLeavingRef.current) return;
          setConnectionStatus('reconnecting');
        });

        room.on(RoomEvent.Reconnected, () => {
          if (!mounted) return;
          setConnectionStatus('connected');
          setTokenError(null);
        });

        room.on(RoomEvent.ParticipantConnected, (participant) => {
          setParticipantCount(1 + room.remoteParticipants.size);
          setRemoteIdentity(participant.identity || 'Participant');
        });

        room.on(RoomEvent.ParticipantDisconnected, () => {
          setParticipantCount(1 + room.remoteParticipants.size);
          if (room.remoteParticipants.size === 0) {
            setRemoteIdentity('Waiting for participant…');
            if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = '';
            if (remoteAudioRef.current) remoteAudioRef.current.innerHTML = '';
          }
        });

        room.on(RoomEvent.LocalTrackPublished, (publication) => {
          if (publication.track?.kind === Track.Kind.Video && localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
            localVideoRef.current.appendChild(publication.track.attach());
          }
        });

        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, participant) => {
          if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
            setRemoteIdentity(participant.identity || 'Participant');
            remoteVideoRef.current.innerHTML = '';
            remoteVideoRef.current.appendChild(track.attach());
          }
          if (track.kind === Track.Kind.Audio && remoteAudioRef.current) {
            const audioEl = track.attach();
            remoteAudioRef.current.appendChild(audioEl);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach();
        });

        room.on(RoomEvent.DataReceived, (payload, participant) => {
          const text = new TextDecoder().decode(payload);
          setMessages((prev) => [
            ...prev,
            {
              id: `remote-${Date.now()}`,
              sender: participant?.identity || 'Participant',
              text,
              time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              isMe: false,
            },
          ]);
        });

        room.on(RoomEvent.Disconnected, () => {
          if (!mounted || isLeavingRef.current) {
            setConnectionStatus('disconnected');
            return;
          }

          scheduleReconnect('Connection dropped. Trying to reconnect...');
        });

        await room.connect(wsUrl, token);

        if ((user.role === 'tutor' || user.role === 'admin') && id) {
          await startSession(id).catch(() => undefined);
        }
      } catch {
        if (!mounted) return;

        scheduleReconnect('Failed to connect to live session. Retrying...');
      }
    };

    void connect();

    return () => {
      mounted = false;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      const room = roomRef.current;
      if (room) {
        room.disconnect();
      }
      roomRef.current = null;
    };
  }, [id, sessionNonce]);

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !roomRef.current) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender: user.name || 'You',
        text,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isMe: true,
      },
    ]);
    setInputText('');

    await roomRef.current.localParticipant.publishData(new TextEncoder().encode(text), {
      reliable: true,
    });
  };

  const handleToggleMic = async () => {
    const next = !micOn;
    setMicOn(next);
    await roomRef.current?.localParticipant.setMicrophoneEnabled(next);
  };

  const handleToggleCam = async () => {
    const next = !camOn;
    setCamOn(next);
    await roomRef.current?.localParticipant.setCameraEnabled(next);
  };

  const handleToggleScreen = async () => {
    const next = !screenOn;
    setScreenOn(next);
    await roomRef.current?.localParticipant.setScreenShareEnabled(next);
  };

  const handleCopyLink = async () => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/session-room/${id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  };

  const handleLeave = async () => {
    isLeavingRef.current = true;
    if ((user.role === 'tutor' || user.role === 'admin') && id) {
      await endSession(id).catch(() => undefined);
    }
    roomRef.current?.disconnect();
    navigate('/mySession');
  };

  const handleReconnectNow = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
    }
    setTokenError(null);
    setSessionNonce((value) => value + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-400 animate-pulse'
                : connectionStatus === 'reconnecting'
                  ? 'bg-orange-400 animate-pulse'
                  : 'bg-yellow-400'
            }`}
          />
          <div>
            <p className="text-sm font-bold leading-none">Live Session</p>
            <p className="text-xs text-gray-400 mt-0.5">with {remoteIdentity}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono bg-gray-700 px-3 py-1 rounded-lg text-green-400">{formatTime(elapsed)}</span>
          <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className="text-gray-400 hover:text-white">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {tokenError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            {tokenError}
          </div>
        )}
        {connectionStatus === 'reconnecting' && !tokenError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            Reconnecting to session... (attempt {Math.min(reconnectAttempts, MAX_RECONNECT_ATTEMPTS)}/{MAX_RECONNECT_ATTEMPTS})
          </div>
        )}
        {connectionStatus === 'connecting' && !tokenError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-white animate-spin" />
            Connecting to session…
          </div>
        )}
        {connectionStatus === 'disconnected' && reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-gray-700">
            <span>Unable to reconnect after {MAX_RECONNECT_ATTEMPTS} attempts.</span>
            <button
              onClick={handleReconnectNow}
              className="px-3 py-1 rounded-md bg-[#43A047] hover:bg-[#2E7D32] text-white text-xs font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-800 min-h-0">
            <div ref={remoteVideoRef} className="absolute inset-0 flex items-center justify-center bg-black" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-300 text-sm">
              {connectionStatus !== 'connected' ? 'Connecting…' : remoteIdentity}
            </div>
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold">
              {remoteIdentity}
            </div>
          </div>

          <div className="h-32 relative rounded-xl overflow-hidden bg-gray-700">
            <div ref={localVideoRef} className="absolute inset-0 bg-black" />
            {!camOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-300 bg-gray-800/90">
                <VideoOff size={22} />
                <span className="text-xs">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-xs font-semibold">You</div>
          </div>

          <div ref={remoteAudioRef} className="hidden" />
        </div>

        {showChat && (
          <div className="w-72 flex flex-col bg-gray-800 border-l border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="font-semibold text-sm">Session Chat</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  {!msg.isMe && <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>}
                  <div className={`max-w-[200px] px-3 py-2 rounded-xl text-sm ${msg.isMe ? 'bg-[#43A047] text-white' : 'bg-gray-700 text-gray-100'}`}>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSend();
                }}
              />
              <button onClick={() => void handleSend()} className="bg-[#43A047] hover:bg-[#2E7D32] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-5 py-2 bg-gray-800/60 border-t border-gray-700 text-xs text-gray-400">
        <Users size={13} />
        <span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
        {handRaised && <span className="ml-3 text-yellow-400 font-semibold animate-bounce">✋ Hand raised</span>}
      </div>

      <div className="flex items-center justify-center gap-4 px-6 py-4 bg-gray-800 border-t border-gray-700">
        <button onClick={() => void handleToggleMic()} title={micOn ? 'Mute' : 'Unmute'} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={() => void handleToggleCam()} title={camOn ? 'Stop Video' : 'Start Video'} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}>
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button onClick={() => void handleToggleScreen()} title="Share Screen" className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${screenOn ? 'bg-[#43A047] hover:bg-[#2E7D32]' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <Monitor size={20} />
        </button>
        <button onClick={() => setHandRaised((v) => !v)} title="Raise Hand" className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${handRaised ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <Hand size={20} />
        </button>
        <button onClick={() => setShowChat((v) => !v)} title="Toggle Chat" className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showChat ? 'bg-[#43A047] hover:bg-[#2E7D32]' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <MessageSquare size={20} />
        </button>
        <button onClick={() => setShowLeaveConfirm(true)} title="Leave Session" className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors ml-4">
          <PhoneOff size={20} />
        </button>
      </div>

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Leave Session?</h3>
            <p className="text-sm text-gray-400 mb-5">Are you sure you want to leave? The session will continue for the other participant.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-semibold transition-colors">
                Stay
              </button>
              <button onClick={() => void handleLeave()} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold transition-colors">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
