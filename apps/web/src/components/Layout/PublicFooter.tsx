import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Mail,
  MessageCircle,
  Linkedin,
  Youtube,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';

const USEFUL_LINKS = [
  { label: 'Find Tutors', to: '/allTutors' },
  { label: 'Become a Tutor', to: '/become-a-tutor' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Leaderboard', to: '/Leaderboard' },
  { label: 'About Us', to: '/' },
  { label: 'Terms & Conditions', to: '/faq' },
  { label: 'Privacy Policy', to: '/faq' },
];

const SOCIAL_LINKS = [
  { Icon: MessageCircle, label: 'WhatsApp', href: '#' },
  { Icon: Linkedin, label: 'LinkedIn', href: '#' },
  { Icon: Youtube, label: 'YouTube', href: '#' },
  { Icon: Facebook, label: 'Facebook', href: '#' },
  { Icon: Twitter, label: 'Twitter', href: '#' },
  { Icon: Instagram, label: 'Instagram', href: '#' },
];

export default function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#1E2720] text-white">
      {/* CTA strip */}
      <div className="bg-[#2E7D32]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white font-semibold text-sm">
            Want to excel in a new language? Book a free trial session today!
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#FF8F00] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#F57C00] transition-colors text-sm shrink-0"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-[#76D275]" />
            <span className="text-lg font-bold">Speakoo</span>
          </div>
          <p className="text-green-300 text-sm leading-relaxed">
            A global marketplace connecting language learners with expert tutors
            across 40+ languages — live, personal, and effective.
          </p>
          <span className="inline-block border border-[#43A047] text-green-200 text-xs px-4 py-1.5 rounded-full">
            🌍 Connecting the world through language
          </span>
        </div>

        {/* Connect */}
        <div className="space-y-3">
          <h3 className="text-[#FF8F00] font-semibold text-xs uppercase tracking-widest">
            Connect With Us
          </h3>
          <div className="flex items-start gap-2 text-green-300 text-sm">
            <Mail size={14} className="mt-0.5 shrink-0 text-[#76D275]" />
            <a href="mailto:help@speakoo.com" className="hover:text-white transition-colors">
              help@speakoo.com
            </a>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#43A047] transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Useful links */}
        <div className="space-y-3">
          <h3 className="text-[#FF8F00] font-semibold text-xs uppercase tracking-widest">
            Useful Links
          </h3>
          <ul className="space-y-2">
            {USEFUL_LINKS.map((l) => (
              <li key={l.label}>
                <button
                  onClick={() => navigate(l.to)}
                  className="text-green-300 text-sm hover:text-white transition-colors text-left"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Download */}
        <div className="space-y-3">
          <h3 className="text-[#FF8F00] font-semibold text-xs uppercase tracking-widest">
            Download the App
          </h3>
          <p className="text-green-300 text-xs">Learn on the go with our mobile app</p>
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5"
            >
              <span className="text-xl leading-none">▶</span>
              <div>
                <div className="text-[9px] text-green-300 uppercase tracking-wider">Get it on</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5"
            >
              <span className="text-xl leading-none">🍎</span>
              <div>
                <div className="text-[9px] text-green-300 uppercase tracking-wider">Download on the</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-400">
          <div className="flex gap-4">
            <button onClick={() => navigate('/faq')} className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </button>
            <button onClick={() => navigate('/faq')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
          </div>
          <p>© {new Date().getFullYear()} Speakoo. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
