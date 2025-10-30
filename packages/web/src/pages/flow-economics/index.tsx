import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CircleStackIcon,
  SparklesIcon,
  ScaleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface EconomicMetrics {
  totalCredits: number;
  activeUsers: number;
  averageVelocity: number;
  poolBalance: {
    EMERGENCY: number;
    COMMUNITY: number;
    REWARDS: number;
  };
  totalFlowTransactions: number;
  averageFlowMultiplier: number;
  giniIndex: number;
}

export default function FlowEconomicsDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAdmin(userData.role === 'ADMIN');
    }
  }, []);

  // Fetch economic metrics
  const { data: metrics, isLoading } = useQuery<EconomicMetrics>({
    queryKey: ['flow-metrics'],
    queryFn: async () => {
      const response = await api.get('/flow-economics/metrics');
      return response.data;
    },
    enabled: isAdmin,
  });

  // Fetch Gini Index
  const { data: giniData } = useQuery({
    queryKey: ['gini-index'],
    queryFn: async () => {
      const response = await api.get('/flow-economics/gini');
      return response.data;
    },
    enabled: isAdmin,
  });

  const getGiniColor = (gini: number) => {
    if (gini < 0.3) return 'text-green-600';
    if (gini < 0.4) return 'text-blue-600';
    if (gini < 0.5) return 'text-yellow-600';
    if (gini < 0.6) return 'text-orange-600';
    return 'text-red-600';
  };

  const features = [
    {
      title: 'Métricas Económicas',
      description: 'Visualiza la salud de la economía en tiempo real',
      icon: ChartBarIcon,
      href: '/flow-economics/metrics',
      color: 'bg-gradient-to-br from-blue-600 to-blue-700',
      badge: isAdmin ? 'Admin' : undefined,
    },
    {
      title: 'Solicitudes de Pool',
      description: 'Gestiona solicitudes de fondos comunitarios',
      icon: CircleStackIcon,
      href: '/flow-economics/pool-requests',
      color: 'bg-gradient-to-br from-green-600 to-emerald-700',
    },
    {
      title: 'Historial de Flujo',
      description: 'Analiza métricas históricas y tendencias',
      icon: ArrowTrendingUpIcon,
      href: '/flow-economics/history',
      color: 'bg-gradient-to-br from-purple-600 to-indigo-700',
      badge: isAdmin ? 'Admin' : undefined,
    },
    {
      title: 'Enviar con Multiplicador',
      description: 'Transfiere créditos con bonus de flujo',
      icon: BanknotesIcon,
      href: '/flow-economics/send',
      color: 'bg-gradient-to-br from-orange-600 to-yellow-600',
    },
  ];

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Economía de Flujo
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema económico con multiplicadores de flujo y pools comunitarios
            </p>
          </div>

          {/* Public Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {features.filter(f => !f.badge).map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`${feature.color} p-6`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 dark:bg-opacity-20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💡 ¿Qué es la Economía de Flujo?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Un sistema económico que recompensa la velocidad de circulación del dinero.
              Cuanto más rápido circulas créditos, mayor multiplicador recibes en tus transacciones.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  🔄 Multiplicador de Flujo
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Gana hasta 2x en transacciones por circular créditos rápido
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  💰 Pools Comunitarios
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Emergencias, proyectos comunitarios y recompensas
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  📊 Economía Saludable
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Incentiva circulación y reduce acumulación
                </p>
              </div>
            </div>
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
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard de Economía de Flujo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Métricas y análisis del sistema económico
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <BanknotesIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Créditos Totales
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics?.totalCredits.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Velocidad Promedio
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics?.averageVelocity.toFixed(2) || 0}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Multiplicador Promedio
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics?.averageFlowMultiplier.toFixed(2) || 0}x
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <ScaleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Índice Gini
                </p>
                <p className={`text-3xl font-bold ${getGiniColor(giniData?.giniIndex || 0)}`}>
                  {giniData?.giniIndex.toFixed(3) || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {giniData?.interpretation}
                </p>
              </div>
            </div>

            {/* Pool Balances */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Balances de Pools Comunitarios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🚨 Emergencias
                  </h3>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {metrics?.poolBalance.EMERGENCY.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Créditos disponibles
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🏘️ Comunidad
                  </h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {metrics?.poolBalance.COMMUNITY.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Créditos disponibles
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🎁 Recompensas
                  </h3>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {metrics?.poolBalance.REWARDS.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Créditos disponibles
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className={`${feature.color} p-6`}>
                      <div className="flex items-center justify-between">
                        <Icon className="h-10 w-10 text-white" />
                        {feature.badge && (
                          <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur rounded-full text-xs font-medium text-white">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 dark:bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📊 Interpretación de Métricas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    Velocidad de Flujo
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Mide qué tan rápido circulan los créditos. Mayor velocidad = economía más saludable.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    Índice Gini
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Mide desigualdad económica. 0 = perfecta igualdad, 1 = perfecta desigualdad.
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
