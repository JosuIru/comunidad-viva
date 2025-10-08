import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Feed from '@/components/Feed';
import QuickActions from '@/components/QuickActions';
import DailySeed from '@/components/DailySeed';
import CommunityStats from '@/components/CommunityStats';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface MapPin {
  id: string;
  type: 'offer' | 'service' | 'event' | 'user' | 'merchant';
  position: [number, number];
  title: string;
  description?: string;
  link?: string;
  image?: string;
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'map' | 'feed'>('map');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch offers for map
  const { data: offersData } = useQuery({
    queryKey: ['map-offers'],
    queryFn: async () => {
      const response = await api.get('/offers', { params: { limit: 50 } });
      return response.data || [];
    },
  });

  // Fetch events for map
  const { data: eventsData } = useQuery({
    queryKey: ['map-events'],
    queryFn: async () => {
      const response = await api.get('/events', { params: { limit: 50 } });
      return response.data?.events || [];
    },
  });

  // Transform data to map pins
  const mapPins: MapPin[] = [
    // Offers
    ...(offersData || [])
      .filter((offer: any) => offer.lat && offer.lng && offer.lat !== 0 && offer.lng !== 0)
      .map((offer: any) => ({
        id: `offer-${offer.id}`,
        type: offer.type === 'TIME_BANK' ? 'service' : 'offer' as const,
        position: [offer.lat, offer.lng] as [number, number],
        title: offer.title,
        description: offer.description?.substring(0, 100),
        link: `/offers/${offer.id}`,
        image: offer.images?.[0],
      })),
    // Events
    ...(eventsData || [])
      .filter((event: any) => event.lat && event.lng && event.lat !== 0 && event.lng !== 0)
      .map((event: any) => ({
        id: `event-${event.id}`,
        type: 'event' as const,
        position: [event.lat, event.lng] as [number, number],
        title: event.title,
        description: event.description?.substring(0, 100),
        link: `/events/${event.id}`,
        image: event.image,
      })),
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <CommunityStats />

        {isAuthenticated && <DailySeed />}

        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setView('map')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  view === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mapa {view === 'map' && mapPins.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
                    {mapPins.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setView('feed')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  view === 'feed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Feed
              </button>
            </div>

            {view === 'map' && mapPins.length === 0 && (
              <div className="text-sm text-gray-500">
                No hay ubicaciones para mostrar
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {view === 'map' ? (
                <Map pins={mapPins} height="600px" />
              ) : (
                <Feed />
              )}
            </div>
            <div>
              {isAuthenticated && <QuickActions />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = getI18nProps;
