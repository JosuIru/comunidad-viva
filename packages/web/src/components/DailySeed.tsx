import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface DailySeedChallenge {
  id: string;
  date: string;
  type: string;
  challenge: string;
  description: string;
  creditsReward: number;
  participantsCount: number;
  completed?: boolean;
}

export default function DailySeed() {
  const queryClient = useQueryClient();

  // Fetch today's challenge
  const { data: challenge, isLoading } = useQuery<DailySeedChallenge>({
    queryKey: ['dailySeed'],
    queryFn: async () => {
      const { data } = await api.get('/challenges/today/me');
      return data;
    },
  });

  // Complete challenge mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/challenges/today/complete');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || `¡Felicidades! Has ganado ${data.creditsAwarded} créditos`);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dailySeed'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al completar el desafío';
      toast.error(message);
    },
  });

  const handleComplete = () => {
    if (challenge?.completed) {
      toast.error('Ya has completado el desafío de hoy');
      return;
    }
    completeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-6 w-48 bg-white/20 rounded mb-2"></div>
              <div className="h-4 w-64 bg-white/20 rounded"></div>
            </div>
            <div className="h-10 w-40 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">🌱 Semilla del Día</h3>
            <p className="text-white/90">{challenge.challenge}</p>
            {challenge.description && (
              <p className="text-sm text-white/70 mt-1">{challenge.description}</p>
            )}
            {challenge.participantsCount > 0 && (
              <p className="text-xs text-white/60 mt-2">
                {challenge.participantsCount} {challenge.participantsCount === 1 ? 'persona ha' : 'personas han'} completado este desafío
              </p>
            )}
          </div>
          <button
            onClick={handleComplete}
            disabled={challenge.completed || completeMutation.isPending}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              challenge.completed
                ? 'bg-white/30 text-white/70 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-gray-100'
            } ${completeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {challenge.completed
              ? '✓ Completado'
              : completeMutation.isPending
              ? 'Completando...'
              : `Completar (+${challenge.creditsReward} créditos)`}
          </button>
        </div>
      </div>
    </div>
  );
}
