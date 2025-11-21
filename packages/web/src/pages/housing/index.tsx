import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import { ImageCard } from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';
import { staggerContainer, listItem } from '@/utils/animations';
import ProximityFilter from '@/components/filters/ProximityFilter';
import CommunityFilter from '@/components/filters/CommunityFilter';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import ViewToggle, { ViewMode } from '@/components/ViewToggle';
import dynamic from 'next/dynamic';
import type { HousingQueryParams } from '@/types/api';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  FILLED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

function HousingPageContent() {
  const t = useTranslations('housing');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [communityFilter, setCommunityFilter] = useState<string>('');
  const [distanceFilter, setDistanceFilter] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data: solutions, isLoading } = useQuery({
    queryKey: ['housing-solutions', selectedType, communityFilter, distanceFilter, userLocation],
    queryFn: async () => {
      const params: HousingQueryParams = {
        limit: 100,
      };
      if (selectedType !== 'ALL') {
        params.solutionType = selectedType as any;
      }
      if (communityFilter) {
        params.communityId = communityFilter;
      }
      if (userLocation && distanceFilter > 0) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = distanceFilter;
      }
      const response = await api.get('/housing/solutions', { params });
      return response.data;
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                  {t('subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                <Link href="/housing/new">
                  <Button variant="primary" size="md" className="whitespace-nowrap">
                    {t('buttons.createSolution')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Type Filters */}
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedType === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('filters.all')}
              </button>
              {(['SPACE_BANK', 'TEMPORARY_HOUSING', 'HOUSING_COOP', 'COMMUNITY_GUARANTEE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(`solutionTypes.${type}`)}
                </button>
              ))}
            </div>

            {/* Community and Proximity Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CommunityFilter
                value={communityFilter}
                onChange={setCommunityFilter}
              />

              <ProximityFilter
                value={distanceFilter}
                onChange={setDistanceFilter}
                onLocationChange={setUserLocation}
              />
            </div>
          </div>

          {/* Solutions Grid */}
          {isLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : solutions && solutions.length > 0 ? (
            viewMode === 'cards' ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {solutions.map((solution: any) => (
                  <motion.div key={solution.id} variants={listItem}>
                    <Link href={`/housing/${solution.id}`}>
                      <ImageCard
                        title={solution.title}
                        description={solution.description}
                        imageSrc={solution.images?.length > 0 ? solution.images[0] : undefined}
                        imagePlaceholder="🏠"
                        clickable
                        footer={
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded">
                                {t(`solutionTypes.${solution.solutionType}`)}
                              </span>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                STATUS_COLORS[solution.status as keyof typeof STATUS_COLORS]
                              }`}>
                                {t(`status.${solution.status}`)}
                              </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              {solution.location && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{solution.location}</span>
                                </div>
                              )}
                              {solution.solutionType === 'SPACE_BANK' && solution.capacity && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>{t('capacity')} {solution.capacity} {t('capacityPeople')}</span>
                                </div>
                              )}
                              {solution.solutionType === 'HOUSING_COOP' && solution.targetMembers && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  <span>{solution.currentMembers}/{solution.targetMembers} {t('members')}</span>
                                </div>
                              )}
                              {solution.monthlyContribution && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                  <span>{solution.monthlyContribution}{t('monthlyContribution')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Map
                center={userLocation ? [userLocation.lat, userLocation.lng] : [42.8125, -1.6458]}
                zoom={userLocation ? 13 : 10}
                height="600px"
                pins={solutions
                  .filter((solution: any) => solution.lat && solution.lng)
                  .map((solution: any) => ({
                    id: solution.id,
                    type: 'housing',
                    position: [solution.lat, solution.lng] as [number, number],
                    title: solution.title,
                    description: t(`solutionTypes.${solution.solutionType}`),
                    link: `/housing/${solution.id}`,
                    image: solution.images?.length > 0 ? solution.images[0] : undefined,
                  }))}
              />
            )
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('empty.description')}
              </p>
              <Link href="/housing/new">
                <Button variant="primary" size="md">
                  {t('empty.button')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function HousingPage() {
  return (
    <PageErrorBoundary pageName="soluciones de vivienda">
      <HousingPageContent />
    </PageErrorBoundary>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
