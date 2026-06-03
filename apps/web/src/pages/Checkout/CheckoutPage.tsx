
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { createPaymentIntent, getBookingById } from '../../core/network/bookingsApi';
import { confirmMockPayment, purchaseCredits } from '../../core/network/paymentsApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

/**
 * CheckoutPage — fetches a Stripe PaymentIntent clientSecret and renders
 * a payment form. Full card collection requires adding @stripe/react-stripe-js
 * and @stripe/stripe-js to the project and embedding the <PaymentElement />.
 *
 * For now this page shows the intent creation status and a placeholder UI.
 */

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const HOLD_WINDOW_MS = 5 * 60 * 1000;

function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms);
  const minutes = Math.floor(clamped / 60_000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((clamped % 60_000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function CheckoutForm({
  clientSecret,
  successPath,
}: {
  clientSecret: string;
  successPath: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    if (result.error) {
      setError(result.error.message || 'Payment failed.');
    } else if (result.paymentIntent?.status === 'succeeded') {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <CreditCard size={24} className="text-green-600" />
        </div>
        <p className="text-green-700 font-semibold">Payment successful!</p>
        <button
          onClick={() => navigate(successPath)}
          className="bg-[#43A047] text-white rounded-xl px-6 py-2 text-sm font-semibold hover:bg-[#388E3C] transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="bg-[#43A047] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#388E3C] transition-colors disabled:opacity-60"
      >
        {submitting ? 'Processing…' : 'Pay Now'}
      </button>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { bookingId, bundleId } = useParams<{ bookingId?: string; bundleId?: string }>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [holdMsLeft, setHoldMsLeft] = useState<number | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'stripe' | 'mock'>('stripe');
  const [mockSubmitting, setMockSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(bookingId)
      .then((booking) => {
        if (booking.status !== 'pending') {
          setHoldExpiresAt(null);
          setHoldMsLeft(null);
          setHoldExpired(false);
          return;
        }
        const expiresAt = new Date(booking.createdAt).getTime() + HOLD_WINDOW_MS;
        const left = Math.max(0, expiresAt - Date.now());
        setHoldExpiresAt(expiresAt);
        setHoldMsLeft(left);
        setHoldExpired(left <= 0);
      })
      .catch(() => {
        // keep checkout resilient even if booking details can't be fetched
      });
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId || holdExpiresAt === null) return;

    const update = () => {
      const left = holdExpiresAt - Date.now();
      if (left <= 0) {
        setHoldMsLeft(0);
        setHoldExpired(true);
        setClientSecret(null);
        setError('Payment window expired. Please book the slot again.');
        return;
      }
      setHoldMsLeft(left);
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [bookingId, holdExpiresAt]);

  useEffect(() => {
    if (bookingId) {
      createPaymentIntent(bookingId)
        .then((res) => {
          setClientSecret(res.clientSecret);
          setPaymentMode(res.paymentMode ?? (stripePromise ? 'stripe' : 'mock'));
        })
        .catch(() => setError('Could not initialise payment. Please try again.'))
        .finally(() => setLoading(false));
      return;
    }

    if (bundleId) {
      purchaseCredits(bundleId)
        .then((res) => {
          setClientSecret(res.clientSecret);
          setPaymentMode(res.paymentMode ?? (stripePromise ? 'stripe' : 'mock'));
        })
        .catch(() => setError('Could not initialise credit purchase. Please try again.'))
        .finally(() => setLoading(false));
      return;
    }

    setError('Invalid checkout request.');
    setLoading(false);
  }, [bookingId, bundleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#43A047] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Preparing payment…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-100 text-gray-700 rounded-xl px-6 py-2 text-sm hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleMockPayNow = async () => {
    try {
      setMockSubmitting(true);
      if (bookingId) {
        await confirmMockPayment({ kind: 'booking', bookingId });
      } else if (bundleId) {
        await confirmMockPayment({ kind: 'credit_purchase', bundleId });
      } else {
        throw new Error('Invalid checkout request');
      }
      window.location.assign(bookingId ? '/mySession' : '/my-credits');
    } catch {
      setError('Mock payment failed. Please try again.');
    } finally {
      setMockSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#43A047]/10 rounded-full flex items-center justify-center">
            <CreditCard size={20} className="text-[#43A047]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Complete Payment</h1>
            <p className="text-gray-400 text-xs">
              {bookingId
                ? `Booking #${bookingId.slice(0, 8)}`
                : bundleId
                  ? `Credits Bundle #${bundleId.slice(0, 8)}`
                  : 'Checkout'}
            </p>
          </div>
        </div>
        {bookingId && holdMsLeft !== null && !holdExpired && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Slot reserved</p>
            <p className="text-sm text-amber-800 mt-1">
              Complete payment within <span className="font-bold">{formatCountdown(holdMsLeft)}</span> to confirm this booking.
            </p>
          </div>
        )}
        {bookingId && holdExpired && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">Your 5-minute payment hold has expired.</p>
            <p className="text-xs text-red-600 mt-1">Please return and book the slot again.</p>
          </div>
        )}
        {clientSecret ? (
          holdExpired ? (
            <button
              onClick={() => window.history.back()}
              className="w-full border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back to booking
            </button>
          ) : paymentMode === 'mock' || !stripePromise ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Test payment mode</p>
                <p className="text-sm text-blue-800 mt-1">This checkout is running in mock mode and will update booking/wallet data in the database.</p>
              </div>
              <button
                type="button"
                onClick={() => void handleMockPayNow()}
                disabled={mockSubmitting}
                className="w-full bg-[#43A047] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#388E3C] transition-colors disabled:opacity-60"
              >
                {mockSubmitting ? 'Processing…' : 'Pay Now'}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-full border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                successPath={bookingId ? '/mySession' : '/my-credits'}
              />
            </Elements>
          )
        ) : (
          <div className="text-center text-gray-400">Unable to load payment form.</div>
        )}
      </div>
    </div>
  );
}
