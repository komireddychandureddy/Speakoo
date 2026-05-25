import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TUTORS, FILTER_CHIPS } from '../../data/mockData';

export default function AllTutorsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('All');

  const filtered = TUTORS.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchChip =
      activeChip === 'All' ||
      t.specialties.some((s) => s.toLowerCase().includes(activeChip.toLowerCase()));
    return matchSearch && matchChip;
  });

  return (
    <div className="max-w-4xl space-y-5">
      {/* Search + Filters */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search tutors, specialties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#EEEEEE] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] shadow-sm"
        />
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
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 font-medium">
        {filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Tutor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((tutor) => (
          <div
            key={tutor.id}
            onClick={() => navigate(`/TutorDetailsView/${tutor.id}`)}
            className="card p-5 cursor-pointer hover:shadow-lg transition-shadow"
          >
            {/* Avatar + Name Row */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {tutor.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{tutor.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tutor.language} · {tutor.experience} exp.</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-semibold text-gray-700">{tutor.rating}</span>
                  <span className="text-xs text-gray-400 ml-1">({tutor.sessionCount} sessions)</span>
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

            {/* Price */}
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
    </div>
  );
}
