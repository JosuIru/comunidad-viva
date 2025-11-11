import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface TourStep {
  target: string; // CSS selector del elemento objetivo
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface InteractiveTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string; // Para recordar si el usuario ya vio el tour
}

export default function InteractiveTour({ steps, onComplete, onSkip, storageKey = 'tour_completed' }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Verificar si el usuario ya completó el tour
    const tourCompleted = localStorage.getItem(storageKey);
    if (!tourCompleted) {
      setIsActive(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const step = steps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;

      if (element) {
        setTargetElement(element);

        // Calcular posición del tooltip
        const rect = element.getBoundingClientRect();
        const position = step.position || 'bottom';

        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top - 20;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 20;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 20;
            break;
        }

        setTooltipPosition({ top, left });

        // Scroll suave al elemento
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Resaltar el elemento objetivo
        element.style.position = 'relative';
        element.style.zIndex = '10001';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.zIndex = '';
      }
    };
  }, [currentStep, isActive, steps, targetElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'true');
    onComplete();
  };

  const handleSkipTour = () => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'true');
    onSkip();
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay oscuro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[10000]"
        onClick={handleSkipTour}
      />

      {/* Spotlight en el elemento objetivo */}
      {targetElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed z-[10001] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed z-[10002] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translate(-50%, 0)',
          }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💡</span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Paso {currentStep + 1} de {steps.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {step.title}
                </h3>
              </div>
              <button
                onClick={handleSkipTour}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {step.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>

            {/* Action button (opcional) */}
            {step.action && (
              <div className="mb-4">
                <Button
                  onClick={step.action.onClick}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  {step.action.label}
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSkipTour}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Saltar tour
              </button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button onClick={handlePrevious} variant="ghost" size="sm">
                    ← Anterior
                  </Button>
                )}
                <Button onClick={handleNext} variant="primary" size="sm">
                  {currentStep < steps.length - 1 ? 'Siguiente →' : 'Finalizar ✓'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
