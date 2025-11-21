import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

type EconomicLayer = 'TRADITIONAL' | 'TRANSITIONAL' | 'GIFT_PURE' | 'CHAMELEON';

interface LayerStats {
  traditional: number;
  transitional: number;
  gift: number;
  chameleon: number;
  total: number;
  percentages: {
    traditional: number;
    transitional: number;
    gift: number;
    chameleon: number;
  };
}

interface UserLayer {
  userId: string;
  currentLayer: EconomicLayer;
  migratedAt: string;
}

export default function HybridDashboard() {
  const t = useTranslations('hybrid.dashboard');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<EconomicLayer | null>(null);
  const [migrationReason, setMigrationReason] = useState('');

  // Fetch user's current layer
  const { data: userLayer, isLoading: loadingLayer } = useQuery<UserLayer>({
    queryKey: ['hybrid-layer'],
    queryFn: async () => {
      const response = await api.get('/hybrid/layer');
      return response.data;
    },
  });

  // Fetch layer statistics
  const { data: stats, isLoading: loadingStats } = useQuery<LayerStats>({
    queryKey: ['hybrid-stats'],
    queryFn: async () => {
      const response = await api.get('/hybrid/stats');
      return response.data;
    },
  });

  // Migration mutation
  const migrationMutation = useMutation({
    mutationFn: async (data: { newLayer: EconomicLayer; reason: string }) => {
      const response = await api.post('/hybrid/migrate', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.migrationSuccess'));
      queryClient.invalidateQueries({ queryKey: ['hybrid-layer'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-stats'] });
      setShowMigrationModal(false);
      setMigrationReason('');
      setSelectedLayer(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.migrationError'));
    },
  });

  const handleMigrate = () => {
    if (!selectedLayer) {
      toast.error(t('toasts.selectLayer'));
      return;
    }
    if (!migrationReason.trim()) {
      toast.error(t('toasts.explainReason'));
      return;
    }
    migrationMutation.mutate({
      newLayer: selectedLayer,
      reason: migrationReason,
    });
  };

  const layerInfo = {
    TRADITIONAL: {
      name: t('layers.traditional.name'),
      emoji: '🏦',
      color: 'blue',
      description: t('layers.traditional.description'),
      features: [t('layers.traditional.feature1'), t('layers.traditional.feature2'), t('layers.traditional.feature3')],
    },
    TRANSITIONAL: {
      name: t('layers.transitional.name'),
      emoji: '🔄',
      color: 'green',
      description: t('layers.transitional.description'),
      features: [t('layers.transitional.feature1'), t('layers.transitional.feature2'), t('layers.transitional.feature3')],
    },
    GIFT_PURE: {
      name: t('layers.giftPure.name'),
      emoji: '🎁',
      color: 'purple',
      description: t('layers.giftPure.description'),
      features: [t('layers.giftPure.feature1'), t('layers.giftPure.feature2'), t('layers.giftPure.feature3')],
    },
    CHAMELEON: {
      name: t('layers.chameleon.name'),
      emoji: '🦎',
      color: 'pink',
      description: t('layers.chameleon.description'),
      features: [t('layers.chameleon.feature1'), t('layers.chameleon.feature2'), t('layers.chameleon.feature3')],
    },
  };

  if (loadingLayer || loadingStats) {
    return (
      <Layout title={t('title')}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  const currentLayer = userLayer?.currentLayer || 'TRADITIONAL';
  const currentLayerInfo = layerInfo[currentLayer];

  return (
    <Layout title={t('title')}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">{t('header.title')}</h1>
            <p className="text-xl opacity-90">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Current Layer Card */}
          <div className="mb-8">
            <div className={`bg-gradient-to-br from-${currentLayerInfo.color}-500 to-${currentLayerInfo.color}-700 text-white rounded-lg shadow-xl p-8`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{currentLayerInfo.emoji}</div>
                  <div>
                    <p className="text-sm opacity-80">{t('currentLayer.label')}</p>
                    <h2 className="text-3xl font-bold">{currentLayerInfo.name}</h2>
                    <p className="text-lg opacity-90">{currentLayerInfo.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMigrationModal(true)}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('currentLayer.changeButton')}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentLayerInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg p-3">
                    <span className="text-xl">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('stats.title')}</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏦</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.percentages.traditional}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('layers.traditional.name')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('stats.people', { count: stats.traditional })}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔄</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.percentages.transitional}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('layers.transitional.name')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('stats.people', { count: stats.transitional })}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎁</div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.percentages.gift}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('layers.giftPure.name')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('stats.people', { count: stats.gift })}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🦎</div>
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.percentages.chameleon}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('layers.chameleon.name')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('stats.people', { count: stats.chameleon })}</div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{t('layers.traditional.name')}</span>
                      <span className="text-gray-600 dark:text-gray-300">{stats.percentages.traditional}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.traditional}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600 dark:text-green-400 font-semibold">{t('layers.transitional.name')}</span>
                      <span className="text-gray-600 dark:text-gray-300">{stats.percentages.transitional}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-600 dark:bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.transitional}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">{t('layers.giftPure.name')}</span>
                      <span className="text-gray-600 dark:text-gray-300">{stats.percentages.gift}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-purple-600 dark:bg-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.gift}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-pink-600 dark:text-pink-400 font-semibold">{t('layers.chameleon.name')}</span>
                      <span className="text-gray-600 dark:text-gray-300">{stats.percentages.chameleon}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-pink-600 dark:bg-pink-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.chameleon}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {stats.percentages.gift >= 70 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🌳</div>
                      <div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-200">{t('stats.threshold.title')}</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-300">
                          {t('stats.threshold.message', { percent: stats.percentages.gift })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Layers Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('allLayers.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(layerInfo) as EconomicLayer[]).map((layer) => {
                const info = layerInfo[layer];
                const isCurrentLayer = layer === currentLayer;
                return (
                  <div
                    key={layer}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-4 ${
                      isCurrentLayer
                        ? `border-${info.color}-500 dark:border-${info.color}-600`
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    } transition-all cursor-pointer`}
                    onClick={() => !isCurrentLayer && setShowMigrationModal(true) && setSelectedLayer(layer)}
                  >
                    {isCurrentLayer && (
                      <div className="mb-3">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                          {t('allLayers.currentBadge')}
                        </span>
                      </div>
                    )}
                    <div className="text-5xl mb-3">{info.emoji}</div>
                    <h4 className={`text-xl font-bold text-${info.color}-900 dark:text-${info.color}-300 mb-2`}>{info.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{info.description}</p>
                    <ul className="space-y-2">
                      {info.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className={`text-${info.color}-600 dark:text-${info.color}-400`}>•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('quickActions.celebrations.title')}</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('quickActions.celebrations.description')}
              </p>
              <button
                onClick={() => router.push('/hybrid/celebrations')}
                className="w-full py-2 px-4 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                {t('quickActions.celebrations.button')}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('quickActions.bridge.title')}</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('quickActions.bridge.description')}
              </p>
              <button
                onClick={() => router.push('/hybrid/bridge-events')}
                className="w-full py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {t('quickActions.bridge.button')}
              </button>
            </div>
          </div>
        </div>

        {/* Migration Modal */}
        {showMigrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('migrationModal.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('migrationModal.description')}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {(Object.keys(layerInfo) as EconomicLayer[])
                  .filter((layer) => layer !== currentLayer)
                  .map((layer) => {
                    const info = layerInfo[layer];
                    return (
                      <button
                        key={layer}
                        onClick={() => setSelectedLayer(layer)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedLayer === layer
                            ? `border-${info.color}-500 dark:border-${info.color}-600 bg-${info.color}-50 dark:bg-${info.color}-900/30`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">{info.emoji}</div>
                        <div className={`font-bold text-${info.color}-900 dark:text-${info.color}-300 mb-1`}>{info.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{info.description}</div>
                      </button>
                    );
                  })}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('migrationModal.reasonLabel')}
                </label>
                <textarea
                  value={migrationReason}
                  onChange={(e) => setMigrationReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  rows={4}
                  placeholder={t('migrationModal.reasonPlaceholder')}
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowMigrationModal(false);
                    setSelectedLayer(null);
                    setMigrationReason('');
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  {t('migrationModal.cancel')}
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={migrationMutation.isPending || !selectedLayer || !migrationReason.trim()}
                  className="flex-1 py-3 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {migrationMutation.isPending ? t('migrationModal.migrating') : t('migrationModal.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
