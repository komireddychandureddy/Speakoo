import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { getTutorProfile, getTutorSlots, type TutorProfile, type AvailabilitySlot } from '../../core/network/tutorsApi';
import { isFavorite, toggleFavorite } from '../../core/favorites/favoritesStore';

export default function TutorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoured, setFavoured] = useState(false);
  const [copied, setCopied] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getTutorProfile(id), getTutorSlots(id)])
      .then(([profile, slotData]) => {
        setTutor(profile);
        setSlots(slotData);
        setFavoured(isFavorite(profile.userId));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFav = () => {
    if (!tutor) return;
    toggleFavorite(tutor.userId);
    setFavoured((v) => !v);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading tutor profile…</div>;
  }

  if (!tutor) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-medium">Tutor not found</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm text-[#43A047] underline">Go back</button>
      </div>
    );
  }

  const displayName = tutor.user.profile?.displayName ?? 'Tutor';
  const initials = displayName.charAt(0).toUpperCase();
  const priceFmt = `₹${(tutor.hourlyRateCents / 100).toLocaleString('en-IN')}`;
  const availableSlots = slots.filter((s) => s.status === 'available');

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/messages')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#EEEEEE] hover:border-[#43A047] text-gray-600 hover:text-[#43A047] transition-colors">
            <MessageCircle size={14} /> Message
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#EEEEEE] hover:border-[#43A047] text-gray-600 hover:text-[#43A047] transition-colors">
            <Share2 size={14} /> {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={handleToggleFav} aria-label={favoured ? 'Remove from favourites' : 'Save tutor'}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${favoured ? 'bg-red-50 border-red-200 text-red-500' : 'border-[#EEEEEE] text-gray-600 hover:border-red-300 hover:text-red-400'}`}>
            <Heart size={14} fill={favoured ? '#ef4444' : 'none'} />
            {favoured ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card px-6 py-6 space-y-4">
        <div className="flex items-start gap-5">
          {tutor.user.profile?.avatarUrl ? (
            <img src={tutor.user.profile.avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {tutor.languagesTaught.join(', ')} Tutor
              {tutor.user.profile?.countryCode ? ` · ${tutor.user.profile.countryCode}` : ''}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${availableSlots.length > 0 ? 'bg-[#BBF7D0] text-[#14783D]' : 'bg-gray-100 text-gray-500'}`}>
              {availableSlots.length > 0 ? `● ${availableSlots.length} slot${availableSlots.length !== 1 ? 's' : ''} available` : '● No slots available'}
            </span>
          </div>
        </div>

        {tutor.user.profile?.bio && (
          <div className="border-t border-[#EEEEEE] pt-4">
            <p className="text-sm text-gray-700 leading-relaxed">{tutor.user.profile.bio}</p>
          </div>
        )}

        {tutor.cefrSpecialties.length > 0 && (
          <div className="border border-[#EEEEEE] rounded-xl overflow-hidden">
            <button onClick={() => setSpecOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-[#F9FBF9] hover:bg-[#E8F5E9] transition-colors text-sm font-semibold text-gray-700">
              Specialties & Teaching Areas
              {specOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {specOpen && (
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {tutor.cefrSpecialties.map((s) => (
                  <span key={s} className="text-sm px-3 py-1 bg-[#E8F5E9] text-[#43A047] rounded-full font-medium">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing + Book CTA */}
        <div className="pt-2 border-t border-[#EEEEEE] flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-[#43A047]">{priceFmt}</span>
            <span className="text-sm text-gray-400"> / hr</span>
          </div>
          <button
            onClick={() => navigate('/myClass')}
            className="btn-primary"
            disabled={availableSlots.length === 0}
          >
            {availableSlots.length > 0 ? 'Book Session' : 'Unavailable'}
          </button>
        </div>
      </div>

      {/* Available Slots */}
      {availableSlots.length > 0 && (
        <div className="card px-5 py-4">
          <h3 className="font-bold text-gray-900 mb-3">Available Slots</h3>
          <div className="space-y-2">
            {availableSlots.slice(0, 8).map((slot) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              return (
                <div key={slot.id} className="flex items-center justify-between p-2 bg-[#E8F5E9] rounded-lg">
                  <span className="text-sm text-[#2E7D32] font-medium">
                    {start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs text-[#43A047]">
                    {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            {availableSlots.length > 8 && (
              <p className="text-xs text-gray-400 text-center">+{availableSlots.length - 8} more slots</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


  const [favoured, setFavoured] = useState(() => isFavorite(tutor.id));
  const [copied, setCopied] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);

  const related = TUTORS.filter((t) => t.id !== tutor.id && t.language === tutor.language).slice(0, 3);

  const handleToggleFav = () => { toggleFavorite(tutor.id); setFavoured((v) => !v); };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/messages')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#EEEEEE] hover:border-[#43A047] text-gray-600 hover:text-[#43A047] transition-colors">
            <MessageCircle size={14} /> Message
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#EEEEEE] hover:border-[#43A047] text-gray-600 hover:text-[#43A047] transition-colors">
            <Share2 size={14} /> {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={handleToggleFav} aria-label={favoured ? 'Remove from favourites' : 'Save tutor'}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${favoured ? 'bg-red-50 border-red-200 text-red-500' : 'border-[#EEEEEE] text-gray-600 hover:border-red-300 hover:text-red-400'}`}>
            <Heart size={14} fill={favoured ? '#ef4444' : 'none'} />
            {favoured ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card px-6 py-6 space-y-4">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {tutor.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-gray-900">{tutor.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{tutor.language} Tutor · {tutor.experience} experience</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400">★ {tutor.rating}</span>
              <span className="text-xs text-gray-400">({tutor.sessionCount} sessions)</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${tutor.isAvailable ? 'bg-[#BBF7D0] text-[#14783D]' : 'bg-gray-100 text-gray-500'}`}>
                {tutor.isAvailable ? '● Available' : '● Unavailable'}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EEEEEE] pt-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {tutor.bio ?? `${tutor.name} is an experienced ${tutor.language} tutor with a passion for helping learners achieve fluency.`}
          </p>
        </div>

        {/* Specialties Accordion */}
        <div className="border border-[#EEEEEE] rounded-xl overflow-hidden">
          <button onClick={() => setSpecOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-[#F9FBF9] hover:bg-[#E8F5E9] transition-colors text-sm font-semibold text-gray-700">
            Specialties & Teaching Areas
            {specOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {specOpen && (
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {tutor.specialties.map((s) => (
                <span key={s} className="text-sm px-3 py-1 bg-[#E8F5E9] text-[#43A047] rounded-full font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing + Book CTA */}
        <div className="pt-2 border-t border-[#EEEEEE] flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-[#43A047]">₹{tutor.pricePerSession}</span>
            <span className="text-sm text-gray-400"> / session</span>
          </div>
          <button onClick={() => navigate('/myClass')} className="btn-primary" disabled={!tutor.isAvailable}>
            {tutor.isAvailable ? 'Book Session' : 'Unavailable'}
          </button>
        </div>
      </div>

      {/* Intro Video */}
      {tutor.introVideoUrl && (
        <div className="card overflow-hidden">
          <p className="px-5 pt-4 pb-2 font-bold text-gray-900 text-sm">Intro Video</p>
          <div className="relative pb-[56.25%] bg-black">
            <iframe src={tutor.introVideoUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`${tutor.name} intro`} />
          </div>
        </div>
      )}

      {/* Availability Schedule */}
      <div className="card px-5 py-4">
        <h3 className="font-bold text-gray-900 mb-3">Available Slots</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="w-14" />
                {DAYS.map((d) => <th key={d} className="text-gray-500 font-semibold text-center pb-2">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((t) => (
                <tr key={t}>
                  <td className="text-gray-400 pr-2 py-1 font-medium">{t}</td>
                  {DAYS.map((d) => {
                    const ok = hasMockSlot(d, t);
                    return (
                      <td key={d} className="text-center py-1">
                        <span className={`inline-block w-6 h-6 rounded leading-6 font-medium cursor-default text-[9px] ${ok ? 'bg-[#E8F5E9] text-[#43A047]' : 'bg-gray-100 text-transparent'}`}>●</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">● = available slot · Times in your local timezone</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-[#43A047]">{tutor.sessionCount}</p>
          <p className="text-xs text-gray-500 mt-1">Sessions</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-[#43A047]">★ {tutor.rating}</p>
          <p className="text-xs text-gray-500 mt-1">Rating</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-[#43A047]">{tutor.experience}</p>
          <p className="text-xs text-gray-500 mt-1">Experience</p>
        </div>
      </div>

      {/* Reviews */}
      <section>
        <h3 className="font-bold text-gray-900 mb-3">Student Reviews</h3>
        <div className="space-y-3">
          {SAMPLE_REVIEWS.map((review) => (
            <div key={review.id} className="card px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
                <div className="text-yellow-400 text-sm">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* You might also like */}
      {related.length > 0 && (
        <section>
          <h3 className="font-bold text-gray-900 mb-3">You might also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((t) => (
              <div key={t.id} onClick={() => navigate(`/TutorDetailsView/${t.id}`)} className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold mb-2">{t.avatar}</div>
                <p className="font-semibold text-gray-900 text-sm truncate">{t.name}</p>
                <p className="text-xs text-gray-500">{t.language} · ★ {t.rating}</p>
                <p className="text-xs text-[#43A047] font-bold mt-1">₹{t.pricePerSession}/session</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
