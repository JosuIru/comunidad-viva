import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import CommunityStats from './CommunityStats';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import {
  SparklesIcon,
  RocketLaunchIcon,
  BriefcaseIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  HandRaisedIcon,
  FaceSmileIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const t = useTranslations('landing');
  const { theme, systemTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const { scrollY } = useScroll();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Refs para las secciones
  const featuresRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Transformaciones basadas en scroll
  const logoSize = useTransform(scrollY, [0, 400], [280, 80]);
  // Rotación continua: 1 vuelta cada 200px de scroll
  const logoRotate = useTransform(scrollY, (value) => (value / 200) * 360);

  // Calcular posición basada en scroll
  const scrollProgress = useTransform(scrollY, [0, 400], [0, 1]);

  // Detectar cuando el logo está en cada sección (bidireccional)
  const [sectionsVisible, setSectionsVisible] = useState({
    features: false,
    stats: false,
    howItWorks: false,
    cta: false,
  });

  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      // Posición del logo (30px desde arriba cuando está pequeño)
      const logoPosition = latest < 400 ? window.innerHeight * 0.15 + latest * 0.2 : 30 + 40;

      // Offset mucho mayor para activar muy antes (600px antes del logo)
      const triggerOffset = 600;

      // Verificar cada sección - simple: está visible si el logo está cerca
      if (featuresRef.current) {
        const rect = featuresRef.current.getBoundingClientRect();
        const shouldShow = logoPosition >= (rect.top - triggerOffset) && logoPosition <= (rect.bottom + triggerOffset);
        setSectionsVisible(prev => ({ ...prev, features: shouldShow }));
      }

      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        const shouldShow = logoPosition >= (rect.top - triggerOffset) && logoPosition <= (rect.bottom + triggerOffset);
        setSectionsVisible(prev => ({ ...prev, stats: shouldShow }));
      }

      if (howItWorksRef.current) {
        const rect = howItWorksRef.current.getBoundingClientRect();
        const shouldShow = logoPosition >= (rect.top - triggerOffset) && logoPosition <= (rect.bottom + triggerOffset);
        setSectionsVisible(prev => ({ ...prev, howItWorks: shouldShow }));
      }

      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        const shouldShow = logoPosition >= (rect.top - triggerOffset) && logoPosition <= (rect.bottom + triggerOffset);
        setSectionsVisible(prev => ({ ...prev, cta: shouldShow }));
      }
    });

    return () => unsubscribe();
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Controles fijos en la esquina superior derecha */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="fixed top-6 right-6 z-50 flex items-center gap-3"
      >
        <ThemeToggle />
        <LanguageSelector />
      </motion.div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo/Brand - TRUK con scroll effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
              style={{
                position: 'fixed',
                left: '50%',
                top: '15vh',
                x: '-50%',
                width: logoSize,
                height: logoSize,
                zIndex: 50
              }}
            >
              <motion.div
                style={{
                  x: useTransform(scrollProgress, (value) => {
                    // Desde el centro (0) hasta la izquierda (necesitamos calcular cuánto mover)
                    // Viewport width / 2 es donde está el centro, queremos ir a 30px + la mitad del logo
                    if (typeof window !== 'undefined') {
                      const targetX = 30 + 40; // 30px desde la izquierda + mitad del logo pequeño (80px/2)
                      const currentCenter = window.innerWidth / 2;
                      const displacement = -(currentCenter - targetX);
                      return value * displacement;
                    }
                    return 0;
                  }),
                  y: useTransform(scrollProgress, (value) => {
                    // Desde 15vh hasta 30px
                    if (typeof window !== 'undefined') {
                      const startY = window.innerHeight * 0.15;
                      const targetY = 30 + 40; // 30px desde arriba + mitad del logo pequeño
                      const displacement = targetY - startY;
                      return value * displacement;
                    }
                    return 0;
                  }),
                  rotate: logoRotate,
                }}
                className="w-full h-full"
              >
                <Image
                  src={isMounted && currentTheme === 'dark' ? '/favicon-light.png' : '/favicon.png'}
                  alt="Truk Logo"
                  width={280}
                  height={280}
                  className="w-full h-full object-contain"
                  priority
                  suppressHydrationWarning
                />
              </motion.div>
            </motion.div>

            {/* Espacio para el logo que ahora es fixed */}
            <div className="h-80 md:h-96 mb-8"></div>

            {/* Nombre de la red - TRUK */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: 'spring', stiffness: 100 }}
              className="mb-8"
            >
              <motion.h2
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% auto'
                }}
                className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight"
              >
                TRUK
              </motion.h2>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-6"
            >
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% auto'
                }}
                className="bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-gray-100 dark:via-blue-400 dark:to-gray-100 bg-clip-text text-transparent"
              >
                {t('hero.title')}
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/auth/register">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 50px rgba(59, 130, 246, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 10px 30px rgba(59, 130, 246, 0.3)",
                      "0 15px 40px rgba(59, 130, 246, 0.4)",
                      "0 10px 30px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg flex items-center gap-3 w-full sm:w-auto justify-center group"
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <RocketLaunchIcon className="h-6 w-6 relative z-10 group-hover:animate-bounce" />
                  <span className="relative z-10">{t('hero.cta.primary')}</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRightIcon className="h-5 w-5 relative z-10" />
                  </motion.div>
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    borderColor: "rgb(59, 130, 246)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <span>{t('hero.cta.secondary')}</span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-sm text-gray-500 dark:text-gray-500"
            >
              {t('hero.trust')}
            </motion.p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 dark:bg-green-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section - 3 Pillars */}
      <section ref={featuresRef} id="features" className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -600, y: -300, scale: 0.3 }}
            animate={sectionsVisible.features ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -600, y: -300, scale: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pillar 1: Marketplace */}
            <motion.div
              initial={{ opacity: 0, x: -700, y: -400, scale: 0.2, rotate: -45 }}
              animate={sectionsVisible.features ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 } : { opacity: 0, x: -700, y: -400, scale: 0.2, rotate: -45 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.3)"
              }}
              className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10"
              />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mb-4 inline-block p-4 bg-blue-500 dark:bg-blue-600 rounded-2xl shadow-lg"
                >
                  <BriefcaseIcon className="h-12 w-12 text-white" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {t('features.marketplace.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('features.marketplace.description')}
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.marketplace.benefit1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.marketplace.benefit2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.marketplace.benefit3')}</span>
                </li>
              </ul>
            </motion.div>

            {/* Pillar 2: Time Bank */}
            <motion.div
              initial={{ opacity: 0, x: -700, y: -400, scale: 0.2, rotate: -45 }}
              animate={sectionsVisible.features ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 } : { opacity: 0, x: -700, y: -400, scale: 0.2, rotate: -45 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(34, 197, 94, 0.3)"
              }}
              className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800 shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-10"
              />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mb-4 inline-block p-4 bg-green-500 dark:bg-green-600 rounded-2xl shadow-lg"
                >
                  <ClockIcon className="h-12 w-12 text-white" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {t('features.timebank.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('features.timebank.description')}
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.timebank.benefit1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.timebank.benefit2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.timebank.benefit3')}</span>
                </li>
              </ul>
            </motion.div>

            {/* Pillar 3: Community */}
            <motion.div
              initial={{ opacity: 0, x: -700, y: -400, scale: 0.2, rotate: -45 }}
              animate={sectionsVisible.features ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 } : { opacity: 0, x: -700, y: -400, scale: 0.2, rotate: -45 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(168, 85, 247, 0.3)"
              }}
              className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800 shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10"
              />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mb-4 inline-block p-4 bg-purple-500 dark:bg-purple-600 rounded-2xl shadow-lg"
                >
                  <UsersIcon className="h-12 w-12 text-white" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {t('features.community.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('features.community.description')}
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.community.benefit1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.community.benefit2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t('features.community.benefit3')}</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof - Stats */}
      <section ref={statsRef} className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -600, y: -300, scale: 0.3 }}
            animate={sectionsVisible.stats ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -600, y: -300, scale: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('impact.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('impact.subtitle')}
            </p>
          </motion.div>

          <CommunityStats />
        </div>
      </section>

      {/* How it Works */}
      <section ref={howItWorksRef} className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -600, y: -300, scale: 0.3 }}
            animate={sectionsVisible.howItWorks ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -600, y: -300, scale: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -500, y: -250, scale: 0.5 }}
              animate={sectionsVisible.howItWorks ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -500, y: -250, scale: 0.5 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('howItWorks.step1.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('howItWorks.step1.description')}
                </p>
              </div>
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl">
                <PencilSquareIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -500, y: -250, scale: 0.5 }}
              animate={sectionsVisible.howItWorks ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -500, y: -250, scale: 0.5 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col md:flex-row-reverse items-center gap-6"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('howItWorks.step2.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('howItWorks.step2.description')}
                </p>
              </div>
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl">
                <MagnifyingGlassIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -500, y: -250, scale: 0.5 }}
              animate={sectionsVisible.howItWorks ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -500, y: -250, scale: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('howItWorks.step3.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('howItWorks.step3.description')}
                </p>
              </div>
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-2xl">
                <HandRaisedIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, x: -500, y: -250, scale: 0.5 }}
              animate={sectionsVisible.howItWorks ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -500, y: -250, scale: 0.5 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col md:flex-row-reverse items-center gap-6"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                4
              </div>
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('howItWorks.step4.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('howItWorks.step4.description')}
                </p>
              </div>
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl">
                <FaceSmileIcon className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={ctaRef} className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -600, y: -300, scale: 0.3 }}
            animate={sectionsVisible.cta ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -600, y: -300, scale: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t('finalCta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              {t('finalCta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center gap-3 w-full sm:w-auto justify-center group"
                >
                  <RocketLaunchIcon className="h-7 w-7 group-hover:translate-x-1 transition-transform" />
                  <span>{t('finalCta.button')}</span>
                  <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              {t('finalCta.subtitle2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 dark:bg-black text-gray-400 text-center text-sm">
        <div className="container mx-auto px-4">
          <p>© 2024 Truk - Comunidad Viva. {t('footer.rights')}</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
