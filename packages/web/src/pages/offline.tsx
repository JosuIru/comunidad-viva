import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { getI18nProps } from '@/lib/i18n';

export default function OfflinePage() {
  const t = useTranslations();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Verificar estado de conexión
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        // Si volvemos a estar online, recargamos la página
        window.location.reload();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>Sin Conexión - Truk</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Animated offline icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
                  />
                </svg>
              </div>
              {/* Pulse animation */}
              <div className="absolute inset-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>

          {/* Content card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sin Conexión
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              No hay conexión a Internet. Algunas funciones pueden no estar disponibles.
            </p>

            {/* Features available offline */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                ✨ Disponible sin conexión:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                <li className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Páginas visitadas recientemente
                </li>
                <li className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Imágenes en caché
                </li>
                <li className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Datos guardados localmente
                </li>
              </ul>
            </div>

            {/* Connection status */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isOnline ? 'Conectando...' : 'Sin conexión'}
              </span>
            </div>

            {/* Retry button */}
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Reintentar Conexión
            </button>

            {/* Back link */}
            <button
              onClick={() => window.history.back()}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Volver atrás
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              💡 Consejo: Comprueba tu conexión WiFi o datos móviles
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
