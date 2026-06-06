import { useEffect, useMemo, useState } from 'react';
import { listLearningResources, type LearningResource } from '../../core/network/contentApi';

const CATEGORY_ICONS: Record<string, string> = {
  All: '🌐',
  'Business English': '💼',
  'Communicative Grammar': '📚',
  'IELTS Speaking Module': '🎙️',
  'Interview Prep Modules': '🎯',
};

export default function EYResourcePage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLearningResources()
      .then((items) => setResources(items))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(resources.map((r) => r.category)))],
    [resources],
  );

  const filtered = resources.filter((r) => activeCategory === 'All' || r.category === activeCategory);

  return (
    <div className="max-w-4xl space-y-5">
      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
              activeCategory === cat
                ? 'bg-[#43A047] border-[#43A047] text-white shadow'
                : 'bg-white border-[#EEEEEE] text-gray-600 hover:border-[#43A047]'
            }`}
          >
            <span>{CATEGORY_ICONS[cat] ?? '📘'}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <div className="card p-5 text-sm text-gray-500">Loading resources...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-5 text-sm text-gray-500">No resources found for this category.</div>
        ) : filtered.map((resource) => (
          <div key={resource.id} className="card overflow-hidden">
            {/* Thumbnail */}
            <div className="h-36 bg-gradient-to-br from-[#43A047] to-[#43A047] flex items-center justify-center">
              <span className="text-4xl opacity-80">{CATEGORY_ICONS[resource.category] ?? '📘'}</span>
            </div>
            <div className="px-5 py-4">
              <h3 className="font-bold text-gray-900 leading-tight">{resource.title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                {resource.description ?? 'Comprehensive learning material to help you master this topic.'}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  className="btn-primary flex-1"
                  onClick={() => {
                    if (resource.contentUrl) window.open(resource.contentUrl, '_blank', 'noopener,noreferrer');
                  }}
                  disabled={!resource.contentUrl}
                >
                  📖 Read
                </button>
                <button
                  className="btn-outline flex-1"
                  onClick={() => {
                    if (resource.downloadUrl) window.open(resource.downloadUrl, '_blank', 'noopener,noreferrer');
                  }}
                  disabled={!resource.downloadUrl}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
