import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import LandingPage from '@/components/LandingPage';
import UnifiedFeed from '@/components/UnifiedFeed';
import QuickActions from '@/components/QuickActions';
import CommunityStats from '@/components/CommunityStats';
import PlatformStats from '@/components/PlatformStats';
import BeginnerWelcome from '@/components/BeginnerWelcome';
import PublicViewBanner from '@/components/PublicViewBanner';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { HomeIcon, MapIcon, NewspaperIcon } from '@heroicons/react/24/outline';

function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<'feed' | 'map'>('feed');
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      const response = await api.get('/auth/profile');
      return response.data;
    },
    enabled: isMounted && !!localStorage.getItem('access_token'),
    retry: false,
  });

  if (!isMounted) {
    return null;
  }

  const isAuthenticated = !!localStorage.getItem('access_token');

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show public view banner if not logged in but has demo access
  const showPublicBanner = !userData && isAuthenticated;

  return (
    <Layout>
      {showPublicBanner && <PublicViewBanner />}

      {userData && !userLoading && (
        <BeginnerWelcome
          userName={userData.name || userData.email}
          communityName={userData.community?.name}
        />
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {t('welcome_back')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard_subtitle')}
          </p>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('feed')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              view === 'feed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <NewspaperIcon className="w-5 h-5" />
            {t('feed')}
          </button>
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-2 px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <MapIcon className="w-5 h-5" />
            {t('map')}
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {view === 'feed' && <UnifiedFeed limit={20} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            {userData?.community && <CommunityStats />}
            <PlatformStats />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: await getI18nProps(locale),
  };
}

export default HomePage;
