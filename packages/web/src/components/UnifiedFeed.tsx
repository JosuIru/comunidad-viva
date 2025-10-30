import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  CalendarIcon,
  ShoppingBagIcon,
  ClockIcon,
  HeartIcon,
  HomeIcon,
  LightBulbIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

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
  author?: {
    name: string;
    avatar?: string;
  };
  link: string;
  metadata?: any;
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

const typeConfig = {
  event: {
    label: 'Evento',
    icon: CalendarIcon,
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  offer: {
    label: 'Oferta',
    icon: ShoppingBagIcon,
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  timebank: {
    label: 'Banco de Tiempo',
    icon: ClockIcon,
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  need: {
    label: 'Necesidad',
    icon: HeartIcon,
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  project: {
    label: 'Proyecto',
    icon: LightBulbIcon,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  housing: {
    label: 'Vivienda',
    icon: HomeIcon,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  groupbuy: {
    label: 'Compra Grupal',
    icon: UserGroupIcon,
    color: 'pink',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
  },
};

export default function UnifiedFeed() {
  const [filter, setFilter] = useState<ResourceType | 'all'>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Ubicación por defecto (Navarra) si no se puede obtener
          setUserLocation([42.8125, -1.6458]);
        }
      );
    } else {
      // Ubicación por defecto si geolocalización no está disponible (Navarra)
      setUserLocation([42.8125, -1.6458]);
    }
  }, []);

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

  // Transform all data into unified format
  const unifiedResources: UnifiedResource[] = [
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
  ];

  // Sort by proximity (local to global)
  const sortedResources = unifiedResources.sort((a, b) => {
    // Primero por distancia (más cercano primero)
    const distDiff = (a.distance || Number.MAX_SAFE_INTEGER) - (b.distance || Number.MAX_SAFE_INTEGER);
    if (distDiff !== 0) return distDiff;

    // Si tienen la misma distancia, ordenar por fecha (más reciente primero)
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  // Filter resources
  const filteredResources = filter === 'all'
    ? sortedResources
    : sortedResources.filter(r => r.type === filter);

  const ResourceCard = ({ resource }: { resource: UnifiedResource }) => {
    const config = typeConfig[resource.type];
    const Icon = config.icon;

    return (
      <Link href={resource.link}>
        <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition border ${config.borderColor} overflow-hidden`}>
          <div className="flex gap-4 p-4">
            {resource.image && (
              <div className="flex-shrink-0">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {resource.title}
                </h3>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                  {config.label}
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {resource.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                {resource.author && (
                  <div className="flex items-center gap-1">
                    {resource.author.avatar ? (
                      <img
                        src={resource.author.avatar}
                        alt={resource.author.name}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
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
                <div className="mt-2 text-xs text-gray-600">
                  {resource.metadata.attendees} asistentes
                  {resource.metadata.maxAttendees && ` / ${resource.metadata.maxAttendees}`}
                </div>
              )}

              {(resource.type === 'need' || resource.type === 'project') && resource.metadata?.goal > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Recaudado</span>
                    <span>{resource.metadata.raised}€ / {resource.metadata.goal}€</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full bg-${config.color}-600`}
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
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Red Unificada
        </h2>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({unifiedResources.length})
          </button>
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = unifiedResources.filter(r => r.type === type).length;
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => setFilter(type as ResourceType)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === type
                    ? `${config.bgColor} ${config.textColor} border ${config.borderColor}`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources grid */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay recursos disponibles
          </div>
        ) : (
          filteredResources.map((resource) => (
            <ResourceCard key={`${resource.type}-${resource.id}`} resource={resource} />
          ))
        )}
      </div>
    </div>
  );
}
