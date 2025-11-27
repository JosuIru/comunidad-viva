import { useState, useEffect, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import {
  CalendarIcon,
  ShoppingBagIcon,
  ClockIcon,
  HeartIcon,
  HomeIcon,
  LightBulbIcon,
  MapPinIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import EmptyState from './EmptyState';
import { isValidImageSrc, handleImageError } from '@/lib/imageUtils';
import { DemoContentManager, DEMO_OFFERS, DEMO_EVENTS } from '@/lib/demoContent';
import DemoBadge from './DemoBadge';
import Analytics, { ANALYTICS_EVENTS } from '@/lib/analytics';
import { CompactDemoNotice } from './DemoContentNotice';

type ResourceType = 'event' | 'offer' | 'timebank' | 'need' | 'project' | 'housing' | 'groupbuy';

interface UnifiedResource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  image?: string;
  date?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // distancia en km desde el usuario
  communityId?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  link: string;
  metadata?: any;
  isDemo?: boolean; // Mark demo content
}

interface UnifiedFeedProps {
  selectedTypes?: Set<string>;
  selectedCommunities?: Set<string>;
  proximityRadius?: number | null;
  searchText?: string;
  userLocation?: [number, number] | null;
  onTypesChange?: (types: Set<string>) => void;
}

// Función para calcular distancia usando fórmula Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to get date X days ago - MUST be defined before component
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const typeConfig = {
  event: {
    labelKey: 'event',
    icon: CalendarIcon,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-700',
  },
  offer: {
    labelKey: 'offer',
    icon: ShoppingBagIcon,
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-700',
  },
  timebank: {
    labelKey: 'timebank',
    icon: ClockIcon,
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-700',
  },
  need: {
    labelKey: 'need',
    icon: HeartIcon,
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-700',
  },
  project: {
    labelKey: 'project',
    icon: LightBulbIcon,
    color: 'yellow',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
  },
  housing: {
    labelKey: 'housing',
    icon: HomeIcon,
    color: 'indigo',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-700 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-700',
  },
  groupbuy: {
    labelKey: 'groupbuy',
    icon: UserGroupIcon,
    color: 'pink',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-700 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-700',
  },
};

export default function UnifiedFeed({
  selectedTypes = new Set(['offer', 'event', 'timebank', 'need', 'project', 'housing', 'groupbuy']),
  selectedCommunities,
  proximityRadius,
  searchText,
  userLocation: externalUserLocation,
  onTypesChange,
}: UnifiedFeedProps = {}) {
  const t = useTranslations('unifiedFeed');
  const router = useRouter();
  const [internalUserLocation, setInternalUserLocation] = useState<[number, number] | null>(null);
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  // Use external location if provided, otherwise get user's location
  const userLocation = externalUserLocation || internalUserLocation;

  // Obtener ubicación del usuario solo si no se proporciona externamente
  useEffect(() => {
    if (externalUserLocation) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInternalUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          logger.debug('Geolocation not available, using default location', {
            error: error.message,
            defaultLocation: 'Navarra'
          });
          // Ubicación por defecto (Navarra) si no se puede obtener
          setInternalUserLocation([42.8125, -1.6458]);
        }
      );
    } else {
      // Ubicación por defecto si geolocalización no está disponible (Navarra)
      setInternalUserLocation([42.8125, -1.6458]);
    }
  }, [externalUserLocation]);

  // Fetch all data
  const { data: events } = useQuery({
    queryKey: ['unified-events'],
    queryFn: async () => {
      const response = await api.get('/events', { params: { limit: 100 } });
      return response.data?.events || [];
    },
  });

  const { data: offers } = useQuery({
    queryKey: ['unified-offers'],
    queryFn: async () => {
      const response = await api.get('/offers', { params: { limit: 100 } });
      return response.data || [];
    },
  });

  const { data: needs } = useQuery({
    queryKey: ['unified-needs'],
    queryFn: async () => {
      const response = await api.get('/mutual-aid/needs', { params: { limit: 100 } });
      return response.data || [];
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['unified-projects'],
    queryFn: async () => {
      const response = await api.get('/mutual-aid/projects', { params: { limit: 100 } });
      return response.data || [];
    },
  });

  const { data: housing } = useQuery({
    queryKey: ['unified-housing'],
    queryFn: async () => {
      const response = await api.get('/housing/solutions', { params: { limit: 100 } });
      return response.data || [];
    },
  });

  const { data: groupbuys } = useQuery({
    queryKey: ['unified-groupbuys'],
    queryFn: async () => {
      const response = await api.get('/groupbuys', { params: { limit: 100 } });
      return response.data?.groupBuys || [];
    },
  });

  // Transform all data into unified format - Memoized for performance
  const unifiedResources = useMemo<UnifiedResource[]>(() => [
    // Events
    ...(events || []).map((event: any) => {
      const lat = event.lat;
      const lng = event.lng;
      const distance = (lat && lng && userLocation)
        ? calculateDistance(userLocation[0], userLocation[1], lat, lng)
        : Number.MAX_SAFE_INTEGER; // Sin coordenadas = distancia infinita

      return {
        id: event.id,
        type: 'event' as ResourceType,
        title: event.title,
        description: event.description || '',
        image: event.image,
        date: event.startDate || event.createdAt,
        location: event.location,
        latitude: lat,
        longitude: lng,
        distance,
        communityId: event.communityId,
        author: event.creator ? {
          name: event.creator.name,
          avatar: event.creator.avatar,
        } : undefined,
        link: `/events/${event.id}`,
        metadata: {
          attendees: event._count?.registrations || 0,
          maxAttendees: event.maxAttendees,
        },
      };
    }),
    // Offers (excluding time bank)
    ...(offers || [])
      .filter((offer: any) => offer.type !== 'TIME_BANK')
      .map((offer: any) => {
        const lat = offer.lat;
        const lng = offer.lng;
        const distance = (lat && lng && userLocation)
          ? calculateDistance(userLocation[0], userLocation[1], lat, lng)
          : Number.MAX_SAFE_INTEGER;

        return {
          id: offer.id,
          type: 'offer' as ResourceType,
          title: offer.title,
          description: offer.description || '',
          image: offer.images?.[0],
          date: offer.createdAt,
          location: offer.location,
          latitude: lat,
          longitude: lng,
          distance,
          author: offer.user ? {
            name: offer.user.name,
            avatar: offer.user.avatar,
          } : undefined,
          link: `/offers/${offer.id}`,
          metadata: {
            price: offer.price,
            priceCredits: offer.priceCredits,
            type: offer.type,
          },
        };
      }),
    // Time bank offers
    ...(offers || [])
      .filter((offer: any) => offer.type === 'TIME_BANK')
      .map((offer: any) => {
        const lat = offer.lat;
        const lng = offer.lng;
        const distance = (lat && lng && userLocation)
          ? calculateDistance(userLocation[0], userLocation[1], lat, lng)
          : Number.MAX_SAFE_INTEGER;

        return {
          id: offer.id,
          type: 'timebank' as ResourceType,
          title: offer.title,
          description: offer.description || '',
          image: offer.images?.[0],
          date: offer.createdAt,
          location: offer.location,
          latitude: lat,
          longitude: lng,
          distance,
          author: offer.user ? {
            name: offer.user.name,
            avatar: offer.user.avatar,
          } : undefined,
          link: `/offers/${offer.id}`,
          metadata: {
            hours: offer.timeHours,
          },
        };
      }),
    // Needs
    ...(needs || []).map((need: any) => {
      const lat = need.latitude;
      const lng = need.longitude;
      const distance = (lat && lng && userLocation)
        ? calculateDistance(userLocation[0], userLocation[1], lat, lng)
        : Number.MAX_SAFE_INTEGER;

      return {
        id: need.id,
        type: 'need' as ResourceType,
        title: need.title,
        description: need.description || '',
        image: need.images?.[0],
        date: need.createdAt,
        location: `${need.latitude}, ${need.longitude}`,
        latitude: lat,
        longitude: lng,
        distance,
        author: need.requester ? {
          name: need.requester.name,
          avatar: need.requester.avatar,
        } : undefined,
        link: `/mutual-aid/needs/${need.id}`,
        metadata: {
          urgency: need.urgency,
          scope: need.scope,
          raised: need.currentAmount || 0,
          goal: need.targetAmount || 0,
        },
      };
    }),
    // Projects
    ...(projects || []).map((project: any) => {
      const lat = project.latitude;
      const lng = project.longitude;
      const distance = (lat && lng && userLocation)
        ? calculateDistance(userLocation[0], userLocation[1], lat, lng)
        : Number.MAX_SAFE_INTEGER;

      return {
        id: project.id,
        type: 'project' as ResourceType,
        title: project.title,
        description: project.description || '',
        image: project.images?.[0],
        date: project.createdAt,
        location: `${project.latitude}, ${project.longitude}`,
        latitude: lat,
        longitude: lng,
        distance,
        author: project.creator ? {
          name: project.creator.name,
          avatar: project.creator.avatar,
        } : undefined,
        link: `/mutual-aid/projects/${project.id}`,
        metadata: {
          type: project.projectType,
          raised: project.currentAmount || 0,
          goal: project.targetAmount || 0,
          contributors: project._count?.contributions || 0,
        },
      };
    }),
    // Housing
    ...(housing || []).map((house: any) => {
      const lat = house.latitude;
      const lng = house.longitude;
      const distance = (lat && lng && userLocation)
        ? calculateDistance(userLocation[0], userLocation[1], lat, lng)
        : Number.MAX_SAFE_INTEGER;

      return {
        id: house.id,
        type: 'housing' as ResourceType,
        title: house.title || house.name,
        description: house.description || '',
        image: house.images?.[0],
        date: house.createdAt,
        location: house.location || `${house.latitude}, ${house.longitude}`,
        latitude: lat,
        longitude: lng,
        distance,
        author: house.owner ? {
          name: house.owner.name,
          avatar: house.owner.avatar,
        } : undefined,
        link: house.solutionType === 'HOUSING_COOP'
          ? `/housing/coops/${house.id}`
          : `/housing/${house.id}`,
        metadata: {
          solutionType: house.solutionType,
          capacity: house.capacity,
        },
      };
    }),
    // Group buys
    ...(groupbuys || []).map((groupbuy: any) => {
      const lat = groupbuy.pickupLat;
      const lng = groupbuy.pickupLng;
      const distance = (lat && lng && userLocation)
        ? calculateDistance(userLocation[0], userLocation[1], lat, lng)
        : Number.MAX_SAFE_INTEGER;

      return {
        id: groupbuy.id,
        type: 'groupbuy' as ResourceType,
        title: groupbuy.offer?.title || 'Compra Grupal',
        description: groupbuy.offer?.description || '',
        image: groupbuy.offer?.images?.[0],
        date: groupbuy.deadline || groupbuy.createdAt,
        location: groupbuy.pickupAddress,
        latitude: lat,
        longitude: lng,
        distance,
        author: groupbuy.offer?.user ? {
          name: groupbuy.offer.user.name,
          avatar: groupbuy.offer.user.avatar,
        } : undefined,
        link: `/groupbuys/${groupbuy.id}`,
        metadata: {
          currentParticipants: groupbuy.currentParticipants,
          minParticipants: groupbuy.minParticipants,
          maxParticipants: groupbuy.maxParticipants,
          currentTier: groupbuy.currentTier,
        },
      };
    }),
  ], [events, offers, needs, projects, housing, groupbuys, userLocation]);

  // Blend demo content with real content - Memoized for performance
  const resourcesWithDemos = useMemo<UnifiedResource[]>(() => {
    if (!userLocation) return unifiedResources;

    const [userLat, userLng] = userLocation;

    // Get demo offers nearby
    const demoOffersNearby = DemoContentManager.getDemoOffersByLocation(userLat, userLng, 50);
    const demoEventsNearby = DemoContentManager.getDemoEventsByLocation(userLat, userLng, 50);

    // Transform demo offers to UnifiedResource format
    const demOfferResources: UnifiedResource[] = demoOffersNearby.map((offer) => {
      const distance = userLocation
        ? calculateDistance(userLat, userLng, offer.lat, offer.lng)
        : Number.MAX_SAFE_INTEGER;

      return {
        id: offer.id,
        type: 'offer' as ResourceType,
        title: offer.title,
        description: offer.description,
        image: offer.images?.[0],
        date: getDaysAgo(offer.createdDaysAgo),
        location: offer.location,
        latitude: offer.lat,
        longitude: offer.lng,
        distance,
        author: {
          name: offer.user.name,
          avatar: offer.user.avatar,
        },
        link: '#', // Demo links are handled separately
        metadata: {
          price: offer.priceEur,
          priceCredits: offer.priceCredits,
          type: offer.type,
        },
        isDemo: true,
      };
    });

    // Transform demo events to UnifiedResource format
    const demoEventResources: UnifiedResource[] = demoEventsNearby.map((event) => {
      const distance = userLocation
        ? calculateDistance(userLat, userLng, event.lat, event.lng)
        : Number.MAX_SAFE_INTEGER;

      return {
        id: event.id,
        type: 'event' as ResourceType,
        title: event.title,
        description: event.description,
        image: event.image,
        date: event.startsAt,
        location: event.address,
        latitude: event.lat,
        longitude: event.lng,
        distance,
        author: {
          name: event.organizer.name,
          avatar: event.organizer.avatar,
        },
        link: '#', // Demo links are handled separately
        metadata: {
          attendees: event.registrationsCount,
          maxAttendees: event.capacity,
        },
        isDemo: true,
      };
    });

    // Blend real content with demo content
    const realOffers = unifiedResources.filter(r => r.type === 'offer' || r.type === 'timebank');
    const realEvents = unifiedResources.filter(r => r.type === 'event');
    const otherResources = unifiedResources.filter(
      r => r.type !== 'offer' && r.type !== 'timebank' && r.type !== 'event'
    );

    // Blend offers (max 50% demos)
    // Cast demo resources as they have isDemo flag
    const blendedOffers = DemoContentManager.blendDemoWithReal<UnifiedResource>(
      realOffers,
      demOfferResources as any, // Demo resources are already marked with isDemo
      10
    );

    // Blend events (max 50% demos)
    const blendedEvents = DemoContentManager.blendDemoWithReal<UnifiedResource>(
      realEvents,
      demoEventResources as any, // Demo resources are already marked with isDemo
      8
    );

    // Show demo notice if we added demo content
    const hasDemoContent = blendedOffers.length > realOffers.length || blendedEvents.length > realEvents.length;
    if (hasDemoContent && !DemoContentManager.hasDismissedDemoNotice()) {
      setShowDemoNotice(true);
    }

    return [...blendedOffers, ...blendedEvents, ...otherResources];
  }, [unifiedResources, userLocation]);

  // Apply filters and sorting - Memoized for performance
  const filteredResources = useMemo(() => {
    // Apply external filters first
  let filteredByExternalFilters = resourcesWithDemos;

  // Type filter (external)
  if (selectedTypes && selectedTypes.size > 0) {
    filteredByExternalFilters = filteredByExternalFilters.filter(resource => {
      // Map resource type to filter type
      const resourceTypeMapping: Record<string, string> = {
        'event': 'event',
        'offer': 'offer',
        'timebank': 'service',
        'need': 'need',
        'project': 'project',
        'housing': 'housing',
        'groupbuy': 'offer',
      };
      const filterType = resourceTypeMapping[resource.type] || resource.type;
      return selectedTypes.has(filterType);
    });
  }

  // Community filter (external)
  if (selectedCommunities && selectedCommunities.size > 0) {
    filteredByExternalFilters = filteredByExternalFilters.filter(resource =>
      resource.communityId && selectedCommunities.has(resource.communityId)
    );
  }

  // Proximity filter (external)
  if (proximityRadius !== null && proximityRadius !== undefined) {
    filteredByExternalFilters = filteredByExternalFilters.filter(resource =>
      (resource.distance || Number.MAX_SAFE_INTEGER) <= proximityRadius
    );
  }

  // Search filter (external)
  if (searchText && searchText.trim().length > 0) {
    const searchLower = searchText.toLowerCase();
    filteredByExternalFilters = filteredByExternalFilters.filter(resource =>
      resource.title.toLowerCase().includes(searchLower) ||
      resource.description.toLowerCase().includes(searchLower)
    );
  }

    // Sort by proximity (local to global)
    const sortedResources = filteredByExternalFilters.sort((a, b) => {
      // Primero por distancia (más cercano primero)
      const distDiff = (a.distance || Number.MAX_SAFE_INTEGER) - (b.distance || Number.MAX_SAFE_INTEGER);
      if (distDiff !== 0) return distDiff;

      // Si tienen la misma distancia, ordenar por fecha (más reciente primero)
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    // Filter resources by selectedTypes
    return sortedResources.filter(r => selectedTypes.has(r.type));
  }, [resourcesWithDemos, selectedTypes, selectedCommunities, proximityRadius, searchText]);

  // Handle demo content click
  const handleDemoClick = (resource: UnifiedResource) => {
    if (!resource.isDemo) return;

    Analytics.track(ANALYTICS_EVENTS.DEMO_CONTENT_CLICKED, {
      demoId: resource.id,
      type: resource.type,
      action: 'view_detail',
    });

    // Show modal explaining it's demo content
    if (window.confirm(
      'Esta es una oferta de demostración.\n\n' +
      'El contenido de ejemplo está claramente marcado para ayudarte a explorar la plataforma.\n\n' +
      '¿Quieres publicar tu primera oferta real?'
    )) {
      Analytics.track(ANALYTICS_EVENTS.DEMO_CONVERTED_TO_REGISTER, {
        fromDemoId: resource.id,
      });
      router.push('/offers/new');
    }
  };

  // Memoized ResourceCard to prevent unnecessary re-renders
  const ResourceCard = memo(({ resource }: { resource: UnifiedResource }) => {
    const config = typeConfig[resource.type];
    const Icon = config.icon;

    const cardContent = (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition border ${config.borderColor} overflow-hidden relative`}>
        {/* Demo Badge - positioned absolutely */}
        {resource.isDemo && (
          <div className="absolute top-2 right-2 z-10">
            <DemoBadge variant="small" />
          </div>
        )}

        <div className="flex gap-4 p-4">
          {isValidImageSrc(resource.image) && (
            <div className="flex-shrink-0">
              <img
                src={resource.image}
                alt={resource.title}
                className="w-24 h-24 object-cover rounded-lg"
                onError={handleImageError}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                {resource.title}
              </h3>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} flex-shrink-0`}>
                <Icon className="w-4 h-4" />
                {t(config.labelKey)}
              </span>
            </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {resource.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {resource.author && (
                  <div className="flex items-center gap-1">
                    {isValidImageSrc(resource.author.avatar) ? (
                      <img
                        src={resource.author.avatar}
                        alt={resource.author.name}
                        className="w-5 h-5 rounded-full"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {resource.author.name[0]}
                        </span>
                      </div>
                    )}
                    <span>{resource.author.name}</span>
                  </div>
                )}

                {resource.location && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="line-clamp-1">{resource.location}</span>
                  </div>
                )}

                {resource.date && (
                  <span>
                    {new Date(resource.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {/* Type-specific metadata */}
              {resource.type === 'event' && resource.metadata?.attendees !== undefined && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {resource.metadata.attendees} {t('attendees')}
                  {resource.metadata.maxAttendees && ` / ${resource.metadata.maxAttendees}`}
                </div>
              )}

              {(resource.type === 'need' || resource.type === 'project') && resource.metadata?.goal > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t('raised')}</span>
                    <span>{resource.metadata.raised}€ / {resource.metadata.goal}€</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full bg-${config.color}-600 dark:bg-${config.color}-500`}
                      style={{
                        width: `${Math.min((resource.metadata.raised / resource.metadata.goal) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    );

    // Wrap with Link or clickable div based on isDemo
    if (resource.isDemo) {
      return (
        <div
          onClick={(e) => {
            e.preventDefault();
            handleDemoClick(resource);
          }}
          className="cursor-pointer"
        >
          {cardContent}
        </div>
      );
    }

    return (
      <Link href={resource.link}>
        {cardContent}
      </Link>
    );
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('title')}
        </h2>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (onTypesChange) {
                onTypesChange(new Set(['offer', 'event', 'timebank', 'need', 'project', 'housing', 'groupbuy']));
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedTypes.size === 7
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t('all')} ({resourcesWithDemos.length})
          </button>
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = resourcesWithDemos.filter(r => r.type === type).length;
            const Icon = config.icon;
            const isSelected = selectedTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => {
                  if (onTypesChange) {
                    const newTypes = new Set(selectedTypes);
                    if (isSelected) {
                      newTypes.delete(type);
                    } else {
                      newTypes.add(type);
                    }
                    // Ensure at least one type is selected
                    if (newTypes.size > 0) {
                      onTypesChange(newTypes);
                    }
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isSelected
                    ? `${config.bgColor} ${config.textColor} border ${config.borderColor}`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(config.labelKey)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo Content Notice */}
      {showDemoNotice && (
        <div className="mb-4">
          <CompactDemoNotice />
        </div>
      )}

      {/* Resources grid */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <EmptyState
            icon={<MagnifyingGlassIcon className="h-12 w-12" />}
            title={t('noResources')}
            description={t('noResourcesDesc')}
            actions={[
              {
                label: t('createOffer'),
                href: '/offers/new',
                variant: 'secondary',
              },
            ]}
          />
        ) : (
          filteredResources.map((resource) => (
            <ResourceCard key={`${resource.type}-${resource.id}`} resource={resource} />
          ))
        )}
      </div>
    </div>
  );
}
