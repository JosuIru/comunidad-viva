import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';
import { getCommunityPack } from '@/lib/communityPacks';
import type { OrganizedCommunityType } from '@/lib/communityPacks';

interface SetupStep {
  id: string;
  stepKey: string;
  completed: boolean;
  completedAt: Date | null;
  stepData: Record<string, any>;
}

interface CommunityPack {
  id: string;
  packType: OrganizedCommunityType;
  setupCompleted: boolean;
  setupProgress: number;
  currentStep: string | null;
  setupSteps: SetupStep[];
}

interface SetupProgressProps {
  communityId: string;
  onStepClick?: (stepKey: string) => void;
}

export default function SetupProgress({ communityId, onStepClick }: SetupProgressProps) {
  const [pack, setPack] = useState<CommunityPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPack();
  }, [communityId]);

  const fetchPack = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community-packs/communities/${communityId}`);
      if (!response.ok) throw new Error('Failed to fetch pack');
      const data = await response.json();
      setPack(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading setup progress');
    } finally {
      setLoading(false);
    }
  };

  const getStepConfig = (stepKey: string) => {
    const packConfig = getCommunityPack(pack?.packType);
    return packConfig?.setupSteps.find((s) => s.key === stepKey);
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-700 dark:text-red-300">{error || 'No se pudo cargar el progreso'}</p>
      </div>
    );
  }

  const completedSteps = pack.setupSteps.filter((s) => s.completed).length;
  const totalSteps = pack.setupSteps.length;

  return (
    <div className="space-y-6">
      {/* Header with overall progress */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Progreso de Configuración
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {pack.setupCompleted ? (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ✨ ¡Configuración completada!
                </span>
              ) : (
                `${completedSteps} de ${totalSteps} pasos completados`
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {pack.setupProgress}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${pack.setupProgress}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        {pack.setupSteps.map((step, index) => {
          const stepConfig = getStepConfig(step.stepKey);
          if (!stepConfig) return null;

          const isCompleted = step.completed;
          const isCurrent = pack.currentStep === step.stepKey;

          return (
            <div
              key={step.id}
              onClick={() => !isCompleted && onStepClick?.(step.stepKey)}
              className={`
                relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200
                ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }
                ${!isCompleted && onStepClick ? 'cursor-pointer hover:shadow-md' : ''}
              `}
            >
              {/* Step number and icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : isCurrent ? (
                  <div className="relative">
                    <Circle className="h-6 w-6 text-blue-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4
                    className={`font-semibold ${
                      isCompleted
                        ? 'text-green-900 dark:text-green-100'
                        : isCurrent
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {stepConfig.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>~{stepConfig.estimatedMinutes} min</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {stepConfig.description}
                </p>

                {/* Completion info */}
                {isCompleted && step.completedAt && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completado el {formatDate(step.completedAt)}</span>
                  </div>
                )}

                {/* Current step indicator */}
                {isCurrent && !isCompleted && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-pulse" />
                    Paso actual
                  </div>
                )}

                {/* Required badge */}
                {stepConfig.required && !isCompleted && (
                  <span className="mt-2 inline-block text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
                    Requerido
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {pack.setupCompleted && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
            ¡Configuración completada!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Tu comunidad está lista para empezar. Ahora puedes invitar a más miembros y comenzar a usar todas las funcionalidades.
          </p>
        </div>
      )}
    </div>
  );
}
