import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import type { CommunityPackConfig } from '@/lib/communityPacks';
import { Check, ArrowRight, Users, TrendingUp, Sparkles } from 'lucide-react';

interface PackLandingPageProps {
  pack: CommunityPackConfig;
}

export default function PackLandingPage({ pack }: PackLandingPageProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleGetStarted = async () => {
    setIsStarting(true);
    router.push(`/comunidades/setup?type=${pack.type}`);
  };

  const getGradientColor = (color: string) => {
    const gradients: Record<string, string> = {
      green: 'from-green-50 to-white dark:from-gray-900 dark:to-gray-800',
      blue: 'from-blue-50 to-white dark:from-gray-900 dark:to-gray-800',
      amber: 'from-amber-50 to-white dark:from-gray-900 dark:to-gray-800',
      purple: 'from-purple-50 to-white dark:from-gray-900 dark:to-gray-800',
      orange: 'from-orange-50 to-white dark:from-gray-900 dark:to-gray-800',
      pink: 'from-pink-50 to-white dark:from-gray-900 dark:to-gray-800',
    };
    return gradients[color] || gradients.green;
  };

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    };
    return colors[color] || colors.green;
  };

  const getButtonColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-600 hover:bg-green-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      amber: 'bg-amber-600 hover:bg-amber-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      pink: 'bg-pink-600 hover:bg-pink-700',
    };
    return colors[color] || colors.green;
  };

  const getAccentColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-600 dark:text-green-400',
      blue: 'text-blue-600 dark:text-blue-400',
      amber: 'text-amber-600 dark:text-amber-400',
      purple: 'text-purple-600 dark:text-purple-400',
      orange: 'text-orange-600 dark:text-orange-400',
      pink: 'text-pink-600 dark:text-pink-400',
    };
    return colors[color] || colors.green;
  };

  return (
    <>
      <Head>
        <title>{pack.name} - Truk | Comunidad Viva</title>
        <meta name="description" content={pack.fullDescription} />
      </Head>

      <Layout>
        <div className={`min-h-screen bg-gradient-to-b ${getGradientColor(pack.color)}`}>
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20 md:py-32">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                {/* Icon Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${getBadgeColor(pack.color)} rounded-full font-medium mb-6`}>
                  <span className="text-2xl">{pack.icon}</span>
                  <span>Solución para {pack.name}</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  {pack.name}
                  <br />
                  <span className={getAccentColor(pack.color)}>Sin Complicaciones</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  {pack.fullDescription}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleGetStarted}
                    disabled={isStarting}
                    className={`group ${getButtonColor(pack.color)} text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50`}
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
                    <Check className={`h-5 w-5 ${getAccentColor(pack.color).replace('text-', 'text-')}`} />
                    <span>100% Gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${getAccentColor(pack.color).replace('text-', 'text-')}`} />
                    <span>Sin comisiones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`h-5 w-5 ${getAccentColor(pack.color).replace('text-', 'text-')}`} />
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
                  <div className={`bg-gradient-to-br ${getBadgeColor(pack.color)} rounded-2xl p-8 border-2`}>
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
                              <div className={`font-bold text-xl ${getAccentColor(pack.color)}`}>
                                {pack.successStories[0].members}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">Miembros</div>
                            </div>
                            <div>
                              <div className={`font-bold text-xl ${getAccentColor(pack.color)}`}>
                                {pack.successStories[0].monthsActive}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">Meses</div>
                            </div>
                          </div>
                        </div>
                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 ${getButtonColor(pack.color)} text-white rounded-full text-sm font-medium`}>
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
                  Todo lo que necesitas
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Herramientas diseñadas específicamente para {pack.name.toLowerCase()}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {pack.features.map((feature, index) => (
                  <div
                    key={index}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-${pack.color}-300 transition-all duration-200 hover:shadow-lg`}
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
                    Configuración en {pack.setupSteps.length} pasos simples
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
                      <div className={`flex-shrink-0 w-10 h-10 ${getBadgeColor(pack.color)} rounded-full flex items-center justify-center font-bold`}>
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
                    className={`${getButtonColor(pack.color)} text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50`}
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
                        <div className={`mt-3 text-xs ${getAccentColor(pack.color)} font-medium`}>
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
          <section className={`py-20 bg-gradient-to-br ${getButtonColor(pack.color)}`}>
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  ¿Listo para potenciar tu {pack.name.toLowerCase()}?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Únete a las comunidades que ya están transformando su forma de colaborar
                </p>

                <button
                  onClick={handleGetStarted}
                  disabled={isStarting}
                  className="bg-white text-gray-900 hover:bg-gray-50 px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-200 inline-flex items-center gap-3 disabled:opacity-50"
                >
                  {isStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
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

                <p className="mt-6 text-sm opacity-80">
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
