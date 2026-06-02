import { useEffect, useState } from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getTransactionRisks, type TransactionRiskResponse } from '../../core/network/adminApi';

const levelClass: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const pretty = (value: string) => value.replace(/_/g, ' ');

export default function AdminRiskSignalsPage() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TransactionRiskResponse | null>(null);

  const load = async (selectedDays = days) => {
    setLoading(true);
    try {
      const result = await getTransactionRisks(selectedDays);
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(7);
  }, []);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Risk Signals</h1>
        <p className="text-[#616161] text-sm mt-1">
          Wallet and payout anomaly detection for trust and fraud prevention.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-[#616161]">Lookback window:</label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value={3}>Last 3 days</option>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
        </select>
        <button
          onClick={() => void load(days)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[#43A047] text-white hover:bg-[#2E7D32]"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#616161]">Analyzing recent transactions...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card p-4 border-l-4 border-red-500 bg-red-50 text-red-800">
              <p className="text-2xl font-bold">{summary?.byLevel.critical ?? 0}</p>
              <p className="text-sm mt-0.5">Critical</p>
            </div>
            <div className="card p-4 border-l-4 border-amber-500 bg-amber-50 text-amber-800">
              <p className="text-2xl font-bold">{summary?.byLevel.high ?? 0}</p>
              <p className="text-sm mt-0.5">High</p>
            </div>
            <div className="card p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-800">
              <p className="text-2xl font-bold">{summary?.byLevel.medium ?? 0}</p>
              <p className="text-sm mt-0.5">Medium</p>
            </div>
            <div className="card p-4 border-l-4 border-green-500 bg-green-50 text-green-800">
              <p className="text-2xl font-bold">{summary?.totalRisks ?? 0}</p>
              <p className="text-sm mt-0.5">Total Signals</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FBF0]">
                <tr>
                  {['Level', 'Type', 'Message', 'Metadata'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[#616161] font-medium text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.risks ?? []).map((risk, idx) => (
                  <tr key={`${risk.type}-${idx}`} className="hover:bg-[#F8FBF0] transition-colors">
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${levelClass[risk.level]}`}>
                        {risk.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#616161] capitalize">{pretty(risk.type)}</td>
                    <td className="px-5 py-3 text-[#212121]">{risk.message}</td>
                    <td className="px-5 py-3 text-[#616161] text-xs">
                      <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-5">
                        {JSON.stringify(risk.metadata, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
                {(data?.risks.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-[#616161]">
                      <div className="flex items-center justify-center gap-2 text-[#2E7D32]">
                        <ShieldCheck size={16} />
                        No risk signals detected in this window.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.summary.byLevel.critical && data.summary.byLevel.critical > 0 ? (
            <div className="card p-4 border border-red-200 bg-red-50 text-red-800 text-sm flex items-start gap-2">
              <AlertOctagon size={16} className="mt-0.5" />
              Critical signals found. Review immediately and take mitigation actions.
            </div>
          ) : (
            <div className="card p-4 border border-green-200 bg-green-50 text-green-800 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5" />
              Monitoring is active. Continue periodic checks and keep thresholds calibrated.
            </div>
          )}
        </>
      )}
    </div>
  );
}
