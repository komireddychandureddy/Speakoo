
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { createPaymentIntent } from '../../core/network/bookingsApi';
import { purchaseCredits } from '../../core/network/paymentsApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

/**
 * CheckoutPage — fetches a Stripe PaymentIntent clientSecret and renders
 * a payment form. Full card collection requires adding @stripe/react-stripe-js
 * and @stripe/stripe-js to the project and embedding the <PaymentElement />.
 *
 * For now this page shows the intent creation status and a placeholder UI.
 */

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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

  useEffect(() => {
    if (bookingId) {
      createPaymentIntent(bookingId)
        .then((res) => setClientSecret(res.clientSecret))
        .catch(() => setError('Could not initialise payment. Please try again.'))
        .finally(() => setLoading(false));
      return;
    }

    if (bundleId) {
      purchaseCredits(bundleId)
        .then((res) => setClientSecret(res.clientSecret))
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
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              successPath={bookingId ? '/mySession' : '/my-credits'}
            />
          </Elements>
        ) : (
          <div className="text-center text-gray-400">Unable to load payment form.</div>
        )}
      </div>
    </div>
  );
}
