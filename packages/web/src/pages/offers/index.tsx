import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import { ImageCard } from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';
import { staggerContainer, listItem } from '@/utils/animations';
import InteractiveTour from '@/components/InteractiveTour';
import Analytics from '@/lib/analytics';
import { CubeIcon, EyeIcon, StarIcon } from '@heroicons/react/24/outline';
import ProximityFilter from '@/components/filters/ProximityFilter';
import CommunityFilter from '@/components/filters/CommunityFilter';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import ViewToggle, { ViewMode } from '@/components/ViewToggle';
import dynamic from 'next/dynamic';
import type { OffersQueryParams } from '@/types/api';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Offer {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  priceEur?: number;
  priceCredits?: number;
  images: string[];
  lat?: number;
  lng?: number;
  address?: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  views: number;
  interested: number;
}

function OffersPageContent() {
  const t = useTranslations('offers');
  const tCommon = useTranslations('common');

  const [filters, setFilters] = useState({
    type: '',
    category: '',
    communityId: '',
    distance: 0,
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data: offersResponse, isLoading } = useQuery({
    queryKey: ['offers', filters, userLocation],
    queryFn: async () => {
      const params: OffersQueryParams = {
        type: filters.type || undefined,
        category: filters.category || undefined,
        communityId: filters.communityId || undefined,
        limit: 100,
      };

      // Add location params if proximity filter is active
      if (userLocation && filters.distance > 0) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = filters.distance;
      }

      const response = await api.get('/offers', { params });
      return response.data as Offer[];
    },
  });

  const offers = offersResponse || [];

  const offerTypes = ['PRODUCT', 'SERVICE', 'TIME_BANK', 'GROUP_BUY', 'EVENT'];
  const categories = ['Alimentación', 'Ropa', 'Hogar', 'Tecnología', 'Servicios', 'Otros'];

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('offers_tour_completed');
    if (!tourCompleted && isAuthenticated) {
      setTimeout(() => setShowTour(true), 2000);
    }
  }, [isAuthenticated]);

  const tourSteps = [
    {
      target: '[data-tour="create-offer"]',
      title: '¡Crea tu primera oferta! 🛍️',
      description: 'Aquí puedes publicar productos o servicios que quieras ofrecer a tu comunidad.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="offer-filters"]',
      title: 'Filtra ofertas 🔍',
      description: 'Usa los filtros para encontrar ofertas por categoría, ubicación o tipo de pago.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="offer-list"]',
      title: 'Explora ofertas 📋',
      description: 'Aquí verás todas las ofertas disponibles. Click en cualquiera para ver detalles.',
      position: 'top' as const,
    },
  ];

  return (
    <Layout title={`${t('title')} - ${t('title')}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                <Link href="/offers/new">
                  <Button variant="primary" size="lg" data-tour="create-offer">
                    {t('newOffer')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="offer-filters">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">{t('allTypes')}</option>
                  {offerTypes.map((type) => (
                    <option key={type} value={type}>
                      {t(`types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {t(`categories.${category}`)}
                    </option>
                  ))}
                </select>
              </div>

              <CommunityFilter
                value={filters.communityId}
                onChange={(communityId) => setFilters({ ...filters, communityId })}
              />

              <ProximityFilter
                value={filters.distance}
                onChange={(distance) => setFilters({ ...filters, distance })}
                onLocationChange={setUserLocation}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : viewMode === 'cards' ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              data-tour="offer-list"
            >
              {offers?.map((offer) => (
                <motion.div key={offer.id} variants={listItem}>
                  <Link href={`/offers/${offer.id}`}>
                    <ImageCard
                      title={offer.title}
                      description={offer.description}
                      imageSrc={offer.images?.length > 0 ? getImageUrl(offer.images[0]) : undefined}
                      imagePlaceholder={<CubeIcon className="h-24 w-24" />}
                      clickable
                      footer={
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                              {t(`types.${offer.type}`)}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              {t(`categories.${offer.category}`)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar name={offer.user?.name || 'Usuario'} src={offer.user?.avatar} size="sm" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{offer.user?.name || 'Usuario'}</span>
                            </div>
                            {offer.priceEur && (
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">€{offer.priceEur}</span>
                            )}
                            {offer.priceCredits && (
                              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {offer.priceCredits} {tCommon('credits')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-4 w-4" />
                              {offer.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4" />
                              {offer.interested}
                            </span>
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
              pins={offers
                ?.filter((offer) => offer.lat && offer.lng)
                .map((offer) => ({
                  id: offer.id,
                  type: offer.type === 'SERVICE' ? 'service' : 'offer',
                  position: [offer.lat!, offer.lng!] as [number, number],
                  title: offer.title,
                  description: `${offer.priceEur ? `€${offer.priceEur}` : ''} ${offer.priceCredits ? `${offer.priceCredits} créditos` : ''}`,
                  link: `/offers/${offer.id}`,
                  image: offer.images?.length > 0 ? getImageUrl(offer.images[0]) : undefined,
                }))}
            />
          )}

          {!isLoading && offers?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{t('noOffersAvailable')}</p>
              <Link href="/offers/new">
                <Button variant="primary" size="lg">
                  {t('createFirstOffer')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {showTour && (
        <InteractiveTour
          steps={tourSteps}
          onComplete={() => {
            setShowTour(false);
            Analytics.track('TOUR_COMPLETED', { page: 'offers', steps: tourSteps.length });
          }}
          onSkip={() => {
            setShowTour(false);
            Analytics.track('TOUR_SKIPPED', { page: 'offers' });
          }}
          storageKey="offers_tour_completed"
        />
      )}
    </Layout>
  );
}

export default function OffersPage() {
  return (
    <PageErrorBoundary pageName="la lista de ofertas">
      <OffersPageContent />
    </PageErrorBoundary>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
