import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';
import Feed from '@/components/Feed';
import QuickActions from '@/components/QuickActions';
import DailySeed from '@/components/DailySeed';
import CommunityStats from '@/components/CommunityStats';
import UnifiedFeed from '@/components/UnifiedFeed';
import Button from '@/components/Button';
import MapFilterPanel from '@/components/MapFilterPanel';
import LandingPage from '@/components/LandingPage';
import InteractiveTour from '@/components/InteractiveTour';
import FeedbackWidget from '@/components/FeedbackWidget';
import ContextualTooltip from '@/components/ContextualTooltip';
import OnboardingTipDisplay from '@/components/OnboardingTipDisplay';
import BadgeNotification from '@/components/BadgeNotification';
import DashboardCustomizer from '@/components/DashboardCustomizer';
import InfoTooltip from '@/components/InfoTooltip';
import PublicViewBanner from '@/components/PublicViewBanner';
import DemoContentNotice from '@/components/DemoContentNotice';
import PlatformStats from '@/components/PlatformStats';
import { api } from '@/lib/api';
import BadgeManager, { Badge } from '@/lib/badges';
import { getI18nProps } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { fadeInUp, staggerContainer, listItem } from '@/utils/animations';
import Analytics, { ANALYTICS_EVENTS } from '@/lib/analytics';
import { handleImageError } from '@/lib/imageUtils';
import ProgressiveOnboardingManager, { OnboardingTip } from '@/lib/progressiveOnboarding';
import AdaptiveTourManager, { AdaptiveTour } from '@/lib/adaptiveTours';
import ProfileSelector from '@/components/ProfileSelector';
import BeginnerWelcome from '@/components/BeginnerWelcome';
import IntentionOnboarding from '@/components/IntentionOnboarding';
import DashboardSettings from '@/lib/dashboardSettings';
import {
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  MapIcon,
  NewspaperIcon,
  FunnelIcon,
  GlobeAltIcon,
  HandRaisedIcon,
  SparklesIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface MapPin {
  id: string;
  type: 'offer' | 'service' | 'event' | 'user' | 'merchant' | 'need' | 'project' | 'housing';
  position: [number, number];
  title: string;
  description?: string;
  link?: string;
  image?: string;
  communityId?: string;
}

export default function HomePage() {
  const t = useTranslations('common');
  const tHome = useTranslations('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'activity'>('explore');
  const [view, setView] = useState<'map' | 'feed'>('map');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);
  const [currentOnboardingTip, setCurrentOnboardingTip] = useState<OnboardingTip | null>(null);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  const [showDashboardCustomizer, setShowDashboardCustomizer] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<string[]>([]);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showIntentionOnboarding, setShowIntentionOnboarding] = useState(false);
  const [adaptiveTour, setAdaptiveTour] = useState<AdaptiveTour | null>(null);
  const [showBeginnerMode, setShowBeginnerMode] = useState(false);
  const [userName, setUserName] = useState('');

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(['offer', 'service', 'event', 'need', 'project', 'housing'])
  );
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(new Set());
  const [proximityRadius, setProximityRadius] = useState<number | null>(null); // in km
  const [proximityCenter, setProximityCenter] = useState<'location' | 'community' | 'custom'>('location');
  const [customLocation, setCustomLocation] = useState<[number, number] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [mapZoom, setMapZoom] = useState(6);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [fullscreenFiltersVisible, setFullscreenFiltersVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    const storedUserId = storedUser ? JSON.parse(storedUser).id : null;
    const hasAuthenticated = !!token;
    setIsAuthenticated(hasAuthenticated);
    setUserId(storedUserId);

    // Get user name for beginner welcome
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || 'Usuario');
      } catch {
        setUserName('Usuario');
      }
    }

    // Check if user has completed the tour
    if (hasAuthenticated) {
      // Check if beginner mode should be shown
      const beginnerCompleted = localStorage.getItem('beginner_mode_completed');
      if (!beginnerCompleted) {
        setShowBeginnerMode(true);
        return; // Don't show other onboarding if in beginner mode
      }

      // Check if intention onboarding should be shown
      const intentionOnboardingCompleted = localStorage.getItem('intention_onboarding_completed');
      const userIntention = localStorage.getItem('user_intention');

      // Show intention onboarding if:
      // 1. Not completed before
      // 2. User has no intention set
      if (!intentionOnboardingCompleted || !userIntention) {
        setTimeout(() => {
          setShowIntentionOnboarding(true);
        }, 1000);
        return;
      }

      // If intention onboarding is completed, continue with existing flow
      // First time: Show profile selector (deprecated - now we use intention onboarding)
      const hasSelectedProfile = localStorage.getItem('user_profile');
      if (!hasSelectedProfile) {
        setTimeout(() => {
          setShowProfileSelector(true);
        }, 1000);
      } else {
        // Load adaptive tour based on user profile
        const tour = AdaptiveTourManager.getNextTourForProfile('homepage');
        if (tour) {
          setTimeout(() => {
            setAdaptiveTour(tour);
            setShowTour(true);
          }, 1500);
        } else {
          // If all tours are completed, show progressive onboarding tip
          setTimeout(() => {
            const tip = ProgressiveOnboardingManager.getNextTipForPage('homepage');
            if (tip) {
              setCurrentOnboardingTip(tip);
            }
          }, 2000);
        }
      }
    }

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          logger.debug('Geolocation error', { error: error.message });
        }
      );
    }

    // Load enabled widgets from dashboard settings
    const loadedEnabledWidgets = DashboardSettings.getEnabledWidgets();
    setEnabledWidgets(loadedEnabledWidgets);
  }, []);

  // Synchronize map zoom with proximity radius
  useEffect(() => {
    if (proximityRadius === null) {
      // No proximity filter, use default zoom (increased from 6 to 10 for closer view)
      setMapZoom(10);
    } else {
      // Calculate appropriate zoom level based on radius
      // Formula: smaller radius = higher zoom (more zoomed in)
      // Approximate zoom levels for different radii:
      // 1km = zoom 14, 2km = 13, 5km = 12, 10km = 11, 25km = 10, 50km = 9, 100km = 8
      let calculatedZoom;
      if (proximityRadius <= 1) calculatedZoom = 14;
      else if (proximityRadius <= 2) calculatedZoom = 13;
      else if (proximityRadius <= 5) calculatedZoom = 12;
      else if (proximityRadius <= 10) calculatedZoom = 11;
      else if (proximityRadius <= 25) calculatedZoom = 10;
      else if (proximityRadius <= 50) calculatedZoom = 9;
      else if (proximityRadius <= 100) calculatedZoom = 8;
      else calculatedZoom = 7;

      setMapZoom(calculatedZoom);
    }
  }, [proximityRadius]);

  // Fetch user's community
  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      logger.debug('User data loaded', {
        userId: response.data?.id,
        communityId: response.data?.community?.id
      });
      return response.data;
    },
    enabled: !!userId,
  });

  // Set default proximity center to user's community if available (only once on initial load)
  const hasInitializedProximity = useRef(false);
  useEffect(() => {
    if (userData?.community && !hasInitializedProximity.current) {
      setProximityCenter('community');
      hasInitializedProximity.current = true;
    }
  }, [userData]);

  // Fetch communities for filter
  const { data: communitiesData } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const response = await api.get('/communities', { params: { limit: 100 } });
      return Array.isArray(response.data) ? response.data : (response.data?.communities || []);
    },
  });

  // Fetch offers for map
  const { data: offersData } = useQuery({
    queryKey: ['map-offers'],
    queryFn: async () => {
      const response = await api.get('/offers', { params: { limit: 50 } });
      const result = Array.isArray(response.data) ? response.data : [];
      logger.debug('Offers loaded for map', {
        isArray: Array.isArray(response.data),
        count: result.length,
        firstOffer: result[0]?.id
      });
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
  const offersWithCoords = (offersData || []).filter((offer: any) => offer.lat && offer.lng && offer.lat !== 0 && offer.lng !== 0);
  const eventsWithCoords = (eventsData || []).filter((event: any) => event.lat && event.lng && event.lat !== 0 && event.lng !== 0);
  const needsWithCoords = (needsData || []).filter((need: any) => need.latitude && need.longitude);
  const projectsWithCoords = (projectsData || []).filter((project: any) => project.latitude && project.longitude);
  const housingWithCoords = (housingData || []).filter((housing: any) => housing.latitude && housing.longitude);
  const timebankWithCoords = (timebankData || []).filter((offer: any) => offer.offer?.lat && offer.offer?.lng && offer.offer?.lat !== 0 && offer.offer?.lng !== 0);
  const groupbuysWithCoords = (groupbuysData || []).filter((gb: any) => gb.pickupLat && gb.pickupLng);

  logger.debug('Map data loaded', {
    dataFetched: {
      offers: (offersData || []).length,
      events: (eventsData || []).length,
      needs: (needsData || []).length,
      projects: (projectsData || []).length,
      housing: (housingData || []).length,
      timebank: (timebankData || []).length,
      groupbuys: (groupbuysData || []).length,
    },
    withCoordinates: {
      offers: offersWithCoords.length,
      events: eventsWithCoords.length,
      needs: needsWithCoords.length,
      projects: projectsWithCoords.length,
      housing: housingWithCoords.length,
      timebank: timebankWithCoords.length,
      groupbuys: groupbuysWithCoords.length,
      total: offersWithCoords.length + eventsWithCoords.length + needsWithCoords.length + projectsWithCoords.length + housingWithCoords.length + timebankWithCoords.length + groupbuysWithCoords.length,
    },
  });

  // Prepare all items for search suggestions
  const allSearchableItems = useMemo(() => {
    const items: Array<{ id: string; title: string; type: string }> = [];

    // Add offers
    (offersData || []).forEach((offer: any) => {
      items.push({
        id: `offer-${offer.id}`,
        title: offer.title,
        type: offer.type === 'TIME_BANK' ? 'service' : 'offer',
      });
    });

    // Add events
    (eventsData || []).forEach((event: any) => {
      items.push({
        id: `event-${event.id}`,
        title: event.title,
        type: 'event',
      });
    });

    // Add needs
    (needsData || []).forEach((need: any) => {
      items.push({
        id: `need-${need.id}`,
        title: need.title,
        type: 'need',
      });
    });

    // Add projects
    (projectsData || []).forEach((project: any) => {
      items.push({
        id: `project-${project.id}`,
        title: project.title,
        type: 'project',
      });
    });

    // Add housing
    (housingData || []).forEach((housing: any) => {
      items.push({
        id: `housing-${housing.id}`,
        title: housing.title || housing.name,
        type: 'housing',
      });
    });

    // Add groupbuys
    (groupbuysData || []).forEach((gb: any) => {
      items.push({
        id: `groupbuy-${gb.id}`,
        title: gb.offer?.title || 'Compra Grupal',
        type: 'offer',
      });
    });

    return items;
  }, [offersData, eventsData, needsData, projectsData, housingData, groupbuysData]);

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
        communityId: offer.communityId,
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
      communityId: event.communityId,
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
      communityId: need.communityId,
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
      communityId: project.communityId,
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
      communityId: housing.communityId,
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
      communityId: offer.offer.communityId,
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
      communityId: gb.offer?.communityId,
    })),
  ];

  // Filter pins based on active filters
  const filteredPins = useMemo(() => {
    return mapPins.filter(pin => {
      // Type filter
      if (!selectedTypes.has(pin.type)) {
        return false;
      }

      // Search filter
      if (searchText && !pin.title.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }

      // Proximity filter
      if (proximityRadius !== null) {
        let referencePoint: [number, number] | null = null;

        if (proximityCenter === 'location' && userLocation) {
          referencePoint = userLocation;
        } else if (proximityCenter === 'community' && userData?.community) {
          referencePoint = [userData.community.lat, userData.community.lng];
        } else if (proximityCenter === 'custom' && customLocation) {
          referencePoint = customLocation;
        }

        if (referencePoint) {
          const distance = calculateDistance(referencePoint, pin.position);
          if (distance > proximityRadius) {
            return false;
          }
        }
      }

      // Community filter
      if (selectedCommunities.size > 0) {
        if (!pin.communityId || !selectedCommunities.has(pin.communityId)) {
          return false;
        }
      }

      return true;
    });
  }, [mapPins, selectedTypes, searchText, proximityRadius, proximityCenter, userLocation, userData, selectedCommunities, customLocation]);

  // Add proximity center marker when proximity filter is active
  const pinsWithProximityMarker = useMemo(() => {
    if (proximityRadius === null) {
      return filteredPins;
    }

    let proximityPoint: [number, number] | null = null;
    let markerTitle = '';
    let markerDescription = '';

    if (proximityCenter === 'location' && userLocation) {
      proximityPoint = userLocation;
      markerTitle = '📍 Tu ubicación';
      markerDescription = `Buscando en ${proximityRadius}km a la redonda`;
    } else if (proximityCenter === 'community' && userData?.community) {
      proximityPoint = [userData.community.lat, userData.community.lng];
      markerTitle = `🏘️ ${userData.community.name}`;
      markerDescription = `Buscando en ${proximityRadius}km desde esta comunidad`;
    } else if (proximityCenter === 'custom' && customLocation) {
      proximityPoint = customLocation;
      markerTitle = '🎯 Ubicación personalizada';
      markerDescription = `Buscando en ${proximityRadius}km a la redonda`;
    }

    if (proximityPoint) {
      const searchCenterPin: MapPin = {
        id: 'proximity-center',
        type: 'user', // Using 'user' type for the violet marker
        position: proximityPoint,
        title: markerTitle,
        description: markerDescription,
      };

      return [searchCenterPin, ...filteredPins];
    }

    return filteredPins;
  }, [filteredPins, proximityRadius, proximityCenter, userLocation, userData, customLocation]);

  // Calculate map center based on proximity filter settings
  const mapCenter: [number, number] = (() => {
    // If proximity filter is active, center on the selected reference point
    if (proximityRadius !== null) {
      if (proximityCenter === 'custom' && customLocation) {
        logger.debug('Map center: Custom location (proximity filter)', { coords: customLocation });
        return customLocation;
      }
      if (proximityCenter === 'location' && userLocation) {
        logger.debug('Map center: User location (proximity filter)', { coords: userLocation });
        return userLocation;
      }
      if (proximityCenter === 'community' && userData?.community?.lat && userData?.community?.lng) {
        const communityCoords: [number, number] = [userData.community.lat, userData.community.lng];
        logger.debug('Map center: User community (proximity filter)', { coords: communityCoords });
        return communityCoords;
      }
    }

    // Fallback logic when no proximity filter is active
    // 1. Priority: User's geolocation
    if (userLocation) {
      logger.debug('Map center: User location', { coords: userLocation });
      return userLocation;
    }

    // 2. User's community location
    if (userData?.community?.lat && userData?.community?.lng) {
      const coords: [number, number] = [userData.community.lat, userData.community.lng];
      logger.debug('Map center: User community', { coords });
      return coords;
    }

    // 3. If there are filtered pins in Spain, center on them (filter out coordinates outside Spain)
    const spainPins = filteredPins.filter(pin => {
      const lat = pin.position[0];
      const lng = pin.position[1];
      // Spain is roughly between lat 36-44 and lng -10 to 5
      return lat >= 36 && lat <= 44 && lng >= -10 && lng <= 5;
    });

    if (spainPins.length > 0) {
      const avgLat = spainPins.reduce((sum, pin) => sum + pin.position[0], 0) / spainPins.length;
      const avgLng = spainPins.reduce((sum, pin) => sum + pin.position[1], 0) / spainPins.length;
      logger.debug('Map center: Average of Spain pins', { coords: [avgLat, avgLng], count: spainPins.length });
      return [avgLat, avgLng];
    }

    // 4. Default to Navarra (Pamplona)
    logger.debug('Map center: Default (Navarra)', { coords: [42.8125, -1.6458] });
    return [42.8125, -1.6458];
  })();

  // Show landing page ONLY if user explicitly hasn't visited before
  // Allow public browsing for returning visitors
  if (!isAuthenticated) {
    const hasVisitedBefore = localStorage.getItem('has_visited_public_view');
    if (!hasVisitedBefore) {
      // First time visitor - show landing page
      localStorage.setItem('has_visited_public_view', 'true');
      return <LandingPage />;
    }
    // Returning visitor - allow public browsing with banner
  }

  // Tour steps - Use adaptive tour if available, otherwise use default
  const tourSteps = adaptiveTour ? adaptiveTour.steps : [
    {
      target: '[data-tour="tabs"]',
      title: '¡Bienvenido a Comunidad Viva! 🎉',
      description: 'Navega entre tres secciones: Descubre (explora el mapa), Mi Actividad (tu feed personal) y Comunidad (estadísticas y eventos).',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Acciones Rápidas ⚡',
      description: 'Crea ofertas, eventos, necesidades o proyectos con un solo clic. Estas son las acciones más importantes para participar en tu comunidad.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="map-toggle"]',
      title: 'Vista de Mapa o Feed 🗺️',
      description: 'Alterna entre el mapa interactivo (para explorar geográficamente) y el feed de contenido (para ver todo en lista).',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="filters"]',
      title: 'Filtros Inteligentes 🔍',
      description: 'Filtra recursos por tipo, comunidad, proximidad o búsqueda de texto. Personaliza tu experiencia para ver solo lo que te interesa.',
      position: 'left' as const,
    },
  ];

  // Show beginner welcome for new users
  if (isAuthenticated && showBeginnerMode) {
    return (
      <Layout>
        <BeginnerWelcome
          userName={userName}
          onComplete={() => {
            setShowBeginnerMode(false);
            localStorage.setItem('beginner_mode_completed', 'true');
          }}
          onSkip={() => {
            setShowBeginnerMode(false);
            localStorage.setItem('beginner_mode_completed', 'true');
          }}
        />
      </Layout>
    );
  }

  // Show dashboard for authenticated users (and public browsing for non-authenticated)
  return (
    <Layout>
      {!isAuthenticated && <PublicViewBanner message="Únete gratis para contactar, publicar ofertas y participar en la comunidad" />}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ paddingTop: !isAuthenticated ? '60px' : '0' }}>
        <div className="container mx-auto px-4 py-6">
          {/* Tab Navigation - Simplified to 2 tabs with prominent CTA */}
          <div data-tour="tabs" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 p-1 flex gap-2 overflow-x-auto items-center">
            <div className="flex gap-1 flex-1">
              <button
                onClick={() => {
                  setActiveTab('explore');
                  Analytics.track(ANALYTICS_EVENTS.TAB_CHANGED, { tab: 'explore' });
                }}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'explore'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <GlobeAltIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Explorar</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('activity');
                  Analytics.track(ANALYTICS_EVENTS.TAB_CHANGED, { tab: 'activity' });
                }}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'activity'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Mi Actividad</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowDashboardCustomizer(true);
                  Analytics.track(ANALYTICS_EVENTS.DASHBOARD_CUSTOMIZER_OPENED);
                }}
                className="px-4 py-3 rounded-md font-medium transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title={tHome('customizeDashboard')}
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Prominent CTA Button - Desktop */}
            {isAuthenticated ? (
              <Link
                href="/offers/new"
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold shadow-lg transition-all hover:scale-105"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Publicar Oferta</span>
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold shadow-lg transition-all hover:scale-105"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Unirse Gratis</span>
              </Link>
            )}
          </div>

          {/* Quick Actions - Simplified to 3 actions - Conditional based on dashboard settings */}
          {isAuthenticated && activeTab === 'explore' && enabledWidgets.includes('quick_actions') && (
            <motion.div
              data-tour="quick-actions"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Acciones Rápidas
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Link
                    href="/offers/new"
                    className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
                  >
                    <ShoppingBagIcon className="h-8 w-8" />
                    <span className="text-xs font-semibold text-center">Publicar</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowFilters(true);
                    }}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
                  >
                    <MagnifyingGlassIcon className="h-8 w-8" />
                    <span className="text-xs font-semibold text-center">Buscar</span>
                  </button>
                  <Link
                    href="/communities"
                    className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                  >
                    <UserGroupIcon className="h-8 w-8" />
                    <span className="text-xs font-semibold text-center">Comunidad</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 desktop:grid-cols-4 gap-6">
                  {/* Map/Feed Section */}
                  <div className="desktop:col-span-3 space-y-6">
                    {/* Featured Section - Top 3 most recent offers */}
                    {offersData && offersData.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-yellow-500" />
                            Destacados
                          </h3>
                          <Link
                            href="/offers"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            Ver todo →
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {offersData.slice(0, 3).map((offer: any) => (
                            <Link
                              key={offer.id}
                              href={`/offers/${offer.id}`}
                              className="group flex flex-col bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]"
                            >
                              {offer.images && offer.images[0] && (
                                <div className="relative h-32 bg-gray-200 dark:bg-gray-600">
                                  <img
                                    src={offer.images[0]}
                                    alt={offer.title}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                  />
                                </div>
                              )}
                              <div className="p-3 flex-1">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  {offer.title}
                                </h4>
                                {offer.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {offer.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Toggle */}
                    <div data-tour="map-toggle" className="flex items-center gap-3">
                      <Button
                        onClick={() => {
                          setView('map');
                          Analytics.track(ANALYTICS_EVENTS.VIEW_CHANGED, { view: 'map' });
                        }}
                        variant={view === 'map' ? 'primary' : 'ghost'}
                        size="md"
                      >
                        <div className="flex items-center gap-2">
                          <MapIcon className="h-5 w-5" />
                          <span>{tHome('map')}</span>
                        </div>
                        {view === 'map' && filteredPins.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                            {filteredPins.length}
                          </span>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setView('feed');
                          Analytics.track(ANALYTICS_EVENTS.VIEW_CHANGED, { view: 'feed' });
                        }}
                        variant={view === 'feed' ? 'primary' : 'ghost'}
                        size="md"
                      >
                        <div className="flex items-center gap-2">
                          <NewspaperIcon className="h-5 w-5" />
                          <span>{tHome('feed')}</span>
                        </div>
                      </Button>
                      {view === 'map' && filteredPins.length > 0 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {filteredPins.length} resultado{filteredPins.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {view === 'map' ? (
                      <div className="space-y-6">
                        {/* Map - Conditional based on dashboard settings */}
                        {enabledWidgets.includes('map_view') && (
                          <div className="relative z-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <Map pins={pinsWithProximityMarker} center={mapCenter} zoom={mapZoom} height="600px" />
                            {/* Fullscreen Button */}
                            <button
                              onClick={() => setIsFullscreenMap(true)}
                              className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-lg shadow-lg transition-all hover:scale-110 border-2 border-gray-200 dark:border-gray-600"
                              title="Ver en pantalla completa"
                            >
                              <ArrowsPointingOutIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}

                        {/* Unified Feed - Below Map */}
                        <UnifiedFeed
                          selectedTypes={selectedTypes}
                          selectedCommunities={selectedCommunities}
                          proximityRadius={proximityRadius}
                          searchText={searchText}
                          userLocation={userLocation}
                          onTypesChange={setSelectedTypes}
                        />
                      </div>
                    ) : (
                      <UnifiedFeed
                        selectedTypes={selectedTypes}
                        selectedCommunities={selectedCommunities}
                        proximityRadius={proximityRadius}
                        searchText={searchText}
                        userLocation={userLocation}
                        onTypesChange={setSelectedTypes}
                      />
                    )}
                  </div>

            {/* Filter Panel - Desktop: Right Sidebar, Mobile: Modal */}
            {view === 'map' && (
              <>
                {/* Desktop Sidebar - Expandable with button */}
                <motion.div
                  data-tour="filters"
                  data-tooltip="filters"
                  className="hidden desktop:block desktop:col-span-1 relative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="sticky top-20 h-fit relative overflow-visible">
                    <div
                      className={`transition-all duration-500 ease-out rounded-lg relative ${
                        filtersExpanded
                          ? 'backdrop-blur-sm shadow-2xl z-50 [&>div]:!bg-white/90 [&>div]:dark:!bg-gray-800/90'
                          : ''
                      }`}
                      style={{
                        width: filtersExpanded ? '480px' : '100%',
                        marginLeft: filtersExpanded ? '-200px' : '0',
                      }}
                    >
                      {/* Expand/Collapse Button - Inside the expanding container */}
                      <button
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        className="absolute -left-10 top-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-l-lg shadow-lg transition-all hover:scale-110"
                        title={filtersExpanded ? 'Contraer filtros' : 'Expandir filtros'}
                      >
                        {filtersExpanded ? (
                          <ChevronRightIcon className="h-5 w-5" />
                        ) : (
                          <ChevronLeftIcon className="h-5 w-5" />
                        )}
                      </button>
                      <MapFilterPanel
                        show={true}
                        onClose={() => {}}
                        selectedTypes={selectedTypes}
                        onTypesChange={setSelectedTypes}
                        selectedCommunities={selectedCommunities}
                        onCommunitiesChange={setSelectedCommunities}
                        proximityRadius={proximityRadius}
                        onProximityChange={setProximityRadius}
                        proximityCenter={proximityCenter}
                        onProximityCenterChange={setProximityCenter}
                        customLocation={customLocation}
                        onCustomLocationChange={setCustomLocation}
                        searchText={searchText}
                        onSearchChange={setSearchText}
                        communities={communitiesData || []}
                        userLocation={userLocation}
                        userCommunity={userData?.community ? {
                          id: userData.community.id,
                          name: userData.community.name,
                          lat: userData.community.lat,
                          lng: userData.community.lng,
                        } : null}
                      allItems={allSearchableItems}
                      />
                    </div>
                  </div>
                </motion.div>

              {/* Mobile Modal */}
              <AnimatePresence>
                {showFilters && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowFilters(false)}
                      className="desktop:hidden fixed inset-0 bg-black/50 z-[9998]"
                    />

                    {/* Drawer */}
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="desktop:hidden fixed right-0 top-0 bottom-0 w-full sm:w-96 z-[9999]"
                    >
                      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FunnelIcon className="h-5 w-5" />
                            <span>{t('filters')}</span>
                          </h2>
                          <button
                            onClick={() => setShowFilters(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <span className="text-2xl">✕</span>
                          </button>
                        </div>

                        {/* Filter Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                          <MapFilterPanel
                            show={true}
                            onClose={() => setShowFilters(false)}
                            selectedTypes={selectedTypes}
                            onTypesChange={setSelectedTypes}
                            selectedCommunities={selectedCommunities}
                            onCommunitiesChange={setSelectedCommunities}
                            proximityRadius={proximityRadius}
                            onProximityChange={setProximityRadius}
                            proximityCenter={proximityCenter}
                            onProximityCenterChange={setProximityCenter}
                            customLocation={customLocation}
                            onCustomLocationChange={setCustomLocation}
                            searchText={searchText}
                            onSearchChange={setSearchText}
                            communities={communitiesData || []}
                            userLocation={userLocation}
                            userCommunity={userData?.community ? {
                              id: userData.community.id,
                              name: userData.community.name,
                              lat: userData.community.lat,
                              lng: userData.community.lng,
                            } : null}
                            allItems={allSearchableItems}
                          />
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => setShowFilters(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                          >
                            Ver resultados ({filteredPins.length})
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
            )}
                </div>
              </motion.div>
            )}

            {/* Tab: Mi Actividad */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">Mi Actividad</h2>
                    <p className="opacity-90">Tu feed personal y recursos</p>
                  </div>
                  {enabledWidgets.includes('personal_feed') && <Feed />}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Interactive Tour for new users */}
        {showTour && (
          <InteractiveTour
            steps={tourSteps}
            onComplete={() => {
              setShowTour(false);
              setShowFeedback(true);
              Analytics.track(ANALYTICS_EVENTS.TOUR_COMPLETED, { steps: tourSteps.length });

              // Mark adaptive tour as completed
              if (adaptiveTour) {
                AdaptiveTourManager.markTourCompleted(adaptiveTour.id);
                logger.debug('Adaptive tour completed', { tourName: adaptiveTour.name });
              }

              // Award Explorer badge
              const badge = BadgeManager.awardBadge('EXPLORER');
              if (badge) {
                setEarnedBadge(badge);
              }

              logger.debug('Tour completed');

              // Show progressive onboarding tip after tour completes
              setTimeout(() => {
                const tip = ProgressiveOnboardingManager.getNextTipForPage('homepage');
                if (tip) {
                  setCurrentOnboardingTip(tip);
                }
              }, 2000);
            }}
            onSkip={() => {
              setShowTour(false);
              Analytics.track(ANALYTICS_EVENTS.TOUR_SKIPPED);
              logger.debug('Tour skipped');
            }}
            storageKey="homepage_tour_completed"
          />
        )}

        {showFeedback && (
          <FeedbackWidget
            onSubmit={(feedback) => {
              Analytics.track(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, feedback);
              setShowFeedback(false);
            }}
            onSkip={() => {
              Analytics.track(ANALYTICS_EVENTS.FEEDBACK_SKIPPED);
              setShowFeedback(false);
            }}
          />
        )}

        {/* Mobile CTA Button - Floating (FAB) */}
        {activeTab === 'explore' && (
          isAuthenticated ? (
            <Link
              href="/offers/new"
              className="md:hidden fixed bottom-20 right-4 z-[10001] bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 font-semibold transition-all hover:scale-105"
            >
              <SparklesIcon className="h-6 w-6" />
              <span className="text-sm">Publicar</span>
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="md:hidden fixed bottom-20 right-4 z-[10001] bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 font-semibold transition-all hover:scale-105"
            >
              <SparklesIcon className="h-6 w-6" />
              <span className="text-sm">Unirse</span>
            </Link>
          )
        )}

        {/* Mobile Filter Button - Floating (only visible on map view and mobile) */}
        {view === 'map' && activeTab === 'explore' && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden fixed bottom-20 left-4 z-[10001] bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold transition-all hover:scale-105"
          >
            <FunnelIcon className="h-6 w-6" />
            <span className="text-sm">{t('filters')}</span>
            {(selectedTypes.size < 6 || selectedCommunities.size > 0 || proximityRadius !== null || searchText.length > 0) && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
        )}

        {/* Floating Help Button - Always visible */}
        {!showTour && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowTour(true);
              Analytics.track(ANALYTICS_EVENTS.HELP_BUTTON_CLICKED);
            }}
            className="fixed bottom-20 left-4 z-[10000] bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all hover:shadow-blue-500/50"
            style={{ position: 'fixed', bottom: '5rem', left: '1rem', zIndex: 10000 }}
            title="Ver tour de ayuda"
          >
            <div className="flex items-center gap-2">
              <QuestionMarkCircleIcon className="h-6 w-6" />
              <span className="hidden sm:inline font-semibold text-sm">Ayuda</span>
            </div>
          </motion.button>
        )}

        {/* Contextual Tooltips for new users */}
        {showTooltips && (
          <>
            <ContextualTooltip
              id="daily-seed-tooltip"
              target="[data-tooltip='daily-seed']"
              title="¡Gana créditos diarios! 🌱"
              description="Completa tu semilla diaria para ganar créditos y subir de nivel en la comunidad."
              trigger="auto"
              delay={5000}
              showOnce={true}
              position="bottom"
              onDismiss={() => {
                Analytics.track('TOOLTIP_DISMISSED', { tooltip: 'daily-seed' });
              }}
            />

            <ContextualTooltip
              id="map-filters-tooltip"
              target="[data-tooltip='filters']"
              title="Personaliza tu búsqueda 🔍"
              description="Usa los filtros para encontrar exactamente lo que buscas: por tipo, comunidad o proximidad."
              trigger="auto"
              delay={10000}
              showOnce={true}
              position="left"
              onDismiss={() => {
                Analytics.track('TOOLTIP_DISMISSED', { tooltip: 'filters' });
              }}
            />
          </>
        )}

        {/* Progressive Onboarding Tips */}
        {/* Badge Notification */}
        {earnedBadge && (
          <BadgeNotification
            badge={earnedBadge}
            onClose={() => setEarnedBadge(null)}
          />
        )}

        <OnboardingTipDisplay
          tip={currentOnboardingTip}
          onClose={() => {
            if (currentOnboardingTip) {
              ProgressiveOnboardingManager.markTipShown(currentOnboardingTip.id);
              Analytics.track('ONBOARDING_TIP_CLOSED', { tipId: currentOnboardingTip.id });
            }
            setCurrentOnboardingTip(null);
          }}
          onDismissForever={() => {
            if (currentOnboardingTip) {
              ProgressiveOnboardingManager.markTipShown(currentOnboardingTip.id);
              Analytics.track('ONBOARDING_TIP_DISMISSED_FOREVER', { tipId: currentOnboardingTip.id });
            }
            setCurrentOnboardingTip(null);
          }}
        />

        {/* Dashboard Customizer Modal */}
        <DashboardCustomizer
          isOpen={showDashboardCustomizer}
          onClose={() => setShowDashboardCustomizer(false)}
          onSave={() => {
            const updatedEnabledWidgets = DashboardSettings.getEnabledWidgets();
            setEnabledWidgets(updatedEnabledWidgets);
          }}
        />

        {/* Intention Onboarding Modal */}
        <IntentionOnboarding
          isOpen={showIntentionOnboarding}
          onClose={() => {
            setShowIntentionOnboarding(false);
            // Mark as completed even if they close without completing
            localStorage.setItem('intention_onboarding_completed', 'true');
          }}
          onIntentionSelected={(intention) => {
            logger.debug('User intention selected', { intention });
            // Mark as completed
            localStorage.setItem('intention_onboarding_completed', 'true');
            // The component already saves the intention to localStorage
          }}
        />

        {/* Profile Selector Modal */}
        <ProfileSelector
          isOpen={showProfileSelector}
          onClose={() => setShowProfileSelector(false)}
          onProfileSelected={(profile) => {
            logger.debug('Profile selected', { profile });
            setShowProfileSelector(false);
            // Load tour for the selected profile
            const tour = AdaptiveTourManager.getNextTourForProfile('homepage');
            if (tour) {
              setTimeout(() => {
                setAdaptiveTour(tour);
                setShowTour(true);
              }, 500);
            }
          }}
        />

        {/* Demo Content Notice */}
        <DemoContentNotice
          onDismiss={() => {
            Analytics.track(ANALYTICS_EVENTS.DEMO_CONTENT_DISMISSED);
          }}
          onRegister={() => {
            window.location.href = '/offers/new';
          }}
        />

        {/* Fullscreen Map Modal */}
        <AnimatePresence>
          {isFullscreenMap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900"
            >
              <div className="h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MapIcon className="h-6 w-6" />
                    <span>Mapa Interactivo</span>
                    {filteredPins.length > 0 && (
                      <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                        {filteredPins.length} resultado{filteredPins.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFullscreenFiltersVisible(!fullscreenFiltersVisible)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                      title={fullscreenFiltersVisible ? "Ocultar filtros" : "Mostrar filtros"}
                    >
                      <FunnelIcon className="h-5 w-5" />
                      <span>{fullscreenFiltersVisible ? "Ocultar" : "Filtros"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsFullscreenMap(false);
                        setFullscreenFiltersVisible(false);
                      }}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      title="Cerrar pantalla completa"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content: Map + Filters */}
                <div className="flex-1 flex overflow-hidden relative">
                  {/* Map */}
                  <div className="flex-1 relative">
                    <Map pins={pinsWithProximityMarker} center={mapCenter} zoom={mapZoom} height="100%" />
                  </div>

                  {/* Filters Sidebar - Sliding from right */}
                  <AnimatePresence>
                    {fullscreenFiltersVisible && (
                      <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute right-0 top-0 bottom-0 w-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 overflow-y-auto shadow-2xl [&>div]:!bg-transparent"
                      >
                        <MapFilterPanel
                          show={true}
                          onClose={() => {}}
                          selectedTypes={selectedTypes}
                          onTypesChange={setSelectedTypes}
                          selectedCommunities={selectedCommunities}
                          onCommunitiesChange={setSelectedCommunities}
                          proximityRadius={proximityRadius}
                          onProximityChange={setProximityRadius}
                          proximityCenter={proximityCenter}
                          onProximityCenterChange={setProximityCenter}
                          searchText={searchText}
                          onSearchChange={setSearchText}
                          communities={communitiesData?.communities || []}
                          userLocation={userLocation}
                          userCommunity={userData?.community}
                          allItems={mapPins}
                          customLocation={customLocation}
                          onCustomLocationChange={setCustomLocation}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: await getI18nProps(locale),
  };
}
