import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

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
      toast.success('¡Migración exitosa! Bienvenido a tu nueva capa económica');
      queryClient.invalidateQueries({ queryKey: ['hybrid-layer'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-stats'] });
      setShowMigrationModal(false);
      setMigrationReason('');
      setSelectedLayer(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al migrar de capa');
    },
  });

  const handleMigrate = () => {
    if (!selectedLayer) {
      toast.error('Selecciona una capa');
      return;
    }
    if (!migrationReason.trim()) {
      toast.error('Explica por qué quieres migrar');
      return;
    }
    migrationMutation.mutate({
      newLayer: selectedLayer,
      reason: migrationReason,
    });
  };

  const layerInfo = {
    TRADITIONAL: {
      name: 'Traditional',
      emoji: '🏦',
      color: 'blue',
      description: 'Sistema capitalista con precios fijos',
      features: ['Precios en € y créditos', 'Transacciones tradicionales', 'Reviews y reputación'],
    },
    TRANSITIONAL: {
      name: 'Transitional',
      emoji: '🔄',
      color: 'green',
      description: 'Economía de regalo gradual',
      features: ['"Paga lo que recibiste"', 'Sistema pay-it-forward', 'Cadena de favores'],
    },
    GIFT_PURE: {
      name: 'Gift Pure',
      emoji: '🎁',
      color: 'purple',
      description: 'Economía de regalo pura, post-dinero',
      features: ['Sin precios ni tracking', 'Compartir abundancia', 'Expresar necesidades'],
    },
    CHAMELEON: {
      name: 'Chameleon',
      emoji: '🦎',
      color: 'pink',
      description: 'Modo experimental',
      features: ['Prueba diferentes capas', 'Sin compromiso', 'Ideal para explorar'],
    },
  };

  if (loadingLayer || loadingStats) {
    return (
      <Layout title="Sistema Híbrido - Comunidad Viva">
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const currentLayer = userLayer?.currentLayer || 'TRADITIONAL';
  const currentLayerInfo = layerInfo[currentLayer];

  return (
    <Layout title="Sistema Híbrido - Comunidad Viva">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">🔄 Sistema Híbrido de Capas Económicas</h1>
            <p className="text-xl opacity-90">
              Elige cómo quieres participar en la economía colaborativa
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
                    <p className="text-sm opacity-80">Tu capa actual</p>
                    <h2 className="text-3xl font-bold">{currentLayerInfo.name}</h2>
                    <p className="text-lg opacity-90">{currentLayerInfo.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMigrationModal(true)}
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cambiar de Capa
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📊 Distribución de la Comunidad</h3>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏦</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.percentages.traditional}%</div>
                    <div className="text-sm text-gray-600">Traditional</div>
                    <div className="text-xs text-gray-500">{stats.traditional} personas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔄</div>
                    <div className="text-3xl font-bold text-green-600">{stats.percentages.transitional}%</div>
                    <div className="text-sm text-gray-600">Transitional</div>
                    <div className="text-xs text-gray-500">{stats.transitional} personas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎁</div>
                    <div className="text-3xl font-bold text-purple-600">{stats.percentages.gift}%</div>
                    <div className="text-sm text-gray-600">Gift Pure</div>
                    <div className="text-xs text-gray-500">{stats.gift} personas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🦎</div>
                    <div className="text-3xl font-bold text-pink-600">{stats.percentages.chameleon}%</div>
                    <div className="text-sm text-gray-600">Chameleon</div>
                    <div className="text-xs text-gray-500">{stats.chameleon} personas</div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-600 font-semibold">Traditional</span>
                      <span className="text-gray-600">{stats.percentages.traditional}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.traditional}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600 font-semibold">Transitional</span>
                      <span className="text-gray-600">{stats.percentages.transitional}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.transitional}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-600 font-semibold">Gift Pure</span>
                      <span className="text-gray-600">{stats.percentages.gift}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.gift}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-pink-600 font-semibold">Chameleon</span>
                      <span className="text-gray-600">{stats.percentages.chameleon}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${stats.percentages.chameleon}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {stats.percentages.gift >= 70 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🌳</div>
                      <div>
                        <h4 className="font-bold text-purple-900">¡Umbral Alcanzado!</h4>
                        <p className="text-sm text-purple-800">
                          {stats.percentages.gift}% de la comunidad vive en economía de regalo pura.
                          ¿Quieren migrar toda la comunidad al modo GIFT_PURE?
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔄 Todas las Capas Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(layerInfo) as EconomicLayer[]).map((layer) => {
                const info = layerInfo[layer];
                const isCurrentLayer = layer === currentLayer;
                return (
                  <div
                    key={layer}
                    className={`bg-white rounded-lg shadow-lg p-6 border-4 ${
                      isCurrentLayer
                        ? `border-${info.color}-500`
                        : 'border-transparent hover:border-gray-300'
                    } transition-all cursor-pointer`}
                    onClick={() => !isCurrentLayer && setShowMigrationModal(true) && setSelectedLayer(layer)}
                  >
                    {isCurrentLayer && (
                      <div className="mb-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          ✓ Tu capa actual
                        </span>
                      </div>
                    )}
                    <div className="text-5xl mb-3">{info.emoji}</div>
                    <h4 className={`text-xl font-bold text-${info.color}-900 mb-2`}>{info.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{info.description}</p>
                    <ul className="space-y-2">
                      {info.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className={`text-${info.color}-600`}>•</span>
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">🎉 Celebraciones de Abundancia</h4>
              <p className="text-gray-600 mb-4">
                Celebra cuando tu comunidad comparte recursos generosamente
              </p>
              <button
                onClick={() => router.push('/hybrid/celebrations')}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ver Celebraciones
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">🌉 Bridge Events</h4>
              <p className="text-gray-600 mb-4">
                Experimenta temporalmente con otra capa económica
              </p>
              <button
                onClick={() => router.push('/hybrid/bridge-events')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Experimentos
              </button>
            </div>
          </div>
        </div>

        {/* Migration Modal */}
        {showMigrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Migrar a otra Capa Económica</h3>
              <p className="text-gray-600 mb-6">
                Elige la capa a la que quieres migrar y explica por qué. Tu decisión es reversible en cualquier momento.
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
                            ? `border-${info.color}-500 bg-${info.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{info.emoji}</div>
                        <div className={`font-bold text-${info.color}-900 mb-1`}>{info.name}</div>
                        <div className="text-xs text-gray-600">{info.description}</div>
                      </button>
                    );
                  })}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ¿Por qué quieres cambiar de capa?
                </label>
                <textarea
                  value={migrationReason}
                  onChange={(e) => setMigrationReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Explica tu motivación para migrar..."
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowMigrationModal(false);
                    setSelectedLayer(null);
                    setMigrationReason('');
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={migrationMutation.isPending || !selectedLayer || !migrationReason.trim()}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {migrationMutation.isPending ? 'Migrando...' : 'Confirmar Migración'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
