import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { HeartIcon, GlobeAltIcon, AcademicCapIcon, HomeIcon } from '@heroicons/react/24/outline';
import Button from '@/components/Button';
import SkeletonLoader from '@/components/SkeletonLoader';
import { staggerContainer, listItem } from '@/utils/animations';
import ProximityFilter from '@/components/filters/ProximityFilter';
import CommunityFilter from '@/components/filters/CommunityFilter';
import PageErrorBoundary from '@/components/PageErrorBoundary';

// Scope labels will be dynamically translated using useTranslations in component

const SCOPE_COLORS = {
  PERSONAL: 'bg-blue-100 text-blue-800',
  COMMUNITY: 'bg-green-100 text-green-800',
  INTERCOMMUNITY: 'bg-purple-100 text-purple-800',
  GLOBAL: 'bg-orange-100 text-orange-800',
};

// Type labels will be dynamically translated using useTranslations in component

// UN Sustainable Development Goals (SDG/ODS)
const SDG_ICONS: Record<number, string> = {
  1: '🚫', 2: '🌾', 3: '❤️', 4: '📚', 5: '⚖️',
  6: '💧', 7: '⚡', 8: '📈', 9: '🏗️', 10: '🤝',
  11: '🏘️', 12: '♻️', 13: '🌍', 14: '🌊', 15: '🌳',
  16: '⚖️', 17: '🤲',
};

// SDG names will be dynamically translated using useTranslations in component

const SDG_COLORS: Record<number, string> = {
  1: 'from-red-600 to-red-700',
  2: 'from-yellow-600 to-yellow-700',
  3: 'from-green-600 to-green-700',
  4: 'from-red-700 to-red-800',
  5: 'from-orange-600 to-orange-700',
  6: 'from-cyan-600 to-cyan-700',
  7: 'from-yellow-500 to-yellow-600',
  8: 'from-red-800 to-red-900',
  9: 'from-orange-700 to-orange-800',
  10: 'from-pink-600 to-pink-700',
  11: 'from-orange-500 to-orange-600',
  12: 'from-yellow-700 to-yellow-800',
  13: 'from-green-700 to-green-800',
  14: 'from-blue-600 to-blue-700',
  15: 'from-green-800 to-green-900',
  16: 'from-blue-700 to-blue-800',
  17: 'from-blue-800 to-blue-900',
};

