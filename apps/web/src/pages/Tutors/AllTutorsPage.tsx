import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, SlidersHorizontal, X } from 'lucide-react';
import { searchTutors, type TutorProfile } from '../../core/network/tutorsApi';
import { getFavoriteIds, toggleFavorite } from '../../core/favorites/favoritesStore';

type SortKey = 'default' | 'price_asc' | 'price_desc';
type PriceRange = 'all' | 'budget' | 'mid' | 'premium';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'default', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const PRICE_RANGES: Array<{ value: PriceRange; label: string }> = [
  { value: 'all', label: 'Any Price' },
  { value: 'budget', label: '≤ ₹399 Budget' },
  { value: 'mid', label: '₹400 – ₹499 Mid' },
  { value: 'premium', label: '≥ ₹500 Premium' },
];

export default function AllTutorsPage() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteIds());

  useEffect(() => {
    setLoading(true);
    searchTutors({ language: language || undefined, limit: 100 })
      .then((res) => setTutors(res.items))
      .finally(() => setLoading(false));
  }, [language]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent, tutorUserId: string) => {
    e.stopPropagation();
    toggleFavorite(tutorUserId);
    setFavoriteIds(getFavoriteIds());
  }, []);

  const activeFilterCount = [priceRange !== 'all', sortKey !== 'default', !!language].filter(Boolean).length;

  const resetFilters = () => {
    setSortKey('default');
    setPriceRange('all');
    setLanguage('');
  };

  const filtered = useMemo(() => {
    return tutors.filter((t) => {
      const name = t.user.profile?.displayName ?? '';
      const langs = t.languagesTaught.join(' ').toLowerCase();
      const q = search.trim().toLowerCase();
      if (q && !name.toLowerCase().includes(q) && !langs.includes(q)) {
        return false;
      }

      const priceCents = t.hourlyRateCents;
      if (priceRange === 'budget' && priceCents > 39900) return false;
      if (priceRange === 'mid' && (priceCents < 40000 || priceCents > 49900)) return false;
      if (priceRange === 'premium' && priceCents < 50000) return false;
      return true;
    });
  }, [tutors, search, priceRange]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortKey === 'price_asc') return a.hourlyRateCents - b.hourlyRateCents;
      if (sortKey === 'price_desc') return b.hourlyRateCents - a.hourlyRateCents;
      return 0;
    });
    return copy;
  }, [filtered, sortKey]);

  const allLanguages = useMemo(
    () => Array.from(new Set(tutors.flatMap((t) => t.languagesTaught))).sort(),
    [tutors],
  );

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search tutors, languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-[#EEEEEE] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] shadow-sm"
        />
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-[#43A047] text-white border-[#43A047]'
              : 'bg-white text-gray-600 border-[#EEEEEE] hover:border-[#43A047]'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF8F00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLanguage('')}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !language
              ? 'bg-[#43A047] text-white border-[#43A047]'
              : 'bg-white text-gray-600 border-[#EEEEEE] hover:border-[#43A047] hover:text-[#43A047]'
          }`}
        >
          All
        </button>
        {allLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang === language ? '' : lang)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              language === lang
                ? 'bg-[#43A047] text-white border-[#43A047]'
                : 'bg-white text-gray-600 border-[#EEEEEE] hover:border-[#43A047] hover:text-[#43A047]'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="bg-white border border-[#E8F5E9] rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                Sort by
              </label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-sm border border-[#EEEEEE] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#43A047] bg-white"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Range</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriceRange(p.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    priceRange === p.value
                      ? 'bg-[#43A047] text-white border-[#43A047]'
                      : 'bg-white text-gray-600 border-[#EEEEEE] hover:border-[#43A047] hover:text-[#43A047]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
            >
              <X size={12} /> Reset all filters
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          {loading ? 'Loading...' : `${sorted.length} tutor${sorted.length !== 1 ? 's' : ''} found`}
        </p>
        {sortKey !== 'default' && (
          <span className="text-xs text-[#43A047] font-medium">
            {SORT_OPTIONS.find((o) => o.value === sortKey)?.label}
          </span>
        )}
      </div>

      {!loading && sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No tutors match your filters</p>
          <button onClick={resetFilters} className="mt-3 text-sm text-[#43A047] underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((tutor) => {
            const displayName = tutor.user.profile?.displayName ?? 'Tutor';
            const initials = displayName.charAt(0).toUpperCase();
            const priceFmt = `₹${(tutor.hourlyRateCents / 100).toLocaleString('en-IN')}`;
            const isFav = favoriteIds.includes(tutor.userId);

            return (
              <div
                key={tutor.id}
                onClick={() => navigate(`/TutorDetailsView/${tutor.userId}`)}
                className="card p-5 cursor-pointer hover:shadow-lg transition-shadow relative"
              >
                <button
                  onClick={(e) => handleToggleFavorite(e, tutor.userId)}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={isFav ? 'Remove from favourites' : 'Save tutor'}
                >
                  <Heart size={18} className={isFav ? 'text-red-500' : 'text-gray-300'} fill={isFav ? '#ef4444' : 'none'} />
                </button>

                <div className="flex items-start gap-4">
                  {tutor.user.profile?.avatarUrl ? (
                    <img
                      src={tutor.user.profile.avatarUrl}
                      alt={displayName}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tutor.languagesTaught.join(', ')}
                      {tutor.user.profile?.countryCode ? ` · ${tutor.user.profile.countryCode}` : ''}
                    </p>
                  </div>
                </div>

                {tutor.cefrSpecialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tutor.cefrSpecialties.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 bg-[#E8F5E9] text-[#43A047] rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {tutor.user.profile?.bio && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{tutor.user.profile.bio}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EEEEEE]">
                  <div>
                    <span className="text-[#43A047] font-bold text-sm">{priceFmt}</span>
                    <span className="text-xs text-gray-400"> / hr</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/TutorDetailsView/${tutor.userId}`);
                    }}
                    className="text-xs bg-[#43A047] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#2E7D32] transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
