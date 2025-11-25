import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ContextualTooltipProps {
  id: string;
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'auto';
  delay?: number;
  onDismiss?: () => void;
  showOnce?: boolean;
}

interface TooltipPositionData {
  top: number;
  left: number;
  arrowPosition: string;
}

export default function ContextualTooltip({
  id,
  target,
  title,
  description,
  position = 'top',
  trigger = 'hover',
  delay = 1000,
  onDismiss,
  showOnce = false,
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPositionData | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const localStorageKey = `tooltip-shown-${id}`;

  useEffect(() => {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    // Verificar si ya se mostró anteriormente
    if (showOnce && localStorage.getItem(localStorageKey)) {
      return;
    }

    const handleMouseEnter = () => {
      if (trigger === 'hover') {
        calculateAndShowTooltip(targetElement);
      }
    };

    const handleMouseLeave = () => {
      if (trigger === 'hover') {
        hideTooltip();
      }
    };

    const handleClick = () => {
      if (trigger === 'click') {
        if (isVisible) {
          hideTooltip();
        } else {
          calculateAndShowTooltip(targetElement);
        }
      }
    };

    if (trigger === 'hover') {
      targetElement.addEventListener('mouseenter', handleMouseEnter);
      targetElement.addEventListener('mouseleave', handleMouseLeave);
    } else if (trigger === 'click') {
      targetElement.addEventListener('click', handleClick);
    } else if (trigger === 'auto') {
      timeoutRef.current = setTimeout(() => {
        calculateAndShowTooltip(targetElement);

        // Auto-cerrar después de 10 segundos
        autoCloseTimeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, 10000);
      }, delay);
    }

    return () => {
      if (trigger === 'hover') {
        targetElement.removeEventListener('mouseenter', handleMouseEnter);
        targetElement.removeEventListener('mouseleave', handleMouseLeave);
      } else if (trigger === 'click') {
        targetElement.removeEventListener('click', handleClick);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [target, trigger, delay, isVisible, showOnce]);

  const calculateAndShowTooltip = (targetElement: Element) => {
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipWidth = 300;
    const tooltipHeight = 150; // Estimado
    const arrowSize = 8;
    const gap = 12;

    let calculatedTop = 0;
    let calculatedLeft = 0;
    let finalPosition = position;
    let arrowPositionStyle = '';

    // Calcular posición según la preferencia y el espacio disponible
    switch (position) {
      case 'top':
        calculatedTop = targetRect.top - tooltipHeight - gap;
        calculatedLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        arrowPositionStyle = 'bottom-[-8px] left-1/2 transform -translate-x-1/2 border-t-white dark:border-t-gray-800 border-x-transparent border-b-transparent';

        // Si no hay espacio arriba, cambiar a abajo
        if (calculatedTop < 10) {
          finalPosition = 'bottom';
          calculatedTop = targetRect.bottom + gap;
          arrowPositionStyle = 'top-[-8px] left-1/2 transform -translate-x-1/2 border-b-white dark:border-b-gray-800 border-x-transparent border-t-transparent';
        }
        break;

      case 'bottom':
        calculatedTop = targetRect.bottom + gap;
        calculatedLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        arrowPositionStyle = 'top-[-8px] left-1/2 transform -translate-x-1/2 border-b-white dark:border-b-gray-800 border-x-transparent border-t-transparent';

        // Si no hay espacio abajo, cambiar a arriba
        if (calculatedTop + tooltipHeight > window.innerHeight - 10) {
          finalPosition = 'top';
          calculatedTop = targetRect.top - tooltipHeight - gap;
          arrowPositionStyle = 'bottom-[-8px] left-1/2 transform -translate-x-1/2 border-t-white dark:border-t-gray-800 border-x-transparent border-b-transparent';
        }
        break;

      case 'left':
        calculatedTop = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        calculatedLeft = targetRect.left - tooltipWidth - gap;
        arrowPositionStyle = 'right-[-8px] top-1/2 transform -translate-y-1/2 border-l-white dark:border-l-gray-800 border-y-transparent border-r-transparent';

        // Si no hay espacio a la izquierda, cambiar a derecha
        if (calculatedLeft < 10) {
          finalPosition = 'right';
          calculatedLeft = targetRect.right + gap;
          arrowPositionStyle = 'left-[-8px] top-1/2 transform -translate-y-1/2 border-r-white dark:border-r-gray-800 border-y-transparent border-l-transparent';
        }
        break;

      case 'right':
        calculatedTop = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        calculatedLeft = targetRect.right + gap;
        arrowPositionStyle = 'left-[-8px] top-1/2 transform -translate-y-1/2 border-r-white dark:border-r-gray-800 border-y-transparent border-l-transparent';

        // Si no hay espacio a la derecha, cambiar a izquierda
        if (calculatedLeft + tooltipWidth > window.innerWidth - 10) {
          finalPosition = 'left';
          calculatedLeft = targetRect.left - tooltipWidth - gap;
          arrowPositionStyle = 'right-[-8px] top-1/2 transform -translate-y-1/2 border-l-white dark:border-l-gray-800 border-y-transparent border-r-transparent';
        }
        break;
    }

    // Ajustar para que no se salga de la pantalla horizontalmente
    if (calculatedLeft < 10) {
      calculatedLeft = 10;
    } else if (calculatedLeft + tooltipWidth > window.innerWidth - 10) {
      calculatedLeft = window.innerWidth - tooltipWidth - 10;
    }

    // Ajustar para que no se salga de la pantalla verticalmente
    if (calculatedTop < 10) {
      calculatedTop = 10;
    } else if (calculatedTop + tooltipHeight > window.innerHeight - 10) {
      calculatedTop = window.innerHeight - tooltipHeight - 10;
    }

    setTooltipPosition({
      top: calculatedTop,
      left: calculatedLeft,
      arrowPosition: arrowPositionStyle,
    });

    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
    setTooltipPosition(null);
  };

  const handleDismiss = () => {
    if (showOnce) {
      localStorage.setItem(localStorageKey, 'true');
    }

    hideTooltip();

    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }

    if (onDismiss) {
      onDismiss();
    }
  };

  // No renderizar si ya se mostró y showOnce está activado
  if (showOnce && localStorage.getItem(localStorageKey)) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && tooltipPosition && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[9999] max-w-[300px]"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            {/* Flecha */}
            <div
              className={`absolute w-0 h-0 border-[8px] ${tooltipPosition.arrowPosition}`}
            />

            {/* Botón de cierre */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Cerrar tooltip"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Contenido */}
            <div className="pr-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                {description}
              </p>
              <button
                onClick={handleDismiss}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
