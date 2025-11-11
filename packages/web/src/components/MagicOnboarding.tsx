import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface OnboardingStep {
  number: number;
  key: string;
  icon: string;
  action?: () => void;
  completed?: boolean;
}

const BASE_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    number: 1,
    key: 'welcome',
    icon: '👋',
  },
  {
    number: 2,
    key: 'exploreOffers',
    icon: '🔍',
  },
  {
    number: 3,
    key: 'joinCommunity',
    icon: '🎉',
  },
  {
    number: 4,
    key: 'completed',
    icon: '🎊',
  },
];

export default function MagicOnboarding({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('magicOnboarding');
  const steps = useMemo(
    () =>
      BASE_ONBOARDING_STEPS.map((step) => ({
        ...step,
        title: t(`steps.${step.key}.title`),
        description: t(`steps.${step.key}.description`),
      })),
    [t]
  );
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
        toast.success(t('toast.completed'), {
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
    if (currentStep < steps.length) {
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
        // Explore offers and map
        router.push('/');
        setShowModal(false);
        break;
      case 3:
        // Join community - go to events or community page
        router.push('/events');
        setShowModal(false);
        break;
      default:
        handleNext();
    }
  };

  const handleOptionalCreateOffer = () => {
    router.push('/offers/new');
    setShowModal(false);
    // Mark onboarding as completed
    trackStepMutation.mutate(steps.length);
  };

  const handleSkip = () => {
    setShowModal(false);
    // Don't mark as completed, user can resume later
  };

  if (!showModal || !progress || progress.completed) {
    return null;
  }

  const currentStepData = steps[currentStep - 1];
  const progressPercent = (currentStep / steps.length) * 100;
  const completedSteps = JSON.parse(progress.completedSteps || '[]');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fadeIn">
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t('buttons.skip')}
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {t('progress.step', { current: currentStep, total: steps.length })}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {t('progress.percent', { percent: Math.round(progressPercent) })}
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
          {steps.map((step) => (
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
            {t('buttons.previous')}
          </button>

          <div className="flex gap-3">
            {currentStep === steps.length ? (
              <>
                <button
                  onClick={() => {
                    trackStepMutation.mutate(currentStep);
                    setShowModal(false);
                    onComplete?.();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-bold"
                >
                  {t('buttons.complete')}
                </button>
                <button
                  onClick={handleOptionalCreateOffer}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-bold flex items-center gap-2"
                >
                  <span>✨</span>
                  <span>{t('buttons.createOffer')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  {t('buttons.next')}
                </button>
                <button
                  onClick={() => handleAction(currentStep)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-bold"
                >
                  {t('buttons.goNow')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        {currentStep === steps.length && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-center text-yellow-800 font-semibold">
              {t('reward')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
