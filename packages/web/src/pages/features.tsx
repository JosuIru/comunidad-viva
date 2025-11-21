import { getI18nProps } from '@/lib/i18n';
import Link from 'next/link';
import Layout from '@/components/Layout';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  href: string;
  category: 'gamification' | 'economy' | 'governance';
  bgColor: string;
}

const features: FeatureCard[] = [
  // Gamification & Viral Features
  {
    title: 'Challenges',
    description: 'Completa desafíos semanales, sube de nivel, mantén rachas y compite en el leaderboard',
    icon: '🏆',
    href: '/gamification/challenges',
    category: 'gamification',
    bgColor: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Swipe & Match',
    description: 'Conecta con personas que pueden ayudarte y a quienes puedes ayudar, tipo Tinder',
    icon: '💝',
    href: '/gamification/swipe',
    category: 'gamification',
    bgColor: 'from-pink-500 to-red-500',
  },
  {
    title: 'Flash Deals',
    description: 'Ofertas relámpago por tiempo limitado con Happy Hour y multiplicadores',
    icon: '⚡',
    href: '/gamification/flash-deals',
    category: 'gamification',
    bgColor: 'from-red-500 to-orange-500',
  },
  {
    title: 'Compras Grupales',
    description: 'Únete con otros y obtén mejores descuentos. Más personas = mayor descuento',
    icon: '🛒',
    href: '/gamification/group-buys',
    category: 'gamification',
    bgColor: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Sistema de Referidos',
    description: 'Invita amigos y gana recompensas. 4 niveles con multiplicadores progresivos',
    icon: '🌟',
    href: '/gamification/referrals',
    category: 'gamification',
    bgColor: 'from-green-500 to-teal-500',
  },

  // Hybrid Economic Layer
  {
    title: 'Sistema Híbrido',
    description: 'Dashboard de capas económicas: Tradicional, Transicional, Don Puro y Camaleón',
    icon: '🦎',
    href: '/hybrid/dashboard',
    category: 'economy',
    bgColor: 'from-purple-600 to-indigo-600',
  },
  {
    title: 'Celebraciones & Eventos Puente',
    description: 'Celebra migraciones entre capas y conecta con personas de diferentes paradigmas económicos',
    icon: '🎉',
    href: '/hybrid/events',
    category: 'economy',
    bgColor: 'from-pink-600 to-purple-600',
  },

  // Governance (Proof of Help)
  {
    title: 'Propuestas de Gobernanza',
    description: 'Crea y vota propuestas con votación cuadrática. Sistema Proof of Help descentralizado',
    icon: '📜',
    href: '/governance/proposals',
    category: 'governance',
    bgColor: 'from-indigo-600 to-blue-600',
  },
  {
    title: 'Delegación de Votos',
    description: 'Delega tu poder de voto en expertos de confianza por categorías específicas',
    icon: '🗳️',
    href: '/governance/delegation',
    category: 'governance',
    bgColor: 'from-purple-600 to-pink-600',
  },
];

const categories = {
  gamification: {
    title: 'Gamificación y Engagement Viral',
    icon: '🎮',
    color: 'text-purple-600',
  },
  economy: {
    title: 'Sistema Híbrido de Capas Económicas',
    icon: '💰',
    color: 'text-blue-600',
  },
  governance: {
    title: 'Gobernanza Descentralizada (Proof of Help)',
    icon: '🏛️',
    color: 'text-indigo-600',
  },
};

export default function FeaturesPage() {
  return (
    <Layout title="Funcionalidades - Truk">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold mb-6 text-center">
              ✨ Funcionalidades de Truk
            </h1>
            <p className="text-2xl opacity-90 text-center max-w-3xl mx-auto">
              Explora el sistema revolucionario de economía colaborativa con gamificación viral,
              capas económicas híbridas y gobernanza descentralizada
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">9</div>
              <div className="text-gray-600 dark:text-gray-400">Funcionalidades Principales</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">~120</div>
              <div className="text-gray-600 dark:text-gray-400">Endpoints de API</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-5xl font-bold text-pink-600 dark:text-pink-400 mb-2">3</div>
              <div className="text-gray-600 dark:text-gray-400">Sistemas Integrados</div>
            </div>
          </div>

          {/* Features by Category */}
          {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
            const categoryFeatures = features.filter((f) => f.category === categoryKey);

            return (
              <div key={categoryKey} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-5xl">{categoryInfo.icon}</div>
                  <h2 className={`text-3xl font-bold ${categoryInfo.color} dark:opacity-90`}>
                    {categoryInfo.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryFeatures.map((feature) => (
                    <Link
                      key={feature.href}
                      href={feature.href}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                    >
                      <div className={`bg-gradient-to-r ${feature.bgColor} p-6 text-white`}>
                        <div className="text-6xl mb-4">{feature.icon}</div>
                        <h3 className="text-2xl font-bold">{feature.title}</h3>
                      </div>

                      <div className="p-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{feature.description}</p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          Explorar →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {/* System Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              🌐 Visión General del Sistema
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                  Gamificación Viral
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Sistema completo de engagement con challenges, swipe matching, flash deals,
                  compras grupales y referidos multinivel. Diseñado para maximizar retención y
                  crecimiento viral.
                </p>
              </div>

              <div className="text-center">
                <div className="text-6xl mb-4">🦎</div>
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                  Capas Económicas Híbridas
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  4 paradigmas económicos coexistentes: Tradicional (💼), Transicional (🔄), Don
                  Puro (🎁) y Camaleón (🦎). Migración fluida entre capas con celebraciones y
                  eventos puente.
                </p>
              </div>

              <div className="text-center">
                <div className="text-6xl mb-4">🏛️</div>
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">
                  Proof of Help
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Gobernanza descentralizada basada en contribuciones reales. Votación cuadrática,
                  delegación de votos y sistema de reputación que recompensa la ayuda comunitaria.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 text-lg">
                🚀 Características Técnicas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
                <div>
                  <strong>Frontend:</strong>
                  <ul className="ml-4 mt-2 space-y-1">
                    <li>• Next.js 13 con Pages Router</li>
                    <li>• React Query para data fetching</li>
                    <li>• Tailwind CSS para UI</li>
                    <li>• TypeScript para type safety</li>
                  </ul>
                </div>
                <div>
                  <strong>Backend:</strong>
                  <ul className="ml-4 mt-2 space-y-1">
                    <li>• NestJS con arquitectura modular</li>
                    <li>• Prisma ORM con PostgreSQL</li>
                    <li>• JWT authentication</li>
                    <li>• ~120 endpoints RESTful</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* API Reference */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              📚 Documentación Completa
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Consulta la documentación técnica completa con todos los endpoints, modelos de datos
              y ejemplos de uso
            </p>
            <Link
              href="/docs"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-colors font-bold text-lg shadow-lg"
            >
              Ver Documentación →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
