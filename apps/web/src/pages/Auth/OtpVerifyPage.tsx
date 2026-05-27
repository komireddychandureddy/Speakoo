import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiVerifyEmailOtp, parseAuthError } from '../../core/network/authApi';
import apiClient from '../../core/network/apiClient';

const OTP_LENGTH = 6;

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Mask email: ab***@domain.com
  const maskedEmail = email.replace(/^(.{2})(.*)(@.+)$/, (_, a, _b, c) => `${a}***${c}`);

  function focusNext(index: number) {
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function focusPrev(index: number) {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit) focusNext(index);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index]) {
      focusPrev(index);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < OTP_LENGTH) return setError('Please enter all 6 digits.');
    setError('');
    setLoading(true);
    try {
      await apiVerifyEmailOtp(code);
      navigate('/dashboard');
    } catch (err) {
      setError(parseAuthError(err));
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await apiClient.post('/auth/send-verification', { email });
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(parseAuthError(err));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#43A047] to-[#1B5E20] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-[#1E2720] px-8 py-6 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Speakoo</h1>
          <p className="text-green-300 text-sm mt-1">Verify your email to continue</p>
        </div>

        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 mb-6">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-gray-700">{maskedEmail}</span>. Enter it below to
            activate your account.
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP digit inputs */}
            <div className="flex gap-3 justify-center mb-6">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#43A047] focus:ring-2 focus:ring-[#43A047]/20 transition-colors"
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-[#43A047] font-medium hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
