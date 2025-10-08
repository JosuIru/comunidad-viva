import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

// Dynamic import to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-600">Cargando mapa...</div>
    </div>
  ),
});

interface Offer {
  id: string;
  title: string;
  type: string;
  description: string;
  lat?: number;
  lng?: number;
  images?: string[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  lat?: number;
  lng?: number;
  startsAt: string;
}

interface MapPin {
  id: string;
  type: 'offer' | 'service' | 'event' | 'user' | 'merchant';
  position: [number, number];
  title: string;
  description?: string;
  link?: string;
  image?: string;
}

export default function MapPage() {
  const [activeFilters, setActiveFilters] = useState({
    offers: true,
    services: true,
    events: true,
    merchants: false,
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4168, -3.7038]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const { data: offers } = useQuery<{ data: Offer[] }>({
    queryKey: ['offers'],
    queryFn: () => api.get('/offers'),
  });

  const { data: events } = useQuery<{ data: Event[] }>({
    queryKey: ['events'],
    queryFn: () => api.get('/events'),
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
          setMapCenter(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const pins: MapPin[] = useMemo(() => {
    const result: MapPin[] = [];

    // Add offers
    if (offers?.data && (activeFilters.offers || activeFilters.services)) {
      offers.data.forEach((offer) => {
        if (offer.lat && offer.lng) {
          const isService = offer.type === 'SERVICE';
          if ((isService && activeFilters.services) || (!isService && activeFilters.offers)) {
            result.push({
              id: offer.id,
              type: isService ? 'service' : 'offer',
              position: [offer.lat, offer.lng],
              title: offer.title,
              description: offer.description?.substring(0, 100) + '...',
              link: `/offers/${offer.id}`,
              image: offer.images?.[0],
            });
          }
        }
      });
    }

    // Add events
    if (events?.data && activeFilters.events) {
      events.data.forEach((event) => {
        if (event.lat && event.lng) {
          result.push({
            id: event.id,
            type: 'event',
            position: [event.lat, event.lng],
            title: event.title,
            description: event.description?.substring(0, 100) + '...',
            link: `/events/${event.id}`,
          });
        }
      });
    }

    // Add user location
    if (userLocation) {
      result.push({
        id: 'user-location',
        type: 'user',
        position: userLocation,
        title: 'Tu ubicación',
        description: 'Estás aquí',
      });
    }

    return result;
  }, [offers, events, activeFilters, userLocation]);

  const toggleFilter = (filter: keyof typeof activeFilters) => {
    setActiveFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const stats = useMemo(() => {
    return {
      offers: pins.filter((p) => p.type === 'offer').length,
      services: pins.filter((p) => p.type === 'service').length,
      events: pins.filter((p) => p.type === 'event').length,
      merchants: pins.filter((p) => p.type === 'merchant').length,
    };
  }, [pins]);

  return (
    <>
      <Head>
        <title>Mapa de la Comunidad - Comunidad Viva</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa de la Comunidad</h1>
            <p className="text-gray-600">
              Explora ofertas, servicios, eventos y comercios cerca de ti
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Filtros</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toggleFilter('offers')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilters.offers
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🛍️ Ofertas ({stats.offers})
              </button>

              <button
                onClick={() => toggleFilter('services')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilters.services
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔧 Servicios ({stats.services})
              </button>

              <button
                onClick={() => toggleFilter('events')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilters.events
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Eventos ({stats.events})
              </button>

              <button
                onClick={() => toggleFilter('merchants')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilters.merchants
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏪 Comercios ({stats.merchants})
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow p-4">
            <Map
              center={mapCenter}
              zoom={13}
              pins={pins}
              height="600px"
              onPinClick={(pin) => {
                if (pin.link) {
                  window.location.href = pin.link;
                }
              }}
            />
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Leyenda</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-700">Ofertas / Productos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600"></div>
                <span className="text-sm text-gray-700">Servicios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-600"></div>
                <span className="text-sm text-gray-700">Eventos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-600"></div>
                <span className="text-sm text-gray-700">Tu ubicación</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.offers}</div>
              <div className="text-sm text-gray-600 mt-1">Ofertas activas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.services}</div>
              <div className="text-sm text-gray-600 mt-1">Servicios disponibles</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.events}</div>
              <div className="text-sm text-gray-600 mt-1">Eventos próximos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.merchants}</div>
              <div className="text-sm text-gray-600 mt-1">Comercios locales</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
