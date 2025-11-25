import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BadgeNotificationProps {
  badge: {
    name: string;
    icon: string;
    description: string;
  };
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Design:
  // - Aparece desde arriba con bounce
  // - Confetti animation (usando emojis: 🎉✨🎊)
  // - Badge grande en el centro
  // - Nombre y descripción
  // - Botón "Cerrar" o auto-cierra en 5s
  // - Gradient background (from-yellow-400 via-orange-400 to-red-500)
  // - Shadow grande
  // - z-index muy alto (z-[10001])

  const ConfettiEmoji = ({ delay, duration }: { delay: number; duration: number }) => (
    <motion.div
      initial={{ y: -10, opacity: 1 }}
      animate={{ y: 20, opacity: 0 }}
      transition={{ delay, duration, ease: 'easeIn' }}
      className="absolute text-xl pointer-events-none"
    >
      {['🎉', '✨', '🎊'][Math.floor(Math.random() * 3)]}
    </motion.div>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[10001]"
        >
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-2xl shadow-2xl p-6 max-w-md mx-4">
            {/* Confetti emojis floating */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[0, 1, 2, 3, 4].map((index) => (
                <ConfettiEmoji
                  key={index}
                  delay={index * 0.1}
                  duration={2}
                />
              ))}
            </div>

            {/* Content */}
            <div className="text-center text-white relative z-10">
              <div className="text-6xl mb-3 animate-bounce">
                {badge.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                ¡Nuevo Badge!
              </h3>
              <p className="text-xl font-semibold mb-1">
                {badge.name}
              </p>
              <p className="text-sm opacity-90">
                {badge.description}
              </p>
              <button
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
