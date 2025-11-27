import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import BadgeUnlockedToast from '../components/achievements/BadgeUnlockedToast';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import ErrorBoundary from '../components/ErrorBoundary';
import AppContent from '../components/AppContent';
import '../styles/globals.css';
import 'leaflet/dist/leaflet.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration for better performance
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for this time
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache (renamed from cacheTime in v5)

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on component mount if data exists
      refetchOnReconnect: true, // Refetch when internet connection is restored

      // Retry configuration
      retry: 1, // Only retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Mutations don't need retry by default
      retry: 0,
    },
  },
});

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [messages, setMessages] = useState(pageProps.messages || {});

  // Load translations on client-side if not provided by SSR
  useEffect(() => {
    if (!pageProps.messages || Object.keys(pageProps.messages).length === 0) {
      const locale = router.locale || 'es';
      import(`../../messages/${locale}.json`)
        .then((mod) => setMessages(mod.default))
        .catch((err) => console.error('Failed to load translations:', err));
    }
  }, [router.locale, pageProps.messages]);

  // Extract JWT token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setAuthToken(token);

    // Listen for auth changes (login/logout)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('access_token');
      setAuthToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Register Service Worker for PWA - TEMPORALMENTE DESHABILITADO
  useEffect(() => {
    // Desregistrar cualquier Service Worker existente
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextIntlClientProvider
        locale={router.locale || 'es'}
        messages={messages}
        timeZone="Europe/Madrid"
        onError={(error) => {
          // Silenciar errores de mensajes faltantes durante SSR
          if (process.env.NODE_ENV === 'development') {
            // Solo loggear en desarrollo, no mostrar en consola del servidor
            // console.warn('i18n error:', error.message);
          }
        }}
        getMessageFallback={({ namespace, key }) => {
          // Fallback para mensajes faltantes
          return `${namespace}.${key}`;
        }}
      >
        <ErrorBoundary>
          <WebSocketProvider token={authToken}>
            <QueryClientProvider client={queryClient}>
              <AppContent>
                <Component {...pageProps} />
              </AppContent>
              <BadgeUnlockedToast />
              <PWAInstallPrompt />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#10b981',
                      color: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#ef4444',
                      color: '#fff',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: '#3b82f6',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#3b82f6',
                      color: '#fff',
                    },
                  },
                }}
              />
            </QueryClientProvider>
          </WebSocketProvider>
        </ErrorBoundary>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}

export default App;
