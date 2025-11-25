import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface PublicViewBannerProps {
  message?: string;
  ctaText?: string;
  ctaLink?: string;
  loginText?: string;
  loginLink?: string;
}

export default function PublicViewBanner({
  message = 'Únete gratis para contactar vendedores, publicar ofertas y más',
  ctaText = 'Registrarse gratis',
  ctaLink = '/auth/register',
  loginText = 'Iniciar sesión',
  loginLink = '/auth/login',
}: PublicViewBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const bannerDismissed = localStorage.getItem('public_banner_dismissed');
    if (bannerDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('public_banner_dismissed', 'true');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl hidden sm:block">👋</span>
                <p className="text-white font-medium text-sm sm:text-base truncate">
                  {message}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={ctaLink}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span>{ctaText}</span>
                </Link>

                <Link
                  href={loginLink}
                  className="hidden sm:flex items-center gap-1 px-4 py-2 text-white border-2 border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <span>{loginText}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>

                {/* Mobile: Single CTA */}
                <Link
                  href={ctaLink}
                  className="sm:hidden flex items-center gap-2 px-3 py-2 bg-white text-green-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-md"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Unirse</span>
                </Link>

                <button
                  onClick={handleDismiss}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Cerrar banner"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
