import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import AppleLogin from 'react-apple-login';
import PhoneInput from '../../components/PhoneInput/PhoneInput';
import {
  apiLogin,
  apiRegister,
  parseAuthError,
  type AuthUser,
} from '../../core/network/authApi';
import apiClient, { setAccessToken } from '../../core/network/apiClient';

const HCAPTCHA_SITE_KEY = import.meta.env['VITE_HCAPTCHA_SITE_KEY'] as string;
const GOOGLE_CLIENT_ID = import.meta.env['VITE_GOOGLE_CLIENT_ID'] as string;
const FACEBOOK_APP_ID = import.meta.env['VITE_FACEBOOK_APP_ID'] as string;
const APPLE_CLIENT_ID = import.meta.env['VITE_APPLE_CLIENT_ID'] as string;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login',
  );

  // Shared state
  const [showPw, setShowPw] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCaptchaToken, setLoginCaptchaToken] = useState('');
  const loginCaptchaRef = useRef<HCaptcha>(null);

  // Sign Up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupCaptchaToken, setSignupCaptchaToken] = useState('');
  const signupCaptchaRef = useRef<HCaptcha>(null);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginIdentifier.trim()) return setError('Please enter your email address or phone number.');
    if (!loginPassword) return setError('Please enter your password.');
    
    // Basic client-side validation for phone format (if it starts with +)
    if (loginIdentifier.trim().startsWith('+')) {
      const phonePattern = /^\+[1-9]\d{7,14}$/;
      if (!phonePattern.test(loginIdentifier.trim())) {
        return setError('Invalid phone number format. Use E.164 format (e.g., +1234567890).');
      }
    }
    
    setLoading(true);
    try {
      await apiLogin(
        loginIdentifier.trim(),
        loginPassword,
        loginCaptchaToken?.trim() || undefined,
      );
      navigate('/dashboard');
    } catch (err) {
      setError(parseAuthError(err));
      loginCaptchaRef.current?.resetCaptcha();
      setLoginCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName.trim()) return setError('Please enter your full name.');
    if (!signupEmail.trim()) return setError('Please enter your email address.');
    if (signupPw.length < 8) return setError('Password must be at least 8 characters.');
    
    // Validate phone if provided
    if (signupPhone.trim()) {
      const phonePattern = /^\+[1-9]\d{7,14}$/;
      if (!phonePattern.test(signupPhone.trim())) {
        return setError('Invalid phone number format. Use E.164 format (e.g., +1234567890).');
      }
    }
    
    setLoading(true);
    try {
      await apiRegister(
        signupName.trim(),
        signupEmail.trim().toLowerCase(),
        signupPw,
        signupCaptchaToken?.trim() || undefined,
        signupPhone.trim() || undefined,
      );
      navigate(`/verify-email?email=${encodeURIComponent(signupEmail.trim().toLowerCase())}`);
    } catch (err) {
      setError(parseAuthError(err));
      signupCaptchaRef.current?.resetCaptcha();
      setSignupCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail.trim()) return setError('Please enter your email address.');
    setLoading(true);
    try {
      await apiClient.post('auth/forgot-password', { email: forgotEmail.trim().toLowerCase() });
      setForgotSent(true);
    } catch (err) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper to persist social login auth state consistently
  const persistSocialAuth = async (accessToken: string): Promise<void> => {
    setAccessToken(accessToken);

    const meResponse = await apiClient.get<{
      id: string;
      email: string;
      role: 'learner' | 'tutor' | 'admin';
      profile: { displayName: string | null } | null;
    }>('users/me');

    const user: AuthUser = {
      id: meResponse.data.id,
      name: meResponse.data.profile?.displayName ?? meResponse.data.email.split('@')[0],
      email: meResponse.data.email,
      role: meResponse.data.role,
    };

    localStorage.setItem('speakoo_access_token', accessToken);
    localStorage.setItem('speakoo_user', JSON.stringify(user));
  };

  // Google OAuth login handler (credential flow gives us ID token directly)
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login failed. Please try again or use email/password login.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Send the ID token to our backend
      const response = await apiClient.post<{ accessToken: string }>('auth/social/google', {
        token: credentialResponse.credential,
      });

      await persistSocialAuth(response.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Facebook OAuth login handler
  const handleFacebookLogin = async (response: { accessToken?: string }) => {
    if (!response.accessToken) {
      setError('Facebook login failed. Please try again or use email/password login.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Send the access token to our backend
      const backendResponse = await apiClient.post<{ accessToken: string }>(
        'auth/social/facebook',
        { token: response.accessToken },
      );

      await persistSocialAuth(backendResponse.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Facebook login error:', err);
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign In handler
  const handleAppleLogin = async (response: { authorization?: { id_token?: string } }) => {
    if (!response.authorization?.id_token) {
      setError('Apple login failed. Please try again or use email/password login.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Send the ID token to our backend
      const backendResponse = await apiClient.post<{ accessToken: string }>(
        'auth/social/apple',
        { token: response.authorization.id_token },
      );

      await persistSocialAuth(backendResponse.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Apple login error:', err);
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
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
              <p className="text-sm text-gray-500 mb-6">
                {forgotSent
                  ? "Check your email for a reset link."
                  : "We'll send a password reset link to your email."}
              </p>
              {error && (
                <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
              {!forgotSent && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base disabled:opacity-60"
                  >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setForgotSent(false);
                  setError('');
                }}
                className="w-full text-sm text-[#43A047] hover:underline text-center mt-4"
              >
                Back to Login
              </button>
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
                  <div>
                    <input
                      type="text"
                      placeholder="Email or Phone Number"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                      autoComplete="username"
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      For phone, use E.164 format (e.g., +1234567890)
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                      autoComplete="current-password"
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
                  <HCaptcha
                    sitekey={HCAPTCHA_SITE_KEY}
                    onVerify={setLoginCaptchaToken}
                    ref={loginCaptchaRef}
                    theme="light"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base disabled:opacity-60"
                  >
                    {loading ? 'Logging in…' : 'Login'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                    autoComplete="name"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                    autoComplete="email"
                  />
                  <PhoneInput
                    value={signupPhone}
                    onChange={setSignupPhone}
                    placeholder="Phone Number (optional)"
                    autoComplete="tel"
                  />
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Create Password (min 8 characters)"
                      value={signupPw}
                      onChange={(e) => setSignupPw(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <HCaptcha
                    sitekey={HCAPTCHA_SITE_KEY}
                    onVerify={setSignupCaptchaToken}
                    ref={signupCaptchaRef}
                    theme="light"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base disabled:opacity-60"
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
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
                {GOOGLE_CLIENT_ID && (
                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => {
                        setError(
                          'Google login failed. Please try again or use email/password login.',
                        );
                      }}
                      text="continue_with"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                )}

                {FACEBOOK_APP_ID && (
                  <FacebookLogin
                    appId={FACEBOOK_APP_ID}
                    onSuccess={handleFacebookLogin}
                    onFail={(error: unknown) => {
                      console.error('Facebook login error:', error);
                      setError('Facebook login failed. Please try again or use email/password login.');
                    }}
                    render={({ onClick }: { onClick?: () => void; logout?: (callback: (res: unknown) => void) => void }) => (
                      <button
                        type="button"
                        onClick={onClick}
                        className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-[#1877F2] hover:bg-[#166FE5] transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Continue with Facebook
                      </button>
                    )}
                  />
                )}

                {APPLE_CLIENT_ID && (
                  <AppleLogin
                    clientId={APPLE_CLIENT_ID}
                    redirectURI={window.location.origin}
                    callback={handleAppleLogin}
                    scope="email name"
                    responseType="code id_token"
                    responseMode="form_post"
                    render={(props) => (
                      <button
                        type="button"
                        onClick={props.onClick}
                        className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-black hover:bg-gray-900 transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        Continue with Apple
                      </button>
                    )}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
