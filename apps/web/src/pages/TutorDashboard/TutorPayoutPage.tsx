import { useEffect, useMemo, useState } from 'react';
import { Landmark, Clock } from 'lucide-react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useLocale } from '../../core/locale/LocaleContext';
import {
  createTutorWithdrawalRequest,
  getTutorPayoutAccount,
  getTutorPayoutSummary,
  listTutorWithdrawals,
  upsertTutorPayoutAccount,
  type TutorPayoutAccount,
  type TutorPayoutSummary,
  type WithdrawalRequest,
} from '../../core/network/paymentsApi';

export default function TutorPayoutPage() {
  const { t } = useI18n();
  const { fmtPrice } = useLocale();
  const [summary, setSummary] = useState<TutorPayoutSummary | null>(null);
  const [account, setAccount] = useState<TutorPayoutAccount | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingCode, setRoutingCode] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const loadAll = async () => {
    try {
      setError(null);
      const [summaryRes, accountRes, withdrawalsRes] = await Promise.all([
        getTutorPayoutSummary(),
        getTutorPayoutAccount(),
        listTutorWithdrawals(),
      ]);
      setSummary(summaryRes);
      setAccount(accountRes);
      setWithdrawals(withdrawalsRes);

      if (accountRes) {
        setAccountHolderName(accountRes.accountHolderName);
        setBankName(accountRes.bankName);
        setRoutingCode(accountRes.routingCode);
        setCountryCode(accountRes.countryCode ?? '');
      }
    } catch {
      setError('Failed to load payout data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const availableCents = summary?.availableToWithdrawCents ?? 0;
  const minWithdrawalCents = summary?.minimumWithdrawalCents ?? 5000;

  const parsedWithdrawalCents = useMemo(() => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    return Math.round(amount * 100);
  }, [withdrawAmount]);

  const handleSaveAccount = async () => {
    if (!accountHolderName.trim() || !accountNumber.trim() || !bankName.trim() || !routingCode.trim()) {
      setError('Please complete all payout account fields.');
      return;
    }

    try {
      setSaveLoading(true);
      setError(null);
      const updated = await upsertTutorPayoutAccount({
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
        routingCode: routingCode.trim(),
        ...(countryCode.trim() && { countryCode: countryCode.trim().toUpperCase() }),
      });
      setAccount(updated);
      setAccountNumber('');
      await loadAll();
    } catch {
      setError('Failed to save payout account. Please verify details and try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (parsedWithdrawalCents <= 0) {
      setError('Enter a valid withdrawal amount.');
      return;
    }

    try {
      setRequestLoading(true);
      setError(null);
      await createTutorWithdrawalRequest(parsedWithdrawalCents);
      setWithdrawAmount('');
      await loadAll();
    } catch {
      setError('Could not create withdrawal request. Please check amount and available balance.');
    } finally {
      setRequestLoading(false);
    }
  };

  const statusClass = (status: WithdrawalRequest['status']) => {
    if (status === 'paid') return 'bg-[#E8F5E9] text-[#2E7D32]';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    if (status === 'approved') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  if (loading) {
    return <div className="text-sm text-[#616161]">Loading payout data…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#212121]">{t('payout_title')}</h1>
        <p className="text-sm text-[#616161] mt-1">
          Payouts are processed via Stripe Connect to your registered bank account.
          Minimum withdrawal is $50 USD equivalent.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Pending Payout Card */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm opacity-80">{t('payout_pending')}</div>
          <div className="text-4xl font-bold mt-1">{fmtPrice(availableCents / 100)}</div>
          <div className="flex items-center gap-1.5 mt-2 text-sm opacity-75">
            <Clock size={14} />
            <span>
              Pending withdrawals: {fmtPrice((summary?.pendingWithdrawalCents ?? 0) / 100)}
            </span>
          </div>
        </div>
        <div className="text-xs opacity-80 text-right">
          <p>Lifetime payouts: {fmtPrice((summary?.lifetimePayoutCents ?? 0) / 100)}</p>
          <p>Minimum withdrawal: {fmtPrice(minWithdrawalCents / 100)}</p>
        </div>
      </div>

      {/* Payout Account */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-[#212121]">
          <Landmark size={18} className="text-[#43A047]" />
          <span>Payout Account Details</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={accountHolderName}
            onChange={(event) => setAccountHolderName(event.target.value)}
            placeholder="Account holder name"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
          <input
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            placeholder={account ? `Account number (ends with ${account.accountNumberLast4})` : 'Account number'}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
          <input
            value={bankName}
            onChange={(event) => setBankName(event.target.value)}
            placeholder="Bank name"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
          <input
            value={routingCode}
            onChange={(event) => setRoutingCode(event.target.value)}
            placeholder="Routing / IFSC code"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
          <input
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
            placeholder="Country code (e.g. IN)"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => void handleSaveAccount()}
            disabled={saveLoading}
            className="px-4 py-2 rounded-xl bg-[#43A047] hover:bg-[#2E7D32] text-white text-sm font-semibold disabled:opacity-60"
          >
            {saveLoading ? 'Saving…' : 'Save Payout Account'}
          </button>
        </div>
      </div>

      {/* Request Withdrawal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-base font-bold text-[#212121]">Request Withdrawal</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={withdrawAmount}
            onChange={(event) => setWithdrawAmount(event.target.value)}
            placeholder="Amount"
            type="number"
            min={0}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
          <button
            onClick={() => void handleRequestWithdrawal()}
            disabled={requestLoading || !summary?.hasPayoutAccount}
            className="px-4 py-2 rounded-xl bg-[#43A047] hover:bg-[#2E7D32] text-white text-sm font-semibold disabled:opacity-60"
          >
            {requestLoading ? 'Submitting…' : 'Request Withdrawal'}
          </button>
        </div>
        {!summary?.hasPayoutAccount && (
          <p className="text-xs text-amber-700">Add payout account details before creating withdrawal requests.</p>
        )}
      </div>

      {/* Payout History */}
      <div>
        <h2 className="text-lg font-bold text-[#212121] mb-3">Withdrawal History</h2>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {withdrawals.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <div className="font-medium text-[#212121]">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div className={`inline-block text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full ${statusClass(item.status)}`}>
                  {item.status}
                </div>
                {item.adminNote && <p className="text-xs text-[#616161] mt-1">{item.adminNote}</p>}
              </div>
              <div className="font-bold text-[#212121]">{fmtPrice(item.amountCents / 100)}</div>
            </div>
          ))}
          {withdrawals.length === 0 && (
            <div className="px-5 py-8 text-sm text-[#616161] text-center">No withdrawal requests yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
