import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { TrendingUp, Users, Activity, Target, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getI18nProps } from '@/lib/i18n';

interface GlobalSummary {
  totalCommunities: number;
  totalMembers: number;
  totalEvents: number;
  byType: Record<
    string,
    {
      count: number;
      totalMembers: number;
      metrics: Record<string, number>;
    }
  >;
}

export default function ImpactoDashboard() {
  const t = useTranslations('impact');
  const [summary, setSummary] = useState<GlobalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community-packs/global-summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackName = (type: string): string => {
    const names: Record<string, string> = {
      CONSUMER_GROUP: t('packTypes.consumerGroup'),
      HOUSING_COOP: t('packTypes.housingCoop'),
      COMMUNITY_BAR: t('packTypes.communityBar'),
    };
    return names[type] || type;
  };

  const getPackIcon = (type: string): string => {
    const icons: Record<string, string> = {
      CONSUMER_GROUP: '🥬',
      HOUSING_COOP: '🏠',
      COMMUNITY_BAR: '☕',
    };
    return icons[type] || '📦';
  };

  const formatMetricName = (key: string): string => {
    const names: Record<string, string> = {
      monthly_savings: t('metrics.monthlySavings'),
      active_members: t('metrics.activeMembers'),
      orders_completed: t('metrics.ordersCompleted'),
      local_producers: t('metrics.localProducers'),
      kg_local_food: t('metrics.kgLocalFood'),
      co2_avoided: t('metrics.co2Avoided'),
      tool_uses: t('metrics.toolUses'),
      space_bookings: t('metrics.spaceBookings'),
      events_hosted: t('metrics.eventsHosted'),
      local_suppliers: t('metrics.localSuppliers'),
    };
    return names[key] || key;
  };

  const formatValue = (key: string, value: number): string => {
    if (key.includes('savings') || key.includes('currency')) {
      return `€${value.toLocaleString()}`;
    } else if (key.includes('kg')) {
      return `${value.toLocaleString()} kg`;
    } else if (key.includes('rate')) {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{t('pageTitle')}</title>
        <meta
          name="description"
          content={t('pageDescription')}
        />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 text-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white font-medium mb-6">
                  <TrendingUp className="h-5 w-5" />
                  <span>{t('hero.badge')}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  {t('hero.title')}
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                  {t('hero.subtitle')}
                </p>

                {summary && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                      <div className="text-3xl sm:text-4xl font-bold mb-2">{summary.totalCommunities}</div>
                      <div className="text-sm sm:text-base text-green-100">{t('stats.activeCommunities')}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                      <div className="text-3xl sm:text-4xl font-bold mb-2">{summary.totalMembers}</div>
                      <div className="text-sm sm:text-base text-green-100">{t('stats.participatingPeople')}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                      <div className="text-3xl sm:text-4xl font-bold mb-2">{summary.totalEvents}</div>
                      <div className="text-sm sm:text-base text-green-100">{t('stats.eventsHeld')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Metrics by Type */}
          {summary && (
            <section className="py-20">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-12 text-center">
                    {t('sections.impactByType')}
                  </h2>

                  <div className="space-y-12">
                    {Object.entries(summary.byType).map(([type, data]) => (
                      <div
                        key={type}
                        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              <div className="text-4xl sm:text-5xl flex-shrink-0">{getPackIcon(type)}</div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                  {getPackName(type)}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {data.count} {data.count === 1 ? t('community') : t('communities')} ·{' '}
                                  {data.totalMembers} {t('members')}
                                </p>
                              </div>
                            </div>
                            <Link
                              href="/comunidades"
                              className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                            >
                              <span>{t('viewMore')}</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {Object.entries(data.metrics).map(([metricKey, value]) => (
                              <div
                                key={metricKey}
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                              >
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatValue(metricKey, value)}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate" title={formatMetricName(metricKey)}>
                                    {formatMetricName(metricKey)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="text-4xl sm:text-5xl mb-6">🌱</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('cta.title')}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  {t('cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/comunidades"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Users className="h-5 w-5" />
                    <span className="truncate">{t('cta.createCommunity')}</span>
                    <ArrowRight className="h-5 w-5 flex-shrink-0" />
                  </Link>
                  <Link
                    href="/communities"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
                  >
                    <Activity className="h-5 w-5" />
                    {t('cta.exploreCommunities')}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Methodology */}
          <section className="py-12 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('methodology.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('methodology.description')}
                </p>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps(context: { locale?: string }) {
  return {
    props: {
      ...(await getI18nProps(context)),
    },
  };
}
