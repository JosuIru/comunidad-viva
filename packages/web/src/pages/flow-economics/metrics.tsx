import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ScaleIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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

export default function FlowMetricsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem('user');
      if (!user) {
        setShouldRedirect(true);
        setIsCheckingAuth(false);
        router.push('/auth/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'ADMIN') {
          setIsCheckingAuth(false);
          // No redirigir, mostrar mensaje de acceso denegado
          return;
        }

        setIsAdmin(true);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setShouldRedirect(true);
        setIsCheckingAuth(false);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const { data: metrics, isLoading } = useQuery<EconomicMetrics>({
    queryKey: ['flow-metrics'],
    queryFn: async () => {
      const response = await api.get('/flow-economics/metrics');
      return response.data;
    },
    enabled: isAdmin && !isCheckingAuth,
  });

  const { data: giniData } = useQuery({
    queryKey: ['gini-index'],
    queryFn: async () => {
      const response = await api.get('/flow-economics/gini');
      return response.data;
    },
    enabled: isAdmin && !isCheckingAuth,
  });

  const getGiniColor = (gini: number) => {
    if (gini < 0.3) return 'text-green-600 dark:text-green-400';
    if (gini < 0.4) return 'text-blue-600 dark:text-blue-400';
    if (gini < 0.5) return 'text-yellow-600 dark:text-yellow-400';
    if (gini < 0.6) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGiniBadge = (gini: number) => {
    if (gini < 0.3) return { text: 'Excelente', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (gini < 0.4) return { text: 'Bueno', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    if (gini < 0.5) return { text: 'Aceptable', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    if (gini < 0.6) return { text: 'Preocupante', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    return { text: 'Crítico', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
  };

  if (isCheckingAuth) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin && !shouldRedirect) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acceso Restringido
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esta página solo está disponible para administradores del sistema.
            </p>
            <Link
              href="/flow-economics"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Volver al Dashboard de Economía
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const badge = giniData ? getGiniBadge(giniData.giniIndex) : null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/flow-economics"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver al Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Métricas Económicas Detalladas
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis profundo de la salud económica del sistema
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <BanknotesIcon className="h-8 w-8 text-blue-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                TOTAL EN CIRCULACIÓN
              </span>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {metrics?.totalCredits?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              créditos totales
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                VELOCIDAD
              </span>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {metrics?.averageVelocity?.toFixed(2) || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              transacciones/día promedio
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <SparklesIcon className="h-8 w-8 text-purple-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                MULTIPLICADOR
              </span>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {metrics?.averageFlowMultiplier?.toFixed(2) || 0}x
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              bonus promedio de flujo
            </p>
          </div>
        </div>

        {/* Gini Index Section */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <ScaleIcon className="h-10 w-10 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Índice de Gini
                </h2>
                {badge && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                    {badge.text}
                  </span>
                )}
              </div>
              <p className={`text-6xl font-bold mb-4 ${getGiniColor(giniData?.giniIndex || 0)}`}>
                {giniData?.giniIndex?.toFixed(3) || 0}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                {giniData?.interpretation}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Interpretación:
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    0.00 - 0.30: Distribución muy equitativa
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    0.30 - 0.40: Distribución equitativa
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    0.40 - 0.50: Distribución aceptable
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    0.50 - 0.60: Desigualdad moderada
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    0.60 - 1.00: Alta desigualdad
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Pool Balances */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">💰</span>
            Pools Comunitarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚨</span>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pool de Emergencias
                </h3>
              </div>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                {metrics?.poolBalance?.EMERGENCY?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Disponible para emergencias comunitarias
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏘️</span>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pool Comunitario
                </h3>
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {metrics?.poolBalance?.COMMUNITY?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Para proyectos y necesidades comunitarias
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 rounded-lg p-6 border-2 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎁</span>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pool de Recompensas
                </h3>
              </div>
              <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {metrics?.poolBalance?.REWARDS?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Para incentivar participación activa
              </p>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Usuarios Activos
            </h3>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {metrics?.activeUsers || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              usuarios con transacciones en los últimos 30 días
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔄 Transacciones de Flujo
            </h3>
            <p className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {metrics?.totalFlowTransactions?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              transacciones con multiplicador aplicado
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
