import { useEffect, useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: string;
  credits: number;
  semillaBalance: number;
  level: number;
  experience: number;
  totalSaved: number;
  hoursShared: number;
  hoursReceived: number;
  co2Avoided: number;
  peopleHelped: number;
  peopleHelpedBy: number;
  community?: {
    id: string;
    name: string;
    slug: string;
  };
  skills: Array<{
    id: string;
    name: string;
    category: string;
    verified?: boolean;
  }>;
  badges: Array<{
    id: string;
    badgeType: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Debes iniciar sesión');
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(user);
    setUserId(userData.id);
  }, [router]);

  const { data: profile, isLoading } = useQuery<{ data: UserProfile }>({
    queryKey: ['profile', userId],
    queryFn: () => api.get(`/users/${userId}`),
    enabled: !!userId,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; bio?: string }) => {
      const response = await api.put(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Perfil actualizado');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    toast.success('Sesión cerrada');
    router.push('/');
  };

  const handleEditProfile = () => {
    setEditedName(profile?.data?.name || '');
    setEditedBio(profile?.data?.bio || '');
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: editedName,
      bio: editedBio,
    });
  };

  if (isLoading || !profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const user = profile.data;

  return (
    <Layout title={`Perfil de ${user.name} - Comunidad Viva`}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header del perfil */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                        placeholder="Tu nombre"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'Usuario'}</h1>
                    )}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                          >
                            {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEditProfile}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Editar perfil
                          </button>
                          <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Cerrar sesión
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  {isEditing ? (
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Cuéntanos sobre ti..."
                    />
                  ) : (
                    user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      Nivel {user.level}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                      {user.credits} créditos
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                      {user.semillaBalance?.toFixed(2) || '0.00'} SEMILLA
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comunidad del usuario */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mi Comunidad</h3>
                {user.community ? (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.community.name}</p>
                      <p className="text-sm text-gray-600">Miembro activo</p>
                    </div>
                    <Link
                      href={`/communities/${user.community.slug}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver comunidad
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 mb-4">No perteneces a ninguna comunidad todavía</p>
                    <Link
                      href="/communities"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Explorar comunidades
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">€{user.totalSaved}</p>
                <p className="text-sm text-gray-600 mt-1">Ahorrado</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{user.hoursShared}h</p>
                <p className="text-sm text-gray-600 mt-1">Horas Compartidas</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{user.co2Avoided}kg</p>
                <p className="text-sm text-gray-600 mt-1">CO₂ Evitado</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{user.peopleHelped}</p>
                <p className="text-sm text-gray-600 mt-1">Personas Ayudadas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Habilidades */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Habilidades</h2>
                {user.skills?.length > 0 ? (
                  <div className="space-y-3">
                    {user.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{skill.name}</p>
                          <p className="text-sm text-gray-600">{skill.category}</p>
                        </div>
                        {skill.verified && (
                          <span className="text-green-600">✓ Verificada</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No has agregado habilidades todavía
                  </p>
                )}
              </div>

              {/* Insignias */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Insignias</h2>
                {user.badges?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {user.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl mb-2">
                          🏆
                        </div>
                        <p className="text-xs font-medium text-gray-700">
                          {badge.badgeType.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aún no has ganado insignias
                  </p>
                )}
              </div>
            </div>

            {/* Progreso de nivel */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Progreso de Nivel</h2>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Nivel {user?.level || 1} - {user?.experience || 0} XP
                </span>
                <span className="text-sm text-gray-600">
                  Próximo nivel: {((user?.level || 1) + 1) * 100} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((user?.experience || 0) / (((user?.level || 1) + 1) * 100)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
