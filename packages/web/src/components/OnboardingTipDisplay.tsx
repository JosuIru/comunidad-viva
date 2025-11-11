import React, { useState, useEffect } from 'react';
import { OnboardingTip } from '../lib/progressiveOnboarding';

interface OnboardingTipDisplayProps {
  tip: OnboardingTip | null;
  onClose: () => void;
  onDismissForever: () => void;
}

const OnboardingTipDisplay: React.FC<OnboardingTipDisplayProps> = ({
  tip,
  onClose,
  onDismissForever,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    setIsVisible(false);
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    // Esperar a que termine la animación antes de llamar onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleDismissForever = () => {
    setIsVisible(false);
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    setTimeout(() => {
      onDismissForever();
    }, 300);
  };

  useEffect(() => {
    if (tip) {
      // Pequeño delay para activar la animación
      setTimeout(() => setIsVisible(true), 100);

      // Auto-cierre después de 8 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 8000);

      setAutoCloseTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      setIsVisible(false);
    }
  }, [tip, onClose]);

  if (!tip) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-2xl p-5 text-white">
        {/* Header con icono y título */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="tip-icon">
              {tip.icon}
            </span>
            <h3 className="font-bold text-lg leading-tight">{tip.title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
            aria-label="Cerrar tip"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Descripción */}
        <p className="text-white/95 text-sm mb-4 leading-relaxed">
          {tip.description}
        </p>

        {/* Botones de acción */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleDismissForever}
            className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
          >
            No mostrar más
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 bg-white text-green-600 rounded-md text-sm font-semibold hover:bg-green-50 transition-colors shadow-sm"
          >
            Entendido
          </button>
        </div>

        {/* Barra de progreso de auto-cierre */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full transition-all duration-[8000ms] ease-linear"
            style={{
              width: isVisible ? '0%' : '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingTipDisplay;
