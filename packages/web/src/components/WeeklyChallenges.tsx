import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';

interface ChallengeParticipation {
  id: string;
  progress: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
    generosityScore: number;
  };
}

interface WeeklyChallenge {
  id: string;
  type: string;
  title: string;
  description: string;
  targetValue: number;
  reward: number;
  startsAt: string;
  endsAt: string;
  participations: ChallengeParticipation[];
}

export default function WeeklyChallenges() {
  const router = useRouter();

  const { data: challenge, isLoading } = useQuery<WeeklyChallenge>({
    queryKey: ['current-challenge'],
    queryFn: async () => {
      const { data } = await api.get('/viral/challenges/current');
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No hay reto activo
        </h3>
        <p className="text-gray-600">
          Los retos semanales comienzan los lunes. ¡Vuelve pronto!
        </p>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(challenge.endsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8">
      {/* Challenge Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                Reto Semanal
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                {daysLeft} {daysLeft === 1 ? 'día' : 'días'} restantes
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-3">{challenge.title}</h2>
            <p className="text-xl opacity-90">{challenge.description}</p>
          </div>
          <div className="text-right">
            <div className="text-6xl mb-2">🏆</div>
            <div className="text-3xl font-bold">{challenge.reward}</div>
            <div className="text-sm opacity-90">créditos</div>
          </div>
        </div>

        {/* Progress target */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Objetivo</span>
            <span className="text-2xl font-bold">{challenge.targetValue}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            🥇 Tabla de Líderes
          </h3>
          <span className="text-sm text-gray-600">
            {challenge.participations.length} participantes
          </span>
        </div>

        {challenge.participations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-600">
              Sé el primero en participar en este reto
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenge.participations.map((participation, index) => (
              <LeaderboardEntry
                key={participation.id}
                participation={participation}
                rank={index + 1}
                targetValue={challenge.targetValue}
              />
            ))}
          </div>
        )}
      </div>

      {/* Challenge Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
          <div className="text-4xl mb-3">🥇</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1er Lugar</div>
          <div className="text-sm text-gray-600">
            Recompensa completa + 50 créditos extra
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
          <div className="text-4xl mb-3">🥈</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">2do Lugar</div>
          <div className="text-sm text-gray-600">
            Recompensa completa + 30 créditos extra
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
          <div className="text-4xl mb-3">🥉</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">3er Lugar</div>
          <div className="text-sm text-gray-600">
            Recompensa completa + 20 créditos extra
          </div>
        </div>
      </div>

      {/* Challenge Types Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h4 className="text-lg font-bold text-gray-900 mb-3">
          💡 Cómo participar
        </h4>
        <ul className="space-y-2 text-gray-700">
          {getChallengeInstructions(challenge.type).map((instruction, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LeaderboardEntry({
  participation,
  rank,
  targetValue,
}: {
  participation: ChallengeParticipation;
  rank: number;
  targetValue: number;
}) {
  const progress = (participation.progress / targetValue) * 100;
  const isComplete = participation.progress >= targetValue;

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div
      className={`p-4 rounded-xl transition-all ${
        rank <= 3
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
          : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
          {rank <= 3 ? (
            <span className="text-3xl">{getMedalIcon(rank)}</span>
          ) : (
            <span className="text-xl font-bold text-gray-500">{rank}</span>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold flex-shrink-0">
              {participation.user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {participation.user.name}
              </div>
              <div className="text-xs text-gray-500">
                ⭐ {participation.user.generosityScore} puntos
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Progreso: {participation.progress} / {targetValue}
              </span>
              <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isComplete
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Complete Badge */}
        {isComplete && (
          <div className="flex-shrink-0">
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
              ✓ Completado
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getChallengeInstructions(type: string): string[] {
  const instructions: { [key: string]: string[] } = {
    'HELP_STREAK': [
      'Completa intercambios o servicios con diferentes personas',
      'Cada persona diferente cuenta como 1 punto',
      'Mantén la racha ayudando a nuevos miembros',
    ],
    'ECO_WARRIOR': [
      'Realiza acciones sostenibles como compartir objetos',
      'Participa en compras grupales ecológicas',
      'Cada acción verde suma puntos',
    ],
    'CONNECTOR': [
      'Conecta con nuevos miembros de la comunidad',
      'Usa el sistema de swipe para hacer matches',
      'Participa en eventos comunitarios',
    ],
    'TRANSACTION_MASTER': [
      'Completa intercambios exitosos en la plataforma',
      'Ofrece y solicita servicios',
      'Cada transacción completada suma 1 punto',
    ],
  };

  return instructions[type] || [
    'Participa activamente en la comunidad',
    'Completa las actividades relacionadas con el reto',
    'Revisa tus notificaciones para actualizaciones',
  ];
}
