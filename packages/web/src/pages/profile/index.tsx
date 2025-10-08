import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  credits: number;
  level: number;
  experience: number;
  address?: string;
  neighborhood?: string;
  interests?: string[];
  // Stats
  totalSaved: number;
  hoursShared: number;
  hoursReceived: number;
  co2Avoided: number;
  peopleHelped: number;
  peopleHelpedBy: number;
  connectionsCount: number;
  // Flow Economics
  generosityScore: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
  }, [router]);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">No se pudo cargar el perfil</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${profile.name} - Perfil`}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>

                {/* Basic Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600 mt-1">{profile.email}</p>
                  {profile.neighborhood && (
                    <p className="text-gray-500 mt-1">📍 {profile.neighborhood}</p>
                  )}
                  {profile.bio && (
                    <p className="text-gray-700 mt-3 max-w-2xl">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <Link
                href="/profile/edit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Editar perfil
              </Link>
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Credits */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow p-6 text-white">
              <div className="text-4xl font-bold">{profile.credits}</div>
              <div className="text-white/90 mt-2">Créditos</div>
              <div className="text-xs text-white/80 mt-1">Nivel {profile.level}</div>
            </div>

            {/* Generosity */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow p-6 text-white">
              <div className="text-4xl font-bold">{Math.round(profile.generosityScore)}</div>
              <div className="text-white/90 mt-2">Índice de Generosidad</div>
              <div className="text-xs text-white/80 mt-1">Flow Economics</div>
            </div>

            {/* Connections */}
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow p-6 text-white">
              <div className="text-4xl font-bold">{profile.connectionsCount}</div>
              <div className="text-white/90 mt-2">Conexiones</div>
              <div className="text-xs text-white/80 mt-1">Red comunitaria</div>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tu Impacto Comunitario</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">{profile.peopleHelped}</div>
                <div className="text-sm text-gray-600 mt-1">Personas ayudadas</div>
              </div>

              <div>
                <div className="text-3xl font-bold text-green-600">
                  {profile.hoursShared.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600 mt-1">Horas compartidas</div>
              </div>

              <div>
                <div className="text-3xl font-bold text-purple-600">
                  €{profile.totalSaved.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Ahorro generado</div>
              </div>

              <div>
                <div className="text-3xl font-bold text-teal-600">
                  {profile.co2Avoided.toFixed(1)}kg
                </div>
                <div className="text-sm text-gray-600 mt-1">CO₂ evitado</div>
              </div>
            </div>
          </div>

          {/* Time Bank Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Banco de Tiempo</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Horas compartidas</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {profile.hoursShared.toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Horas recibidas</span>
                  <span className="text-2xl font-bold text-green-600">
                    {profile.hoursReceived.toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Balance</span>
                  <span
                    className={`text-2xl font-bold ${
                      profile.hoursShared - profile.hoursReceived >= 0
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {(profile.hoursShared - profile.hoursReceived).toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Red de Apoyo</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Has ayudado a</span>
                  <span className="text-2xl font-bold text-blue-600">{profile.peopleHelped}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Te han ayudado</span>
                  <span className="text-2xl font-bold text-green-600">
                    {profile.peopleHelpedBy}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Conexiones activas</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {profile.connectionsCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
