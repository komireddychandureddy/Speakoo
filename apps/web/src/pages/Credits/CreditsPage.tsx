import { Gem } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useI18n } from '../../core/i18n/I18nContext';
import { useLocale } from '../../core/locale/LocaleContext';
import {
  getWalletTransactions,
  type WalletTransaction,
} from '../../core/network/bookingsApi';
import {
  createWalletSetupIntent,
  getWalletBalance,
  listCreditBundles,
  listWalletPaymentMethods,
  setDefaultWalletPaymentMethod,
  type CreditBundle,
  type WalletPaymentMethod,
} from '../../core/network/paymentsApi';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function txLabel(tx: WalletTransaction): string {
  switch (tx.type) {
    case 'credit':
      return 'Credit Granted';
    case 'debit':
      return 'Debit';
    case 'refund':
      return 'Refund';
    case 'payout':
      return 'Tutor Payout';
    default:
      return 'Transaction';
  }
}

function PackCard({ pack, onBuy }: { pack: CreditBundle; onBuy: (bundleId: string) => void }) {
  const { t } = useI18n();
  const { fmtCredits, fmtPrice } = useLocale();

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all hover:shadow-md ${
      'border-gray-100'
    }`}>
      <div className="text-sm font-semibold text-[#616161]">{pack.name}</div>
      <div className="flex items-baseline gap-1">
        <Gem size={16} className="text-[#43A047] mt-0.5" />
        <span className="text-3xl font-bold text-[#212121]">{pack.credits.toLocaleString()}</span>
        <span className="text-sm text-[#616161]">credits</span>
      </div>
      <div className="mt-auto">
        <div className="text-lg font-bold text-[#212121]">{fmtPrice(pack.priceCents / 100)}</div>
        <div className="text-xs text-[#616161]">≈ {fmtCredits(pack.credits)}</div>
      </div>
      <button
        onClick={() => onBuy(pack.id)}
        className="w-full py-2 rounded-xl bg-[#43A047] hover:bg-[#2E7D32] text-white font-semibold text-sm transition-colors"
      >
        {t('cred_buy_now')}
      </button>
    </div>
  );
}

function AddCardForm({
  onSuccess,
}: {
  onSuccess: () => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message || 'Unable to save card.');
      setSubmitting(false);
      return;
    }

    await onSuccess();
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="px-4 py-2 rounded-xl bg-[#43A047] hover:bg-[#2E7D32] text-white text-sm font-semibold disabled:opacity-60"
      >
        {submitting ? 'Saving...' : 'Save Card'}
      </button>
    </form>
  );
}

export default function CreditsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { fmtCredits, symbol } = useLocale();
  const [balance, setBalance] = useState(0);
  const [bundles, setBundles] = useState<CreditBundle[]>([]);
  const [history, setHistory] = useState<WalletTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<WalletPaymentMethod[]>([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);
  const [cardSetupError, setCardSetupError] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  useEffect(() => {
    getWalletBalance()
      .then((res) => {
        setBalance(res.balanceCents);
      })
      .catch(() => {});

    getWalletTransactions()
      .then((res) => {
        setHistory(res.items);
      })
      .catch(() => {});

    listCreditBundles()
      .then((items) => setBundles(items))
      .catch(() => {});

    listWalletPaymentMethods()
      .then((res) => {
        setPaymentMethods(res.items);
        setDefaultPaymentMethodId(res.defaultPaymentMethodId);
      })
      .catch(() => {});
  }, []);

  const refreshPaymentMethods = async () => {
    const methods = await listWalletPaymentMethods();
    setPaymentMethods(methods.items);
    setDefaultPaymentMethodId(methods.defaultPaymentMethodId);
    setSetupClientSecret(null);
  };

  const handleStartAddCard = async () => {
    if (!stripePromise) {
      setCardSetupError('Stripe publishable key is not configured.');
      return;
    }

    try {
      setCardSetupError(null);
      const setup = await createWalletSetupIntent();
      setSetupClientSecret(setup.clientSecret);
    } catch {
      setCardSetupError('Could not start card setup. Please try again.');
    }
  };

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    try {
      setSettingDefaultId(paymentMethodId);
      await setDefaultWalletPaymentMethod(paymentMethodId);
      await refreshPaymentMethods();
    } catch {
      setCardSetupError('Could not set default card. Please try again.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const rows = useMemo(() => history.slice(0, 30), [history]);

  return (
    <div className="space-y-6">
      {/* Balance Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium opacity-80">{t('cred_balance')}</div>
          <div className="flex items-center gap-2 mt-1">
            <Gem size={28} />
            <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
          </div>
          <div className="text-sm opacity-75 mt-1">≈ {fmtCredits(balance)} {symbol}</div>
        </div>
        <button className="px-5 py-2.5 bg-white text-[#2E7D32] font-semibold rounded-xl hover:bg-[#E8F5E9] transition-colors text-sm">
          {t('cred_buy')}
        </button>
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="text-lg font-bold text-[#212121] mb-4">{t('cred_buy')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {bundles.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              onBuy={(bundleId) => navigate(`/checkout/credits/${bundleId}`)}
            />
          ))}
        </div>
      </div>

      {/* Wallet Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#212121]">Wallet Payment Methods</h2>
          <button
            onClick={() => void handleStartAddCard()}
            className="px-4 py-2 rounded-xl bg-[#43A047] hover:bg-[#2E7D32] text-white text-sm font-semibold"
          >
            Add Card
          </button>
        </div>

        {cardSetupError && <p className="text-xs text-red-600">{cardSetupError}</p>}

        {setupClientSecret && stripePromise && (
          <div className="rounded-xl border border-gray-200 p-4">
            <Elements stripe={stripePromise} options={{ clientSecret: setupClientSecret }}>
              <AddCardForm onSuccess={refreshPaymentMethods} />
            </Elements>
          </div>
        )}

        {paymentMethods.length === 0 ? (
          <p className="text-sm text-[#616161]">No saved cards yet.</p>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#212121]">
                    {method.brand.toUpperCase()} •••• {method.last4}
                  </p>
                  <p className="text-xs text-[#616161]">
                    Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                    {defaultPaymentMethodId === method.id ? ' • Default' : ''}
                  </p>
                </div>
                {defaultPaymentMethodId !== method.id && (
                  <button
                    onClick={() => void handleSetDefaultCard(method.id)}
                    disabled={settingDefaultId === method.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {settingDefaultId === method.id ? 'Saving...' : 'Set Default'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How Credits Work */}
      <div className="bg-[#E8F5E9] rounded-2xl p-5">
        <h3 className="font-bold text-[#2E7D32] mb-2">{t('cred_how')}</h3>
        <ul className="text-sm text-[#616161] space-y-1.5 list-disc list-inside">
          <li>1 credit ≈ 1 INR base value (displayed in your local currency)</li>
          <li>Credits are deducted when you book a session</li>
          <li>Unused credits never expire</li>
          <li>Earn bonus credits through referrals and promotions</li>
          <li>Platform fee (5%) is included in the displayed session price</li>
        </ul>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-bold text-[#212121] mb-3">Transaction History</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {rows.map((tx, idx) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between px-5 py-3.5 text-sm ${
                idx < rows.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div>
                <div className="font-medium text-[#212121]">{txLabel(tx)}</div>
                <div className="text-xs text-[#616161] mt-0.5">
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${tx.amountCents > 0 ? 'text-[#43A047]' : 'text-red-500'}`}>
                  {tx.amountCents > 0 ? '+' : ''}{tx.amountCents}
                </div>
                <div className="text-xs text-[#616161]">Bal: {tx.balanceAfter}</div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="px-5 py-10 text-center text-[#616161] text-sm">No transactions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
