import { useState } from 'react';
import { Bell, Globe, Shield, Palette, ChevronRight } from 'lucide-react';

interface Toggle { label: string; description: string; value: boolean; }

export default function SettingsPage() {
  const [notifs, setNotifs] = useState<Record<string, Toggle>>({
    sessionReminders: { label: 'Session reminders', description: 'Get notified 60 and 10 minutes before a session', value: true },
    newMessages: { label: 'New messages', description: 'Notify me when a tutor sends a message', value: true },
    promotions: { label: 'Promotions & offers', description: 'Hear about credits, discounts and new tutors', value: false },
    weeklyReport: { label: 'Weekly progress report', description: 'Summary of your learning progress every Sunday', value: true },
  });

  const [prefs, setPrefs] = useState<Record<string, Toggle>>({
    darkMode: { label: 'Dark mode', description: 'Switch to a darker colour scheme', value: false },
    autoplay: { label: 'Autoplay intro videos', description: 'Auto-play tutor intro videos on their profile', value: true },
  });

  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Record<string, Toggle>>>,
    key: string
  ) => setter((prev) => ({ ...prev, [key]: { ...prev[key], value: !prev[key].value } }));

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#43A047]' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[#43A047]">{icon}</span>
      <h2 className="font-bold text-gray-900">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      {/* Notifications */}
      <div className="card px-5 py-5">
        <SectionHeader icon={<Bell size={18} />} title="Notifications" />
        <div className="space-y-4">
          {Object.entries(notifs).map(([key, item]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              <Toggle checked={item.value} onChange={() => toggle(setNotifs, key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Language & Region */}
      <div className="card px-5 py-5">
        <SectionHeader icon={<Globe size={18} />} title="Language & Region" />
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-800 block mb-1">App Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#EEEEEE] bg-[#F9FBF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30 focus:border-[#43A047]"
            >
              {['English', 'Hindi', 'French', 'Spanish', 'Mandarin', 'Arabic'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-800 block mb-1">Timezone</label>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#EEEEEE] bg-[#F9FBF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30 focus:border-[#43A047]"
            />
            <p className="text-[11px] text-gray-400 mt-1">Detected automatically from your browser.</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card px-5 py-5">
        <SectionHeader icon={<Palette size={18} />} title="Appearance" />
        <div className="space-y-4">
          {Object.entries(prefs).map(([key, item]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              <Toggle checked={item.value} onChange={() => toggle(setPrefs, key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="card px-5 py-5">
        <SectionHeader icon={<Shield size={18} />} title="Account & Security" />
        <div className="space-y-1">
          {['Change Password', 'Two-Factor Authentication', 'Connected Accounts', 'Download My Data', 'Delete Account'].map((item) => (
            <button key={item} className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#F9FBF9] transition-colors text-sm text-gray-700 font-medium">
              {item}
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">Speakoo v1.0.0 · <a href="/privacy" className="hover:underline">Privacy Policy</a> · <a href="/terms" className="hover:underline">Terms</a></p>
    </div>
  );
}
