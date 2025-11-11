import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '@/lib/api';

interface MetricHistoryPoint {
  date: string;
  value: number;
  note?: string;
}

interface Metric {
  id: string;
  metricKey: string;
  metricName: string;
  currentValue: number;
  targetValue?: number;
  unit?: string;
  period: string;
  history: MetricHistoryPoint[];
  updatedAt: string;
}

interface MetricsChartProps {
  communityId: string;
  metricKey?: string; // Si se especifica, muestra solo esa métrica
  showComparison?: boolean; // Mostrar valor objetivo
  chartType?: 'line' | 'area';
  height?: number;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export default function MetricsChart({
  communityId,
  metricKey,
  showComparison = true,
  chartType = 'area',
  height = 300,
  timeRange = '30d',
}: MetricsChartProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(metricKey || null);

  useEffect(() => {
    fetchMetrics();
  }, [communityId, timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/community-packs/communities/${communityId}/metrics`);
      setMetrics(response.data);

      if (!selectedMetric && response.data.length > 0) {
        setSelectedMetric(response.data[0].metricKey);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const metric = metrics.find((m) => m.metricKey === selectedMetric);
    if (!metric) return [];

    let historyData = [...(metric.history || [])];

    // Filtrar por rango de tiempo
    if (timeRange !== 'all') {
      const now = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      historyData = historyData.filter((point) => {
        return new Date(point.date) >= cutoffDate;
      });
    }

    // Agregar punto actual
    const data = [
      ...historyData.map((point) => ({
        date: new Date(point.date).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
        }),
        value: point.value,
        target: metric.targetValue || null,
      })),
      {
        date: new Date(metric.updatedAt).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
        }),
        value: metric.currentValue,
        target: metric.targetValue || null,
      },
    ];

    return data;
  };

  const getCurrentMetric = () => {
    return metrics.find((m) => m.metricKey === selectedMetric);
  };

  const formatValue = (value: number) => {
    const metric = getCurrentMetric();
    if (!metric) return value;

    const unit = metric.unit || '';

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    }

    return `${value.toFixed(0)} ${unit}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-6" style={{ height }}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center" style={{ height }}>
        <p className="text-gray-500 dark:text-gray-400">No hay métricas disponibles</p>
      </div>
    );
  }

  const chartData = getChartData();
  const currentMetric = getCurrentMetric();

  if (!currentMetric) return null;

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {/* Header con selector de métrica */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentMetric.metricName}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {formatValue(currentMetric.currentValue)}
              </span>
              {currentMetric.targetValue && (
                <span className="text-sm text-gray-500 ml-2">
                  / {formatValue(currentMetric.targetValue)} objetivo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Selector de métrica */}
        {!metricKey && (
          <select
            value={selectedMetric || ''}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {metrics.map((metric) => (
              <option key={metric.metricKey} value={metric.metricKey}>
                {metric.metricName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Gráfica */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tickFormatter={formatValue}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatValue(value), 'Valor']}
            />
            <Legend />

            {chartType === 'area' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Valor actual"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                {showComparison && currentMetric.targetValue && (
                  <Area
                    type="monotone"
                    dataKey="target"
                    name="Objetivo"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                )}
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Valor actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                {showComparison && currentMetric.targetValue && (
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Objetivo"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos históricos disponibles
          </p>
        </div>
      )}

      {/* Footer con estadísticas */}
      {chartData.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cambio</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {chartData.length > 1 && (
                  <>
                    {((chartData[chartData.length - 1].value - chartData[0].value) /
                      chartData[0].value) *
                      100 >
                    0
                      ? '+'
                      : ''}
                    {(
                      ((chartData[chartData.length - 1].value - chartData[0].value) /
                        chartData[0].value) *
                      100
                    ).toFixed(1)}
                    %
                  </>
                )}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Máximo</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatValue(Math.max(...chartData.map((d) => d.value)))}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Mínimo</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatValue(Math.min(...chartData.map((d) => d.value)))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
