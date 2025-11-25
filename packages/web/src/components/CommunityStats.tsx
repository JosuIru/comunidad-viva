import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import Tooltip from './Tooltip';

function CommunityStats() {
  const t = useTranslations('communityStats');
  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: () => api.get('/analytics/community/metrics', {
      suppressToast: true, // Don't show error toast for permission errors
    } as any),
    retry: false, // Don't retry on 403 errors
  });

  const metrics = stats?.data?.[0] || {};

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.activeUsers || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('activeUsers')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.hoursExchanged || 0}h
            </p>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              {t('hoursShared')}
              <Tooltip content="Horas intercambiadas a través del banco de tiempo. 1 hora de cualquier habilidad = 1 hora.">
                <InformationCircleIcon className="h-4 w-4 cursor-help" />
              </Tooltip>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              €{metrics.eurosSaved || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalSavings')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {metrics.co2Avoided || 0}kg
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('co2Avoided')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(CommunityStats);
