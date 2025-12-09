import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  GlobeAltIcon,
  XMarkIcon,
  ArrowRightIcon,
  MapPinIcon,
  TagIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import Analytics, { ANALYTICS_EVENTS } from '@/lib/analytics';
import { logger } from '@/lib/logger';

export type UserIntention = 'search' | 'offer' | 'community' | 'explore';

interface IntentionOption {
  id: UserIntention;
  icon: typeof MagnifyingGlassIcon;
  title: string;
  description: string;
  color: string;
  gradient: string;
}

interface IntentionOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onIntentionSelected?: (intention: UserIntention) => void;
}

const intentionOptions: IntentionOption[] = [
  {
    id: 'search',
    icon: MagnifyingGlassIcon,
    title: 'Buscar algo',
    description: 'Encuentra productos, servicios o ayuda cerca de ti',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'offer',
    icon: ShoppingBagIcon,
    title: 'Ofrecer algo',
    description: 'Vende, ofrece servicios o comparte recursos',
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'community',
    icon: UserGroupIcon,
    title: 'Unirme a comunidad',
    description: 'Conecta con vecinos y comunidades locales',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'explore',
    icon: GlobeAltIcon,
    title: 'Solo explorar',
    description: 'Mira qué hay disponible sin compromiso',
    color: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-600',
  },
];

export default function IntentionOnboarding({
  isOpen,
  onClose,
  onIntentionSelected,
}: IntentionOnboardingProps) {
  const router = useRouter();
  const [selectedIntention, setSelectedIntention] = useState<UserIntention | null>(null);
  const [showSecondStep, setShowSecondStep] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offerData, setOfferData] = useState({
    title: '',
    category: 'product',
    price: '',
  });
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (isOpen) {
      setStartTime(Date.now());
      Analytics.track('INTENTION_ONBOARDING_OPENED');
    }
  }, [isOpen]);

  const handleIntentionClick = (intention: UserIntention) => {
    setSelectedIntention(intention);
    Analytics.track('INTENTION_SELECTED', { intention });

    // Track selection in localStorage
    localStorage.setItem('user_intention', intention);

    // For explore, close immediately and go to homepage
    if (intention === 'explore') {
      handleExplore();
      return;
    }

    // Show second step for other intentions
    setShowSecondStep(true);
  };

  const handleExplore = () => {
    Analytics.track('INTENTION_COMPLETED', {
      intention: 'explore',
      timeToCompleteMs: Date.now() - startTime,
    });
    onIntentionSelected?.('explore');
    onClose();
    router.push('/');
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    Analytics.track('INTENTION_COMPLETED', {
      intention: 'search',
      query: searchQuery,
      timeToCompleteMs: Date.now() - startTime,
    });

    onIntentionSelected?.('search');
    onClose();

    // Redirect to offers page with search query
    router.push(`/offers?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleOffer = () => {
    if (!offerData.title.trim()) return;

    Analytics.track('INTENTION_COMPLETED', {
      intention: 'offer',
      category: offerData.category,
      hasPrice: !!offerData.price,
      timeToCompleteMs: Date.now() - startTime,
    });

    // Save draft to localStorage
    localStorage.setItem(
      'offer_draft',
      JSON.stringify({
        title: offerData.title,
        category: offerData.category,
        price: offerData.price,
      })
    );

    onIntentionSelected?.('offer');
    onClose();

    // Redirect to offer creation with draft data
    router.push('/offers/new');
  };

  const handleCommunity = () => {
    Analytics.track('INTENTION_COMPLETED', {
      intention: 'community',
      location,
      interestsCount: interests.length,
      timeToCompleteMs: Date.now() - startTime,
    });

    onIntentionSelected?.('community');
    onClose();

    // Redirect to communities page with filters
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (interests.length > 0) params.set('interests', interests.join(','));

    router.push(`/communities?${params.toString()}`);
  };

  const handleBack = () => {
    setShowSecondStep(false);
    setSelectedIntention(null);
  };

  const handleCloseWithTracking = () => {
    if (selectedIntention && showSecondStep) {
      Analytics.track('INTENTION_ABANDONED', {
        intention: selectedIntention,
        step: 'second_step',
      });
    } else if (selectedIntention) {
      Analytics.track('INTENTION_ABANDONED', {
        intention: selectedIntention,
        step: 'first_step',
      });
    }
    onClose();
  };

  const renderSecondStep = () => {
    switch (selectedIntention) {
      case 'search':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                ¿Qué estás buscando?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Busca productos, servicios o ayuda en tu comunidad
              </p>
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ej: clases de guitarra, bicicleta, fontanero..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:text-gray-100"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Volver
              </button>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                Buscar
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              💡 No necesitas registrarte para buscar
            </p>
          </motion.div>
        );

      case 'offer':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                ¿Qué quieres ofrecer?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Cuéntanos qué tienes para compartir con la comunidad
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ¿Qué ofreces?
                </label>
                <input
                  type="text"
                  value={offerData.title}
                  onChange={(e) => setOfferData({ ...offerData, title: e.target.value })}
                  placeholder="ej: Clases de guitarra, Bicicleta de montaña..."
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-800 dark:text-gray-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={offerData.category}
                  onChange={(e) => setOfferData({ ...offerData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="product">Producto</option>
                  <option value="service">Servicio</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio aproximado (opcional)
                </label>
                <div className="relative">
                  <CurrencyEuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={offerData.price}
                    onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Volver
              </button>
              <button
                onClick={handleOffer}
                disabled={!offerData.title.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              💡 Necesitarás crear una cuenta para publicar
            </p>
          </motion.div>
        );

      case 'community':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Encuentra tu comunidad
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Te ayudamos a conectar con personas cercanas
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ¿Dónde vives?
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ciudad, barrio o código postal"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-800 dark:text-gray-100"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intereses (opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Huerto urbano', 'Intercambio', 'Sostenibilidad', 'Vecindario', 'Artesanía'].map(
                    (interest) => (
                      <button
                        key={interest}
                        onClick={() => {
                          if (interests.includes(interest)) {
                            setInterests(interests.filter((i) => i !== interest));
                          } else {
                            setInterests([...interests, interest]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          interests.includes(interest)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Volver
              </button>
              <button
                onClick={handleCommunity}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                Buscar comunidades
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              💡 Puedes explorar comunidades sin registrarte
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseWithTracking}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Modal - Wrapper for centering */}
          <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {showSecondStep ? 'Siguiente paso' : '¿Qué quieres hacer hoy?'}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {showSecondStep
                      ? 'Completa la información para continuar'
                      : 'Selecciona una opción para comenzar'}
                  </p>
                </div>
                <button
                  onClick={handleCloseWithTracking}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {!showSecondStep ? (
                    <motion.div
                      key="first-step"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {intentionOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.id}
                            onClick={() => handleIntentionClick(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-start p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent bg-gradient-to-br ${option.gradient} text-white shadow-lg hover:shadow-xl transition-all min-h-[140px] group`}
                          >
                            <Icon className="h-10 w-10 mb-3" />
                            <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                            <p className="text-sm opacity-90 text-left">{option.description}</p>
                            <ArrowRightIcon className="h-5 w-5 ml-auto mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <div key="second-step">{renderSecondStep()}</div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
