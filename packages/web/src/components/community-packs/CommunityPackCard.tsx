import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, CheckCircle, Clock, TrendingUp, Network, Award } from 'lucide-react';

interface CommunityPackCardProps {
  communityId: string;
  communitySlug: string;
  isAdmin?: boolean;
}

interface PackData {
  id: string;
  packType: 'CONSUMER_GROUP' | 'HOUSING_COOP' | 'COMMUNITY_BAR';
  setupCompleted: boolean;
  setupProgress: number;
  enabledFeatures: string[];
  setupSteps: Array<{
    id: string;
    stepKey: string;
    title: string;
    completed: boolean;
    order: number;
  }>;
  metrics: Array<{
    id: string;
    metricKey: string;
    value: number;
    unit?: string;
  }>;
}

export default function CommunityPackCard({ communityId, communitySlug, isAdmin = false }: CommunityPackCardProps) {
  const [pack, setPack] = useState<PackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bridgesCount, setBridgesCount] = useState(0);

  useEffect(() => {
    fetchPack();
    fetchBridges();
  }, [communityId]);

  const fetchPack = async () => {
    try {
      const response = await fetch(`/api/community-packs/communities/${communityId}`);
      if (response.ok) {
        const data = await response.json();
        setPack(data);
      }
    } catch (error) {
      console.error('Error fetching pack:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBridges = async () => {
    try {
      const response = await fetch(`/api/community-packs/communities/${communityId}/bridges`);
      if (response.ok) {
        const data = await response.json();
        setBridgesCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching bridges:', error);
    }
  };

  const getPackName = (type: string): string => {
    const names: Record<string, string> = {
      CONSUMER_GROUP: 'Grupo de Consumo',
      HOUSING_COOP: 'Cooperativa de Vivienda',
      COMMUNITY_BAR: 'Bar Comunitario',
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

  const getPackDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      CONSUMER_GROUP: 'Compra colectiva de productos locales y ecológicos',
      HOUSING_COOP: 'Vivienda cooperativa en cesión de uso',
      COMMUNITY_BAR: 'Espacio social gestionado por la comunidad',
    };
    return descriptions[type] || '';
  };

  const formatMetricName = (key: string): string => {
    const names: Record<string, string> = {
      monthly_savings: 'Ahorro Mensual',
      active_members: 'Miembros Activos',
      orders_completed: 'Pedidos',
      local_producers: 'Productores',
      kg_local_food: 'Comida Local',
      co2_avoided: 'CO2 Evitado',
      tool_uses: 'Usos',
      space_bookings: 'Reservas',
      events_hosted: 'Eventos',
      participation_rate: 'Participación',
      local_suppliers: 'Proveedores',
    };
    return names[key] || key;
  };

  const formatValue = (key: string, value: number): string => {
    if (key.includes('savings')) return `€${value.toLocaleString()}`;
    if (key.includes('kg')) return `${value.toLocaleString()} kg`;
    if (key.includes('co2')) return `${value.toLocaleString()} kg`;
    if (key.includes('rate')) return `${value}%`;
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!pack) {
    // No pack configured yet
    if (isAdmin) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border-2 border-green-200 dark:border-green-700 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Package className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Configura tu Pack de Comunidad Organizada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Optimiza tu comunidad con herramientas específicas para grupos de consumo,
                cooperativas de vivienda o bares comunitarios. Obtén guías, métricas y recursos
                adaptados a tu tipo de organización.
              </p>
              <Link
                href={`/communities/${communitySlug}/setup-pack`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Package className="h-5 w-5" />
                Configurar Pack
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return null; // Don't show anything to non-admins if no pack configured
  }

  // Pack is configured - show information
  const completedSteps = pack.setupSteps.filter((s) => s.completed).length;
  const totalSteps = pack.setupSteps.length;
  const topMetrics = pack.metrics.slice(0, 4);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{getPackIcon(pack.packType)}</div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  Pack Activo
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getPackName(pack.packType)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getPackDescription(pack.packType)}
              </p>
            </div>
          </div>

          {isAdmin && (
            <Link
              href={`/communities/${communitySlug}/pack-dashboard`}
              className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
              Gestionar
            </Link>
          )}
        </div>
      </div>

      {/* Setup Progress */}
      {!pack.setupCompleted && (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Configuración en progreso
            </h4>
            <span className="ml-auto text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              {completedSteps} / {totalSteps} pasos
            </span>
          </div>
          <div className="h-2 bg-yellow-200 dark:bg-yellow-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-600 dark:bg-yellow-500 transition-all duration-500"
              style={{ width: `${pack.setupProgress}%` }}
            />
          </div>
          {isAdmin && (
            <Link
              href={`/communities/${communitySlug}/setup-pack`}
              className="mt-3 inline-flex items-center text-sm font-semibold text-yellow-700 dark:text-yellow-400 hover:text-yellow-800"
            >
              Continuar configuración →
            </Link>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Metrics */}
          {topMetrics.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                Métricas Clave
              </h4>
              <div className="space-y-3">
                {topMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMetricName(metric.metricKey)}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatValue(metric.metricKey, metric.value)}
                    </span>
                  </div>
                ))}
              </div>
              {pack.metrics.length > 4 && (
                <Link
                  href={`/communities/${communitySlug}/pack-dashboard`}
                  className="mt-3 block text-center text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700"
                >
                  Ver todas las métricas →
                </Link>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Estado
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Configuración</span>
                <div className="flex items-center gap-2">
                  {pack.setupCompleted ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Completa
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        {pack.setupProgress}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Funciones activas</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {pack.enabledFeatures.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Network className="h-4 w-4" />
                  Conexiones
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {bridgesCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Bridges Link */}
        {bridgesCount > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/communities/${communitySlug}/bridges`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Network className="h-5 w-5" />
              Ver red de conexiones ({bridgesCount})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
