'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TimeBankStatsProps {
  userId?: string;
}

export default function TimeBankStats({ userId }: TimeBankStatsProps) {
  const t = useTranslations('timebankStats');
  const router = useRouter();
  const userLocale = router.locale || 'es';

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['timebank', 'stats', userId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/timebank/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('stats-fetch-error');
      return response.json();
    },
    enabled: !!userId,
  });

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-sm text-red-700">{t('errors.load')}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatHours = (value: number) =>
    new Intl.NumberFormat(userLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);

  const formatDecimal = (value: number) =>
    new Intl.NumberFormat(userLocale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);

  const hoursProvided = stats.hoursProvided ?? 0;
  const hoursReceived = stats.hoursReceived ?? 0;
  const transactionsCompleted = stats.transactionsCompleted ?? 0;
  const averageRating = stats.averageRating ?? 0;
  const totalRatings = stats.totalRatings ?? 0;
  const balance = hoursProvided - hoursReceived;
  const formattedBalance =
    balance > 0 ? `+${formatDecimal(balance)}` : formatDecimal(balance);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {t('title')}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hours provided */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {formatHours(hoursProvided)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t('metrics.hoursProvided')}
          </div>
        </div>

        {/* Hours received */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {formatHours(hoursReceived)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t('metrics.hoursReceived')}
          </div>
        </div>

        {/* Transactions completed */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">
            {new Intl.NumberFormat(userLocale).format(transactionsCompleted)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t('metrics.transactions')}
          </div>
        </div>

        {/* Average rating */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-1">
            {averageRating > 0 ? formatDecimal(averageRating) : '-'}
            {averageRating > 0 && <span className="text-xl">⭐</span>}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t('metrics.rating')}
            {totalRatings > 0 && (
              <span className="text-xs block text-gray-500">
                {t('metrics.ratingCount', { count: totalRatings })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Balance info */}
      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('balance.title')}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {t('balance.description')}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                balance > 0
                  ? 'text-green-600'
                  : balance < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {formattedBalance}
              {t('balance.unit')}
            </div>
          </div>
        </div>
      </div>

      {/* Motivation message */}
      {transactionsCompleted === 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium">{t('motivation.tipTitle')}</p>
          <p className="mt-1">{t('motivation.tipDescription')}</p>
        </div>
      )}

      {transactionsCompleted > 0 && averageRating >= 4.5 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p className="font-medium">{t('motivation.greatTitle')}</p>
          <p className="mt-1">{t('motivation.greatDescription')}</p>
        </div>
      )}
    </div>
  );
}
