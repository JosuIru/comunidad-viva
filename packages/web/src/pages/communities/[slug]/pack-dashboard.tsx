import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import BridgesVisualization from '@/components/community-packs/BridgesVisualization';
import MetricsChart from '@/components/community-packs/MetricsChart';
import ConnectionRecommendations from '@/components/community-packs/ConnectionRecommendations';
import NetworkImpact from '@/components/community-packs/NetworkImpact';
import {
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Settings,
  RefreshCw,
  Download,
  Loader,
  Network,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PackData {
  id: string;
  communityId: string;
  packType: 'CONSUMER_GROUP' | 'HOUSING_COOP' | 'COMMUNITY_BAR';
  setupCompleted: boolean;
  setupProgress: number;
  currentStep?: string;
  enabledFeatures: string[];
  trackingMetrics: string[];
  completedGuides: string[];
  setupSteps: Array<{
    id: string;
    stepKey: string;
    title: string;
    description: string;
    completed: boolean;
    order: number;
  }>;
  metrics: Array<{
    id: string;
    metricKey: string;
    value: number;
    previousValue?: number;
    unit?: string;
    lastUpdated: string;
  }>;
}

export default function PackDashboardPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [pack, setPack] = useState<PackData | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'metrics' | 'setup' | 'bridges' | 'network'
  >('overview');

  useEffect(() => {
    if (slug) {
      checkAccess();
    }
  }, [slug]);

  const checkAccess = async () => {
    try {
      // Get community
      const response = await fetch(`/api/communities/slug/${slug}`);
      if (!response.ok) throw new Error('Community not found');
      const community = await response.json();
      setCommunityId(community.id);
      setCommunityName(community.name);

      // Check admin
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión');
        router.push('/auth/login');
        return;
      }

      const profileResponse = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        const memberResponse = await fetch(
          `/api/communities/${community.id}/members/${profile.id}`
        );

        if (memberResponse.ok) {
          const member = await memberResponse.json();
          if (member.role === 'ADMIN' || member.role === 'MODERATOR') {
            setIsAdmin(true);
            fetchPack(community.id);
          } else {
            toast.error('Solo los administradores pueden acceder');
            router.push(`/communities/${slug}`);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar');
      router.push(`/communities/${slug}`);
    }
  };

  const fetchPack = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community-packs/communities/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('No hay pack configurado');
          router.push(`/communities/${slug}/setup-pack`);
          return;
        }
        throw new Error('Failed to fetch pack');
      }
      const data = await response.json();
      setPack(data);
    } catch (error) {
      console.error('Error fetching pack:', error);
      toast.error('Error al cargar el pack');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateMetrics = async () => {
    if (!communityId) return;

    setRecalculating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/community-packs/communities/${communityId}/metrics/recalculate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to recalculate');

      toast.success('Métricas recalculadas');
      fetchPack(communityId);
    } catch (error) {
      console.error('Error recalculating:', error);
      toast.error('Error al recalcular métricas');
    } finally {
      setRecalculating(false);
    }
  };

  const handleCompleteStep = async (stepKey: string) => {
    if (!communityId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/community-packs/communities/${communityId}/steps/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stepKey }),
        }
      );

      if (!response.ok) throw new Error('Failed to complete step');

      toast.success('Paso completado');
      fetchPack(communityId);
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Error al completar paso');
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'report') => {
    if (!communityId) return;

    setShowExportMenu(false);

    const token = localStorage.getItem('token');
    const url = `/api/community-packs/communities/${communityId}/export/${format}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Export failed');

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `metrics-${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download =
          format === 'csv' ? `metrics-${Date.now()}.csv` : `report-${Date.now()}.txt`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
      }

      toast.success('Archivo descargado');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar');
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

  const formatMetricName = (key: string): string => {
    const names: Record<string, string> = {
      monthly_savings: 'Ahorro Mensual',
      active_members: 'Miembros Activos',
      orders_completed: 'Pedidos Completados',
      local_producers: 'Productores Locales',
      kg_local_food: 'Comida Local',
      co2_avoided: 'CO2 Evitado',
      tool_uses: 'Usos de Herramientas',
      space_bookings: 'Reservas de Espacios',
      events_hosted: 'Eventos Realizados',
      participation_rate: 'Tasa de Participación',
      local_suppliers: 'Proveedores Locales',
      savings_per_unit: 'Ahorro por Vivienda',
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

  if (!isAdmin || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!pack) return null;

  return (
    <>
      <Head>
        <title>Dashboard Pack - {communityName}</title>
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{getPackIcon(pack.packType)}</div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                      <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        {getPackName(pack.packType)}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Dashboard del Pack
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{communityName}</p>
                  </div>
                </div>

                <button
                  onClick={handleRecalculateMetrics}
                  disabled={recalculating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-5 w-5 ${recalculating ? 'animate-spin' : ''}`} />
                  Recalcular métricas
                </button>
              </div>

              {/* Progress Bar */}
              {!pack.setupCompleted && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Configuración inicial
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {pack.setupProgress}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                      style={{ width: `${pack.setupProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Vista General', icon: TrendingUp },
                { id: 'metrics', label: 'Métricas', icon: Target },
                { id: 'setup', label: 'Configuración', icon: Settings },
                { id: 'bridges', label: 'Conexiones', icon: Package },
                { id: 'network', label: 'Red & Reputación', icon: Network },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Estado
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Configuración</span>
                      {pack.setupCompleted ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          ✓ Completa
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                          {pack.setupProgress}%
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Funciones</span>
                      <span className="font-bold">{pack.enabledFeatures.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Métricas</span>
                      <span className="font-bold">{pack.metrics.length}</span>
                    </div>
                  </div>
                </div>

                {/* Top Metrics */}
                {pack.metrics.slice(0, 6).map((metric) => (
                  <div
                    key={metric.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {formatMetricName(metric.metricKey)}
                      </h3>
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {formatValue(metric.metricKey, metric.value)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Actualizado: {new Date(metric.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="space-y-6">
                {/* Gráficas temporales */}
                {communityId && (
                  <MetricsChart
                    communityId={communityId}
                    showComparison={true}
                    chartType="area"
                    height={350}
                    timeRange="30d"
                  />
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Todas las Métricas
                    </h2>
                    <div className="relative">
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Download className="h-5 w-5" />
                        Exportar
                      </button>

                      {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <button
                            onClick={() => handleExport('csv')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
                          >
                            📊 Exportar CSV
                          </button>
                          <button
                            onClick={() => handleExport('json')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            📄 Exportar JSON
                          </button>
                          <button
                            onClick={() => handleExport('report')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-b-lg"
                          >
                            📋 Reporte de Texto
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pack.metrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {formatMetricName(metric.metricKey)}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatValue(metric.metricKey, metric.value)}
                        </div>
                        {metric.previousValue !== undefined && metric.previousValue !== metric.value && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Anterior: {formatValue(metric.metricKey, metric.previousValue)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'setup' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Pasos de Configuración
                </h2>

                <div className="space-y-4">
                  {pack.setupSteps
                    .sort((a, b) => a.order - b.order)
                    .map((step) => (
                      <div
                        key={step.id}
                        className={`p-4 border-2 rounded-lg ${
                          step.completed
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {step.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                          ) : (
                            <Clock className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {step.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {step.description}
                            </p>
                            {!step.completed && (
                              <button
                                onClick={() => handleCompleteStep(step.stepKey)}
                                className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700"
                              >
                                Marcar como completado →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'bridges' && communityId && (
              <BridgesVisualization communityId={communityId} communityName={communityName} />
            )}

            {activeTab === 'network' && communityId && (
              <div className="space-y-6">
                {/* Network Impact */}
                <NetworkImpact communityId={communityId} />

                {/* Connection Recommendations */}
                <ConnectionRecommendations communityId={communityId} />
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

// Force SSR to prevent React Query prerender errors
export const getServerSideProps = async () => ({ props: {} });
