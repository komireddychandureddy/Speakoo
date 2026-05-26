import { useNavigate } from 'react-router-dom';
import { Globe, Star, Users, BookOpen, ArrowRight, CheckCircle, Video } from 'lucide-react';
import PublicHeader from '../../components/Layout/PublicHeader';
import PublicFooter from '../../components/Layout/PublicFooter';

const STATS = [
  { value: '10,000+', label: 'Active Learners' },
  { value: '500+', label: 'Expert Tutors' },
  { value: '40+', label: 'Languages' },
  { value: '4.9★', label: 'Average Rating' },
];

const STEPS = [
  { n: '1', icon: <Users size={24} />, title: 'Find Your Tutor', desc: 'Browse verified tutors by language, price, and availability.' },
  { n: '2', icon: <BookOpen size={24} />, title: 'Book a Session', desc: 'Pick a time that fits your schedule — instant or pre-booked.' },
  { n: '3', icon: <Video size={24} />, title: 'Start Learning', desc: 'Join a live video session with whiteboard, chat & screen share.' },
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Arabic', 'Mandarin', 'Japanese', 'German', 'Portuguese', 'Hindi', 'Korean', 'Italian', 'Russian'];

const TESTIMONIALS = [
  { name: 'Maria G.', country: '🇧🇷 Brazil', text: 'My English improved dramatically in just 3 months. The tutors are incredible!', rating: 5 },
  { name: 'Yuki T.', country: '🇯🇵 Japan', text: 'Found the perfect Spanish tutor. Flexible sessions fit my busy work schedule.', rating: 5 },
  { name: 'Ahmed K.', country: '🇸🇦 Saudi Arabia', text: 'Professional tutors, great platform. Highly recommend for business English.', rating: 5 },
];

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FBF0]">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm px-4 py-1.5 rounded-full mb-6">
            <Globe size={14} /> Available in 40+ languages worldwide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Learn Any Language with<br />Expert Live Tutors
          </h1>
          <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto">
            One-on-one video sessions, interactive whiteboards, and flexible scheduling — all on one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="bg-white text-[#2E7D32] font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
              Start Learning Free <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/become-a-tutor')} className="border border-white/60 text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Become a Tutor
            </button>
          </div>
          {/* Stats bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-green-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#212121] text-center mb-2">How Speakoo Works</h2>
          <p className="text-[#616161] text-center mb-10">Get fluent in three simple steps</p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="card text-center">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4 text-[#43A047]">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-[#43A047] mb-1">STEP {s.n}</div>
                <h3 className="font-semibold text-[#212121] mb-2">{s.title}</h3>
                <p className="text-sm text-[#616161]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="bg-[#E8F5E9] py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#212121] text-center mb-2">Popular Languages</h2>
          <p className="text-[#616161] text-center mb-8">From everyday conversation to business fluency</p>
          <div className="flex flex-wrap justify-center gap-3">
            {LANGUAGES.map(lang => (
              <button key={lang} onClick={() => navigate('/login')}
                className="bg-white border border-[#A5D6A7] text-[#2E7D32] font-medium px-5 py-2 rounded-full hover:bg-[#43A047] hover:text-white hover:border-[#43A047] transition-colors text-sm">
                {lang}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#212121] text-center mb-2">What Learners Say</h2>
          <p className="text-[#616161] text-center mb-10">Join thousands of satisfied students</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#FF8F00" stroke="none" />
                  ))}
                </div>
                <p className="text-[#616161] text-sm mb-4">"{t.text}"</p>
                <div className="font-semibold text-[#212121] text-sm">{t.name}</div>
                <div className="text-xs text-[#616161]">{t.country}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#2E7D32] to-[#43A047] py-14 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">Ready to start speaking?</h2>
        <p className="text-green-100 mb-7">Create your free account and book your first session today.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/login')} className="bg-white text-[#2E7D32] font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
            <CheckCircle size={16} /> Create Free Account
          </button>
          <button onClick={() => navigate('/become-a-tutor')} className="border border-white/60 text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
            Teach on Speakoo
          </button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
