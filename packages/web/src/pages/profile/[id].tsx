import { useRouter } from 'next/router';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  credits: number;
  hoursGiven: number;
  hoursReceived: number;
  generosityScore: number;
  role: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['user-profile', id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout title="Cargando perfil...">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout title="Error">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h2>
            <p className="text-gray-600 mb-4">No pudimos encontrar este perfil.</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${user.name} - Perfil`}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="container mx-auto px-4 py-12">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-gray-200 mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-6xl text-blue-600 font-bold">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-white">
                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                <p className="text-xl opacity-90 mb-4">{user.email}</p>
                {user.bio && (
                  <p className="text-lg opacity-90 mb-4">{user.bio}</p>
                )}
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg">
                    ⭐ {user.generosityScore} puntos de generosidad
                  </span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg">
                    💰 {user.credits} créditos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Estadísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⏰</span>
                  <span className="text-green-600 font-bold text-sm">DONADAS</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{user.hoursGiven}h</p>
                <p className="text-sm text-gray-600">Horas compartidas</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⏳</span>
                  <span className="text-blue-600 font-bold text-sm">RECIBIDAS</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{user.hoursReceived}h</p>
                <p className="text-sm text-gray-600">Horas recibidas</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⭐</span>
                  <span className="text-purple-600 font-bold text-sm">PUNTUACIÓN</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{user.generosityScore}</p>
                <p className="text-sm text-gray-600">Generosidad</p>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <p className="text-sm text-gray-600">Miembro desde</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Fecha no disponible'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Conectar</h2>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/messages?userId=${user.id}`)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                💬 Enviar Mensaje
              </button>
              <button
                onClick={() => router.push('/offers')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                🔍 Ver Ofertas
              </button>
            </div>
          </div>
        </div>

        <div className="h-12"></div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export const getStaticProps = async (context: any) => getI18nProps(context);
