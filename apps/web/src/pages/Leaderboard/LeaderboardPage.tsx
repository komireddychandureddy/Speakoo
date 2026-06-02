import { useEffect, useState } from 'react';
import {
  getMyBadges,
  getMyProgress,
  type UserBadge,
  type UserProgressResponse,
} from '../../core/network/usersApi';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function LeaderboardPage() {
  const [progress, setProgress] = useState<UserProgressResponse | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [progressData, badgesData] = await Promise.all([
          getMyProgress(),
          getMyBadges(),
        ]);
        setProgress(progressData);
        setBadges(badgesData);
      } catch {
        setError('Unable to load your progress right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="card p-8 text-sm text-gray-500">Loading progress...</div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="max-w-4xl">
        <div className="card p-8 text-sm text-red-600">{error ?? 'Failed to load progress.'}</div>
      </div>
    );
  }

  const summary = progress.summary;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#43A047]">Learning Progress</p>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <div className="rounded-xl bg-[#F4FBF4] p-3">
            <p className="text-xs text-gray-500">Completed Sessions</p>
            <p className="mt-1 text-xl font-bold text-[#1F2937]">{summary.completedSessions}</p>
          </div>
          <div className="rounded-xl bg-[#F4FBF4] p-3">
            <p className="text-xs text-gray-500">Total Points</p>
            <p className="mt-1 text-xl font-bold text-[#1F2937]">{summary.totalPoints}</p>
          </div>
          <div className="rounded-xl bg-[#F4FBF4] p-3">
            <p className="text-xs text-gray-500">Current Streak</p>
            <p className="mt-1 text-xl font-bold text-[#1F2937]">{summary.currentStreakDays} days</p>
          </div>
          <div className="rounded-xl bg-[#F4FBF4] p-3">
            <p className="text-xs text-gray-500">Badges</p>
            <p className="mt-1 text-xl font-bold text-[#1F2937]">{summary.badgesCount}</p>
          </div>
          <div className="rounded-xl bg-[#F4FBF4] p-3">
            <p className="text-xs text-gray-500">Latest CEFR</p>
            <p className="mt-1 text-xl font-bold text-[#1F2937]">{summary.latestCefr ?? 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-900">Milestone Badges</p>
        {badges.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No badges earned yet. Keep learning to unlock milestones.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div key={badge.id} className="rounded-xl border border-[#E6EAE8] p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {badge.icon}
                  </span>
                  <p className="font-semibold text-gray-900">{badge.name}</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">{badge.description}</p>
                <p className="mt-2 text-xs text-gray-400">Awarded {formatDate(badge.awardedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-900">Progress Timeline</p>
        {progress.timeline.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No timeline items yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {progress.timeline.map((item) => (
              <div key={item.bookingId} className="rounded-xl border border-[#E6EAE8] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">Session with {item.tutor.name}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#43A047]">{item.status}</p>
                </div>
                <p className="mt-1 text-xs text-gray-500">{new Date(item.startsAt).toLocaleString()}</p>
                {item.feedback ? (
                  <div className="mt-2 grid gap-2 text-xs text-gray-700 sm:grid-cols-3">
                    <p>Rating: {item.feedback.rating}/5</p>
                    <p>CEFR Before: {item.feedback.cefrBefore ?? 'N/A'}</p>
                    <p>CEFR After: {item.feedback.cefrAfter ?? 'N/A'}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">No feedback submitted yet.</p>
                )}
                {item.feedback?.comment ? (
                  <p className="mt-2 text-sm text-gray-700">{item.feedback.comment}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
