import { useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import FlashDeals from '@/components/FlashDeals';

export default function FlashDealsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <Layout title="Flash Deals - Comunidad Viva">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8">
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
              <div className="text-6xl">🔥</div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Flash Deals
                </h1>
                <p className="text-lg text-gray-600">
                  Descuentos especiales por tiempo limitado
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⏰</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Horarios de Flash Deals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌅</span>
                      <span className="text-gray-700">
                        <strong>10:00 AM</strong> - Deals matutinos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">☀️</span>
                      <span className="text-gray-700">
                        <strong>2:00 PM</strong> - Deals del mediodía
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌆</span>
                      <span className="text-gray-700">
                        <strong>8:00 PM</strong> - Deals nocturnos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Deals Component */}
          <FlashDeals />

          {/* How it Works */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ¿Cómo funcionan los Flash Deals?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-5xl mb-3">👀</div>
                <h4 className="font-semibold mb-2">1. Encuentra</h4>
                <p className="text-sm text-gray-600">
                  Descubre ofertas especiales 3 veces al día
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-3">⚡</div>
                <h4 className="font-semibold mb-2">2. Activa rápido</h4>
                <p className="text-sm text-gray-600">
                  Los deals duran solo 2 horas
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-3">🎫</div>
                <h4 className="font-semibold mb-2">3. Muestra el código</h4>
                <p className="text-sm text-gray-600">
                  Presenta tu confirmación en el comercio
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h4 className="font-semibold mb-2">4. Disfruta</h4>
                <p className="text-sm text-gray-600">
                  Obtén tu descuento y ahorra
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
