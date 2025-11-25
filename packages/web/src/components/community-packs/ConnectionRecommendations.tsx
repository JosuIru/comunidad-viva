import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { ExternalLink, TrendingUp, Users, MapPin, Link as LinkIcon } from 'lucide-react';

interface CommunityNode {
  id: string;
  name: string;
  slug: string;
  packType?: string;
  memberCount: number;
  createdAt: string;
}

interface Recommendation {
  targetCommunity: CommunityNode;
  score: number;
  reasons: string[];
  potentialBridgeTypes: string[];
  estimatedStrength: number;
}

interface ConnectionRecommendationsProps {
  communityId: string;
}

export default function ConnectionRecommendations({
  communityId,
}: ConnectionRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [communityId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/community-packs/network/recommendations/${communityId}`,
      );
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackTypeIcon = (packType?: string) => {
    switch (packType) {
      case 'CONSUMER_GROUP':
        return '🥬';
      case 'HOUSING_COOP':
        return '🏠';
      case 'COMMUNITY_BAR':
        return '☕';
      default:
        return '📦';
    }
  };

  const getBridgeTypeLabel = (bridgeType: string) => {
    const labels: Record<string, string> = {
      GEOGRAPHIC: 'Geográfico',
      THEMATIC: 'Temático',
      SUPPLY_CHAIN: 'Cadena de suministro',
      MENTORSHIP: 'Mentoría',
      SPONTANEOUS: 'Espontáneo',
    };
    return labels[bridgeType] || bridgeType;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Recomendaciones de Conexión
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No hay recomendaciones disponibles en este momento
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        Recomendaciones de Conexión
      </h3>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.targetCommunity.id}
            className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Community header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getPackTypeIcon(rec.targetCommunity.packType)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {rec.targetCommunity.name}
                      <a
                        href={`/communities/${rec.targetCommunity.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {rec.targetCommunity.memberCount} miembros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Compatibilidad
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {(rec.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${rec.score * 100}%` }}
                    />
                  </div>
                </div>

                {/* Reasons */}
                <div className="space-y-1 mb-3">
                  {rec.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                    >
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Bridge types */}
                <div className="flex flex-wrap gap-2">
                  {rec.potentialBridgeTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {getBridgeTypeLabel(type)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rank badge */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Tip:</strong> Estas recomendaciones se basan en proximidad geográfica,
          similitud de tipo, tamaño, y conexiones mutuas. Contacta a estas comunidades para
          explorar colaboraciones.
        </p>
      </div>
    </div>
  );
}
