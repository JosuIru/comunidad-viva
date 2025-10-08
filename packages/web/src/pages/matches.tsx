import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Match {
  id: string;
  createdAt: string;
  isSuper: boolean;
  user1: {
    id: string;
    name: string;
    avatar?: string;
    generosityScore: number;
  };
  user2: {
    id: string;
    name: string;
    avatar?: string;
    generosityScore: number;
  };
}

export default function MatchesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get('/viral/matches');
      return data;
    },
  });

  const currentUserId = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}').id
    : null;

  const getOtherUser = (match: Match) => {
    return match.user1.id === currentUserId ? match.user2 : match.user1;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💜</span>
              <h1 className="text-xl font-bold text-gray-900">Mis Matches</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-8xl mb-6">💔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Aún no tienes matches
            </h2>
            <p className="text-gray-600 mb-6">
              Empieza a deslizar ofertas para encontrar conexiones
            </p>
            <button
              onClick={() => router.push('/swipe')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <span className="text-xl mr-2">💜</span>
              Descubrir Ofertas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6">
              <p className="text-purple-900 font-semibold text-center">
                🎉 Tienes {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => {
                const otherUser = getOtherUser(match);
                return (
                  <div
                    key={match.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {match.isSuper && (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                        ⭐ Super Match
                      </div>
                    )}

                    <div className="p-6">
                      {/* Avatar */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* User Info */}
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                        {otherUser.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-gray-600">{otherUser.generosityScore}</span>
                      </div>

                      {/* Match Date */}
                      <p className="text-sm text-gray-500 text-center mb-4">
                        Match: {new Date(match.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>

                      {/* Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => router.push(`/messages?userId=${otherUser.id}`)}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          💬 Enviar Mensaje
                        </button>
                        <button
                          onClick={() => router.push(`/profile/${otherUser.id}`)}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Ver Perfil
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
