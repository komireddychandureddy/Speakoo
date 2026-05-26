import { DollarSign, TrendingUp, Clock, ChevronRight } from 'lucide-react';

const SUMMARY_CARDS = [
  { label: 'This Month', value: '$840', sub: '28 sessions', trend: '+12%', up: true },
  { label: 'Last Month', value: '$750', sub: '25 sessions', trend: '', up: false },
  { label: 'Total Paid Out', value: '$5,230', sub: 'Since joining', trend: '', up: false },
  { label: 'Pending Payout', value: '$840', sub: 'Paid on 10th', trend: '', up: false },
];

const TRANSACTIONS = [
  { id: 'T001', date: 'Jun 24, 2025', student: 'Aryan K.', duration: '60 min', gross: 30, fee: 1.5, net: 28.5 },
  { id: 'T002', date: 'Jun 23, 2025', student: 'Fatima A.', duration: '45 min', gross: 22, fee: 1.1, net: 20.9 },
  { id: 'T003', date: 'Jun 23, 2025', student: 'Liam P.', duration: '60 min', gross: 30, fee: 1.5, net: 28.5 },
  { id: 'T004', date: 'Jun 22, 2025', student: 'Mei L.', duration: '30 min', gross: 15, fee: 0.75, net: 14.25 },
  { id: 'T005', date: 'Jun 21, 2025', student: 'Omar S.', duration: '60 min', gross: 30, fee: 1.5, net: 28.5 },
  { id: 'T006', date: 'Jun 20, 2025', student: 'Priyanka M.', duration: '90 min', gross: 45, fee: 2.25, net: 42.75 },
  { id: 'T007', date: 'Jun 19, 2025', student: 'David B.', duration: '60 min', gross: 30, fee: 1.5, net: 28.5 },
];

const MONTHLY = [
  { month: 'Jan', amount: 420 },
  { month: 'Feb', amount: 560 },
  { month: 'Mar', amount: 490 },
  { month: 'Apr', amount: 610 },
  { month: 'May', amount: 750 },
  { month: 'Jun', amount: 840 },
];

export default function TutorEarningsPage() {
  const maxAmount = Math.max(...MONTHLY.map((m) => m.amount));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Earnings</h1>
        <p className="text-gray-500 text-sm mt-1">Your revenue overview and payout history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((c) => (
          <div key={c.label} className="card px-5 py-4">
            <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{c.sub}</span>
              {c.trend && (
                <span className={`text-xs font-semibold ${c.up ? 'text-[#43A047]' : 'text-gray-400'}`}>
                  {c.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payout Info Banner */}
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

      {/* Monthly Bar Chart */}
      <div className="card px-6 py-5">
        <h3 className="font-bold text-gray-900 mb-5">Monthly Earnings (2025)</h3>
        <div className="flex items-end gap-3 h-36">
          {MONTHLY.map((m) => {
            const height = Math.round((m.amount / maxAmount) * 120);
            const isCurrent = m.month === 'Jun';
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">${m.amount}</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${height}px`,
                    backgroundColor: isCurrent ? '#43A047' : '#A5D6A7',
                  }}
                />
                <span className={`text-xs font-medium ${isCurrent ? 'text-[#2E7D32]' : 'text-gray-500'}`}>
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card px-5 py-5">
        <h3 className="font-bold text-gray-900 mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs text-gray-500 font-semibold pr-4">Date</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold pr-4">Student</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold pr-4">Duration</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold text-right pr-4">Gross</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold text-right pr-4">Fee (5%)</th>
                <th className="pb-3 text-xs text-gray-500 font-semibold text-right">You Earn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TRANSACTIONS.map((t) => (
                <tr key={t.id} className="group hover:bg-[#F8FBF0] transition-colors">
                  <td className="py-3 text-gray-500 pr-4 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {t.student.charAt(0)}
                      </div>
                      <span className="text-gray-900 font-medium">{t.student}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500 pr-4">{t.duration}</td>
                  <td className="py-3 text-gray-700 text-right pr-4">${t.gross.toFixed(2)}</td>
                  <td className="py-3 text-red-400 text-right pr-4">−${t.fee.toFixed(2)}</td>
                  <td className="py-3 font-bold text-[#2E7D32] text-right">${t.net.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} className="pt-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Showing 7 transactions
                </td>
                <td className="pt-3 text-right font-bold text-gray-700 pr-4">
                  ${TRANSACTIONS.reduce((s, t) => s + t.gross, 0).toFixed(2)}
                </td>
                <td className="pt-3 text-right font-bold text-red-400 pr-4">
                  −${TRANSACTIONS.reduce((s, t) => s + t.fee, 0).toFixed(2)}
                </td>
                <td className="pt-3 text-right font-bold text-[#2E7D32]">
                  ${TRANSACTIONS.reduce((s, t) => s + t.net, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <button className="mt-4 w-full text-center text-sm text-[#43A047] font-semibold py-2 border border-[#A5D6A7] rounded-xl hover:bg-[#E8F5E9] transition-colors flex items-center justify-center gap-1">
          Load More <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
