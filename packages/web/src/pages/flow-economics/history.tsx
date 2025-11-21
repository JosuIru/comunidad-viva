import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';
import {
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FlowTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  multiplier: number;
  finalAmount: number;
  type: string;
  createdAt: string;
  fromUser?: {
    name: string;
    email: string;
  };
  toUser?: {
    name: string;
    email: string;
  };
}

interface HistoricalMetrics {
  date: string;
  totalTransactions: number;
  averageMultiplier: number;
  totalVolume: number;
  activeUsers: number;
}

export default function FlowHistoryPage() {
  const t = useTranslations('flowEconomics');
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem('user');
      if (!user) {
        setShouldRedirect(true);
        setIsCheckingAuth(false);
        router.push('/auth/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'ADMIN') {
          setIsCheckingAuth(false);
          // No redirigir, mostrar mensaje de acceso denegado
          return;
        }

        setIsAdmin(true);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setShouldRedirect(true);
        setIsCheckingAuth(false);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const { data: transactions, isLoading: loadingTransactions } = useQuery<FlowTransaction[]>({
    queryKey: ['flow-history', timeRange],
    queryFn: async () => {
      const response = await api.get(`/flow-economics/history?range=${timeRange}`);
      return response.data;
    },
    enabled: isAdmin && !isCheckingAuth,
  });

  const { data: historicalMetrics, isLoading: loadingMetrics } = useQuery<HistoricalMetrics[]>({
    queryKey: ['flow-metrics-history', timeRange],
    queryFn: async () => {
      const response = await api.get(`/flow-economics/metrics/history?range=${timeRange}`);
      return response.data;
    },
    enabled: isAdmin && !isCheckingAuth,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 1.5) return 'text-green-600 dark:text-green-400';
    if (multiplier >= 1.25) return 'text-blue-600 dark:text-blue-400';
    if (multiplier >= 1.1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const isLoading = loadingTransactions || loadingMetrics;

  if (isCheckingAuth) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin && !shouldRedirect) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('history.restricted.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('history.restricted.description')}
            </p>
            <Link
              href="/flow-economics"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              {t('history.restricted.backButton')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/flow-economics"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {t('history.backToDashboard')}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('history.title')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('history.description')}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1">
            {[
              { value: '7d', label: t('history.timeRange.last7days') },
              { value: '30d', label: t('history.timeRange.last30days') },
              { value: '90d', label: t('history.timeRange.last90days') },
              { value: 'all', label: t('history.timeRange.allTime') },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Historical Metrics Summary */}
            {historicalMetrics && historicalMetrics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="h-5 w-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('history.summary.totalTransactions')}
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {historicalMetrics.reduce((sum, m) => sum + m.totalTransactions, 0)}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('history.summary.averageMultiplier')}
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {(
                      historicalMetrics.reduce((sum, m) => sum + m.averageMultiplier, 0) /
                      historicalMetrics.length
                    ).toFixed(2)}
                    x
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('history.summary.totalVolume')}
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {historicalMetrics
                      .reduce((sum, m) => sum + m.totalVolume, 0)
                      .toLocaleString()}{' '}
                    <span className="text-sm text-gray-500">{t('preview.credits')}</span>
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-orange-500" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('history.summary.activeUsers')}
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.max(...historicalMetrics.map((m) => m.activeUsers))}
                  </p>
                </div>
              </div>
            )}

            {/* Daily Metrics Chart (Text-based) */}
            {historicalMetrics && historicalMetrics.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {t('history.dailyEvolution')}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('history.table.date')}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('history.table.transactions')}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('history.table.multiplier')}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('history.table.volume')}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('history.table.users')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalMetrics.map((metric, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {formatShortDate(metric.date)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                            {metric.totalTransactions}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold">
                            <span className={getMultiplierColor(metric.averageMultiplier)}>
                              {metric.averageMultiplier.toFixed(2)}x
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                            {metric.totalVolume.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                            {metric.activeUsers}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('history.recentTransactions')}
              </h2>

              {!transactions || transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('history.noTransactions.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('history.noTransactions.description')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(tx.createdAt)}
                            </span>
                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                              {tx.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {tx.fromUser?.name || t('history.user')}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {tx.toUser?.name || t('history.user')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {tx.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {tx.finalAmount.toLocaleString()}
                            </span>
                          </div>
                          <div
                            className={`text-sm font-semibold ${getMultiplierColor(
                              tx.multiplier
                            )}`}
                          >
                            {tx.multiplier.toFixed(2)}x {t('history.multiplierLabel')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
