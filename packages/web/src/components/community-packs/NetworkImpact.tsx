import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Network, Award, TrendingUp, Users } from 'lucide-react';

interface CommunityImpact {
  communityId: string;
  communityName: string;
  bridgeCount: number;
  networkReach: number;
  centralityScore: number;
  influenceScore: number;
  reputation: 'emerging' | 'established' | 'hub' | 'connector';
}

interface NetworkImpactProps {
  communityId: string;
}

export default function NetworkImpact({ communityId }: NetworkImpactProps) {
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpact();
  }, [communityId]);

  const fetchImpact = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/community-packs/network/impact/${communityId}`);
      setImpact(response.data);
    } catch (error) {
      console.error('Error fetching impact:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationConfig = (reputation: string) => {
    const configs: Record<
      string,
      { label: string; color: string; icon: string; description: string }
    > = {
      hub: {
        label: 'Hub de Red',
        color: 'from-purple-500 to-purple-600',
        icon: '🌟',
        description: 'Centro neurálgico con alta conectividad e influencia',
      },
      connector: {
        label: 'Conector',
        color: 'from-blue-500 to-blue-600',
        icon: '🔗',
        description: 'Conecta diferentes ecosistemas y comunidades',
      },
      established: {
        label: 'Establecida',
        color: 'from-green-500 to-green-600',
        icon: '✅',
        description: 'Presencia sólida en la red local',
      },
      emerging: {
        label: 'Emergente',
        color: 'from-yellow-500 to-yellow-600',
        icon: '🌱',
        description: 'Nueva en la red, en crecimiento',
      },
    };
    return configs[reputation] || configs.emerging;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No se pudo cargar el impacto de red
        </p>
      </div>
    );
  }

  const reputationConfig = getReputationConfig(impact.reputation);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Network className="h-5 w-5 text-blue-600" />
        Impacto en la Red
      </h3>

      {/* Reputation Badge */}
      <div className="mb-6">
        <div
          className={`bg-gradient-to-r ${reputationConfig.color} text-white rounded-xl p-6 text-center`}
        >
          <div className="text-5xl mb-2">{reputationConfig.icon}</div>
          <h4 className="text-2xl font-bold mb-1">{reputationConfig.label}</h4>
          <p className="text-sm opacity-90">{reputationConfig.description}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Bridge Count */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Conexiones Directas
            </span>
            <Network className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {impact.bridgeCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Puentes activos con otras comunidades
          </div>
        </div>

        {/* Network Reach */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Alcance de Red
            </span>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {impact.networkReach}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Comunidades alcanzables en la red
          </div>
        </div>

        {/* Centrality Score */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Centralidad
            </span>
            <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {(impact.centralityScore * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Posición central en la red
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
              style={{ width: `${impact.centralityScore * 100}%` }}
            />
          </div>
        </div>

        {/* Influence Score */}
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Influencia
            </span>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {impact.influenceScore.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Score ponderado por fuerza de conexiones
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {impact.bridgeCount === 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              💡 Tu comunidad aún no tiene conexiones. ¡Explora las recomendaciones para conectar
              con otras comunidades!
            </p>
          </div>
        )}

        {impact.reputation === 'hub' && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              🌟 ¡Felicidades! Tu comunidad es un hub de la red. Consideren ofrecer mentoría a
              comunidades emergentes.
            </p>
          </div>
        )}

        {impact.reputation === 'connector' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              🔗 Tu comunidad conecta diferentes ecosistemas. Esto es valioso para el intercambio
              de conocimiento entre grupos diversos.
            </p>
          </div>
        )}

        {impact.networkReach > 5 && impact.centralityScore < 0.3 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100">
              ✨ Tienes buen alcance de red. Considera fortalecer algunas conexiones clave para
              aumentar tu centralidad.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
