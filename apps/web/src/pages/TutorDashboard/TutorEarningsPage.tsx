import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { getWalletTransactions, WalletTransaction } from '../../core/network/bookingsApi';

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(input: string): string {
  return new Date(input).toLocaleString();
}

export default function TutorEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    getWalletTransactions()
      .then((res) => setTransactions(res.items))
      .catch(() => setError('Could not load earnings right now.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const payouts = transactions.filter((t) => t.type === 'payout');
    const totalPaidOut = payouts.reduce((sum, t) => sum + t.amountCents, 0);

    const now = new Date();
    const thisMonthPayouts = payouts.filter((t) => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const thisMonth = thisMonthPayouts.reduce((sum, t) => sum + t.amountCents, 0);
    const latestBalance = transactions[0]?.balanceAfter ?? 0;

    return {
      thisMonth,
      totalPaidOut,
      pendingPayout: latestBalance,
      payoutCount: payouts.length,
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <p className="text-gray-500">Loading earnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Earnings</h1>
        <p className="text-gray-500 text-sm mt-1">Live payout and wallet transaction history</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card px-5 py-4">
          <p className="text-xs text-gray-500 font-medium mb-1">This Month</p>
          <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.thisMonth)}</p>
          <span className="text-xs text-gray-500">Payout transactions this month</span>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Paid Out</p>
          <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.totalPaidOut)}</p>
          <span className="text-xs text-gray-500">Since joining</span>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Wallet Balance</p>
          <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.pendingPayout)}</p>
          <span className="text-xs text-gray-500">Latest balance after transaction</span>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Payout Count</p>
          <p className="text-2xl font-extrabold text-gray-900">{stats.payoutCount}</p>
          <span className="text-xs text-gray-500">Completed payout entries</span>
        </div>
      </div>

      <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-xl px-5 py-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#43A047] rounded-lg flex items-center justify-center">
            <DollarSign size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2E7D32]">Monthly Payout Schedule</p>
            <p className="text-xs text-gray-600">Earnings are paid out on the 10th of every month</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#43A047] rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2E7D32]">Platform Fee: 5%</p>
            <p className="text-xs text-gray-600">Deducted per session from gross session price</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#43A047] rounded-lg flex items-center justify-center">
            <Clock size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2E7D32]">Minimum Payout: $50</p>
            <p className="text-xs text-gray-600">Balance carries over if below threshold</p>
          </div>
        </div>
      </div>

      <div className="card px-5 py-5">
        <h3 className="font-bold text-gray-900 mb-4">Wallet Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs text-gray-500 font-semibold pr-4">Date</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold pr-4">Type</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold pr-4">Reference</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold text-right pr-4">Amount</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-[#F8FBF0] transition-colors">
                  <td className="py-3 text-gray-500 pr-4 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                  <td className="py-3 pr-4 capitalize text-gray-700">{tx.type}</td>
                  <td className="py-3 pr-4 text-gray-500">{tx.referenceId ?? '-'}</td>
                  <td className="py-3 text-right pr-4 font-medium">
                    {tx.amountCents < 0 ? '-' : ''}
                    {formatCurrency(Math.abs(tx.amountCents))}
                  </td>
                  <td className="py-3 text-right font-bold text-[#2E7D32]">{formatCurrency(tx.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
