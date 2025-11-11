import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import SkeletonLoader from '@/components/SkeletonLoader';
import { staggerContainer, listItem } from '@/utils/animations';
import { SparklesIcon, CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import ProximityFilter from '@/components/filters/ProximityFilter';
import CommunityFilter from '@/components/filters/CommunityFilter';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import ViewToggle, { ViewMode } from '@/components/ViewToggle';
import dynamic from 'next/dynamic';
import type { EventsQueryParams } from '@/types/api';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  startsAt: string;
  endsAt: string;
  capacity?: number;
  address: string;
  lat?: number;
  lng?: number;
  type: string;
  creditsReward: number;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: any[];
}

function EventsPageContent() {
  const t = useTranslations('events');

  const [filters, setFilters] = useState({
    communityId: '',
    distance: 0,
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data: eventsResponse, isLoading } = useQuery<{ data: { events: Event[]; total: number } }>({
    queryKey: ['events', filters, userLocation],
    queryFn: () => {
      const params: EventsQueryParams = {
        communityId: filters.communityId || undefined,
        limit: 100,
      };

      // Add location params if proximity filter is active
      if (userLocation && filters.distance > 0) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = filters.distance;
      }

      return api.get('/events', { params });
    },
  });

  const events = eventsResponse?.data?.events || [];

  return (
    <Layout title="Eventos - Truk">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('pageTitle')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('pageSubtitle')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                <Link href="/events/new">
                  <Button variant="primary" size="lg">
                    {t('create')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {isLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : viewMode === 'cards' ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {events.map((event) => (
                <motion.div key={event.id} variants={listItem}>
                  <Link
                    href={`/events/${event.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                  >
                  <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    {event.image ? (
                      <img
                        src={getImageUrl(event.image)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <SparklesIcon className="h-24 w-24 text-white" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs rounded-full font-medium">
                        {event.type}
                      </span>
                      {event.creditsReward > 0 && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs rounded-full font-medium">
                          +{event.creditsReward} {t('credits')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{event.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {new Date(event.startsAt).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5" />
                        {new Date(event.startsAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        {event.address}
                      </p>
                      <p className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        {event.attendees?.length || 0}
                        {event.capacity && ` / ${event.capacity}`} {t('attendees')}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <Avatar
                        name={event.organizer?.name || 'Organizador'}
                        src={event.organizer?.avatar}
                        size="sm"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('organizedBy')} {event.organizer?.name || t('organizer')}
                      </span>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Map
              center={userLocation ? [userLocation.lat, userLocation.lng] : [42.8125, -1.6458]}
              zoom={userLocation ? 13 : 10}
              height="600px"
              pins={events
                .filter((event) => event.lat && event.lng)
                .map((event) => ({
                  id: event.id,
                  type: 'event',
                  position: [event.lat!, event.lng!] as [number, number],
                  title: event.title,
                  description: new Date(event.startsAt).toLocaleDateString('es-ES'),
                  link: `/events/${event.id}`,
                  image: event.image ? getImageUrl(event.image) : undefined,
                }))}
            />
          )}

          {!isLoading && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{t('noEvents')}</p>
              <Link href="/events/new">
                <Button variant="success" size="lg">
                  {t('createFirst')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function EventsPage() {
  return (
    <PageErrorBoundary pageName="la lista de eventos">
      <EventsPageContent />
    </PageErrorBoundary>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
