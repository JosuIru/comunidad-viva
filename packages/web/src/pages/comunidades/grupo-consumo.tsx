import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { CONSUMER_GROUP_PACK } from '@/lib/communityPacks';
import { Check, ArrowRight, Users, TrendingUp, Heart, Sparkles } from 'lucide-react';

export default function ConsumerGroupLandingPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const pack = CONSUMER_GROUP_PACK;

  const handleGetStarted = async () => {
    setIsStarting(true);
    // Redirect to setup wizard
    router.push('/comunidades/setup?type=CONSUMER_GROUP');
  };

  return (
    <>
      <Head>
        <title>{pack.name} - Truk | Comunidad Viva</title>
        <meta name="description" content={pack.fullDescription} />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20 md:py-32">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-green-50 to-white dark:from-green-900/20 dark:via-gray-800 dark:to-gray-900 opacity-70"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                {/* Icon Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 font-medium mb-6">
                  <span className="text-2xl">{pack.icon}</span>
                  <span>Solución para Grupos de Consumo</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  Gestiona tu Grupo de Consumo
                  <br />
                  <span className="text-green-600 dark:text-green-400">Sin Complicaciones</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  {pack.fullDescription}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleGetStarted}
                    disabled={isStarting}
                    className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Empezar Gratis (10 min)
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
                    <Check className="h-5 w-5 text-green-600" />
                    <span>100% Gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Sin comisiones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Listo en 10 minutos</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Success Story */}
          {pack.successStories && pack.successStories[0] && (
            <section className="py-16 bg-white dark:bg-gray-800/50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">💚</div>
                      <div className="flex-1">
                        <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-4">
                          "{pack.successStories[0].quote}"
                        </p>
                        <div className="flex flex-wrap gap-6 text-sm">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {pack.successStories[0].author}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {pack.successStories[0].communityName}
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <div className="font-bold text-green-600 text-xl">
                                {pack.successStories[0].members}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">
                                Familias
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-green-600 text-xl">
                                {pack.successStories[0].monthsActive}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">
                                Meses
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                          <TrendingUp className="h-4 w-4" />
                          {pack.successStories[0].keyMetric}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Features Grid */}
          <section id="features" className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Todo lo que necesitas para tu grupo
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Herramientas diseñadas específicamente para grupos de consumo
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {pack.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 hover:shadow-lg"
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

          {/* Setup Steps Preview */}
          <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Configuración en 5 pasos simples
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Te guiamos paso a paso. Listo en menos de 10 minutos.
                  </p>
                </div>

                <div className="space-y-4">
                  {pack.setupSteps.map((step, index) => (
                    <div
                      key={step.key}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold">
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
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50"
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
                    Mide tu impacto
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Dashboard con métricas que demuestran el valor de vuestra colaboración
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pack.metrics.slice(0, 6).map((metric) => (
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
                      {metric.targetValue && (
                        <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium">
                          Meta: {metric.targetValue} {metric.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-800 dark:to-green-900">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  ¿Listo para potenciar tu grupo de consumo?
                </h2>
                <p className="text-xl mb-8 text-green-100">
                  Únete a decenas de grupos que ya están ahorrando dinero y fortaleciendo la economía local
                </p>

                <button
                  onClick={handleGetStarted}
                  disabled={isStarting}
                  className="bg-white text-green-700 hover:bg-green-50 px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-200 inline-flex items-center gap-3 disabled:opacity-50"
                >
                  {isStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Users className="h-6 w-6" />
                      Empezar Ahora - Es Gratis
                      <ArrowRight className="h-6 w-6" />
                    </>
                  )}
                </button>

                <p className="mt-6 text-sm text-green-100">
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
