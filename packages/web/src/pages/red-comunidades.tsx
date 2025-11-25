import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Network, TrendingUp, Users, Activity, GitBranch, ArrowRight } from 'lucide-react';

interface NetworkStats {
  totalBridges: number;
  bridgesByType: Record<string, number>;
  strongestBridges: Array<{
    id: string;
    bridgeType: string;
    strength: number;
    sourceCommunity: { name: string; slug: string };
    targetCommunity: { name: string; slug: string };
  }>;
  averageStrength: number;
}

export default function RedComunidades() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkStats();
  }, []);

  const fetchNetworkStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community-packs/network-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching network stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBridgeTypeName = (type: string): string => {
    const names: Record<string, string> = {
      GEOGRAPHIC: 'Proximidad Geográfica',
      THEMATIC: 'Temática Común',
      SPONTANEOUS: 'Conexión Espontánea',
      MENTORSHIP: 'Mentoría',
      SUPPLY_CHAIN: 'Cadena de Suministro',
      FEDERATION: 'Federación',
    };
    return names[type] || type;
  };

  const getBridgeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      GEOGRAPHIC: '📍',
      THEMATIC: '🎯',
      SPONTANEOUS: '✨',
      MENTORSHIP: '🎓',
      SUPPLY_CHAIN: '🔗',
      FEDERATION: '🌐',
    };
    return icons[type] || '🔗';
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Red de Comunidades - Truk | Comunidad Viva</title>
        <meta
          name="description"
          content="Visualiza la red de conexiones entre comunidades organizadas: cómo se relacionan, colaboran y forman un ecosistema cooperativo."
        />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 text-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white font-medium mb-6">
                  <Network className="h-5 w-5" />
                  <span>Mapa de la Red</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  La Red de Comunidades Organizadas
                </h1>

                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Descubre cómo las comunidades se conectan y colaboran formando un ecosistema
                  cooperativo distribuido. Cada conexión representa una relación real detectada
                  automáticamente.
                </p>

                {stats && (
                  <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="text-4xl font-bold mb-2">{stats.totalBridges}</div>
                      <div className="text-blue-100">Conexiones Activas</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="text-4xl font-bold mb-2">
                        {Object.keys(stats.bridgesByType).length}
                      </div>
                      <div className="text-blue-100">Tipos de Puentes</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="text-4xl font-bold mb-2">
                        {Math.round(stats.averageStrength * 100)}%
                      </div>
                      <div className="text-blue-100">Fuerza Promedio</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Network Stats */}
          {stats && (
            <>
              {/* Bridge Types Distribution */}
              <section className="py-20">
                <div className="container mx-auto px-4">
                  <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
                      Tipos de Conexiones
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(stats.bridgesByType).map(([type, count]) => (
                        <div
                          key={type}
                          className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="text-5xl">{getBridgeIcon(type)}</div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {getBridgeTypeName(type)}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {count} {count === 1 ? 'conexión' : 'conexiones'}
                              </p>
                            </div>
                          </div>

                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                              style={{
                                width: `${(count / stats.totalBridges) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Strongest Bridges */}
              <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
                <div className="container mx-auto px-4">
                  <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
                      Conexiones Más Fuertes
                    </h2>

                    <div className="space-y-4">
                      {stats.strongestBridges.map((bridge, index) => (
                        <div
                          key={bridge.id}
                          className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6"
                        >
                          <div className="flex items-center gap-6">
                            <div className="flex-shrink-0 text-center">
                              <div className="text-4xl font-bold text-gray-300 dark:text-gray-600">
                                #{index + 1}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{getBridgeIcon(bridge.bridgeType)}</span>
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                  {getBridgeTypeName(bridge.bridgeType)}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 flex-wrap">
                                <Link
                                  href={`/communities/${bridge.sourceCommunity.slug}`}
                                  className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  {bridge.sourceCommunity.name}
                                </Link>
                                <GitBranch className="h-5 w-5 text-gray-400" />
                                <Link
                                  href={`/communities/${bridge.targetCommunity.slug}`}
                                  className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  {bridge.targetCommunity.name}
                                </Link>
                              </div>

                              <div className="mt-3 flex items-center gap-4">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                    style={{ width: `${bridge.strength * 100}%` }}
                                  />
                                </div>
                                <div className="flex-shrink-0 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {Math.round(bridge.strength * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="text-5xl mb-6">🌱</div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Forma parte de la red
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Cada comunidad que se organiza añade un nodo más a esta red cooperativa. Cuantas
                  más conexiones, más fuerte y resiliente es el ecosistema.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/comunidades"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Network className="h-5 w-5" />
                    Crear Mi Comunidad
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/communities"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
                  >
                    <Activity className="h-5 w-5" />
                    Explorar Comunidades
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-12 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  Cómo se detectan las conexiones
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Detección Automática
                      </h4>
                      <p>
                        El sistema analiza diariamente la actividad de las comunidades y detecta
                        automáticamente las conexiones.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Fuerza de Conexión
                      </h4>
                      <p>
                        Cada puente tiene una fuerza basada en factores como distancia, miembros
                        compartidos, o afinidad temática.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Actualización Continua
                      </h4>
                      <p>
                        Las conexiones se actualizan continuamente reflejando el estado real de las
                        relaciones entre comunidades.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Transparente y Abierto
                      </h4>
                      <p>
                        Todo el código es abierto y auditable. Las comunidades pueden ver y entender
                        sus conexiones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}

// Force SSR to avoid prerender errors with React Query
export const getServerSideProps = async () => {
  return { props: {} };
};
