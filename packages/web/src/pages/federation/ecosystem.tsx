import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import {
  ChartBarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ServerIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface EcosystemStats {
  totalNodes: number;
  activeNodes: number;
  totalUsers: number;
  totalSemilla: number;
  totalTransactions: number;
  totalActivities: number;
  totalCirculos: number;
  circulosMembers: number;
}

export default function EcosystemDashboard() {
  // Fetch ecosystem stats
  const { data: stats, isLoading } = useQuery<EcosystemStats>({
    queryKey: ['ecosystem-dashboard'],
    queryFn: async () => {
      const response = await api.get('/federation/ecosystem/dashboard');
      return response.data;
    },
  });

  // Fetch nodes
  const { data: nodes } = useQuery({
    queryKey: ['federation-nodes'],
    queryFn: async () => {
      const response = await api.get('/federation/nodes');
      return response.data;
    },
  });

  // Fetch semilla stats
  const { data: semillaStats } = useQuery({
    queryKey: ['semilla-stats'],
    queryFn: async () => {
      const response = await api.get('/federation/semilla/stats');
      return response.data;
    },
  });

  // Fetch círculos stats
  const { data: circulosStats } = useQuery({
    queryKey: ['circulos-stats'],
    queryFn: async () => {
      const response = await api.get('/federation/circulos/stats');
      return response.data;
    },
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const response = await api.get('/federation/feed', { params: { limit: 10 } });
      return response.data;
    },
  });

  const metrics = [
    {
      title: 'Nodos Activos',
      value: nodes?.filter((n: any) => n.status === 'ACTIVE').length || 0,
      total: nodes?.length || 0,
      icon: ServerIcon,
      color: 'bg-blue-500',
      suffix: 'activos',
    },
    {
      title: 'Suministro SEMILLA',
      value: semillaStats?.totalSupply || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      suffix: 'tokens',
    },
    {
      title: 'Usuarios Activos',
      value: semillaStats?.activeUsers || 0,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      suffix: 'usuarios',
    },
    {
      title: 'Transacciones',
      value: semillaStats?.totalTransactions || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-orange-500',
      suffix: 'total',
    },
    {
      title: 'Círculos Activos',
      value: circulosStats?.total || 0,
      icon: SparklesIcon,
      color: 'bg-indigo-500',
      suffix: 'círculos',
    },
    {
      title: 'Actividades Federadas',
      value: recentActivities?.length || 0,
      icon: GlobeAltIcon,
      color: 'bg-cyan-500',
      suffix: 'recientes',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard del Ecosistema
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Métricas y estadísticas globales de la red federada Gailu Labs
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.title}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${metric.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {metric.total && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          de {metric.total}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {metric.title}
                    </p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {metric.value.toLocaleString()}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {metric.suffix}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Network Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Nodes by Type */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Distribución de Nodos
                </h3>
                {nodes && (
                  <div className="space-y-4">
                    {['GENESIS', 'HUB', 'COMMUNITY', 'PERSONAL'].map((type) => {
                      const count = nodes.filter((n: any) => n.type === type).length;
                      const percentage = nodes.length > 0 ? (count / nodes.length) * 100 : 0;
                      const icons: Record<string, string> = {
                        GENESIS: '🌟',
                        HUB: '🔷',
                        COMMUNITY: '🏘️',
                        PERSONAL: '👤',
                      };

                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{icons[type]}</span>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {type}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Círculos Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Estadísticas de Círculos
                </h3>
                {circulosStats && (
                  <div className="space-y-4">
                    {circulosStats.byType?.map((stat: any) => {
                      const icons: Record<string, string> = {
                        APRENDIZAJE: '📚',
                        TRANSFORMACION: '✨',
                        APOYO: '🤝',
                        CREATIVIDAD: '🎨',
                        ACCION: '🌍',
                      };

                      return (
                        <div
                          key={stat.type}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{icons[stat.type]}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {stat.type}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {stat._count || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              círculos
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SEMILLA Economics */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-xl p-6 mb-8 text-white">
              <h3 className="text-xl font-semibold mb-4">Economía SEMILLA</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4">
                  <p className="text-green-100 text-sm mb-1">Suministro Total</p>
                  <p className="text-2xl font-bold">
                    {semillaStats?.totalSupply.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4">
                  <p className="text-green-100 text-sm mb-1">Transacciones</p>
                  <p className="text-2xl font-bold">
                    {semillaStats?.totalTransactions.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4">
                  <p className="text-green-100 text-sm mb-1">Usuarios Activos</p>
                  <p className="text-2xl font-bold">
                    {semillaStats?.activeUsers.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4">
                  <p className="text-green-100 text-sm mb-1">Balance Promedio</p>
                  <p className="text-2xl font-bold">
                    {semillaStats?.averageBalance.toFixed(2) || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actividad Reciente en la Red
              </h3>
              {recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {activity.actorName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.actorName}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {activity.actorNode}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {activity.content}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No hay actividad reciente
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 dark:bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                💡 Sobre el Ecosistema Gailu Labs
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                El ecosistema federado Gailu Labs conecta comunidades de economía solidaria alrededor del mundo.
                Cada nodo es independiente pero puede compartir recursos, conocimiento y valor a través de la red.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    🌍 Descentralizado
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Sin punto único de control
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    🔗 Interoperable
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Compatible con ActivityPub
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    💚 Solidario
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Basado en valores compartidos
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
