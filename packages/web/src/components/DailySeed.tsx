import { memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { HelpTooltip, CommonTooltips } from './Tooltip';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface DailySeedChallenge {
  id: string;
  date: string;
  type: string;
  challenge: string;
  description: string;
  creditsReward: number;
  participantsCount: number;
  completed?: boolean;
}

function DailySeed() {
  const queryClient = useQueryClient();
  const t = useTranslations('dailySeed');

  // Fetch today's challenge
  const { data: challenge, isLoading } = useQuery<DailySeedChallenge>({
    queryKey: ['dailySeed'],
    queryFn: async () => {
      const { data } = await api.get('/challenges/today/me');
      return data;
    },
  });

  // Complete challenge mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/challenges/today/complete');
      return data;
    },
    onSuccess: (data) => {
      const fallback = t('toast.success', { credits: data.creditsAwarded });
      toast.success(data.message || fallback);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dailySeed'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('toast.error');
      toast.error(message);
    },
  });

  const handleComplete = () => {
    if (challenge?.completed) {
      toast.error(t('toast.alreadyCompleted'));
      return;
    }
    completeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-6 w-48 bg-white/20 dark:bg-white/30 rounded mb-2"></div>
              <div className="h-4 w-64 bg-white/20 dark:bg-white/30 rounded"></div>
            </div>
            <div className="h-10 w-40 bg-white/20 dark:bg-white/30 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <div data-tooltip="daily-seed" className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              {t('title')} <SparklesIcon className="h-5 w-5" />
              <HelpTooltip content={CommonTooltips.semilla} />
            </h3>
            <p className="text-white/90 dark:text-white/95">{challenge.challenge}</p>
            {challenge.description && (
              <p className="text-sm text-white/70 dark:text-white/80 mt-1">{challenge.description}</p>
            )}
            {challenge.participantsCount > 0 && (
              <p className="text-xs text-white/60 dark:text-white/70 mt-2">
                {t('participants', { count: challenge.participantsCount })}
              </p>
            )}
          </div>
          <button
            onClick={handleComplete}
            disabled={challenge.completed || completeMutation.isPending}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              challenge.completed
                ? 'bg-white/30 dark:bg-white/20 text-white/70 dark:text-white/60 cursor-not-allowed'
                : 'bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-200'
            } ${completeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {challenge.completed
              ? t('button.completed')
              : completeMutation.isPending
              ? t('button.loading')
              : t('button.action', { credits: challenge.creditsReward })}
          </button>
        </div>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(DailySeed);
