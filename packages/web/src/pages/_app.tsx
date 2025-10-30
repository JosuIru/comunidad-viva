import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import BadgeUnlockedToast from '../components/achievements/BadgeUnlockedToast';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);

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

  return (
    <NextIntlClientProvider
      locale={router.locale || 'es'}
      messages={pageProps.messages}
      timeZone="Europe/Madrid"
    >
      <WebSocketProvider token={authToken}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          <BadgeUnlockedToast />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </QueryClientProvider>
      </WebSocketProvider>
    </NextIntlClientProvider>
  );
}
