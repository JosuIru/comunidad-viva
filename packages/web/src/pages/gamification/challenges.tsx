import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Challenge {
  id: string;
  type: string;
  description: string;
  targetValue: number;
  reward: number;
  bonusFirst: number;
  endsAt: string;
  progress?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  avatar?: string;
}

interface UserLevel {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  perks: string[];
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  nextMilestone: {
    days: number;
    reward: string;
  };
}

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'level' | 'streak'>('challenges');

  // Fetch weekly challenge
  const { data: challenge, isLoading: loadingChallenge } = useQuery<Challenge>({
    queryKey: ['weekly-challenge'],
    queryFn: async () => {
      const response = await api.get('/viral-features/challenges/weekly');
      return response.data;
    },
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<{
    leaderboard: LeaderboardEntry[];
    myRank: number;
    myPoints: number;
  }>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get('/viral-features/challenges/leaderboard');
      return response.data;
    },
  });

  // Fetch level progress
  const { data: level, isLoading: loadingLevel } = useQuery<UserLevel>({
    queryKey: ['user-level'],
    queryFn: async () => {
      const response = await api.get('/viral-features/levels/progress');
      return response.data;
    },
  });

  // Fetch streak
  const { data: streak, isLoading: loadingStreak } = useQuery<UserStreak>({
    queryKey: ['user-streak'],
    queryFn: async () => {
      const response = await api.get('/viral-features/streaks');
      return response.data;
    },
  });

  const formatTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Finalizado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <Layout title="Retos y Gamificación - Comunidad Viva">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">🎮 Retos y Gamificación</h1>
            <p className="text-xl opacity-90">
              Completa retos, sube de nivel y gana recompensas
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'challenges'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">🏆</span>
                Retos
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'leaderboard'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">📊</span>
                Clasificación
              </button>
              <button
                onClick={() => setActiveTab('level')}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'level'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">⭐</span>
                Mi Nivel
              </button>
              <button
                onClick={() => setActiveTab('streak')}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'streak'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">🔥</span>
                Racha
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-6">
              {loadingChallenge ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : challenge ? (
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm opacity-80 mb-1">Reto Semanal</div>
                      <h2 className="text-3xl font-bold mb-2">{challenge.description}</h2>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="text-xl">⏰</span>
                          {formatTimeRemaining(challenge.endsAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-xl">💰</span>
                          {challenge.reward} créditos
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-xl">🏆</span>
                          +{challenge.bonusFirst} bonus para top 10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso</span>
                      <span>{challenge.progress || 0} / {challenge.targetValue}</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
                      <div
                        className="bg-white h-4 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((challenge.progress || 0) / challenge.targetValue) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">¿Cómo completar este reto?</h4>
                    <p className="text-sm opacity-90">
                      {challenge.type === 'HELP_3_NEIGHBORS' && 'Ayuda a 3 vecinos diferentes usando el banco de tiempo esta semana'}
                      {challenge.type === 'CREATE_5_OFFERS' && 'Crea 5 ofertas nuevas en cualquier categoría'}
                      {challenge.type === 'ATTEND_2_EVENTS' && 'Asiste a 2 eventos comunitarios diferentes'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay reto activo</h3>
                  <p className="text-gray-600">El próximo reto semanal comenzará pronto</p>
                </div>
              )}

              {/* Other Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/gamification/flash-deals" className="bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">⚡</div>
                    <div>
                      <h3 className="text-2xl font-bold">Flash Deals</h3>
                      <p className="opacity-90">Ofertas relámpago por tiempo limitado</p>
                    </div>
                  </div>
                  <div className="text-sm opacity-80">
                    Descuentos de hasta 70% • Solo 2-4 horas
                  </div>
                </Link>

                <Link href="/gamification/swipe" className="bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">❤️</div>
                    <div>
                      <h3 className="text-2xl font-bold">Swipe & Match</h3>
                      <p className="opacity-90">Descubre ofertas tipo Tinder</p>
                    </div>
                  </div>
                  <div className="text-sm opacity-80">
                    Like • Dislike • Super Like
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">🏆 Clasificación Semanal</h2>
                <p className="opacity-90">Los mejores de esta semana</p>
              </div>

              {loadingLeaderboard ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  {/* My Rank */}
                  {leaderboard && (
                    <div className="bg-blue-50 border-b border-blue-100 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tu Posición</span>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-blue-600">#{leaderboard.myRank}</span>
                          <span className="text-lg font-semibold text-gray-700">{leaderboard.myPoints} puntos</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Leaderboard */}
                  <div className="divide-y divide-gray-200">
                    {leaderboard?.leaderboard.map((entry) => (
                      <div
                        key={entry.userId}
                        className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold ${
                            entry.rank === 1 ? 'text-yellow-500' :
                            entry.rank === 2 ? 'text-gray-400' :
                            entry.rank === 3 ? 'text-orange-600' :
                            'text-gray-600'
                          }`}>
                            {entry.rank === 1 && '🥇'}
                            {entry.rank === 2 && '🥈'}
                            {entry.rank === 3 && '🥉'}
                            {entry.rank > 3 && `#${entry.rank}`}
                          </div>
                          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                          <div>
                            <div className="font-semibold text-gray-900">{entry.userName}</div>
                            <div className="text-sm text-gray-500">{entry.points} puntos</div>
                          </div>
                        </div>
                        {entry.rank <= 10 && (
                          <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                            TOP 10
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Level Tab */}
          {activeTab === 'level' && (
            <div className="space-y-6">
              {loadingLevel ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : level && (
                <>
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm opacity-80 mb-1">Tu Nivel</div>
                        <div className="text-6xl font-bold mb-2">{level.currentLevel}</div>
                        <div className="text-xl opacity-90">{level.currentXP} / {level.nextLevelXP} XP</div>
                      </div>
                      <div className="text-8xl">⭐</div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
                        <div
                          className="bg-white h-4 rounded-full transition-all"
                          style={{ width: `${level.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-sm mt-1 opacity-80">{level.progress}%</div>
                    </div>

                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Beneficios Activos</h4>
                      <div className="space-y-2">
                        {level.perks.map((perk, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-xl">✓</span>
                            <span className="text-sm opacity-90">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Level Benefits */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Próximos Beneficios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { level: level.currentLevel + 1, perk: 'Acceso a eventos premium' },
                        { level: level.currentLevel + 2, perk: 'Descuento 10% en todo' },
                        { level: level.currentLevel + 3, perk: 'Badge exclusivo' },
                        { level: 10, perk: 'Acceso VIP completo' },
                      ].map((item, index) => (
                        <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {item.level}
                            </div>
                            <span className="font-semibold text-gray-900">Nivel {item.level}</span>
                          </div>
                          <p className="text-sm text-gray-600">{item.perk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Streak Tab */}
          {activeTab === 'streak' && (
            <div className="space-y-6">
              {loadingStreak ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : streak && (
                <>
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm opacity-80 mb-1">Racha Actual</div>
                        <div className="text-6xl font-bold mb-2">{streak.currentStreak}</div>
                        <div className="text-xl opacity-90">días consecutivos</div>
                      </div>
                      <div className="text-8xl">🔥</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-sm opacity-80 mb-1">Mejor Racha</div>
                        <div className="text-3xl font-bold">{streak.longestStreak} días</div>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="text-sm opacity-80 mb-1">Multiplicador</div>
                        <div className="text-3xl font-bold">×{Math.min(2, 1 + streak.currentStreak * 0.1).toFixed(1)}</div>
                      </div>
                    </div>

                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Próximo Milestone</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">{streak.nextMilestone.days} días</span>
                        <span className="text-sm font-semibold">{streak.nextMilestone.reward}</span>
                      </div>
                    </div>
                  </div>

                  {/* Streak Milestones */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Milestones de Racha</h3>
                    <div className="space-y-4">
                      {[
                        { days: 7, reward: 'Badge "Semana Completa"', bonus: '+10 créditos' },
                        { days: 14, reward: 'Badge "Dos Semanas"', bonus: '+25 créditos' },
                        { days: 30, reward: 'Badge "Un Mes"', bonus: '+50 créditos' },
                        { days: 60, reward: 'Badge "Dos Meses"', bonus: '+100 créditos' },
                        { days: 90, reward: 'Badge "Tres Meses"', bonus: '+200 créditos' },
                      ].map((milestone, index) => {
                        const achieved = streak.currentStreak >= milestone.days;
                        return (
                          <div
                            key={index}
                            className={`p-4 border-2 rounded-lg ${
                              achieved
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                                  achieved ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {achieved ? '✓' : milestone.days}
                                </div>
                                <div>
                                  <div className={`font-semibold ${achieved ? 'text-green-900' : 'text-gray-900'}`}>
                                    {milestone.days} días
                                  </div>
                                  <div className={`text-sm ${achieved ? 'text-green-700' : 'text-gray-600'}`}>
                                    {milestone.reward}
                                  </div>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                achieved
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {milestone.bonus}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
