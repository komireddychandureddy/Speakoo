import { useState } from 'react';

const REFERRAL_CODE = 'RAHUL500';

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const HOW_IT_WORKS = [
    { step: '1', title: 'Share Your Code', desc: 'Share your unique referral code with friends and family.' },
    { step: '2', title: 'Friend Signs Up', desc: 'When they sign up using your code, they get ₹500 off their first plan.' },
    { step: '3', title: 'Earn Rewards', desc: 'You earn ₹500 credits added to your wallet for each successful referral.' },
  ];

  const REFERRED_FRIENDS = [
    { name: 'Ananya Sharma', date: 'May 12, 2025', status: 'Credited', amount: '₹500' },
    { name: 'Vikram Patel', date: 'Apr 28, 2025', status: 'Credited', amount: '₹500' },
    { name: 'Deepa Nair', date: 'Apr 03, 2025', status: 'Pending', amount: '₹500' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#43A047] to-[#43A047] text-white rounded-2xl px-6 py-8 text-center">
        <p className="text-5xl mb-3">🎁</p>
        <h2 className="text-2xl font-extrabold">Refer & Earn</h2>
        <p className="text-purple-200 mt-2 text-sm leading-relaxed">
          Invite your friends to Speakoo. You both get ₹500 credits!
        </p>
      </div>

      {/* Referral Code Card */}
      <div className="card px-6 py-5">
        <p className="text-sm font-semibold text-gray-500 mb-2">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#E8F5E9] border-2 border-dashed border-[#43A047] rounded-xl px-4 py-3 text-center">
            <span className="text-2xl font-extrabold text-[#43A047] tracking-widest">{REFERRAL_CODE}</span>
          </div>
          <button onClick={handleCopy} className="btn-primary px-5 py-3">
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="card px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#BBF7D0] flex items-center justify-center text-2xl flex-shrink-0">
          💰
        </div>
        <div>
          <p className="text-sm text-gray-500">Referral Wallet Balance</p>
          <p className="text-2xl font-extrabold text-[#14783D]">₹1,000</p>
          <p className="text-xs text-gray-400">2 successful referrals</p>
        </div>
        <button className="ml-auto btn-outline">Redeem</button>
      </div>

      {/* How It Works */}
      <section>
        <h3 className="font-bold text-gray-900 mb-4">How It Works</h3>
        <div className="space-y-3">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="flex items-start gap-4 card px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {step.step}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referred Friends */}
      <section>
        <h3 className="font-bold text-gray-900 mb-3">Referred Friends</h3>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#E8F5E9] text-left">
                <th className="px-5 py-3 font-semibold text-gray-700">Friend</th>
                <th className="px-5 py-3 font-semibold text-gray-700">Date</th>
                <th className="px-5 py-3 font-semibold text-gray-700">Reward</th>
                <th className="px-5 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {REFERRED_FRIENDS.map((f, i) => (
                <tr key={i} className="border-t border-[#EEEEEE]">
                  <td className="px-5 py-3 font-medium text-gray-900">{f.name}</td>
                  <td className="px-5 py-3 text-gray-500">{f.date}</td>
                  <td className="px-5 py-3 font-semibold text-[#14783D]">{f.amount}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.status === 'Credited'
                          ? 'bg-[#BBF7D0] text-[#14783D]'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
