import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';

interface Celebration {
  id: string;
  communityId?: string;
  event: string;
  description?: string;
  emoji?: string;
  approximateParticipants?: number;
  createdAt: string;
}

export default function CelebrationsPage() {
  const t = useTranslations('hybrid.celebrations');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');

  // Fetch celebrations
  const { data: celebrations, isLoading } = useQuery<Celebration[]>({
    queryKey: ['celebrations', selectedCommunity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCommunity) {
        params.append('communityId', selectedCommunity);
      }
      params.append('limit', '50');

      const response = await api.get(`/hybrid/celebrations?${params.toString()}`);
      return response.data;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return t('time.fewMinutes');
    } else if (diffInHours < 24) {
      return t('time.hoursAgo', { hours: diffInHours });
    } else if (diffInHours < 48) {
      return t('time.yesterday');
    } else {
      return date.toLocaleDateString(t('time.locale'), {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
              {t('header.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('header.subtitle')}
            </p>
          </div>

          {/* Stats Card */}
          {celebrations && celebrations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border-4 border-yellow-400 dark:border-yellow-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {celebrations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {t('stats.recentCelebrations')}
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                    {celebrations.reduce(
                      (sum, c) => sum + (c.approximateParticipants || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {t('stats.peopleInvolved')}
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                    ✨
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {t('stats.communityMagic')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!celebrations || celebrations.length === 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {t('empty.description')}
              </p>
            </div>
          )}

          {/* Celebrations Timeline */}
          {!isLoading && celebrations && celebrations.length > 0 && (
            <div className="space-y-4">
              {celebrations.map((celebration, index) => (
                <div
                  key={celebration.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="p-6 md:p-8 flex gap-6">
                    {/* Emoji */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center text-4xl md:text-5xl shadow-inner">
                        {celebration.emoji || '✨'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                          {celebration.event}
                        </h3>
                        <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(celebration.createdAt)}
                        </div>
                      </div>

                      {celebration.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-base md:text-lg">
                          {celebration.description}
                        </p>
                      )}

                      {celebration.approximateParticipants && (
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                          <span className="text-lg">👥</span>
                          <span>
                            {t('participants', { count: celebration.approximateParticipants })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decorative gradient bar */}
                  <div className="h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 dark:from-purple-600 dark:via-pink-600 dark:to-yellow-600"></div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">💝</div>
              <div>
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2">
                  {t('info.title')}
                </h3>
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                  {t('info.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