function MutualAidPageContent() {
  const t = useTranslations('mutualAid');
  const [tab, setTab] = useState<'needs' | 'projects'>('needs');
  const [selectedSDG, setSelectedSDG] = useState<number | null>(null);
  const [showSDGFilter, setShowSDGFilter] = useState(false);
  const [communityFilter, setCommunityFilter] = useState<string>('');
  const [distanceFilter, setDistanceFilter] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Helper functions for translations
  const getScopeLabel = (scope: string) => t(`scope.${scope}`);
  const getNeedTypeLabel = (type: string) => t(`needType.${type}`);
  const getProjectTypeLabel = (type: string) => t(`projectType.${type}`);
  const getSDGName = (num: number) => t(`sdg.${num}`);

  const { data: needs, isLoading: needsLoading } = useQuery({
    queryKey: ['mutual-aid-needs', communityFilter, distanceFilter, userLocation],
    queryFn: async () => {
      const params: any = { limit: 20 };
      if (communityFilter) {
        params.communityId = communityFilter;
      }
      if (userLocation && distanceFilter > 0) {
        params.nearLat = userLocation.lat;
        params.nearLng = userLocation.lng;
        params.maxDistance = distanceFilter;
      }
      const response = await api.get('/mutual-aid/needs', { params });
      return response.data;
    },
    enabled: tab === 'needs',
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['mutual-aid-projects', communityFilter, distanceFilter, userLocation],
    queryFn: async () => {
      const params: any = { limit: 20 };
      if (communityFilter) {
        params.communityId = communityFilter;
      }
      if (userLocation && distanceFilter > 0) {
        params.nearLat = userLocation.lat;
        params.nearLng = userLocation.lng;
        params.maxDistance = distanceFilter;
      }
      const response = await api.get('/mutual-aid/projects', { params });
      return response.data;
    },
    enabled: tab === 'projects',
  });

  // Filter projects by SDG
  const filteredProjects = selectedSDG && projects
    ? projects.filter((p: any) => p.sdgGoals && p.sdgGoals.includes(selectedSDG))
    : projects;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setTab('needs')}
                variant={tab === 'needs' ? 'primary' : 'ghost'}
                size="md"
              >
                {t('tabs.needs')}
              </Button>
              <Button
                onClick={() => setTab('projects')}
                variant={tab === 'projects' ? 'primary' : 'ghost'}
                size="md"
              >
                {t('tabs.projects')}
              </Button>
            </div>

            {/* Community and Proximity Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

            {/* SDG Filter - Only show for projects */}
            {tab === 'projects' && (
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('filter.title')}
                  </h3>
                  <button
                    onClick={() => setShowSDGFilter(!showSDGFilter)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showSDGFilter ? t('filter.hide') : t('filter.show')}
                  </button>
                </div>

                {showSDGFilter && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
                    <button
                      onClick={() => setSelectedSDG(null)}
                      className={`p-2 rounded-lg text-center transition ${
                        selectedSDG === null
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold">{t('filter.all')}</div>
                    </button>
                    {Object.keys(SDG_ICONS).map((sdgNum) => {
                      const num = parseInt(sdgNum);
                      return (
                        <button
                          key={num}
                          onClick={() => setSelectedSDG(num)}
                          className={`p-2 rounded-lg text-center transition ${
                            selectedSDG === num
                              ? `bg-gradient-to-br ${SDG_COLORS[num]} text-white shadow-md`
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          title={getSDGName(num)}
                        >
                          <div className="text-2xl mb-1">{SDG_ICONS[num]}</div>
                          <div className="text-xs font-semibold">ODS {num}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedSDG && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('filter.filtering')}</span>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${SDG_COLORS[selectedSDG]}`}>
                      {SDG_ICONS[selectedSDG]} ODS {selectedSDG}: {getSDGName(selectedSDG)}
                    </span>
                    <button
                      onClick={() => setSelectedSDG(null)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ✕ {t('filter.clear')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Needs Tab */}
          {tab === 'needs' && (
            <div>
              <div className="flex justify-end mb-4">
                <Link href="/mutual-aid/needs/new">
                  <Button variant="primary" size="lg">
                    {t('buttons.publishNeed')}
                  </Button>
                </Link>
              </div>

              {needsLoading ? (
                <SkeletonLoader type="card" count={6} />
              ) : needs && needs.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {needs.map((need: any) => (
                    <motion.div key={need.id} variants={listItem}>
                      <Link
                        href={`/mutual-aid/needs/${need.id}`}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-5 block"
                      >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          SCOPE_COLORS[need.scope as keyof typeof SCOPE_COLORS]
                        }`}>
                          {getScopeLabel(need.scope)}
                        </span>
                        {need.urgencyLevel >= 8 && (
                          <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded">
                            {t('badges.urgent')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {need.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {need.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {need.location && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{need.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{need.contributorsCount || 0} {t('contributions')}</span>
                        </div>

                        {need.targetEur && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{t('progress')}</span>
                              <span>{Math.round((need.currentEur / need.targetEur) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min((need.currentEur / need.targetEur) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('empty.needs.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('empty.needs.description')}
                  </p>
                  <Link href="/mutual-aid/needs/new">
                    <Button variant="primary" size="lg">
                      {t('empty.needs.button')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {tab === 'projects' && (
            <div>
              <div className="flex justify-end mb-4">
                <Link href="/mutual-aid/projects/new">
                  <Button variant="primary" size="lg">
                    {t('buttons.createProject')}
                  </Button>
                </Link>
              </div>

              {projectsLoading ? (
                <SkeletonLoader type="card" count={6} />
              ) : filteredProjects && filteredProjects.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProjects.map((project: any) => (
                    <motion.div key={project.id} variants={listItem}>
                      <Link
                        href={`/mutual-aid/projects/${project.id}`}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden block"
                      >
                      {project.images && project.images.length > 0 && (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            {getProjectTypeLabel(project.type)}
                          </span>
                          {project.isVerified && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* SDG Badges */}
                        {project.sdgGoals && project.sdgGoals.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.sdgGoals.slice(0, 4).map((sdg: number) => (
                              <span
                                key={sdg}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white bg-gradient-to-r ${SDG_COLORS[sdg]}`}
                                title={getSDGName(sdg)}
                              >
                                {SDG_ICONS[sdg]} ODS {sdg}
                              </span>
                            ))}
                            {project.sdgGoals.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                +{project.sdgGoals.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {project.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{project.location}</span>
                          </div>

                          {project.beneficiaries && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{project.beneficiaries} {t('beneficiaries')}</span>
                            </div>
                          )}

                          {project.targetEur && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{project.currentEur}€ / {project.targetEur}€</span>
                                <span>{Math.round((project.currentEur / project.targetEur) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${Math.min((project.currentEur / project.targetEur) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {selectedSDG ? t('empty.projects.titleWithFilter', { sdg: selectedSDG }) : t('empty.projects.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedSDG ? t('empty.projects.descriptionWithFilter') : t('empty.projects.description')}
                  </p>
                  {selectedSDG ? (
                    <Button
                      onClick={() => setSelectedSDG(null)}
                      variant="outline"
                      size="lg"
                    >
                      {t('buttons.viewAll')}
                    </Button>
                  ) : (
                    <Link href="/mutual-aid/projects/new">
                      <Button variant="primary" size="lg">
                        {t('empty.projects.button')}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SDG Information Box */}
          {tab === 'projects' && (
            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 dark:bg-opacity-20 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                {t('sdg.title')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                {t('sdg.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SDG_ICONS[1]}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      ODS 1: {getSDGName(1)}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getSDGName(1)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SDG_ICONS[3]}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      ODS 3: {getSDGName(3)}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getSDGName(3)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{SDG_ICONS[11]}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      ODS 11: {getSDGName(11)}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getSDGName(11)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function MutualAidPage() {
  return (
    <PageErrorBoundary pageName="ayuda mutua">
      <MutualAidPageContent />
    </PageErrorBoundary>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
