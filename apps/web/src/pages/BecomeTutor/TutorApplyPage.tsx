import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import PhoneInput from '../../components/PhoneInput/PhoneInput';
import { submitPublicTutorApplication } from '../../core/network/tutorsApi';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  // Step 2
  languages: string[];
  proficiency: string;
  certifications: string[];
  yearsExp: string;
  // Step 3
  bio: string;
  teachingStyle: string;
  maxSessions: string;
  availability: string[];
  // Step 4
  agreed: boolean;
}

const ALL_LANGUAGES = [
  'English', 'French', 'Spanish', 'Mandarin', 'Japanese',
  'Arabic', 'German', 'Portuguese', 'Hindi', 'Korean', 'Italian', 'Russian',
];

const CERTS = ['CELTA', 'TEFL', 'TESOL', 'Bachelor\'s in Education', 'Master\'s Degree', 'PhD', 'None'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STEPS_META = [
  { num: 1, label: 'Personal Info' },
  { num: 2, label: 'Language & Skills' },
  { num: 3, label: 'Teaching Style' },
  { num: 4, label: 'Review & Submit' },
];

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function TutorApplyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '', country: 'United States', city: '',
    languages: [], proficiency: '', certifications: [], yearsExp: '',
    bio: '', teachingStyle: '', maxSessions: '', availability: [],
    agreed: false,
  });

  const update = (field: keyof FormData, value: FormData[keyof FormData]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canNext = (): boolean => {
    if (step === 1) return !!(form.firstName && form.lastName && form.email && form.country);
    if (step === 2) return form.languages.length > 0 && !!form.proficiency && !!form.yearsExp;
    if (step === 3) return !!(form.bio && form.availability.length > 0);
    return form.agreed;
  };

  const next = () => { if (step < 4) setStep((s) => (s + 1) as Step); };
  const back = () => { if (step > 1) setStep((s) => (s - 1) as Step); };

  const handleSubmit = async () => {
    if (!canNext()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await submitPublicTutorApplication({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        country: form.country.trim(),
        ...(form.city.trim() ? { city: form.city.trim() } : {}),
        languages: form.languages,
        proficiency: form.proficiency,
        certifications: form.certifications,
        yearsExp: form.yearsExp,
        bio: form.bio.trim(),
        ...(form.teachingStyle ? { teachingStyle: form.teachingStyle } : {}),
        ...(form.maxSessions ? { maxSessions: form.maxSessions } : {}),
        availability: form.availability,
      });

      setRefNumber(result.applicationReference);
      setSubmitted(true);
    } catch {
      setSubmitError('Unable to submit your application right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FBF0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={36} className="text-[#43A047]" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Application Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Thank you, <strong>{form.firstName}</strong>! We've received your application and will
            review it within 7 business days. Check your email at <strong>{form.email}</strong> for updates.
          </p>
          <div className="bg-[#E8F5E9] rounded-xl p-4 text-sm text-[#2E7D32] font-medium">
            Application Reference: #{refNumber}
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#43A047] hover:bg-[#2E7D32] text-white font-bold py-3 rounded-full transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF0]">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/become-a-tutor')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            <ArrowLeft size={16} /> Back to Overview
          </button>
          <span className="text-lg font-extrabold text-[#2E7D32]">Speakoo</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Apply to Become a Tutor</h1>
          <p className="text-gray-500 text-sm mt-1">Takes about 5 minutes · Free to apply</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-[#43A047] z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {STEPS_META.map((s) => (
            <div key={s.num} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                  step > s.num
                    ? 'bg-[#43A047] border-[#43A047] text-white'
                    : step === s.num
                    ? 'bg-white border-[#43A047] text-[#43A047]'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {step > s.num ? <CheckCircle size={18} /> : s.num}
              </div>
              <span className={`text-xs mt-2 font-medium hidden sm:block ${step === s.num ? 'text-[#43A047]' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    placeholder="Jane"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    placeholder="Doe"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number &amp; Country</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(v) => update('phone', v)}
                    onCountryChange={(name) => update('country', name)}
                    placeholder="Phone Number (optional)"
                    autoComplete="tel"
                  />
                  {form.country && (
                    <p className="text-xs text-gray-500 mt-1">
                      Country selected: <strong>{form.country}</strong>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="New York"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047]"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Language & Skills ── */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Language & Qualifications</h2>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Languages You Can Teach *</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => update('languages', toggle(form.languages, lang))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        form.languages.includes(lang)
                          ? 'bg-[#43A047] border-[#43A047] text-white'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-[#43A047]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Your Proficiency Level *</label>
                <select
                  value={form.proficiency}
                  onChange={(e) => update('proficiency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047] bg-white"
                >
                  <option value="">Select level</option>
                  {['Native Speaker', 'Fluent (C2)', 'Advanced (C1)', 'Upper Intermediate (B2)'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Certifications (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {CERTS.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => update('certifications', toggle(form.certifications, cert))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        form.certifications.includes(cert)
                          ? 'bg-[#E8F5E9] border-[#43A047] text-[#2E7D32]'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-[#43A047]'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Years of Teaching Experience *</label>
                <select
                  value={form.yearsExp}
                  onChange={(e) => update('yearsExp', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047] bg-white"
                >
                  <option value="">Select experience</option>
                  {['Less than 1 year', '1–2 years', '3–5 years', '6–10 years', '10+ years'].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* ── Step 3: Teaching Style ── */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Teaching Experience & Style</h2>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">About You / Short Bio *</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  placeholder="Tell students about your background, teaching philosophy, and what makes you unique as a tutor..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Teaching Approach</label>
                <select
                  value={form.teachingStyle}
                  onChange={(e) => update('teachingStyle', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047] bg-white"
                >
                  <option value="">Select approach</option>
                  {[
                    'Conversational practice focused',
                    'Grammar & structure focused',
                    'Exam preparation (IELTS/TOEFL/DELF)',
                    'Business language focused',
                    'Mixed / adaptive approach',
                  ].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Max Sessions Per Week</label>
                <select
                  value={form.maxSessions}
                  onChange={(e) => update('maxSessions', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#43A047] focus:ring-1 focus:ring-[#43A047] bg-white"
                >
                  <option value="">Select max sessions</option>
                  {['5–10', '10–20', '20–30', '30+'].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Availability *</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => update('availability', toggle(form.availability, day))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        form.availability.includes(day)
                          ? 'bg-[#43A047] border-[#43A047] text-white'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-[#43A047]'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 4: Review & Submit ── */}
          {step === 4 && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Review Your Application</h2>
              <div className="space-y-3 text-sm">
                <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Location" value={[form.city, form.country].filter(Boolean).join(', ')} />
                <ReviewRow label="Languages" value={form.languages.join(', ') || '—'} />
                <ReviewRow label="Proficiency" value={form.proficiency || '—'} />
                <ReviewRow label="Certifications" value={form.certifications.join(', ') || 'None specified'} />
                <ReviewRow label="Experience" value={form.yearsExp || '—'} />
                <ReviewRow label="Availability" value={form.availability.join(', ') || '—'} />
                {form.bio && (
                  <div className="bg-[#F8FBF0] rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-700">{form.bio}</p>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) => update('agreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#43A047]"
                />
                <span className="text-sm text-gray-600">
                  I confirm that all information provided is accurate and agree to Speakoo's{' '}
                  <span className="text-[#43A047] font-medium cursor-pointer">Terms of Service</span> and{' '}
                  <span className="text-[#43A047] font-medium cursor-pointer">Tutor Guidelines</span>.
                </span>
              </label>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {submitError ? (
              <p className="text-sm text-red-600 font-medium">{submitError}</p>
            ) : (
              <div />
            )}
            <button
              onClick={back}
              className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft size={16} /> Back
            </button>
            {step < 4 ? (
              <button
                onClick={next}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-[#43A047] hover:bg-[#2E7D32] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext() || isSubmitting}
                className="flex items-center gap-2 bg-[#43A047] hover:bg-[#2E7D32] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'} <CheckCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold text-right max-w-xs">{value || '—'}</span>
    </div>
  );
}
