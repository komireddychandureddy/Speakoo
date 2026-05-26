import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../../components/Layout/PublicHeader';
import PublicFooter from '../../components/Layout/PublicFooter';
import {
  Clock,
  Globe,
  BookOpen,
  Banknote,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Clock,
    title: 'Flexible Schedule',
    desc: 'Set your own hours and work as much or as little as you want. Balance teaching with your life.',
  },
  {
    icon: Globe,
    title: 'Work From Anywhere',
    desc: 'Teach from the comfort of your home. No commute, no traffic — just you and your students.',
  },
  {
    icon: BookOpen,
    title: 'Stress-Free Teaching',
    desc: 'We provide lesson frameworks and session plans. Our 24/7 support team always has your back.',
  },
  {
    icon: Banknote,
    title: 'Monthly Payouts',
    desc: 'Earn $500–$2,000+ monthly based on your sessions. Paid directly to your bank on the 10th.',
  },
];

const STEPS = [
  { num: 1, title: 'Submit Application', desc: 'Fill out our quick online form with your background and language skills.' },
  { num: 2, title: 'Application Review', desc: 'Our team reviews your application within 7 business days.' },
  { num: 3, title: 'Interview & Assessment', desc: 'A short video call to assess your communication and teaching style.' },
  { num: 4, title: 'Training & Onboarding', desc: 'Complete our tutor training module and get set up on the platform.' },
  { num: 5, title: 'Start Teaching!', desc: 'Go live, accept your first booking, and start earning.' },
];

const QUALITIES = [
  'Fluency in your target teaching language',
  'Passion for helping others learn',
  'Patience, empathy, and clear communication',
  'Openness to feedback and continuous learning',
  'Ability to motivate and inspire students',
  'Stable internet and a quiet teaching space',
];

const TESTIMONIALS = [
  {
    name: 'Priya M.',
    lang: 'English Tutor',
    country: 'India',
    quote: 'Speakoo changed my life. I went from part-time work to earning a full income teaching English from home. The platform makes everything so easy!',
    rating: 5,
  },
  {
    name: 'Carlos R.',
    lang: 'Spanish Tutor',
    country: 'Mexico',
    quote: 'The lesson plan support means I spend less time preparing and more time actually teaching. My students love the sessions and so do I.',
    rating: 5,
  },
  {
    name: 'Sophie L.',
    lang: 'French Tutor',
    country: 'France',
    quote: "I was nervous about online teaching but Speakoo's onboarding was fantastic. Within a week I had my first students booked. Highly recommend!",
    rating: 5,
  },
];

const FAQS = [
  {
    id: 'f1',
    q: 'What is Speakoo?',
    a: 'Speakoo is a global language tutoring marketplace that connects passionate language tutors with learners worldwide. We support all major world languages.',
  },
  {
    id: 'f2',
    q: 'Who can apply to become a tutor?',
    a: 'Anyone who is fluent in a language and has a genuine passion for teaching can apply. Native speakers, certified language teachers, and experienced tutors are all welcome.',
  },
  {
    id: 'f3',
    q: 'What qualifications do I need?',
    a: 'Formal certifications (CELTA, TEFL, TESOL) are a plus but not mandatory. We value demonstrated language fluency, teaching enthusiasm, and student empathy above all.',
  },
  {
    id: 'f4',
    q: 'What age groups will I teach?',
    a: 'Speakoo serves diverse learners — students, working professionals, homemakers, and seniors. You can set your preferred learner profile when you create your tutor profile.',
  },
  {
    id: 'f5',
    q: 'How do I get paid?',
    a: 'Tutors receive monthly bank transfers on the 10th of each month. The platform deducts a 5% service fee. You can track all earnings in your Tutor Dashboard.',
  },
];

