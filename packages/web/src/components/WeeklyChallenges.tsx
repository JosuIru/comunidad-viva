import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface ChallengeParticipation {
  id: string;
  progress: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
    generosityScore: number;
  };
}

interface WeeklyChallenge {
  id: string;
  type: string;
  title: string;
  description: string;
  targetValue: number;
  reward: number;
  startsAt: string;
  endsAt: string;
  participations: ChallengeParticipation[];
}

function WeeklyChallenges() {
  const t = useTranslations('weeklyChallenges');
  const tCommon = useTranslations('common');

  const { data: challenge, isLoading } = useQuery<WeeklyChallenge>({
    queryKey: ['current-challenge'],
    queryFn: async () => {
      const { data } = await api.get('/viral/challenges/current');
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 flex justify-center">
          <TrophyIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('empty.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(challenge.endsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8">
      {/* Challenge Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                {t('badges.weekly')}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                {t('badges.daysRemaining', { count: daysLeft })}
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-3">{challenge.title}</h2>
            <p className="text-xl opacity-90">{challenge.description}</p>
          </div>
          <div className="text-right">
            <div className="mb-2 flex justify-end">
              <TrophyIcon className="h-16 w-16" />
            </div>
            <div className="text-3xl font-bold">{challenge.reward}</div>
            <div className="text-sm opacity-90">{tCommon('credits')}</div>
          </div>
        </div>

        {/* Progress target */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">{t('reward.target')}</span>
            <span className="text-2xl font-bold">{challenge.targetValue}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('leaderboard.title')}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('leaderboard.participants', { count: challenge.participations.length })}
          </span>
        </div>

        {challenge.participations.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center">
              <UserGroupIcon className="h-14 w-14 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('leaderboard.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenge.participations.map((participation, index) => (
              <LeaderboardEntry
                key={participation.id}
                participation={participation}
                rank={index + 1}
                targetValue={challenge.targetValue}
              />
            ))}
          </div>
        )}
      </div>

      {/* Challenge Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="mb-3">
            <TrophyIcon className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{t('positions.first.title')}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('positions.first.description')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
          <div className="mb-3">
            <TrophyIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{t('positions.second.title')}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('positions.second.description')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="mb-3">
            <TrophyIcon className="h-10 w-10 text-orange-600 dark:text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{t('positions.third.title')}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('positions.third.description')}
          </div>
        </div>
      </div>

      {/* Challenge Types Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
          {t('instructions.title')}
        </h4>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          {getChallengeInstructions(t, challenge.type).map((instruction, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LeaderboardEntry({
  participation,
  rank,
  targetValue,
}: {
  participation: ChallengeParticipation;
  rank: number;
  targetValue: number;
}) {
  const progress = (participation.progress / targetValue) * 100;
  const isComplete = participation.progress >= targetValue;
  const t = useTranslations('weeklyChallenges');

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />;
    if (rank === 2) return <TrophyIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />;
    if (rank === 3) return <TrophyIcon className="h-8 w-8 text-orange-600 dark:text-orange-500" />;
    return rank;
  };

  return (
    <div
      className={`p-4 rounded-xl transition-all ${
        rank <= 3
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700'
          : 'bg-gray-50 dark:bg-gray-700'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
          {rank <= 3 ? (
            getMedalIcon(rank)
          ) : (
            <span className="text-xl font-bold text-gray-500">{rank}</span>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold flex-shrink-0">
              {participation.user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {participation.user.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('leaderboard.points', { score: participation.user.generosityScore })}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('leaderboard.progress', {
                  progress: participation.progress,
                  target: targetValue,
                })}
              </span>
              <span className={`font-bold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isComplete
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Complete Badge */}
        {isComplete && (
          <div className="flex-shrink-0">
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
              {t('leaderboard.completed')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getChallengeInstructions(
  t: ReturnType<typeof useTranslations>,
  type: string
): string[] {
  const normalize = (value: unknown): string[] | null => {
    if (Array.isArray(value)) return value as string[];
    if (value && typeof value === 'object') {
      return Object.values(value as Record<string, string>);
    }
    if (typeof value === 'string') return [value];
    return null;
  };

  const specific = normalize(t.raw(`instructions.${type}`));
  if (specific && specific.length > 0) {
    return specific;
  }

  const fallback = normalize(t.raw('instructions.default'));
  return fallback ?? [];
}

// Memoize component to prevent unnecessary re-renders
export default memo(WeeklyChallenges);
