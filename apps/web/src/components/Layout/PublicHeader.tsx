import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '../../core/i18n/I18nContext';

const NAV_LINKS = [
  { label: 'Find Tutors', to: '/allTutors' },
  { label: 'Become a Tutor', to: '/become-a-tutor' },
  { label: 'FAQ', to: '/faq' },
];

export default function PublicHeader() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#C8E6C9] shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#2E7D32] hover:opacity-80 transition-opacity"
        >
          <Globe size={22} className="text-[#43A047]" />
          <span className="text-xl font-bold">Speakoo</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              className="text-sm text-[#616161] font-medium hover:text-[#43A047] transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-[#43A047] font-medium border border-[#43A047] px-4 py-1.5 rounded-lg hover:bg-[#E8F5E9] transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-sm px-4 py-2"
          >
            Register
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#43A047]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#C8E6C9] px-6 pb-4">
          {NAV_LINKS.map((l) => (
            <button
              key={l.to}
              onClick={() => { navigate(l.to); setMobileOpen(false); }}
              className="block w-full text-left py-3 text-sm text-[#616161] hover:text-[#43A047] border-b border-[#E8F5E9] last:border-0 transition-colors"
            >
              {l.label}
            </button>
          ))}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 text-sm text-[#43A047] font-medium border border-[#43A047] py-2 rounded-lg hover:bg-[#E8F5E9] transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 btn-primary text-sm py-2"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
