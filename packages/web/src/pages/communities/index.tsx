import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import SkeletonLoader from '@/components/SkeletonLoader';
import { staggerContainer, listItem } from '@/utils/animations';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  LockOpenIcon,
  LightBulbIcon,
  UsersIcon,
  ShoppingBagIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import ViewToggle, { ViewMode } from '@/components/ViewToggle';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type CommunityType = 'NEIGHBORHOOD' | 'VILLAGE' | 'TOWN' | 'COUNTY' | 'REGION' | 'CUSTOM';
type CommunityVisibility = 'PRIVATE' | 'PUBLIC' | 'OPEN' | 'FEDERATED';

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location?: string;
  lat?: number;
  lng?: number;
  type: CommunityType;
  visibility: CommunityVisibility;
  membersCount: number;
  activeOffersCount: number;
  logo?: string;
  bannerImage?: string;
  primaryColor?: string;
}

function CommunitiesPageContent() {
  const t = useTranslations('communities');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterVisibility, setFilterVisibility] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ['communities', searchQuery, filterType, filterVisibility],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType) params.append('type', filterType);
      if (filterVisibility) params.append('visibility', filterVisibility);

      const response = await api.get(`/communities?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <Layout title="Comunidades - Explora">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('pageTitle')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('pageSubtitle')}
                </p>
              </div>
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  {t('search.label')}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  {t('filters.type')}
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('filters.all')}</option>
                  {(['NEIGHBORHOOD', 'VILLAGE', 'TOWN', 'COUNTY', 'REGION', 'CUSTOM'] as CommunityType[]).map((key) => (
                    <option key={key} value={key}>
                      {t(`types.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <LockOpenIcon className="h-4 w-4" />
                  {t('filters.visibility')}
                </label>
                <select
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('filters.allFeminine')}</option>
                  {(['PRIVATE', 'PUBLIC', 'OPEN', 'FEDERATED'] as CommunityVisibility[]).map((key) => (
                    <option key={key} value={key}>
                      {t(`visibility.${key}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <LightBulbIcon className="h-4 w-4" />
              {t('notFound.message')}{' '}
              <Link href="/admin/communities" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                {t('notFound.action')}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {communities?.length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{t('stats.activeCommunities')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {communities?.reduce((sum, c) => sum + c.membersCount, 0) || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{t('stats.totalMembers')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                {communities?.reduce((sum, c) => sum + c.activeOffersCount, 0) || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{t('stats.activeOffers')}</div>
            </div>
          </div>

          {/* Communities Grid */}
          {isLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : communities && communities.length > 0 ? (
            viewMode === 'cards' ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
              {communities.map((community) => (
                <motion.div key={community.id} variants={listItem}>
                  <Link
                    href={`/communities/${community.slug}`}
                    className="block group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                  >
                  {/* Banner */}
                  <div
                    className="h-32 bg-gradient-to-r from-blue-500 to-green-500"
                    style={
                      community.primaryColor
                        ? {
                            background: `linear-gradient(135deg, ${community.primaryColor}, ${community.primaryColor}dd)`,
                          }
                        : undefined
                    }
                  >
                    {community.bannerImage && (
                      <img
                        src={community.bannerImage}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Logo */}
                    <div className="-mt-16 mb-4">
                      {community.logo ? (
                        <img
                          src={community.logo}
                          alt={community.name}
                          className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                        />
                      ) : (
                        <div className="-ml-2">
                          <Avatar name={community.name} size="xl" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {community.name}
                    </h3>

                    {community.location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {community.location}
                      </p>
                    )}

                    {community.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{community.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        {community.membersCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingBagIcon className="h-4 w-4" />
                        {community.activeOffersCount}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {t(`types.${community.type}`)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          community.visibility === 'OPEN'
                            ? 'bg-green-100 text-green-800'
                            : community.visibility === 'PUBLIC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {t(`visibility.${community.visibility}`)}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center justify-between">
                      <span>{t('card.viewCommunity')}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              ))}
              </motion.div>
            ) : (
              <Map
                center={[42.8125, -1.6458]}
                zoom={10}
                height="600px"
                pins={communities
                  .filter((community) => community.lat && community.lng)
                  .map((community) => ({
                    id: community.id,
                    type: 'user',
                    position: [community.lat!, community.lng!] as [number, number],
                    title: community.name,
                    description: `${community.membersCount} miembros · ${community.activeOffersCount} ofertas`,
                    link: `/communities/${community.slug}`,
                    image: community.logo || community.bannerImage,
                  }))}
              />
            )
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <div className="mb-4 flex justify-center">
                <BuildingOffice2Icon className="h-24 w-24 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('empty.description')}
              </p>
              <Link href="/admin/communities">
                <Button variant="primary" size="md">
                  {t('empty.action')}
                </Button>
              </Link>
            </div>
          )}

          {/* CTA */}
          <motion.div
            className="mt-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-2xl p-8 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <Link href="/admin/communities">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold">
                {t('cta.action')} →
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default function CommunitiesPage() {
  return (
    <PageErrorBoundary pageName="las comunidades">
      <CommunitiesPageContent />
    </PageErrorBoundary>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
