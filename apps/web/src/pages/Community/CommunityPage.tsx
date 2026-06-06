import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Plus, Search, Globe, X } from 'lucide-react';
import {
  createCommunityThread,
  listCommunityThreads,
  type CommunityThread,
} from '../../core/network/communityApi';

const LANGUAGES = ['All', 'English', 'French', 'Spanish', 'German', 'Japanese', 'Arabic', 'Hindi', 'Mandarin'] as const;
const CATEGORIES = ['All', 'question', 'discussion', 'tip', 'resource'] as const;

type Category = typeof CATEGORIES[number];

const CAT_LABEL: Record<string, string> = {
  question: '❓ Question', discussion: '💬 Discussion', tip: '💡 Tip', resource: '📚 Resource',
};
const CAT_COLOR: Record<string, string> = {
  question: 'bg-blue-50 text-blue-700', discussion: 'bg-violet-50 text-violet-700',
  tip: 'bg-amber-50 text-amber-700', resource: 'bg-green-50 text-green-700',
};

export default function CommunityPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>('All');
  const [cat, setCat] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newLang, setNewLang] = useState('English');

  useEffect(() => {
    listCommunityThreads({
      ...(lang !== 'All' ? { language: lang } : {}),
      ...(cat !== 'All' ? { category: cat } : {}),
    })
      .then((data) => {
        setThreads(data);
        setError(null);
      })
      .catch(() => {
        setError('Unable to load community threads right now.');
      })
      .finally(() => setLoading(false));
  }, [lang, cat]);

  const filtered = threads.filter(
    (t) =>
      (search === '' || t.title.toLowerCase().includes(search.toLowerCase())),
  );

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;

    try {
      await createCommunityThread({
        language: newLang,
        title: newTitle.trim(),
        body: newBody.trim(),
        category: cat === 'All' ? 'discussion' : cat,
      });
      const refreshed = await listCommunityThreads({
        ...(lang !== 'All' ? { language: lang } : {}),
        ...(cat !== 'All' ? { category: cat } : {}),
      });
      setThreads(refreshed);
      setShowNew(false);
      setNewTitle('');
      setNewBody('');
      setError(null);
    } catch {
      setError('Unable to create post. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-xl font-extrabold text-[#212121] flex items-center gap-2">
            <Globe size={20} className="text-[#43A047]" /> Community Forum
          </h1>
          <p className="text-sm text-[#616161] mt-0.5">Ask questions, share tips, and discuss all languages with fellow learners.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm shrink-0">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* New Post Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#212121]">New Discussion Post</h2>
              <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <select value={newLang} onChange={(e) => setNewLang(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#43A047]">
              {LANGUAGES.filter((l) => l !== 'All').map((l) => <option key={l}>{l}</option>)}
            </select>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Post title..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#43A047]" />
            <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)}
              placeholder="Share your question, insight, or resource..." rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#43A047]" />
            <div className="flex gap-3">
              <button onClick={() => { setShowNew(false); setNewTitle(''); setNewBody(''); }}
                className="flex-1 border border-gray-200 text-sm py-2 rounded-lg hover:bg-gray-50 text-[#616161]">Cancel</button>
              <button disabled={!newTitle.trim() || !newBody.trim()} onClick={() => void handleCreatePost()}
                className="flex-1 btn-primary text-sm py-2 disabled:opacity-40">Post</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discussions..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#43A047]" />
      </div>

      {/* Language Filters */}
      <div className="flex gap-2 flex-wrap">
        {LANGUAGES.map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${lang === l ? 'bg-[#43A047] border-[#43A047] text-white' : 'border-gray-200 text-[#616161] hover:border-[#43A047] hover:text-[#43A047]'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${cat === c ? 'bg-[#2E7D32] border-[#2E7D32] text-white' : 'border-gray-200 text-[#616161] hover:border-[#43A047]'}`}>
            {c === 'All' ? 'All Types' : CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Thread count */}
      <p className="text-xs text-[#616161]">{filtered.length} post{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Thread List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center text-[#616161] text-sm">Loading community threads...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center text-[#616161] text-sm">
            No posts found. Be the first to post in this language!
          </div>
        ) : (
          filtered.map((t) => (
            <button key={t.id} onClick={() => navigate(`/community/${t.id}`)}
              className="card p-4 text-left w-full hover:shadow-md hover:border-[#C8E6C9] transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-sm font-bold text-[#43A047] shrink-0">
                  {(t.author.profile?.displayName ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base leading-none">🌍</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLOR[t.category]}`}>{CAT_LABEL[t.category]}</span>
                    <span className="text-xs text-[#616161]">{t.language}</span>
                  </div>
                  <p className="font-semibold text-sm text-[#212121] leading-snug">{t.title}</p>
                  <p className="text-xs text-[#616161] mt-0.5 line-clamp-2">{t.body}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#616161]">
                    <span className="flex items-center gap-1"><MessageSquare size={11} /> {t.replyCount} replies</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {t.likesCount}</span>
                    <span className="ml-auto">by {t.author.profile?.displayName ?? 'Community Member'}</span>
                  </div>
                  {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-[#616161] px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
