import { useState } from 'react';
import { RESOURCES } from '../../data/mockData';

const CATEGORIES = [
  'Business English',
  'Communicative Grammar',
  'IELTS Speaking Module',
  'Interview Prep Modules',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Business English': '💼',
  'Communicative Grammar': '📚',
  'IELTS Speaking Module': '🎙️',
  'Interview Prep Modules': '🎯',
};

export default function EYResourcePage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  const filtered = RESOURCES.filter((r) => r.category === activeCategory);

  return (
    <div className="max-w-4xl space-y-5">
      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
              activeCategory === cat
                ? 'bg-[#43A047] border-[#43A047] text-white shadow'
                : 'bg-white border-[#EEEEEE] text-gray-600 hover:border-[#43A047]'
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((resource) => (
          <div key={resource.id} className="card overflow-hidden">
            {/* Thumbnail */}
            <div className="h-36 bg-gradient-to-br from-[#43A047] to-[#43A047] flex items-center justify-center">
              <span className="text-4xl opacity-80">{CATEGORY_ICONS[resource.category]}</span>
            </div>
            <div className="px-5 py-4">
              <h3 className="font-bold text-gray-900 leading-tight">{resource.title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                {resource.description ?? 'Comprehensive learning material to help you master this topic.'}
              </p>
              <div className="flex gap-2 mt-3">
                <button className="btn-primary flex-1">📖 Read</button>
                <button className="btn-outline flex-1">⬇ Download</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
