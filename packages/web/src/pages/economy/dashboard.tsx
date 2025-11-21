import { useQuery } from '@tanstack/react-query';
import { getI18nProps } from '@/lib/i18n';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface EconomicMetrics {
  giniIndex: number;
  medianBalance: number;
  meanBalance: number;
  wealthConcentration: number;
  transactionsCount: number;
  averageFlowMultiplier: number;
  totalValueGenerated: number;
  pools: Array<{
    type: string;
    balance: number;
    totalReceived: number;
    totalDistributed: number;
  }>;
  totalPoolBalance: number;
  activeUsers: number;
  generousUsers: number;
}

export default function EconomyDashboardPage() {
  const t = useTranslations('economy.dashboard');
  const { data: metrics, isLoading } = useQuery<EconomicMetrics>({
    queryKey: ['economy-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/flow-economics/metrics');
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: giniData } = useQuery<{ giniIndex: number; interpretation: string }>({
    queryKey: ['gini-index'],
    queryFn: async () => {
      const { data } = await api.get('/flow-economics/gini');
      return data;
    },
    refetchInterval: 30000,
  });

  const getGiniColor = (gini: number) => {
    if (gini < 0.3) return 'text-green-600 bg-green-100';
    if (gini < 0.4) return 'text-blue-600 bg-blue-100';
    if (gini < 0.5) return 'text-yellow-600 bg-yellow-100';
    if (gini < 0.6) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  if (!metrics) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">{t('errors.loadMetrics')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('pageTitle')}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Gini Index - Featured */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-700 dark:to-blue-700 rounded-lg shadow-lg p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/80 mb-2">{t('giniIndex.label')}</div>
                <div className="text-6xl font-bold mb-4">
                  {giniData?.giniIndex.toFixed(3) || metrics.giniIndex.toFixed(3)}
                </div>
                <div className="text-xl text-white/90">
                  {giniData?.interpretation || t('giniIndex.measuring')}
                </div>
                <div className="mt-4 text-sm text-white/70">
                  {t('giniIndex.scale')}
                </div>
              </div>
              <div className="text-8xl opacity-20">⚖️</div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Users */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('metrics.activeUsers')}</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.activeUsers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('metrics.generousUsers', { count: metrics.generousUsers })}
              </div>
            </div>

            {/* Average Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('metrics.averageBalance')}</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.meanBalance}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('metrics.median', { amount: metrics.medianBalance })}</div>
            </div>

            {/* Wealth Concentration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('metrics.wealthConcentration')}</div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.wealthConcentration.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('metrics.top10')}</div>
            </div>

            {/* Pool Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('metrics.communityPools')}</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalPoolBalance}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('metrics.creditsAvailable')}</div>
            </div>
          </div>

          {/* Flow Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Transactions Today */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('flow.transactionsToday')}</h3>
                <span className="text-3xl">💸</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {metrics.transactionsCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('flow.averageMultiplier', { multiplier: metrics.averageFlowMultiplier.toFixed(2) })}
              </div>
            </div>

            {/* Value Generated */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('flow.valueGenerated')}</h3>
                <span className="text-3xl">✨</span>
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {metrics.totalValueGenerated}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('flow.creditsCreated')}</div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">{t('quickActions.title')}</h3>
              <div className="space-y-2">
                <Link
                  href="/credits/send"
                  className="block w-full py-2 px-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors text-center"
                >
                  💸 {t('quickActions.sendCredits')}
                </Link>
                <Link
                  href="/economy/pools"
                  className="block w-full py-2 px-4 bg-white/20 dark:bg-white/10 text-white rounded-lg hover:bg-white/30 dark:hover:bg-white/20 font-medium transition-colors text-center"
                >
                  🏦 {t('quickActions.viewPools')}
                </Link>
              </div>
            </div>
          </div>

          {/* Community Pools */}
          {metrics.pools && metrics.pools.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('pools.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.pools.map((pool) => (
                  <div
                    key={pool.type}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{pool.type}</h3>
                      <span className="text-2xl">
                        {pool.type === 'NEEDS'
                          ? '🆘'
                          : pool.type === 'PROJECTS'
                          ? '🚀'
                          : pool.type === 'EMERGENCY'
                          ? '⚡'
                          : pool.type === 'CELEBRATION'
                          ? '🎉'
                          : '⚖️'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('pools.balance')}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{pool.balance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('pools.received')}</span>
                        <span className="text-gray-700 dark:text-gray-300">{pool.totalReceived}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('pools.distributed')}</span>
                        <span className="text-gray-700 dark:text-gray-300">{pool.totalDistributed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Economic Health Indicators */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('healthIndicators.title')}</h2>
            <div className="space-y-6">
              {/* Gini Index Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('healthIndicators.giniIndex')}</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${getGiniColor(metrics.giniIndex)}`}>
                    {metrics.giniIndex.toFixed(3)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      metrics.giniIndex < 0.3
                        ? 'bg-green-500'
                        : metrics.giniIndex < 0.4
                        ? 'bg-blue-500'
                        : metrics.giniIndex < 0.5
                        ? 'bg-yellow-500'
                        : metrics.giniIndex < 0.6
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.giniIndex * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Wealth Concentration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('healthIndicators.wealthConcentration')}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {metrics.wealthConcentration.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                    style={{ width: `${metrics.wealthConcentration}%` }}
                  ></div>
                </div>
              </div>

              {/* Flow Multiplier Average */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('healthIndicators.flowMultiplier')}
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {metrics.averageFlowMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-500"
                    style={{ width: `${((metrics.averageFlowMultiplier - 1) / 0.5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Footer */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
              💡 {t('info.title')}
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <p>
                {t('info.description')}
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>{t('info.bullet1')}</li>
                <li>{t('info.bullet2')}</li>
                <li>{t('info.bullet3')}</li>
                <li>{t('info.bullet4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
