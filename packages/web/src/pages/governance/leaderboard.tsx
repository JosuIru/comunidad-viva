import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { TrophyIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';

interface LeaderboardEntry {
  id: string;
  name: string;
  reputation: number;
  level: string;
  helpActions: number;
  validations: number;
  proposalsCreated: number;
  votescast: number;
}

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['reputation-leaderboard', filter],
    queryFn: async () => {
      const response = await api.get('/consensus/leaderboard', {
        params: { period: filter },
      });
      return response.data;
    },
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return 'from-purple-600 to-indigo-600';
      case 'EXPERIENCED':
        return 'from-blue-600 to-cyan-600';
      case 'CONTRIBUTOR':
        return 'from-green-600 to-emerald-600';
      case 'ACTIVE':
        return 'from-orange-600 to-yellow-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return '👑';
      case 'EXPERIENCED':
        return '⭐';
      case 'CONTRIBUTOR':
        return '✨';
      case 'ACTIVE':
        return '🌟';
      default:
        return '🌱';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrophyIcon className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Leaderboard de Reputación
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Ranking de miembros según su Proof of Help y contribuciones
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 mb-8 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Todo el Tiempo
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'month'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'week'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Esta Semana
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center gap-4 ${
                  index < 3 ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="text-center w-16">
                  {index === 0 && <span className="text-4xl">🥇</span>}
                  {index === 1 && <span className="text-4xl">🥈</span>}
                  {index === 2 && <span className="text-4xl">🥉</span>}
                  {index > 2 && (
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                  )}
                </div>

                <div className={`bg-gradient-to-br ${getLevelColor(entry.level)} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                  {getLevelIcon(entry.level)}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {entry.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.level}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <FireIcon className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {entry.reputation.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PoH</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {entry.helpActions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ayudas</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {entry.proposalsCreated}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Propuestas</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {entry.votescast}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Votos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <TrophyIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay datos todavía
            </h3>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 dark:bg-opacity-20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💡 Sobre la Reputación (Proof of Help)
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            La reputación se gana ayudando a otros, participando en la gobernanza y contribuyendo a la comunidad.
            Mayor reputación desbloquea privilegios como crear propuestas, validar acciones y moderar contenido.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                🌱 Newcomer (0-10)
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Puede ayudar y recibir ayuda
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                ⭐ Expert (100+)
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Puede resolver disputas y moderar
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                📊 Privilegios
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Mayor reputación = más privilegios
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