export default function BecomeTutorPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicHeader />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Now Hiring Tutors
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Share Your Language.<br />Earn Your Way.
            </h1>
            <p className="text-lg text-green-100 max-w-lg">
              Tutoring your language with Speakoo is fun, rewarding, and completely flexible.
              Join thousands of tutors already earning from home.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/tutor-apply')}
                className="flex items-center gap-2 bg-white text-[#2E7D32] font-bold px-7 py-3 rounded-full hover:bg-[#E8F5E9] transition-colors text-base"
              >
                Apply Now <ArrowRight size={18} />
              </button>
              <div className="flex items-center gap-1 text-yellow-300 text-sm font-medium">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <span className="text-white ml-1">Rated 4.9 by tutors</span>
              </div>
            </div>
          </div>
          {/* Tutor Collage */}
          <div className="flex-shrink-0 grid grid-cols-3 gap-3">
            {['🇮🇳', '🇫🇷', '🇲🇽', '🇺🇸', '🇯🇵', '🇧🇷'].map((flag, i) => (
              <div
                key={i}
                className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-lg"
              >
                {flag}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#E8F5E9] border-y border-green-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Active Tutors', value: '4,200+' },
            { label: 'Languages', value: '50+' },
            { label: 'Sessions Monthly', value: '80,000+' },
            { label: 'Countries', value: '120+' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-[#2E7D32]">{s.value}</p>
              <p className="text-sm text-gray-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Teach Languages Online with Speakoo</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Everything you need to run a successful tutoring business — we handle the rest.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#A5D6A7] transition-all text-center"
            >
              <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center mx-auto mb-4">
                <b.icon size={22} className="text-[#43A047]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#F8FBF0] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">How to Get Started</h2>
            <p className="text-gray-500 mt-2">From application to your first session in as little as 2 weeks.</p>
          </div>
          <div className="space-y-4">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex items-start gap-5">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#43A047] text-white font-bold text-sm flex items-center justify-center shadow">
                    {step.num}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="w-0.5 h-8 bg-[#A5D6A7] mt-1" />
                  )}
                </div>
                <div className="bg-white rounded-xl p-4 flex-1 border border-gray-100 shadow-sm mb-1">
                  <p className="font-bold text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Qualities ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">What Makes a Great Speakoo Tutor?</h2>
            <p className="text-gray-500 mb-6">We're looking for tutors who go beyond just teaching grammar.</p>
            <ul className="space-y-3">
              {QUALITIES.map((q) => (
                <li key={q} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-[#43A047] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{q}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-8 text-center">
            <p className="text-5xl mb-4">🌍</p>
            <p className="text-2xl font-extrabold text-[#2E7D32]">50+ Languages</p>
            <p className="text-gray-600 mt-2 text-sm">
              English, French, Spanish, Mandarin, Japanese, Arabic, German, Portuguese, and many more.
            </p>
            <button
              onClick={() => navigate('/tutor-apply')}
              className="mt-6 bg-[#43A047] hover:bg-[#2E7D32] text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              Apply Today
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-[#F8FBF0] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">Straight from the Heart</h2>
            <p className="text-gray-500 mt-2">What our tutors say about teaching with Speakoo</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#FF8F00" className="text-[#FF8F00]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#43A047] text-white font-bold flex items-center justify-center text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.lang} · {t.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Got Questions?</h2>
          <p className="text-gray-500 mt-2">Everything you need to know before applying.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                className={`bg-white border rounded-xl px-5 cursor-pointer transition-all ${isOpen ? 'border-[#43A047] shadow-sm' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between py-4">
                  <p className={`text-sm font-semibold pr-4 ${isOpen ? 'text-[#43A047]' : 'text-gray-900'}`}>
                    {faq.q}
                  </p>
                  {isOpen ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                </div>
                {isOpen && (
                  <p className="pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-3xl font-extrabold">Ready to Start Teaching?</h2>
          <p className="text-green-100 text-lg">
            Join our community of passionate language tutors and start earning today.
          </p>
          <button
            onClick={() => navigate('/tutor-apply')}
            className="inline-flex items-center gap-2 bg-white text-[#2E7D32] font-bold px-8 py-4 rounded-full hover:bg-[#E8F5E9] transition-colors text-base mt-2"
          >
            Apply Now <ArrowRight size={18} />
          </button>
          <p className="text-green-200 text-xs pt-2">
            Free to apply · No hidden fees · Join 4,200+ tutors worldwide
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
