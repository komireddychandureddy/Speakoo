import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TUTORS } from '../../data/mockData';

const SAMPLE_REVIEWS = [
  { id: 1, name: 'Priya S.', rating: 5, text: 'Excellent tutor! Very patient and clear.', date: '2 weeks ago' },
  { id: 2, name: 'Arjun M.', rating: 4, text: 'Great at explaining grammar concepts.', date: '1 month ago' },
  { id: 3, name: 'Sneha K.', rating: 5, text: 'My pronunciation improved a lot!', date: '1 month ago' },
];

export default function TutorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tutor = TUTORS.find((t) => t.id === id) ?? TUTORS[0];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Card */}
      <div className="card px-6 py-6">
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
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${
                  tutor.isAvailable
                    ? 'bg-[#BBF7D0] text-[#14783D]'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tutor.isAvailable ? '● Available' : '● Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 pt-4 border-t border-[#EEEEEE]">
          <p className="text-sm text-gray-700 leading-relaxed">
            {tutor.bio ?? `${tutor.name} is an experienced English language tutor with a passion for helping learners achieve fluency. Specializes in conversational English, pronunciation, and professional communication.`}
          </p>
        </div>

        {/* Specialties */}
        <div className="mt-4 flex flex-wrap gap-2">
          {tutor.specialties.map((s) => (
            <span key={s} className="text-sm px-3 py-1 bg-[#E8F5E9] text-[#43A047] rounded-full font-medium">
              {s}
            </span>
          ))}
        </div>

        {/* Pricing + Book CTA */}
        <div className="mt-5 pt-4 border-t border-[#EEEEEE] flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-[#43A047]">₹{tutor.pricePerSession}</span>
            <span className="text-sm text-gray-400"> / session</span>
          </div>
          <button
            onClick={() => navigate('/myClass')}
            className="btn-primary"
            disabled={!tutor.isAvailable}
          >
            {tutor.isAvailable ? 'Book Session' : 'Unavailable'}
          </button>
        </div>
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
    </div>
  );
}
