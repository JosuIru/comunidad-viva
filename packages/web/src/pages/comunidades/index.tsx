import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getAllCommunityPacks } from '@/lib/communityPacks';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { getI18nProps } from '@/lib/i18n';

export default function CommunityPacksIndex() {
  const packs = getAllCommunityPacks();

  const getPackUrl = (type: string): string => {
    const urls: Record<string, string> = {
      CONSUMER_GROUP: '/comunidades/grupo-consumo',
      HOUSING_COOP: '/comunidades/cooperativa-vivienda',
      COMMUNITY_BAR: '/comunidades/bar-comunitario',
      SOCIAL_CENTER: '/comunidades/centro-social',
      WORKER_COOP: '/comunidades/cooperativa-trabajo',
      NEIGHBORHOOD_ASSOCIATION: '/comunidades/asociacion-vecinos',
      TRANSITION_TOWN: '/comunidades/pueblo-transicion',
      ECOVILLAGE: '/comunidades/ecoaldea',
      SOLIDARITY_NETWORK: '/comunidades/red-solidaria',
      CULTURAL_SPACE: '/comunidades/espacio-cultural',
    };
    return urls[type] || '#';
  };

  return (
    <>
      <Head>
        <title>Packs para Comunidades Organizadas - Truk | Comunidad Viva</title>
        <meta
          name="description"
          content="Soluciones pre-configuradas para grupos de consumo, cooperativas de vivienda, bares comunitarios y más. Comienza en minutos."
        />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <section className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 font-medium mb-6">
                  <span className="text-2xl">📦</span>
                  <span>Soluciones para Comunidades Organizadas</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  Configura tu Comunidad
                  <br />
                  <span className="text-green-600 dark:text-green-400">
                    en Minutos, no en Meses
                  </span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Hemos preparado configuraciones específicas para distintos tipos de comunidades organizadas.
                  Elige la tuya y empieza a colaborar.
                </p>

                {/* Benefits */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>100% Gratis y Open Source</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Pre-configurado para ti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Listo en 10 minutos</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Community Packs Grid */}
          <section className="pb-20">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Elige el tipo de comunidad
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {packs.map((pack) => (
                    <Link
                      key={pack.type}
                      href={getPackUrl(pack.type)}
                      className="group bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 transition-all duration-200 hover:shadow-xl overflow-hidden"
                    >
                      {/* Header with icon and name */}
                      <div className={`p-6 bg-gradient-to-br ${
                        pack.color === 'green'
                          ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                          : pack.color === 'blue'
                          ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
                          : 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-5xl">{pack.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {pack.name}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {pack.shortDescription}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="space-y-3 mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Funcionalidades principales:
                          </h4>
                          <ul className="space-y-2">
                            {pack.features.slice(0, 4).map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                              </li>
                            ))}
                          </ul>
                          {pack.features.length > 4 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              +{pack.features.length - 4} funcionalidades más
                            </p>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {pack.setupSteps.length} pasos de configuración
                          </span>
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold group-hover:gap-3 transition-all">
                            <span>Empezar</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gray-100 dark:bg-gray-800/50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  ¿Tu tipo de comunidad no está aquí?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Estamos añadiendo nuevos packs constantemente. También puedes crear una comunidad personalizada
                  desde cero con todas las funcionalidades disponibles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/communities/new"
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    Crear Comunidad Personalizada
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a
                    href="mailto:hola@truk.app"
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
                  >
                    Solicitar Nuevo Pack
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps = getI18nProps;
