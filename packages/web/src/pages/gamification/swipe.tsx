import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface SwipeCard {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  bio: string;
  interests: string[];
  helpOffered: string[];
  helpNeeded: string[];
  mutualConnections: number;
  level?: number;
  credits?: number;
  reputation?: number;
  location?: string;
  joinedDate?: string;
  activeOffersCount?: number;
  completedTransactionsCount?: number;
  badges?: string[];
  languages?: string[];
  availability?: string;
  responseRate?: number;
}

interface Match {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  matchedAt: string;
  chatStarted: boolean;
}

interface SwipeStats {
  totalSwipes: number;
  likes: number;
  matches: number;
  superLikesRemaining: number;
}

// Helper function to generate avatar URL
const getAvatarUrl = (userName: string, avatar?: string | null) => {
  if (avatar && avatar !== 'null' && !avatar.includes('pravatar')) {
    return avatar;
  }
  // Generate avatar using ui-avatars.com with user's initials
  const name = encodeURIComponent(userName || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=ec4899&color=fff&size=150&bold=true`;
};

export default function SwipePage() {
  const queryClient = useQueryClient();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [newMatch, setNewMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'swipe' | 'matches'>('swipe');

  // Fetch swipe cards
  const { data: cards, isLoading } = useQuery<SwipeCard[]>({
    queryKey: ['swipe-cards'],
    queryFn: async () => {
      const response = await api.get('/viral-features/swipe/cards');
      return response.data.cards || [];
    },
  });

  // Fetch matches
  const { data: matches } = useQuery<Match[]>({
    queryKey: ['swipe-matches'],
    queryFn: async () => {
      const response = await api.get('/viral-features/swipe/matches');
      return response.data.matches || [];
    },
  });

  // Fetch stats
  const { data: stats } = useQuery<SwipeStats>({
    queryKey: ['swipe-stats'],
    queryFn: async () => {
      const response = await api.get('/viral-features/swipe/stats');
      return response.data;
    },
  });

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async ({ cardId, action }: { cardId: string; action: 'LIKE' | 'DISLIKE' | 'SUPER_LIKE' }) => {
      const response = await api.post('/viral-features/swipe/action', { cardId, action });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.match) {
        setNewMatch(data.match);
        setShowMatchModal(true);
        queryClient.invalidateQueries({ queryKey: ['swipe-matches'] });
      }
      queryClient.invalidateQueries({ queryKey: ['swipe-stats'] });
      queryClient.invalidateQueries({ queryKey: ['swipe-cards'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al procesar swipe');
    },
  });

  const currentCard = cards?.[currentCardIndex];

  const handleSwipe = (action: 'LIKE' | 'DISLIKE' | 'SUPER_LIKE') => {
    if (!currentCard) return;

    if (action === 'SUPER_LIKE' && stats && stats.superLikesRemaining === 0) {
      toast.error('No te quedan Super Likes hoy');
      return;
    }

    setSwipeDirection(action === 'DISLIKE' ? 'left' : 'right');

    setTimeout(() => {
      swipeMutation.mutate({ cardId: currentCard.id, action });
      setSwipeDirection(null);
      setCurrentCardIndex((prev) => prev + 1);
    }, 300);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (activeTab !== 'swipe') return;
    if (e.key === 'ArrowLeft') handleSwipe('DISLIKE');
    if (e.key === 'ArrowRight') handleSwipe('LIKE');
    if (e.key === 'ArrowUp') handleSwipe('SUPER_LIKE');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab, currentCard]);

  // Reset index when cards refresh
  useEffect(() => {
    if (cards && currentCardIndex >= cards.length) {
      setCurrentCardIndex(0);
    }
  }, [cards]);

  return (
    <Layout title="Swipe & Match - Truk">
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">💝 Swipe & Match</h1>
            <p className="text-xl opacity-90">
              Conecta con personas que pueden ayudarte y a quienes puedes ayudar
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Bar */}
          {stats && (
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSwipes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Swipes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.likes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Likes Dados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.matches}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.superLikesRemaining}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Super Likes hoy</div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('swipe')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'swipe'
                    ? 'border-b-2 border-pink-500 text-pink-600 dark:text-pink-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                💫 Descubrir
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-6 py-3 font-semibold transition-colors relative ${
                  activeTab === 'matches'
                    ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                💝 Matches
                {matches && matches.length > 0 && (
                  <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {matches.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Swipe Tab */}
          {activeTab === 'swipe' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                </div>
              ) : currentCard ? (
                <div className="max-w-2xl mx-auto">
                  {/* Swipe Card */}
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300 ${
                      swipeDirection === 'left' ? '-translate-x-full opacity-0' : ''
                    } ${swipeDirection === 'right' ? 'translate-x-full opacity-0' : ''}`}
                  >
                    {/* Avatar Section */}
                    <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-12 text-center relative">
                      {/* Level Badge */}
                      {currentCard.level && (
                        <div className="absolute top-4 right-4 bg-white dark:bg-gray-700 rounded-full px-4 py-2 shadow-lg">
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Nivel</div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentCard.level}</div>
                        </div>
                      )}

                      <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-lg">
                        <Image
                          src={getAvatarUrl(currentCard.userName, currentCard.avatar)}
                          alt={currentCard.userName}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{currentCard.userName}</h2>

                      {/* Location */}
                      {currentCard.location && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          📍 {currentCard.location}
                        </div>
                      )}

                      {/* Mutual Connections */}
                      {currentCard.mutualConnections > 0 && (
                        <div className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                          🤝 {currentCard.mutualConnections} conexiones en común
                        </div>
                      )}

                      {/* Badges */}
                      {currentCard.badges && currentCard.badges.length > 0 && (
                        <div className="flex justify-center gap-2 mt-3">
                          {currentCard.badges.slice(0, 5).map((badge, index) => (
                            <span key={index} className="text-2xl" title={badge}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        {currentCard.credits !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{currentCard.credits}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Créditos</div>
                          </div>
                        )}
                        {currentCard.reputation !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">⭐ {currentCard.reputation.toFixed(1)}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Reputación</div>
                          </div>
                        )}
                        {currentCard.completedTransactionsCount !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentCard.completedTransactionsCount}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Intercambios</div>
                          </div>
                        )}
                      </div>

                      {/* Activity Info */}
                      <div className="mb-6 flex flex-wrap gap-3 text-sm">
                        {currentCard.activeOffersCount !== undefined && currentCard.activeOffersCount > 0 && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                            📋 {currentCard.activeOffersCount} ofertas activas
                          </span>
                        )}
                        {currentCard.responseRate !== undefined && (
                          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                            ⚡ {currentCard.responseRate}% respuesta
                          </span>
                        )}
                        {currentCard.availability && (
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                            🕐 {currentCard.availability}
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">📝 Sobre mí</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentCard.bio}</p>
                      </div>

                      {/* Languages */}
                      {currentCard.languages && currentCard.languages.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">🗣️ Idiomas</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentCard.languages.map((language, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold"
                              >
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interests */}
                      {currentCard.interests && currentCard.interests.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">💫 Intereses</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentCard.interests.map((interest, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Help Offered */}
                      {currentCard.helpOffered && currentCard.helpOffered.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">🤝 Puedo ayudar con</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentCard.helpOffered.map((help, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold"
                              >
                                {help}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Help Needed */}
                      {currentCard.helpNeeded && currentCard.helpNeeded.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">🙏 Necesito ayuda con</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentCard.helpNeeded.map((help, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-semibold"
                              >
                                {help}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Member Since */}
                      {currentCard.joinedDate && (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          Miembro desde {new Date(currentCard.joinedDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-center items-center gap-6">
                    <button
                      onClick={() => handleSwipe('DISLIKE')}
                      disabled={swipeMutation.isPending}
                      className="w-16 h-16 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 disabled:opacity-50"
                      title="No me interesa (←)"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => handleSwipe('SUPER_LIKE')}
                      disabled={swipeMutation.isPending || (stats && stats.superLikesRemaining === 0)}
                      className="w-20 h-20 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-4xl transition-all hover:scale-110 disabled:opacity-50"
                      title="Super Like (↑)"
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => handleSwipe('LIKE')}
                      disabled={swipeMutation.isPending}
                      className="w-16 h-16 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 disabled:opacity-50"
                      title="Me interesa (→)"
                    >
                      💝
                    </button>
                  </div>

                  {/* Keyboard Hints */}
                  <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    💡 Usa las flechas del teclado: ← No, ↑ Super Like, → Sí
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center max-w-2xl mx-auto">
                  <div className="text-6xl mb-4">😊</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No hay más perfiles por ahora</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Vuelve más tarde para descubrir nuevas conexiones
                  </p>
                  <button
                    onClick={() => {
                      setCurrentCardIndex(0);
                      queryClient.invalidateQueries({ queryKey: ['swipe-cards'] });
                    }}
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
                  >
                    🔄 Actualizar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div>
              {matches && matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-8 text-center">
                        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                          <Image
                            src={getAvatarUrl(match.userName, match.avatar)}
                            alt={match.userName}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{match.userName}</h3>
                        <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Match desde {new Date(match.matchedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="p-6">
                        <button
                          onClick={() => toast.success('Funcionalidad de chat próximamente')}
                          className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors font-semibold"
                        >
                          {match.chatStarted ? '💬 Continuar Chat' : '💬 Iniciar Chat'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aún no tienes matches</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Empieza a hacer swipe para encontrar conexiones
                  </p>
                  <button
                    onClick={() => setActiveTab('swipe')}
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
                  >
                    💫 Descubrir Personas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* How it Works */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">¿Cómo funciona Swipe & Match?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Descubre</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ve perfiles de personas con intereses y necesidades complementarias
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Swipe</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Desliza a la derecha si te interesa, izquierda si no
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Match</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Si ambos se dan like, ¡es un match!
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">4️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Conecta</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chatea y coordina cómo pueden ayudarse mutuamente
                </p>
              </div>
            </div>

            <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3">💡 Tips para mejores matches</h4>
              <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-2">
                <li>• Completa tu perfil con información sobre lo que ofreces y necesitas</li>
                <li>• Sé específico sobre tus habilidades e intereses</li>
                <li>• Usa Super Likes estratégicamente (3 por día)</li>
                <li>• Las conexiones mutuas aumentan la probabilidad de match</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Match Modal */}
        {showMatchModal && newMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-8 text-center animate-bounce">
              <div className="text-8xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
                ¡Es un Match!
              </h3>

              <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                  <Image
                    src={getAvatarUrl(newMatch.userName, newMatch.avatar)}
                    alt={newMatch.userName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{newMatch.userName}</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  A {newMatch.userName} también le interesas
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowMatchModal(false);
                    setActiveTab('matches');
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors font-semibold"
                >
                  💬 Iniciar Chat
                </button>
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Seguir Descubriendo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
