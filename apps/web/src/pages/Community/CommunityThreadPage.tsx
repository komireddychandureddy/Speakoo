import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, Send, MessageSquare } from 'lucide-react';
import { COMMUNITY_THREADS, COMMUNITY_REPLIES, type CommunityReply } from '../../data/mockData';

const CAT_LABEL: Record<string, string> = {
  question: '❓ Question', discussion: '💬 Discussion', tip: '💡 Tip', resource: '📚 Resource',
};
const CAT_COLOR: Record<string, string> = {
  question: 'bg-blue-50 text-blue-700', discussion: 'bg-violet-50 text-violet-700',
  tip: 'bg-amber-50 text-amber-700', resource: 'bg-green-50 text-green-700',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function CommunityThreadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState<CommunityReply[]>(
    COMMUNITY_REPLIES.filter((r) => r.threadId === id),
  );

  const thread = COMMUNITY_THREADS.find((t) => t.id === id);

  if (!thread) {
    return (
      <div className="card p-8 text-center space-y-3">
        <p className="text-[#616161]">Thread not found.</p>
        <button onClick={() => navigate('/community')} className="btn-primary px-4 py-2 text-sm">Back to Forum</button>
      </div>
    );
  }

  const handleReply = () => {
    if (!reply.trim()) return;
    const newReply: CommunityReply = {
      id: `cr-new-${Date.now()}`,
      threadId: id!,
      authorName: 'You',
      authorAvatar: 'ME',
      body: reply.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setReplies([...replies, newReply]);
    setReply('');
  };

  return (
    <div className="max-w-2xl space-y-4">
      <button onClick={() => navigate('/community')} className="flex items-center gap-2 text-sm text-[#616161] hover:text-[#43A047] transition-colors">
        <ArrowLeft size={16} /> Back to Community Forum
      </button>

      {/* Thread card */}
      <div className="card p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xl leading-none">{thread.flag}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLOR[thread.category]}`}>
            {CAT_LABEL[thread.category]}
          </span>
          <span className="text-xs text-[#616161]">{thread.language}</span>
        </div>
        <h1 className="text-lg font-extrabold text-[#212121] mb-3 leading-snug">{thread.title}</h1>
        <p className="text-sm text-[#424242] leading-relaxed">{thread.body}</p>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-xs font-bold text-[#43A047]">
              {thread.authorAvatar}
            </div>
            <span className="text-sm font-semibold text-[#212121]">{thread.authorName}</span>
          </div>
          <span className="text-xs text-[#616161]">{timeAgo(thread.createdAt)}</span>
          <button
            onClick={() => setLiked(!liked)}
            className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${liked ? 'border-[#43A047] bg-[#E8F5E9] text-[#43A047]' : 'border-gray-200 text-[#616161] hover:border-[#43A047]'}`}>
            <ThumbsUp size={12} /> {thread.likes + (liked ? 1 : 0)}
          </button>
        </div>

        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {thread.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-[#616161] px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Replies */}
      <div>
        <h2 className="font-bold text-sm text-[#212121] mb-3 flex items-center gap-2">
          <MessageSquare size={14} className="text-[#43A047]" /> {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        {replies.length === 0 && (
          <p className="text-sm text-[#616161] text-center py-4">No replies yet — be the first to respond!</p>
        )}
        <div className="space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#E8F5E9] flex items-center justify-center text-xs font-bold text-[#43A047]">
                  {r.authorAvatar}
                </div>
                <span className="text-sm font-semibold text-[#212121]">{r.authorName}</span>
                <span className="text-xs text-[#616161] ml-auto">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-sm text-[#424242] leading-relaxed">{r.body}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-[#616161]">
                <ThumbsUp size={11} /> {r.likes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-[#212121] mb-3">Add a Reply</h3>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          placeholder="Share your thoughts, tips, or answer..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#43A047]"
        />
        <button
          onClick={handleReply}
          disabled={!reply.trim()}
          className="mt-2 btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-40">
          <Send size={14} /> Post Reply
        </button>
      </div>
    </div>
  );
}
