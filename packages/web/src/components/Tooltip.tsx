import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string | ReactNode;
  children?: ReactNode;
  position?: TooltipPosition;
  maxWidth?: number;
  showIcon?: boolean;
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  maxWidth = 250,
  showIcon = true,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 rotate-180',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 -rotate-90',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 rotate-90',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help"
      >
        {children || (
          showIcon && (
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
          )
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionStyles[position]}`}
            style={{ maxWidth: `${maxWidth}px` }}
          >
            {/* Tooltip content */}
            <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700">
              {content}
            </div>

            {/* Arrow */}
            <div className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 border-l border-t border-gray-700 ${arrowStyles[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for common tooltips
export function HelpTooltip({ content, className = '' }: { content: string | ReactNode, className?: string }) {
  return (
    <Tooltip content={content} showIcon className={className}>
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
    </Tooltip>
  );
}

// Predefined tooltips for common concepts
export const CommonTooltips = {
  superSwipe: (
    <div>
      <strong className="block mb-1">Super Swipe ✨</strong>
      <p>Envía una notificación especial y aumenta 3x las posibilidades de match con este usuario u oferta.</p>
    </div>
  ),

  credits: (
    <div>
      <strong className="block mb-1">Créditos 💰</strong>
      <p>Moneda local de tu comunidad. Gana créditos ayudando a otros o creando contenido valioso.</p>
    </div>
  ),

  semilla: (
    <div>
      <strong className="block mb-1">Semilla Diaria 🌱</strong>
      <p>Recompensa diaria por mantener tu racha activa. Cuanto más tiempo consecutivo, mayor la recompensa.</p>
    </div>
  ),

  proofOfHelp: (
    <div>
      <strong className="block mb-1">Proof of Help 🤝</strong>
      <p>Sistema de consenso descentralizado donde ayudar a otros te da poder de decisión en la comunidad.</p>
    </div>
  ),

  nivel: (
    <div>
      <strong className="block mb-1">Nivel 📊</strong>
      <p>Tu progresión en la plataforma. Sube de nivel completando acciones y ayudando a la comunidad.</p>
    </div>
  ),

  blockchainBridge: (
    <div>
      <strong className="block mb-1">Blockchain Bridge 🌉</strong>
      <p>Conecta tu wallet de Polygon o Solana para usar tokens en la plataforma. Totalmente opcional.</p>
    </div>
  ),

  timeBank: (
    <div>
      <strong className="block mb-1">Banco de Tiempo ⏱️</strong>
      <p>Intercambia horas de habilidades. 1 hora de cualquier servicio = 1 hora, sin importar qué sea.</p>
    </div>
  ),

  reputation: (
    <div>
      <strong className="block mb-1">Reputación ⭐</strong>
      <p>Tu puntuación de confianza basada en ayudas, validaciones correctas y tiempo activo en la comunidad.</p>
    </div>
  ),

  quadraticVoting: (
    <div>
      <strong className="block mb-1">Votación Cuadrática 🗳️</strong>
      <p>Votar 1 punto cuesta 1 crédito, 5 puntos cuestan 25. Previene que pocos dominen las decisiones.</p>
    </div>
  ),
};
