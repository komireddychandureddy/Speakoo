import { useState, useRef } from 'react';
import { Camera, MapPin, Globe, User } from 'lucide-react';

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Arabic',
  'Portuguese', 'Russian', 'Korean', 'Italian',
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Australia', 'UAE',
  'Canada', 'Singapore', 'Germany', 'France', 'Japan',
];

export default function ProfilePage() {
  const [name, setName] = useState('Rahul Mehta');
  const [email, setEmail] = useState('rahul.mehta@email.com');
  const [mobile] = useState('9876543210');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['English', 'Hindi']);
  const [desiredLanguages, setDesiredLanguages] = useState<string[]>(['Spanish']);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleLang = (lang: string, type: 'speaks' | 'desires') => {
    if (type === 'speaks') {
      setSelectedLangs((prev) =>
        prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
      );
    } else {
      setDesiredLanguages((prev) =>
        prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
      );
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#43A047] to-[#2E7D32] rounded-2xl px-6 py-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-2xl overflow-hidden cursor-pointer border-2 border-white/40"
            onClick={() => fileRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow"
          >
            <Camera size={14} className="text-[#43A047]" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="text-white">
          <h2 className="text-xl font-extrabold">{name}</h2>
          {(city || country) && (
            <p className="text-green-200 text-sm mt-0.5 flex items-center gap-1">
              <MapPin size={12} />
              {[city, country].filter(Boolean).join(', ')}
            </p>
          )}
          <p className="text-green-200 text-sm mt-0.5">Member since Jan 2024</p>
          <div className="flex gap-3 mt-2 text-sm">
            <div>
              <span className="font-bold">142</span>
              <span className="text-green-200 ml-1">Sessions</span>
            </div>
            <div>
              <span className="font-bold">🥉 Bronze</span>
              <span className="text-green-200 ml-1">League</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card px-6 py-5 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <User size={16} className="text-[#43A047]" />
          Personal Information
        </h3>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email (Optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            readOnly
            className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell tutors and learners a bit about yourself..."
            rows={3}
            maxLength={250}
            className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/250</p>
        </div>
      </div>

      {/* Location */}
      <div className="card px-6 py-5 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={16} className="text-[#43A047]" />
          Location
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] bg-white"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Address (Optional)</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, area, pin code..."
            rows={2}
            className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] resize-none"
          />
        </div>
      </div>

      {/* Languages */}
      <div className="card px-6 py-5 space-y-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Globe size={16} className="text-[#43A047]" />
          Language Preferences
        </h3>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Languages I Speak
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLang(lang, 'speaks')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                  selectedLangs.includes(lang)
                    ? 'bg-[#43A047] border-[#43A047] text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#43A047]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Languages I Want to Learn
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLang(lang, 'desires')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                  desiredLanguages.includes(lang)
                    ? 'bg-[#FF8F00] border-[#FF8F00] text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF8F00]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Selected: {desiredLanguages.length === 0 ? 'None' : desiredLanguages.join(', ')}
          </p>
        </div>
      </div>

      {/* Save */}
      <div className="card px-6 py-5">
        {saved && (
          <div className="bg-[#E8F5E9] text-[#2E7D32] rounded-xl px-4 py-2 text-sm font-semibold text-center mb-4">
            ✓ Profile saved successfully
          </div>
        )}
        <button onClick={handleSave} className="btn-primary w-full py-3">
          Save Changes
        </button>
      </div>

      {/* Active Subscription Card */}
      <div className="card px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Active Subscription</h3>
          <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
        <div className="bg-[#E8F5E9] rounded-xl p-4">
          <p className="font-bold text-[#43A047]">120 Sessions Plan · 3 Months</p>
          <p className="text-sm text-gray-600 mt-1">Expires: Aug 31, 2025</p>
          <p className="text-sm text-gray-600 mt-0.5">
            Sessions remaining: <span className="font-bold text-[#43A047]">68</span>
          </p>
        </div>
        <button className="btn-outline w-full py-2.5 mt-3 text-red-500 border-red-300 hover:bg-red-50">
          ⏸ Pause Plan
        </button>
      </div>
    </div>
  );
}
