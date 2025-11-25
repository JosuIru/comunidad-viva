/**
 * Demo Content Notice
 * Modal that explains demo content to new users
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  SparklesIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { DemoContentManager } from '@/lib/demoContent';
import Analytics, { ANALYTICS_EVENTS } from '@/lib/analytics';
import Button from './Button';

interface DemoContentNoticeProps {
  onDismiss?: () => void;
  onRegister?: () => void;
}

export default function DemoContentNotice({
  onDismiss,
  onRegister,
}: DemoContentNoticeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this notice
    const hasDismissed = DemoContentManager.hasDismissedDemoNotice();

    if (!hasDismissed) {
      // Show notice after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        Analytics.track(ANALYTICS_EVENTS.DEMO_CONTENT_VIEWED, {
          component: 'DemoContentNotice',
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    DemoContentManager.dismissDemoNotice();
    Analytics.track(ANALYTICS_EVENTS.DEMO_CONTENT_DISMISSED);
    onDismiss?.();
  };

  const handleRegister = () => {
    setIsVisible(false);
    DemoContentManager.dismissDemoNotice();
    Analytics.track(ANALYTICS_EVENTS.DEMO_CONVERTED_TO_REGISTER);
    onRegister?.();
  };

  const stats = DemoContentManager.getDemoStats();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <SparklesIcon className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Contenido de Ejemplo</h2>
                </div>
                <p className="text-blue-100 text-sm">
                  Estás viendo ofertas y eventos de demostración
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Info message */}
                <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold mb-1">¿Por qué ves contenido de ejemplo?</p>
                    <p>
                      Para que no veas la plataforma vacía, mostramos contenido de demostración
                      mezclado con ofertas reales de tu zona. Todos los ejemplos están claramente marcados.
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalOffers}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Ofertas demo
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalEvents}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Eventos demo
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.citiesCovered}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Ciudades
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Los ejemplos están basados en tu ubicación
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Todos llevan una etiqueta "Ejemplo" claramente visible
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Desaparecen automáticamente cuando hay contenido real
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    <strong>¡Ayúdanos a crecer!</strong> Publica tu primera oferta y sé parte
                    del contenido real de la plataforma.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRegister}
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      Publicar Oferta
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="md"
                      className="flex-1"
                    >
                      Entendido
                    </Button>
                  </div>
                </div>

                {/* Footer note */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Este mensaje solo se muestra una vez
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact Demo Notice (for inline use)
 */
export function CompactDemoNotice() {
  const [isExpanded, setIsExpanded] = useState(false);
  const stats = DemoContentManager.getDemoStats();

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Contenido de demostración visible
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
            >
              {isExpanded ? 'Ocultar' : 'Más info'}
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Mostramos {stats.totalOffers} ofertas y {stats.totalEvents} eventos de ejemplo
            para evitar que veas la plataforma vacía.
          </p>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 text-xs text-gray-600 dark:text-gray-400 space-y-1"
              >
                <p>✓ Basados en tu ubicación</p>
                <p>✓ Marcados con etiqueta "Ejemplo"</p>
                <p>✓ Se ocultan cuando hay contenido real suficiente</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
