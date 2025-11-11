import { useState, useEffect } from 'react';
import { Network, LinkHorizontal, Users, GitBranch, Heart, TrendingUp } from 'lucide-react';

interface Bridge {
  id: string;
  bridgeType: 'GEOGRAPHIC' | 'THEMATIC' | 'SPONTANEOUS' | 'MENTORSHIP' | 'SUPPLY_CHAIN' | 'FEDERATION';
  strength: number;
  sharedMembers?: number;
  sourceCommunity: {
    id: string;
    name: string;
    slug: string;
    location?: string;
    onboardingPack?: {
      packType: string;
    };
  };
  targetCommunity: {
    id: string;
    name: string;
    slug: string;
    location?: string;
    onboardingPack?: {
      packType: string;
    };
  };
}

interface BridgesVisualizationProps {
  communityId: string;
  communityName?: string;
}

export default function BridgesVisualization({ communityId, communityName }: BridgesVisualizationProps) {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBridges();
  }, [communityId]);

  const fetchBridges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community-packs/communities/${communityId}/bridges`);
      if (!response.ok) throw new Error('Failed to fetch bridges');
      const data = await response.json();
      setBridges(data);
    } catch (err) {
      console.error('Error fetching bridges:', err);
      setError('Error al cargar las conexiones');
    } finally {
      setLoading(false);
    }
  };

  const getBridgeIcon = (type: Bridge['bridgeType']) => {
    const icons = {
      GEOGRAPHIC: '📍',
      THEMATIC: '🎯',
      SPONTANEOUS: '✨',
      MENTORSHIP: '🎓',
      SUPPLY_CHAIN: '🔗',
      FEDERATION: '🌐',
    };
    return icons[type] || '🔗';
  };

  const getBridgeColor = (type: Bridge['bridgeType']) => {
    const colors = {
      GEOGRAPHIC: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
      THEMATIC: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
      SPONTANEOUS: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
      MENTORSHIP: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
      SUPPLY_CHAIN: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
      FEDERATION: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700',
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-700 border-gray-300';
  };

  const getBridgeName = (type: Bridge['bridgeType']) => {
    const names = {
      GEOGRAPHIC: 'Proximidad Geográfica',
      THEMATIC: 'Temática Común',
      SPONTANEOUS: 'Conexión Espontánea',
      MENTORSHIP: 'Mentoría',
      SUPPLY_CHAIN: 'Cadena de Suministro',
      FEDERATION: 'Federación',
    };
    return names[type] || type;
  };

  const getConnectedCommunity = (bridge: Bridge) => {
    return bridge.sourceCommunity.id === communityId
      ? bridge.targetCommunity
      : bridge.sourceCommunity;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (bridges.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <Network className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Sin conexiones detectadas aún
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            A medida que tu comunidad crezca y se relacione con otras, aparecerán aquí las conexiones
            detectadas automáticamente.
          </p>
        </div>
      </div>
    );
  }

  // Group bridges by type
  const bridgesByType = bridges.reduce((acc, bridge) => {
    if (!acc[bridge.bridgeType]) {
      acc[bridge.bridgeType] = [];
    }
    acc[bridge.bridgeType].push(bridge);
    return acc;
  }, {} as Record<string, Bridge[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
        <div className="flex items-center gap-3 mb-2">
          <Network className="h-8 w-8 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Red de Conexiones
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {communityName || 'Tu comunidad'} está conectada con {bridges.length}{' '}
          {bridges.length === 1 ? 'comunidad' : 'comunidades'} a través de diferentes tipos de
          puentes.
        </p>
      </div>

      {/* Bridges by Type */}
      {Object.entries(bridgesByType).map(([type, typeBridges]) => (
        <div
          key={type}
          className={`rounded-xl border-2 p-6 ${getBridgeColor(type as Bridge['bridgeType'])}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{getBridgeIcon(type as Bridge['bridgeType'])}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {getBridgeName(type as Bridge['bridgeType'])}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {typeBridges.length} {typeBridges.length === 1 ? 'conexión' : 'conexiones'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {typeBridges.map((bridge) => {
              const connectedCommunity = getConnectedCommunity(bridge);
              return (
                <div
                  key={bridge.id}
                  className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <a
                        href={`/communities/${connectedCommunity.slug}`}
                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
                      >
                        {connectedCommunity.name}
                      </a>
                      {connectedCommunity.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📍 {connectedCommunity.location}
                        </p>
                      )}
                      {bridge.sharedMembers && bridge.sharedMembers > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>{bridge.sharedMembers} miembros compartidos</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {Math.round(bridge.strength * 100)}% fuerza
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Strength bar */}
                  <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                      style={{ width: `${bridge.strength * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tipos de Conexiones
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Proximidad Geográfica</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comunidades cercanas (menos de 50 km)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Temática Común</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mismo tipo de comunidad organizada
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Conexión Espontánea</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Miembros compartidos entre comunidades
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Mentoría</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comunidad experimentada guía a otra nueva
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
