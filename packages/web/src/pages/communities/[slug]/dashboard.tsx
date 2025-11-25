import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import SetupProgress from '@/components/community-packs/SetupProgress';
import MetricsDashboard from '@/components/community-packs/MetricsDashboard';
import { api } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, CheckSquare, Settings, Users } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  onboardingPack?: {
    id: string;
    packType: string;
    setupCompleted: boolean;
    setupProgress: number;
  };
}

export default function CommunityDashboard() {
  const router = useRouter();
  const { slug } = router.query;
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/communities/slug/${slug}`);
      setCommunity(response.data);

      // If setup is completed, default to metrics tab
      if (response.data.onboardingPack?.setupCompleted) {
        setActiveTab('metrics');
      }
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comunidad no encontrada
          </h1>
        </div>
      </Layout>
    );
  }

  if (!community.onboardingPack) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Esta comunidad no tiene un pack de configuración
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Los packs de configuración están disponibles para comunidades organizadas como grupos de consumo, cooperativas, etc.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - {community.name} | Truk</title>
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {community.name}
                    </h1>
                    {community.onboardingPack.setupCompleted && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        <CheckSquare className="h-4 w-4" />
                        Configurado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {community.description}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/communities/${slug}`)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Ver Comunidad
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Tabs list */}
              <TabsList className="inline-flex p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="setup"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                >
                  <CheckSquare className="h-4 w-4" />
                  Configuración
                  {!community.onboardingPack.setupCompleted && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                      {community.onboardingPack.setupProgress}%
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="metrics"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                >
                  <BarChart3 className="h-4 w-4" />
                  Métricas
                </TabsTrigger>

                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                >
                  <Settings className="h-4 w-4" />
                  Ajustes
                </TabsTrigger>
              </TabsList>

              {/* Setup tab */}
              <TabsContent value="setup" className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <SetupProgress
                    communityId={community.id}
                    onStepClick={(stepKey) => {
                      // Navigate to setup wizard at specific step
                      router.push(`/comunidades/setup?communityId=${community.id}&step=${stepKey}`);
                    }}
                  />
                </div>
              </TabsContent>

              {/* Metrics tab */}
              <TabsContent value="metrics" className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <MetricsDashboard
                    communityId={community.id}
                    packType={community.onboardingPack.packType as any}
                  />
                </div>
              </TabsContent>

              {/* Settings tab */}
              <TabsContent value="settings" className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Configuración del Pack
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ajustes del pack en desarrollo...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </>
  );
}

