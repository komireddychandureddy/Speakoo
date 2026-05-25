import { LEADERBOARD_DATA } from '../../data/mockData';

const LEAGUE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Gold: { bg: '#FFF8C8', text: '#B45309', icon: '🥇' },
  Silver: { bg: '#F5F5F5', text: '#6B7280', icon: '🥈' },
  Bronze: { bg: '#FFF1E4', text: '#92400E', icon: '🥉' },
};

const CURRENT_LEAGUE = 'Bronze';
const MY_RANK = 12;
const MY_SCORE = 340;
const MY_SESSIONS = 28;

export default function LeaderboardPage() {
  const { bg, text, icon } = LEAGUE_COLORS[CURRENT_LEAGUE];

  return (
    <div className="max-w-2xl space-y-5">
      {/* My League Card */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center gap-4 border border-[#EEEEEE] shadow-sm"
        style={{ backgroundColor: bg }}
      >
        <span className="text-5xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-600">{CURRENT_LEAGUE} League</p>
          <p className="text-3xl font-extrabold" style={{ color: text }}>Rank #{MY_RANK}</p>
          <p className="text-sm text-gray-600 mt-0.5">{MY_SCORE} pts · {MY_SESSIONS} sessions</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-500">Next rank</p>
          <p className="font-bold text-sm" style={{ color: text }}>+160 pts</p>
          <p className="text-xs text-gray-400">to reach Gold</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 py-2">
        {/* 2nd */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
            {LEADERBOARD_DATA[1]?.avatar}
          </div>
          <p className="text-xs font-semibold text-gray-700 mt-1 max-w-[80px] text-center truncate">{LEADERBOARD_DATA[1]?.name}</p>
          <div className="h-16 w-16 bg-gray-200 rounded-t-xl flex items-center justify-center mt-1">
            <span className="text-2xl">🥈</span>
          </div>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#FAC847] flex items-center justify-center text-white font-bold text-lg">
            {LEADERBOARD_DATA[0]?.avatar}
          </div>
          <p className="text-xs font-semibold text-gray-700 mt-1 max-w-[80px] text-center truncate">{LEADERBOARD_DATA[0]?.name}</p>
          <div className="h-24 w-16 bg-[#FAC847] rounded-t-xl flex items-center justify-center mt-1">
            <span className="text-2xl">🥇</span>
          </div>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-lg">
            {LEADERBOARD_DATA[2]?.avatar}
          </div>
          <p className="text-xs font-semibold text-gray-700 mt-1 max-w-[80px] text-center truncate">{LEADERBOARD_DATA[2]?.name}</p>
          <div className="h-12 w-16 bg-orange-200 rounded-t-xl flex items-center justify-center mt-1">
            <span className="text-2xl">🥉</span>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="card overflow-hidden">
        {LEADERBOARD_DATA.map((user, i) => {
          const isMe = user.isMe;
          return (
            <div
              key={user.id}
              className={`flex items-center gap-4 px-5 py-3.5 ${
                i < LEADERBOARD_DATA.length - 1 ? 'border-b border-[#EEEEEE]' : ''
              } ${isMe ? 'bg-[#E8F5E9]' : 'hover:bg-gray-50'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  i === 0
                    ? 'bg-[#FAC847] text-white'
                    : i === 1
                    ? 'bg-gray-300 text-gray-700'
                    : i === 2
                    ? 'bg-orange-400 text-white'
                    : 'bg-[#EEEEEE] text-gray-500'
                }`}
              >
                {user.rank}
              </div>
              <div className="w-9 h-9 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isMe ? 'text-[#43A047]' : 'text-gray-900'}`}>
                  {user.name} {isMe && <span className="text-[10px] text-gray-400">(You)</span>}
                </p>
                <p className="text-xs text-gray-400">{user.sessions} sessions</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${isMe ? 'text-[#43A047]' : 'text-gray-900'}`}>
                  {user.score} pts
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
