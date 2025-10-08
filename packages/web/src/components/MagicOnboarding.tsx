import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface OnboardingStep {
  number: number;
  title: string;
  description: string;
  icon: string;
  action?: () => void;
  completed?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    number: 1,
    title: '¡Bienvenido!',
    description: 'Conoce Comunidad Viva, donde la economía local cobra vida.',
    icon: '👋',
  },
  {
    number: 2,
    title: 'Explora Ofertas',
    description: 'Descubre servicios y productos de tu comunidad.',
    icon: '🔍',
  },
  {
    number: 3,
    title: 'Crea tu Primera Oferta',
    description: '¿Qué puedes ofrecer? Comparte tus habilidades con la comunidad.',
    icon: '✨',
  },
  {
    number: 4,
    title: 'Conoce el Mapa Local',
    description: 'Encuentra negocios y personas cerca de ti.',
    icon: '🗺️',
  },
  {
    number: 5,
    title: 'Envía tu Primer Crédito',
    description: 'Apoya a alguien de la comunidad con créditos.',
    icon: '💸',
  },
  {
    number: 6,
    title: 'Únete a un Evento',
    description: 'Participa en eventos comunitarios y conoce gente nueva.',
    icon: '🎉',
  },
  {
    number: 7,
    title: '¡Listo!',
    description: 'Ya eres parte activa de la comunidad. ¡A por tus primeros 50 créditos de bono!',
    icon: '🎊',
  },
];

export default function MagicOnboarding({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Get onboarding progress from backend
  const { data: progress } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: async () => {
      const { data } = await api.get('/viral/onboarding/progress');
      return data;
    },
  });

  // Track step completion
  const trackStepMutation = useMutation({
    mutationFn: async (step: number) => {
      const { data } = await api.post('/viral/onboarding/track', { step });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });

      if (data.completed) {
        toast.success('¡Onboarding completado! 🎉 Has ganado 50 créditos de bono', {
          duration: 5000,
        });
        setTimeout(() => {
          setShowModal(false);
          onComplete?.();
        }, 2000);
      }
    },
  });

  useEffect(() => {
    // Show onboarding modal if user hasn't completed it
    if (progress && !progress.completed) {
      setShowModal(true);
      setCurrentStep(progress.currentStep || 1);
    }
  }, [progress]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      trackStepMutation.mutate(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (step: number) => {
    // Track current step
    trackStepMutation.mutate(step);

    // Navigate based on step
    switch (step) {
      case 2:
        router.push('/offers');
        setShowModal(false);
        break;
      case 3:
        router.push('/offers/create');
        setShowModal(false);
        break;
      case 4:
        // Navigate to map (if implemented)
        toast('Función de mapa próximamente', { icon: '🗺️' });
        handleNext();
        break;
      case 5:
        router.push('/credits/send');
        setShowModal(false);
        break;
      case 6:
        router.push('/events');
        setShowModal(false);
        break;
      default:
        handleNext();
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    // Don't mark as completed, user can resume later
  };

  if (!showModal || !progress || progress.completed) {
    return null;
  }

  const currentStepData = ONBOARDING_STEPS[currentStep - 1];
  const progressPercent = (currentStep / ONBOARDING_STEPS.length) * 100;
  const completedSteps = JSON.parse(progress.completedSteps || '[]');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fadeIn">
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          Saltar ✕
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Paso {currentStep} de {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progressPercent)}% completado
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6 animate-bounce">{currentStepData.icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentStepData.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {currentStepData.description}
          </p>
        </div>

        {/* Completed Steps Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {ONBOARDING_STEPS.map((step) => (
            <div
              key={step.number}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                completedSteps.includes(step.number)
                  ? 'bg-green-500 scale-110'
                  : step.number === currentStep
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>

          <div className="flex gap-3">
            {currentStep === ONBOARDING_STEPS.length ? (
              <button
                onClick={() => handleAction(currentStep)}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                ¡Completar! 🎉
              </button>
            ) : (
              <>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => handleAction(currentStep)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-bold"
                >
                  Ir ahora →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        {currentStep === ONBOARDING_STEPS.length && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-center text-yellow-800 font-semibold">
              🎁 ¡Completa el onboarding y recibe 50 créditos de bono!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
