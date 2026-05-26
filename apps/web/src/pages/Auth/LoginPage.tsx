import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const COUNTRY_CODES = ['+91 🇮🇳', '+1 🇺🇸', '+44 🇬🇧', '+61 🇦🇺', '+971 🇦🇪'];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );
  const [countryCode, setCountryCode] = useState('+91 🇮🇳');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMobile, setForgotMobile] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<'learner' | 'tutor'>('learner');

  // Login name field
  const [loginName, setLoginName] = useState('');

  // Signup fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPw, setSignupPw] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginName.trim()) return setError('Please enter your name.');
    if (!mobile) return setError('Please enter your mobile number.');
    if (!password) return setError('Please enter your password.');
    if (!/^\d{10}$/.test(mobile)) return setError('Enter a valid 10-digit mobile number.');
    localStorage.setItem('speakoo_user', JSON.stringify({ mobile, name: loginName.trim(), role }));
    navigate('/dashboard');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !signupMobile || !signupPw) return setError('All fields are required.');
    localStorage.setItem('speakoo_user', JSON.stringify({ mobile: signupMobile, name, role: 'learner' }));
    navigate('/dashboard');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotMobile) return setError('Please enter your mobile number.');
    alert('OTP sent to ' + countryCode + ' ' + forgotMobile);
    setForgotMode(false);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    const mockNames: Record<string, string> = {
      google: 'Google User',
      facebook: 'Facebook User',
      apple: 'Apple User',
    };
    localStorage.setItem('speakoo_user', JSON.stringify({ name: mockNames[provider], provider, role }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#43A047] to-[#1B5E20] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-[#1E2720] px-8 py-6 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Speakoo</h1>
          <p className="text-green-300 text-sm mt-1">Your Language Learning Journey Starts Here</p>
        </div>

        <div className="px-8 py-6">
          {forgotMode ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot Password</h2>
              <p className="text-sm text-gray-500 mb-6">We'll send an OTP to your mobile</p>
              {error && (
                <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] w-32"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    value={forgotMobile}
                    onChange={(e) => setForgotMobile(e.target.value.replace(/\D/, '').slice(0, 10))}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3 text-base">
                  Send OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setError('');
                  }}
                  className="w-full text-sm text-[#43A047] hover:underline text-center"
                >
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-[#E8F5E9] mb-6">
                <button
                  onClick={() => {
                    setTab('login');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === 'login'
                      ? 'border-[#43A047] text-[#43A047]'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setTab('signup');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === 'signup'
                      ? 'border-[#43A047] text-[#43A047]'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Role Selector — Login tab only */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRole('learner')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        role === 'learner' ? 'bg-[#43A047] text-white shadow' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🎓 Learner
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('tutor')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        role === 'tutor' ? 'bg-[#43A047] text-white shadow' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      👩‍🏫 Tutor
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] w-32"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="Mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/, '').slice(0, 10))}
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setError('');
                      }}
                      className="text-sm text-[#43A047] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3 text-base">
                    Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                  />
                  <input
                    type="email"
                    placeholder="Email address (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047] w-32"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="Mobile number"
                      value={signupMobile}
                      onChange={(e) =>
                        setSignupMobile(e.target.value.replace(/\D/, '').slice(0, 10))
                      }
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Create Password"
                      value={signupPw}
                      onChange={(e) => setSignupPw(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3 text-base">
                    Create Account
                  </button>
                </form>
              )}

              {/* Social login divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Social login buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-[#1877F2] hover:bg-[#166FE5] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-black hover:bg-gray-900 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Continue with Apple
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
