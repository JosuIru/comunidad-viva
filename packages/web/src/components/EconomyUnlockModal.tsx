import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { EconomyTier, getTierConfig, trackEconomyEvent } from '@/lib/economyProgression';

interface EconomyUnlockModalProps {
  isOpen: boolean;
  tier: EconomyTier;
  onClose: () => void;
  onExplore?: () => void;
}

export default function EconomyUnlockModal({
  isOpen,
  tier,
  onClose,
  onExplore,
}: EconomyUnlockModalProps) {
  const [showContent, setShowContent] = useState(false);
  const config = getTierConfig(tier);

  useEffect(() => {
    if (isOpen && tier !== 'basic') {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Show content after brief delay
      setTimeout(() => setShowContent(true), 300);

      // Track analytics
      trackEconomyEvent('ECONOMY_TIER_UNLOCKED', {
        tier,
        timestamp: Date.now(),
      });

      return () => {
        clearInterval(interval);
        setShowContent(false);
      };
    }
  }, [isOpen, tier]);

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    }
    onClose();
  };

  const getGiftText = () => {
    if (tier === 'intermediate') {
      return {
        title: '50 créditos gratis',
        description: 'Para que empieces a usar la moneda local',
      };
    } else if (tier === 'advanced') {
      return {
        title: '5 horas iniciales',
        description: 'Tu primer tiempo para intercambiar',
      };
    }
    return null;
  };

  const getExploreButtonText = () => {
    if (tier === 'intermediate') {
      return 'Ver ofertas que aceptan créditos';
    } else if (tier === 'advanced') {
      return 'Explorar banco de tiempo';
    }
    return 'Explorar';
  };

  const getDescription = () => {
    if (tier === 'intermediate') {
      return (
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p className="text-lg font-medium">¿Qué son los créditos?</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <span>Moneda local de la comunidad</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <span>1 crédito ≈ 1€ de valor</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <span>Sin comisiones ni bancos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
              <span>Circula solo en tu zona</span>
            </li>
          </ul>
        </div>
      );
    } else if (tier === 'advanced') {
      return (
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p className="text-lg font-medium">Banco de Tiempo</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 flex-shrink-0 mt-0.5">⏰</span>
              <span>1 hora de tu tiempo = 1 hora de cualquier otro</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 flex-shrink-0 mt-0.5">⏰</span>
              <span>Clases, reparaciones, cuidados, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 flex-shrink-0 mt-0.5">⏰</span>
              <span>Igualdad radical: Todas las horas valen lo mismo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 flex-shrink-0 mt-0.5">⏰</span>
              <span>Construye relaciones, no solo transacciones</span>
            </li>
          </ul>
        </div>
      );
    }
    return null;
  };

  const gift = getGiftText();

  return (
    <AnimatePresence>
      {isOpen && tier !== 'basic' && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Header with gradient */}
              <div
                className={`relative overflow-hidden ${
                  tier === 'intermediate'
                    ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600'
                } p-8 text-white`}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]"></div>
                </div>

                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative z-10"
                    >
                      {/* Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: 'spring',
                          damping: 10,
                          stiffness: 200,
                          delay: 0.3,
                        }}
                        className="text-7xl mb-4 inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full"
                      >
                        {config.badge}
                      </motion.div>

                      <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <SparklesIcon className="h-8 w-8" />
                        Nueva economía desbloqueada!
                      </h2>
                      <p className="text-xl opacity-90">{config.name}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content */}
              <div className="p-8">
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-6"
                    >
                      {/* Gift Badge */}
                      {gift && (
                        <div
                          className={`${
                            tier === 'intermediate'
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                              : 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800'
                          } border-2 rounded-xl p-4`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">🎁</div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-100">
                                {gift.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {gift.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {getDescription()}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={handleExplore}
                          variant="primary"
                          size="md"
                          className="flex-1"
                        >
                          {getExploreButtonText()}
                        </Button>
                        <Button onClick={onClose} variant="ghost" size="md" className="flex-1">
                          Lo exploraré después
                        </Button>
                      </div>

                      {/* Features List */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                          Ahora puedes:
                        </p>
                        <ul className="space-y-1">
                          {config.features.map((feature, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                            >
                              <span
                                className={`${
                                  tier === 'intermediate' ? 'text-green-500' : 'text-purple-500'
                                } flex-shrink-0 mt-0.5`}
                              >
                                •
                              </span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
