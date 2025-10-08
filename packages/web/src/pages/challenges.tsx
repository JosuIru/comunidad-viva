import { useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import WeeklyChallenges from '@/components/WeeklyChallenges';

export default function ChallengesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <Layout title="Retos Semanales - Comunidad Viva">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">🏆</div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Retos Semanales
                </h1>
                <p className="text-lg text-gray-600">
                  Compite con la comunidad y gana recompensas
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💡</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    ¿Qué son los Retos Semanales?
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Cada lunes lanzamos un nuevo reto comunitario. Completa el objetivo durante la semana
                    y gana créditos. Los 3 primeros lugares reciben bonificaciones extra.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/50 rounded-full text-sm font-medium">
                      🥇 +50 créditos extra
                    </span>
                    <span className="px-3 py-1 bg-white/50 rounded-full text-sm font-medium">
                      🥈 +30 créditos extra
                    </span>
                    <span className="px-3 py-1 bg-white/50 rounded-full text-sm font-medium">
                      🥉 +20 créditos extra
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Challenges Component */}
          <WeeklyChallenges />

          {/* Benefits Section */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Beneficios de Participar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 text-4xl">💰</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gana Créditos</h4>
                  <p className="text-sm text-gray-600">
                    Recibe créditos al completar retos que puedes usar en la plataforma
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 text-4xl">📈</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Sube de Nivel</h4>
                  <p className="text-sm text-gray-600">
                    Cada reto completado te da experiencia para subir de nivel
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 text-4xl">🤝</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Conoce Gente</h4>
                  <p className="text-sm text-gray-600">
                    Los retos te motivan a interactuar más con la comunidad
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Types of Challenges */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tipos de Retos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🤝</span>
                  <h4 className="font-bold text-gray-900">Semana Solidaria</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Ayuda a diferentes personas de la comunidad realizando intercambios o servicios
                </p>
              </div>

              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🌱</span>
                  <h4 className="font-bold text-gray-900">Guerrero Ecológico</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Completa acciones sostenibles como compartir objetos o participar en compras grupales eco
                </p>
              </div>

              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">👥</span>
                  <h4 className="font-bold text-gray-900">Super Conector</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Conecta con nuevos miembros usando el sistema de matches y participando en eventos
                </p>
              </div>

              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">💼</span>
                  <h4 className="font-bold text-gray-900">Maestro de Intercambios</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Realiza múltiples transacciones exitosas ofreciendo y solicitando servicios
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
