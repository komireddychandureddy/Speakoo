import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, Heart } from 'lucide-react';
import { searchTutors, type TutorProfile } from '../../core/network/tutorsApi';
import { getFavoriteIds, toggleFavorite } from '../../core/favorites/favoritesStore';

type SortKey = 'default' | 'price_asc' | 'price_desc';
type PriceRange = 'all' | 'budget' | 'mid' | 'premium';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const PRICE_RANGES: { value: PriceRange; label: string }[] = [
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

  const filtered = tutors.filter((t) => {
    const name = t.user.profile?.displayName ?? '';
    const langs = t.languagesTaught.join(' ').toLowerCase();
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !langs.includes(search.toLowerCase()))
      return false;
    const priceCents = t.hourlyRateCents;
    if (priceRange === 'budget' && priceCents > 39900) return false;
    if (priceRange === 'mid' && (priceCents < 40000 || priceCents > 49900)) return false;
    if (priceRange === 'premium' && priceCents < 50000) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'price_asc') return a.hourlyRateCents - b.hourlyRateCents;
    if (sortKey === 'price_desc') return b.hourlyRateCents - a.hourlyRateCents;
    return 0;
  });

  const allLanguages = Array.from(new Set(tutors.flatMap((t) => t.languagesTaught))).sort();

  return (
    <div className="max-w-4xl space-y-4">
      {/* Search row */}
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

      {/* Language chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLanguage('')}
          className={`filter-chip ${!language ? 'filter-chip-active' : ''}`}
        >
          All
        </button>
        {allLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang === language ? '' : lang)}
            className={`filter-chip ${language === lang ? 'filter-chip-active' : ''}`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Expanded filter panel */}
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
                  <option key={o.value} value={o.value}>{o.label}</option>
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

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          {loading ? 'Loading…' : `${sorted.length} tutor${sorted.length !== 1 ? 's' : ''} found`}
        </p>
        {sortKey !== 'default' && (
          <span className="text-xs text-[#43A047] font-medium">
            {SORT_OPTIONS.find((o) => o.value === sortKey)?.label}
          </span>
        )}
      </div>

      {/* Tutor Grid */}
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
                  <Heart
                    size={18}
                    className={isFav ? 'text-red-500' : 'text-gray-300'}
                    fill={isFav ? '#ef4444' : 'none'}
                  />
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
                    onClick={(e) => { e.stopPropagation(); navigate(`/TutorDetailsView/${tutor.userId}`); }}
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


type SortKey =
  | 'default'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'rating_asc'
  | 'popular'
  | 'newest';

type PriceRange = 'all' | 'budget' | 'mid' | 'premium';
type ExpLevel = 'all' | 'junior' | 'mid' | 'senior';

const ALL_COUNTRIES = ['All', ...Array.from(new Set(TUTORS.map((t) => t.country))).sort()];
const ALL_LANGUAGES = ['All', ...Array.from(new Set(TUTORS.map((t) => t.language))).sort()];

const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳',
  'United Kingdom': '🇬🇧',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  'United States': '🇺🇸',
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'rating_asc', label: 'Rating: Low to High' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest Tutors' },
];

const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'all', label: 'Any Price' },
  { value: 'budget', label: '≤ ₹399 Budget' },
  { value: 'mid', label: '₹400 – ₹499 Mid' },
  { value: 'premium', label: '≥ ₹500 Premium' },
];

const EXP_LEVELS: { value: ExpLevel; label: string }[] = [
  { value: 'all', label: 'Any Experience' },
  { value: 'junior', label: '1–4 yrs' },
  { value: 'mid', label: '5–7 yrs' },
  { value: 'senior', label: '8+ yrs' },
];

