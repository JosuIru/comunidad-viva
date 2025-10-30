import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  GlobeAltIcon,
  HeartIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface CommunityMetrics {
  totalUsers: number;
  activeUsers: number;
  totalOffers: number;
  totalEvents: number;
  totalTransactions: number;
  totalCreditsCirculated: number;
  averageCreditsPerUser: number;
  communityEngagement: number;
  growthRate: number;
  retentionRate: number;
}

interface TimeSeriesData {
  date: string;
  users: number;
  transactions: number;
  credits: number;
  engagement: number;
}

export default function AnalyticsDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAdmin(userData.role === 'ADMIN');
    }

    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  // Fetch community metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<CommunityMetrics>({
    queryKey: ['community-metrics', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/community/metrics', {
        params: { startDate, endDate },
      });
      return response.data;
    },
    enabled: isAdmin && !!startDate && !!endDate,
  });

  // Fetch time series data
  const { data: timeSeries, isLoading: timeSeriesLoading } = useQuery<TimeSeriesData[]>({
    queryKey: ['analytics-timeseries', startDate, endDate, dateRange],
    queryFn: async () => {
      const response = await api.get('/analytics/timeseries', {
        params: { startDate, endDate, interval: 'day' },
      });
      return response.data;
    },
    enabled: isAdmin && !!startDate && !!endDate,
  });

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/analytics/export/csv', {
        params: { startDate, endDate },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `community-metrics-${startDate}-${endDate}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar datos');
    }
  };

  const handleDateRangeChange = (range: 'week' | 'month' | 'year') => {
    setDateRange(range);
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setDate(start.getDate() - 30);
        break;
      case 'year':
        start.setDate(start.getDate() - 365);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Acceso Restringido
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Solo los administradores pueden acceder al panel de analytics
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Exportar CSV
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Métricas e insights de la comunidad
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rango de Fechas:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDateRangeChange('week')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Última Semana
              </button>
              <button
                onClick={() => handleDateRangeChange('month')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Último Mes
              </button>
              <button
                onClick={() => handleDateRangeChange('year')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Último Año
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <span className="self-center text-gray-500">’</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {metricsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : metrics ? (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    +{metrics.growthRate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Usuarios Totales
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {metrics.activeUsers} activos ({((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(0)}%)
                </p>
              </div>

              {/* Total Transactions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <TrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Transacciones
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalTransactions.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  En el período seleccionado
                </p>
              </div>

              {/* Credits Circulated */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Créditos Circulados
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalCreditsCirculated.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Promedio: {metrics.averageCreditsPerUser.toFixed(0)} por usuario
                </p>
              </div>

              {/* Community Engagement */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Engagement
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.communityEngagement.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Retención: {metrics.retentionRate.toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Offers & Events */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-blue-600" />
                  Actividad de la Comunidad
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">=æ</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Ofertas Publicadas
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Servicios y productos
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.totalOffers}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">=Å</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Eventos Creados
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Encuentros comunitarios
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.totalEvents}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Indicators */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5 text-green-600" />
                  Indicadores de Salud
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tasa de Crecimiento
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {metrics.growthRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(metrics.growthRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tasa de Retención
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {metrics.retentionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${metrics.retentionRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Engagement Comunitario
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {metrics.communityEngagement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${metrics.communityEngagement}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Series Visualization */}
            {timeSeries && timeSeries.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  Tendencias en el Tiempo
                </h3>

                {/* Simple bar chart visualization */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Usuarios Activos
                    </h4>
                    <div className="flex items-end gap-1 h-32">
                      {timeSeries.slice(-14).map((data, idx) => {
                        const maxUsers = Math.max(...timeSeries.map(d => d.users));
                        const height = (data.users / maxUsers) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition cursor-pointer"
                              style={{ height: `${height}%` }}
                              title={`${data.users} usuarios - ${new Date(data.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-top-left">
                              {new Date(data.date).toLocaleDateString('es-ES', { day: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Transacciones Diarias
                    </h4>
                    <div className="flex items-end gap-1 h-32">
                      {timeSeries.slice(-14).map((data, idx) => {
                        const maxTx = Math.max(...timeSeries.map(d => d.transactions));
                        const height = maxTx > 0 ? (data.transactions / maxTx) * 100 : 0;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-green-500 rounded-t hover:bg-green-600 transition cursor-pointer"
                              style={{ height: `${height}%` }}
                              title={`${data.transactions} transacciones - ${new Date(data.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Insights Box */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 dark:bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                =¡ Insights Clave
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    =È Crecimiento
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {metrics.growthRate > 10
                      ? 'La comunidad está creciendo rápidamente. Considera expandir recursos.'
                      : 'Crecimiento estable. Enfócate en retención y engagement.'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    =° Economía
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {metrics.averageCreditsPerUser > 100
                      ? 'Alta circulación de créditos. La economía es saludable.'
                      : 'Considera incentivar más transacciones para mejorar la economía.'}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay datos disponibles
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Selecciona un rango de fechas para ver las métricas
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
