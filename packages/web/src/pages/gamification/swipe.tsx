import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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
    <Layout title="Swipe & Match - Comunidad Viva">
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
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
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalSwipes}</div>
                  <div className="text-sm text-gray-600">Total Swipes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{stats.likes}</div>
                  <div className="text-sm text-gray-600">Likes Dados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.matches}</div>
                  <div className="text-sm text-gray-600">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.superLikesRemaining}</div>
                  <div className="text-sm text-gray-600">Super Likes hoy</div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('swipe')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'swipe'
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💫 Descubrir
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-6 py-3 font-semibold transition-colors relative ${
                  activeTab === 'matches'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
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
                    className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300 ${
                      swipeDirection === 'left' ? '-translate-x-full opacity-0' : ''
                    } ${swipeDirection === 'right' ? 'translate-x-full opacity-0' : ''}`}
                  >
                    {/* Avatar Section */}
                    <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-12 text-center">
                      <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-6xl">
                        {currentCard.avatar || '👤'}
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentCard.userName}</h2>
                      {currentCard.mutualConnections > 0 && (
                        <div className="text-sm text-purple-700 font-semibold">
                          🤝 {currentCard.mutualConnections} conexiones en común
                        </div>
                      )}
                    </div>

                    <div className="p-8">
                      {/* Bio */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Sobre mí</h3>
                        <p className="text-gray-700">{currentCard.bio}</p>
                      </div>

                      {/* Interests */}
                      {currentCard.interests && currentCard.interests.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">💫 Intereses</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentCard.interests.map((interest, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
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
                          <h3 className="text-lg font-bold text-gray-900 mb-2">🤝 Puedo ayudar con</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentCard.helpOffered.map((help, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
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
                          <h3 className="text-lg font-bold text-gray-900 mb-2">🙏 Necesito ayuda con</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentCard.helpNeeded.map((help, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold"
                              >
                                {help}
                              </span>
                            ))}
                          </div>
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
                  <div className="mt-6 text-center text-sm text-gray-600">
                    💡 Usa las flechas del teclado: ← No, ↑ Super Like, → Sí
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-2xl mx-auto">
                  <div className="text-6xl mb-4">😊</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay más perfiles por ahora</h3>
                  <p className="text-gray-600 mb-6">
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
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-8 text-center">
                        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-5xl">
                          {match.avatar || '👤'}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{match.userName}</h3>
                        <div className="text-sm text-purple-700 mt-1">
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
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Aún no tienes matches</h3>
                  <p className="text-gray-600 mb-6">
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
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo funciona Swipe & Match?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-bold mb-2">Descubre</h4>
                <p className="text-sm text-gray-600">
                  Ve perfiles de personas con intereses y necesidades complementarias
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-bold mb-2">Swipe</h4>
                <p className="text-sm text-gray-600">
                  Desliza a la derecha si te interesa, izquierda si no
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-bold mb-2">Match</h4>
                <p className="text-sm text-gray-600">
                  Si ambos se dan like, ¡es un match!
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">4️⃣</div>
                <h4 className="font-bold mb-2">Conecta</h4>
                <p className="text-sm text-gray-600">
                  Chatea y coordina cómo pueden ayudarse mutuamente
                </p>
              </div>
            </div>

            <div className="mt-8 bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <h4 className="font-bold text-purple-900 mb-3">💡 Tips para mejores matches</h4>
              <ul className="text-sm text-purple-800 space-y-2">
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
            <div className="bg-white rounded-lg max-w-md w-full p-8 text-center animate-bounce">
              <div className="text-8xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
                ¡Es un Match!
              </h3>

              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-6 mb-6">
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-5xl">
                  {newMatch.avatar || '👤'}
                </div>
                <h4 className="text-xl font-bold text-gray-900">{newMatch.userName}</h4>
                <p className="text-sm text-purple-700 mt-2">
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
                  className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
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

export { getI18nProps as getStaticProps };