function parseExpYears(exp: string): number {
  const match = exp.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export default function AllTutorsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [expLevel, setExpLevel] = useState<ExpLevel>('all');
  const [country, setCountry] = useState('All');
  const [language, setLanguage] = useState('English');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    availableOnly,
    priceRange !== 'all',
    expLevel !== 'all',
    sortKey !== 'default',
    country !== 'All',
    language !== 'English',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSortKey('default');
    setAvailableOnly(false);
    setPriceRange('all');
    setExpLevel('all');
    setCountry('All');
    setLanguage('English');
  };

  const results = TUTORS.filter((t) => {
    // search
    if (
      search &&
      !t.name.toLowerCase().includes(search.toLowerCase()) &&
      !t.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    )
      return false;
    // specialty chip
    if (
      activeChip !== 'All' &&
      !t.specialties.some((s) => s.toLowerCase().includes(activeChip.toLowerCase()))
    )
      return false;
    // availability
    if (availableOnly && !t.isAvailable) return false;
    // price range
    if (priceRange === 'budget' && t.pricePerSession > 399) return false;
    if (priceRange === 'mid' && (t.pricePerSession < 400 || t.pricePerSession > 499)) return false;
    if (priceRange === 'premium' && t.pricePerSession < 500) return false;
    // experience
    const yrs = parseExpYears(t.experience);
    if (expLevel === 'junior' && (yrs < 1 || yrs > 4)) return false;
    if (expLevel === 'mid' && (yrs < 5 || yrs > 7)) return false;
    if (expLevel === 'senior' && yrs < 8) return false;
    // country
    if (country !== 'All' && t.country !== country) return false;
    // language
    if (language !== 'All' && t.language !== language) return false;
    return true;
  });

  const sorted = [...results].sort((a, b) => {
    switch (sortKey) {
      case 'price_asc': return a.pricePerSession - b.pricePerSession;
      case 'price_desc': return b.pricePerSession - a.pricePerSession;
      case 'rating_desc': return b.rating - a.rating;
      case 'rating_asc': return a.rating - b.rating;
      case 'popular': return b.sessionCount - a.sessionCount;
      case 'newest': return b.tutorSince - a.tutorSince;
      default: return b.rating * Math.log(b.sessionCount + 1) - a.rating * Math.log(a.sessionCount + 1);
    }
  });

  return (
    <div className="max-w-4xl space-y-4">
      {/* Search row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search tutors, specialties..."
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

      {/* Specialty chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`filter-chip ${activeChip === chip ? 'filter-chip-active' : ''}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="bg-white border border-[#E8F5E9] rounded-2xl p-4 space-y-4 shadow-sm">
          {/* Row 1: Sort + Available toggle */}
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
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
              <span className="text-sm font-medium text-gray-700">Available slots only</span>
              <div
                onClick={() => setAvailableOnly((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  availableOnly ? 'bg-[#43A047]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    availableOnly ? 'translate-x-5' : ''
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Row 2: Price range */}
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

          {/* Row 3: Experience level */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience Level</p>
            <div className="flex flex-wrap gap-2">
              {EXP_LEVELS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setExpLevel(e.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    expLevel === e.value
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                      : 'bg-white text-gray-600 border-[#EEEEEE] hover:border-[#2E7D32] hover:text-[#2E7D32]'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Country */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tutor Location</p>
            <div className="flex flex-wrap gap-2">
              {ALL_COUNTRIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    country === c
                      ? 'bg-[#0277BD] text-white border-[#0277BD]'
                      : 'bg-white text-gray-600 border-[#EEEEEE] hover:border-[#0277BD] hover:text-[#0277BD]'
                  }`}
                >
                  {c === 'All' ? '🌍 All Countries' : `${COUNTRY_FLAGS[c] ?? '🏳️'} ${c}`}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Language */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teaching Language</p>
            <div className="flex flex-wrap gap-2">
              {ALL_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    language === lang
                      ? 'bg-[#6A1B9A] text-white border-[#6A1B9A]'
                      : 'bg-white text-gray-600 border-[#EEEEEE] hover:border-[#6A1B9A] hover:text-[#6A1B9A]'
                  }`}
                >
                  {lang === 'All' ? '🗣️ All Languages' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
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

      {/* Result count + active sort label */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          {sorted.length} tutor{sorted.length !== 1 ? 's' : ''} found
        </p>
        {sortKey !== 'default' && (
          <span className="text-xs text-[#43A047] font-medium">
            {SORT_OPTIONS.find((o) => o.value === sortKey)?.label}
          </span>
        )}
      </div>

      {/* Tutor Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No tutors match your filters</p>
          <button onClick={resetFilters} className="mt-3 text-sm text-[#43A047] underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((tutor) => (
            <div
              key={tutor.id}
              onClick={() => navigate(`/TutorDetailsView/${tutor.id}`)}
              className="card p-5 cursor-pointer hover:shadow-lg transition-shadow relative"
            >
              {/* Avatar + Name Row */}
              <div className="flex items-start gap-4">
                <button
                  onClick={(e) => handleToggleFavorite(e, tutor.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={favoriteIds.includes(tutor.id) ? 'Remove from favourites' : 'Save tutor'}
                >
                  <Heart
                    size={18}
                    className={favoriteIds.includes(tutor.id) ? 'text-red-500' : 'text-gray-300'}
                    fill={favoriteIds.includes(tutor.id) ? '#ef4444' : 'none'}
                  />
                </button>
                <div className="w-14 h-14 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {tutor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{tutor.name}</p>
                    {tutor.sessionCount >= 1000 && (
                      <span className="text-[10px] bg-[#FFF8E1] text-[#FF8F00] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        Top Tutor
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{tutor.language} · {tutor.experience} exp. · {COUNTRY_FLAGS[tutor.country] ?? '🏳️'} {tutor.country}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-semibold text-gray-700">{tutor.rating}</span>
                    <span className="text-xs text-gray-400 ml-1">({tutor.sessionCount.toLocaleString()} sessions)</span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tutor.specialties.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 bg-[#E8F5E9] text-[#43A047] rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>

              {/* Price + Availability */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EEEEEE]">
                <div>
                  <span className="text-[#43A047] font-bold text-sm">₹{tutor.pricePerSession}</span>
                  <span className="text-xs text-gray-400"> / session</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    tutor.isAvailable
                      ? 'bg-[#BBF7D0] text-[#14783D]'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tutor.isAvailable ? '● Available' : '● Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
