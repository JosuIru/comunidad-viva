import { useEffect } from 'react';
import { useRouter } from 'next/router';
import SwipeStack from '@/components/SwipeStack';
import { getI18nProps } from '@/lib/i18n';

export default function SwipePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💜</span>
              <h1 className="text-xl font-bold text-gray-900">Descubre Ofertas</h1>
            </div>
            <button
              onClick={() => router.push('/matches')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Mis Matches
            </button>
          </div>
        </div>
      </div>

      {/* Swipe Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Encuentra lo que necesitas
          </h2>
          <p className="text-gray-600">
            Desliza a la derecha si te interesa, a la izquierda si no
          </p>
        </div>

        <SwipeStack />
      </div>
    </div>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
