import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { COMMUNITY_BAR_PACK } from '@/lib/communityPacks';
import { Check, ArrowRight, Coffee, TrendingUp, Users, Sparkles, Calendar } from 'lucide-react';

export default function CommunityBarLandingPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const pack = COMMUNITY_BAR_PACK;

  const handleGetStarted = async () => {
    setIsStarting(true);
    router.push('/comunidades/setup?type=COMMUNITY_BAR');
  };

  return (
    <>
      <Head>
        <title>{pack.name} - Truk | Comunidad Viva</title>
        <meta name="description" content={pack.fullDescription} />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20 md:py-32">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-white dark:from-amber-900/20 dark:via-gray-800 dark:to-gray-900 opacity-70"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                {/* Icon Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 font-medium mb-6">
                  <span className="text-2xl">{pack.icon}</span>
                  <span>Solución para Bares Comunitarios y Cooperativos</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  Transforma tu Bar en un
                  <br />
                  <span className="text-amber-600 dark:text-amber-400">Hub Cultural y Social</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  {pack.fullDescription}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleGetStarted}
                    disabled={isStarting}
                    className="group bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Empezar Gratis
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
                  >
                    Ver Funcionalidades
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-amber-600" />
                    <span>100% Gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-amber-600" />
                    <span>Gestión de eventos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-amber-600" />
                    <span>Moneda local integrada</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Todo lo que necesitas para tu bar comunitario
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Herramientas para gestionar eventos, socios, proveedores locales y mucho más
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {pack.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="text-3xl mb-3">{feature.split(' ')[0]}</div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {feature.substring(feature.indexOf(' ') + 1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-20 bg-white dark:bg-gray-800/50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Más que un bar, un espacio para la comunidad
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6">
                    <div className="text-5xl mb-4">🎸</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Eventos Culturales
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Conciertos, jam sessions, presentaciones de libros, exposiciones...
                    </p>
                  </div>

                  <div className="text-center p-6">
                    <div className="text-5xl mb-4">🤝</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Punto de Encuentro
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reuniones de colectivos, asambleas, charlas, talleres...
                    </p>
                  </div>

                  <div className="text-center p-6">
                    <div className="text-5xl mb-4">🌾</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Economía Local
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Productos locales, moneda comunitaria, apoyo a productores...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Setup Steps Preview */}
          <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Configuración simple y flexible
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Personaliza según las necesidades de tu espacio
                  </p>
                </div>

                <div className="space-y-4">
                  {pack.setupSteps.map((step, index) => (
                    <div
                      key={step.key}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {step.title}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ~{step.estimatedMinutes} min
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleGetStarted}
                    disabled={isStarting}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Iniciando...
                      </>
                    ) : (
                      <>
                        Comenzar Configuración
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Preview */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Visualiza tu impacto cultural y social
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Métricas que demuestran el valor de tu espacio para la comunidad
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {pack.metrics.map((metric) => (
                    <div
                      key={metric.key}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{metric.icon}</div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {metric.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {metric.unit}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {metric.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-800 dark:to-amber-900">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  ¿Listo para potenciar tu bar comunitario?
                </h2>
                <p className="text-xl mb-8 text-amber-100">
                  Únete a los espacios que están construyendo comunidad a través de la cultura y la convivencia
                </p>

                <button
                  onClick={handleGetStarted}
                  disabled={isStarting}
                  className="bg-white text-amber-700 hover:bg-amber-50 px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-200 inline-flex items-center gap-3 disabled:opacity-50"
                >
                  {isStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-700"></div>
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Coffee className="h-6 w-6" />
                      Empezar Ahora - Es Gratis
                      <ArrowRight className="h-6 w-6" />
                    </>
                  )}
                </button>

                <p className="mt-6 text-sm text-amber-100">
                  Sin tarjeta de crédito · Sin compromiso · Soporte incluido
                </p>
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
