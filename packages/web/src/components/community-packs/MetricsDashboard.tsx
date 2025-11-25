import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Award, Calendar } from 'lucide-react';
import { getCommunityPack } from '@/lib/communityPacks';
import type { OrganizedCommunityType } from '@/lib/communityPacks';

interface Metric {
  id: string;
  metricKey: string;
  value: number;
  previousValue: number | null;
  lastUpdated: Date;
  notes: string | null;
}

interface MetricConfig {
  key: string;
  name: string;
  unit: string;
  icon: string;
  description: string;
  targetValue?: number;
}

interface MetricsDashboardProps {
  communityId: string;
  packType: OrganizedCommunityType;
}

export default function MetricsDashboard({ communityId, packType }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const packConfig = getCommunityPack(packType);

  useEffect(() => {
    fetchMetrics();
  }, [communityId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community-packs/communities/${communityId}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading metrics');
    } finally {
      setLoading(false);
    }
  };

  const getMetricConfig = (metricKey: string): MetricConfig | undefined => {
    return packConfig?.metrics.find((m) => m.key === metricKey);
  };

  const calculateProgress = (value: number, target?: number): number => {
    if (!target) return 0;
    return Math.min(Math.round((value / target) * 100), 100);
  };

  const calculateChange = (current: number, previous: number | null): number | null => {
    if (previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'EUR') {
      return `€${value.toLocaleString()}`;
    } else if (unit === '%') {
      return `${value}%`;
    } else if (unit === 'kg') {
      return `${value.toLocaleString()} kg`;
    } else {
      return `${value.toLocaleString()} ${unit}`;
    }
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Panel de Métricas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza el impacto de tu comunidad
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const config = getMetricConfig(metric.metricKey);
          if (!config) return null;

          const progress = calculateProgress(metric.value, config.targetValue);
          const change = calculateChange(metric.value, metric.previousValue);
          const hasTarget = config.targetValue !== undefined;

          return (
            <div
              key={metric.id}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-6 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 hover:shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{config.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {config.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatValue(metric.value, config.unit)}
                </div>

                {/* Change indicator */}
                {change !== null && (
                  <div className="flex items-center gap-1 mt-2">
                    {change > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          +{change.toFixed(1)}%
                        </span>
                      </>
                    ) : change < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          {change.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Sin cambios</span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress bar (if has target) */}
              {hasTarget && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Objetivo
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatValue(config.targetValue!, config.unit)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        progress >= 100
                          ? 'bg-green-600'
                          : progress >= 75
                          ? 'bg-green-500'
                          : progress >= 50
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{progress}%</span>
                    {progress >= 100 && (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        ¡Objetivo alcanzado!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Last updated */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>Actualizado {formatDate(metric.lastUpdated)}</span>
              </div>

              {/* Notes */}
              {metric.notes && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                  {metric.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {metrics.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay métricas registradas aún
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Las métricas se irán actualizando conforme uses la plataforma
          </p>
        </div>
      )}
    </div>
  );
}
