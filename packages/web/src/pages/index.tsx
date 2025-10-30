import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Feed from '@/components/Feed';
import QuickActions from '@/components/QuickActions';
import DailySeed from '@/components/DailySeed';
import CommunityStats from '@/components/CommunityStats';
import UnifiedFeed from '@/components/UnifiedFeed';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface MapPin {
  id: string;
  type: 'offer' | 'service' | 'event' | 'user' | 'merchant' | 'need' | 'project' | 'housing';
  position: [number, number];
  title: string;
  description?: string;
  link?: string;
  image?: string;
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'map' | 'feed'>('map');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);
    setUserId(storedUserId);

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Fetch user's community
  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  // Fetch offers for map
  const { data: offersData } = useQuery({
    queryKey: ['map-offers'],
    queryFn: async () => {
      const response = await api.get('/offers', { params: { limit: 50 } });
      console.log('🔍 Raw offers response:', response.data);
      console.log('🔍 Is array?', Array.isArray(response.data));
      const result = Array.isArray(response.data) ? response.data : [];
      console.log('🔍 Offers result length:', result.length);
      if (result.length > 0) {
        console.log('🔍 First offer:', result[0]);
      }
      return result;
    },
  });

  // Fetch events for map
  const { data: eventsData } = useQuery({
    queryKey: ['map-events'],
    queryFn: async () => {
      const response = await api.get('/events', { params: { limit: 50 } });
      const events = response.data?.events || response.data;
      return Array.isArray(events) ? events : [];
    },
  });

  // Fetch needs for map
  const { data: needsData } = useQuery({
    queryKey: ['map-needs'],
    queryFn: async () => {
      const response = await api.get('/mutual-aid/needs', { params: { limit: 50 } });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  // Fetch projects for map
  const { data: projectsData } = useQuery({
    queryKey: ['map-projects'],
    queryFn: async () => {
      const response = await api.get('/mutual-aid/projects', { params: { limit: 50 } });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  // Fetch housing solutions for map
  const { data: housingData } = useQuery({
    queryKey: ['map-housing'],
    queryFn: async () => {
      const response = await api.get('/housing/solutions', { params: { limit: 50 } });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  // Fetch timebank offers for map
  const { data: timebankData } = useQuery({
    queryKey: ['map-timebank'],
    queryFn: async () => {
      const response = await api.get('/timebank/offers', { params: { limit: 50 } });
      // El endpoint devuelve un array directamente o dentro de data
      return Array.isArray(response.data) ? response.data : (response.data?.offers || []);
    },
  });

  // Fetch groupbuys for map
  const { data: groupbuysData } = useQuery({
    queryKey: ['map-groupbuys'],
    queryFn: async () => {
      const response = await api.get('/groupbuys', { params: { limit: 50 } });
      return response.data?.groupBuys || [];
    },
  });

  // Transform data to map pins
  console.log('📊 Data fetched before filtering:', {
    offers: (offersData || []).length,
    events: (eventsData || []).length,
    needs: (needsData || []).length,
    projects: (projectsData || []).length,
    housing: (housingData || []).length,
    timebank: (timebankData || []).length,
    groupbuys: (groupbuysData || []).length,
  });

  const offersWithCoords = (offersData || []).filter((offer: any) => offer.lat && offer.lng && offer.lat !== 0 && offer.lng !== 0);
  const eventsWithCoords = (eventsData || []).filter((event: any) => event.lat && event.lng && event.lat !== 0 && event.lng !== 0);
  const needsWithCoords = (needsData || []).filter((need: any) => need.latitude && need.longitude);
  const projectsWithCoords = (projectsData || []).filter((project: any) => project.latitude && project.longitude);
  const housingWithCoords = (housingData || []).filter((housing: any) => housing.latitude && housing.longitude);
  const timebankWithCoords = (timebankData || []).filter((offer: any) => offer.offer?.lat && offer.offer?.lng && offer.offer?.lat !== 0 && offer.offer?.lng !== 0);
  const groupbuysWithCoords = (groupbuysData || []).filter((gb: any) => gb.pickupLat && gb.pickupLng);

  console.log('📍 Map pins with coordinates:', {
    offers: offersWithCoords.length,
    events: eventsWithCoords.length,
    needs: needsWithCoords.length,
    projects: projectsWithCoords.length,
    housing: housingWithCoords.length,
    timebank: timebankWithCoords.length,
    groupbuys: groupbuysWithCoords.length,
    total: offersWithCoords.length + eventsWithCoords.length + needsWithCoords.length + projectsWithCoords.length + housingWithCoords.length + timebankWithCoords.length + groupbuysWithCoords.length,
  });

  const mapPins: MapPin[] = [
    // Offers
    ...offersWithCoords.map((offer: any) => ({
        id: `offer-${offer.id}`,
        type: offer.type === 'TIME_BANK' ? 'service' : 'offer' as const,
        position: [offer.lat, offer.lng] as [number, number],
        title: offer.title,
        description: offer.description?.substring(0, 100),
        link: `/offers/${offer.id}`,
        image: offer.images?.[0],
      })),
    // Events
    ...eventsWithCoords.map((event: any) => ({
      id: `event-${event.id}`,
      type: 'event' as const,
      position: [event.lat, event.lng] as [number, number],
      title: event.title,
      description: event.description?.substring(0, 100),
      link: `/events/${event.id}`,
      image: event.image,
    })),
    // Needs
    ...needsWithCoords.map((need: any) => ({
      id: `need-${need.id}`,
      type: 'need' as const,
      position: [need.latitude, need.longitude] as [number, number],
      title: need.title,
      description: need.description?.substring(0, 100),
      link: `/mutual-aid/needs/${need.id}`,
      image: need.images?.[0],
    })),
    // Projects
    ...projectsWithCoords.map((project: any) => ({
      id: `project-${project.id}`,
      type: 'project' as const,
      position: [project.latitude, project.longitude] as [number, number],
      title: project.title,
      description: project.description?.substring(0, 100),
      link: `/mutual-aid/projects/${project.id}`,
      image: project.images?.[0],
    })),
    // Housing solutions
    ...housingWithCoords.map((housing: any) => ({
      id: `housing-${housing.id}`,
      type: 'housing' as const,
      position: [housing.latitude, housing.longitude] as [number, number],
      title: housing.title || housing.name,
      description: housing.description?.substring(0, 100),
      link: housing.solutionType === 'HOUSING_COOP'
        ? `/housing/coops/${housing.id}`
        : `/housing/${housing.id}`,
      image: housing.images?.[0],
    })),
    // Timebank offers
    ...timebankWithCoords.map((offer: any) => ({
      id: `timebank-${offer.id}`,
      type: 'service' as const,
      position: [offer.offer.lat, offer.offer.lng] as [number, number],
      title: offer.offer.title,
      description: offer.offer.description?.substring(0, 100),
      link: `/timebank/offers/${offer.id}`,
      image: offer.offer.images?.[0],
    })),
    // Group buys
    ...groupbuysWithCoords.map((gb: any) => ({
      id: `groupbuy-${gb.id}`,
      type: 'offer' as const,
      position: [gb.pickupLat, gb.pickupLng] as [number, number],
      title: gb.offer?.title || 'Compra Grupal',
      description: gb.offer?.description?.substring(0, 100) || `${gb.currentParticipants}/${gb.maxParticipants} participantes`,
      link: `/groupbuys/${gb.id}`,
      image: gb.offer?.images?.[0],
    })),
  ];

  // Calculate map center
  const mapCenter: [number, number] = (() => {
    // 1. Priority: User's geolocation
    if (userLocation) {
      console.log('Map center: User location', userLocation);
      return userLocation;
    }

    // 2. User's community location
    if (userData?.community?.lat && userData?.community?.lng) {
      console.log('Map center: User community', [userData.community.lat, userData.community.lng]);
      return [userData.community.lat, userData.community.lng];
    }

    // 3. If there are pins in Spain, center on them (filter out coordinates outside Spain)
    const spainPins = mapPins.filter(pin => {
      const lat = pin.position[0];
      const lng = pin.position[1];
      // Spain is roughly between lat 36-44 and lng -10 to 5
      return lat >= 36 && lat <= 44 && lng >= -10 && lng <= 5;
    });

    if (spainPins.length > 0) {
      const avgLat = spainPins.reduce((sum, pin) => sum + pin.position[0], 0) / spainPins.length;
      const avgLng = spainPins.reduce((sum, pin) => sum + pin.position[1], 0) / spainPins.length;
      console.log('Map center: Average of Spain pins', [avgLat, avgLng], 'Total Spain pins:', spainPins.length);
      return [avgLat, avgLng];
    }

    // 4. Default to Navarra (Pamplona)
    console.log('Map center: Default (Navarra)', [42.8125, -1.6458]);
    return [42.8125, -1.6458];
  })();

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
                <div className="space-y-6">
                  <Map pins={mapPins} center={mapCenter} zoom={6} height="600px" />
                  <UnifiedFeed />
                </div>
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
