import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getFavoriteIds, toggleFavorite } from '../../core/favorites/favoritesStore';
import { searchTutors, type TutorProfile } from '../../core/network/tutorsApi';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteIds());
  const [allTutors, setAllTutors] = useState<TutorProfile[]>([]);

  useEffect(() => {
    searchTutors({}).then((res) => setAllTutors(res.items)).catch(() => {});
  }, []);

  const favoriteTutors = allTutors.filter((t) => favoriteIds.includes(t.userId));

  const handleRemove = (e: React.MouseEvent, tutorId: string) => {
    e.stopPropagation();
    toggleFavorite(tutorId);
    setFavoriteIds(getFavoriteIds());
  };

  if (favoriteTutors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Heart size={56} className="text-gray-200" />
        <h2 className="text-xl font-bold text-gray-700">No saved tutors yet</h2>
        <p className="text-sm text-gray-500">Tap the heart icon on any tutor card to save them here.</p>
        <button onClick={() => navigate('/allTutors')} className="btn-primary mt-2">Browse Tutors</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">{favoriteTutors.length} saved tutor{favoriteTutors.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {favoriteTutors.map((tutor) => {
          const displayName = tutor.user.profile?.displayName ?? 'Tutor';
          const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
          const priceFmt = tutor.hourlyRateCents != null
            ? `₹${Math.round(tutor.hourlyRateCents / 100)}`
            : '—';
          return (
          <div
            key={tutor.userId}
            onClick={() => navigate(`/TutorDetailsView/${tutor.userId}`)}
            className="card p-5 cursor-pointer hover:shadow-lg transition-shadow relative"
          >
            <button
              onClick={(e) => handleRemove(e, tutor.userId)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-red-50 transition-colors"
              aria-label="Remove from favourites"
            >
              <Heart size={18} className="text-red-500" fill="#ef4444" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {tutor.user.profile?.avatarUrl
                  ? <img src={tutor.user.profile.avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
                  : initials}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <p className="font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tutor.languagesTaught?.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EEEEEE]">
              <span className="text-[#43A047] font-bold text-sm">
                {priceFmt}<span className="text-xs text-gray-400 font-normal"> / hr</span>
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#BBF7D0] text-[#14783D]">
                ● Available
              </span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
