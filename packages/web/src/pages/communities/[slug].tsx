import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

type CommunityType = 'NEIGHBORHOOD' | 'VILLAGE' | 'TOWN' | 'COUNTY' | 'REGION' | 'CUSTOM';
type CommunityVisibility = 'PRIVATE' | 'PUBLIC' | 'OPEN' | 'FEDERATED';

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  type: CommunityType;
  visibility: CommunityVisibility;
  requiresApproval: boolean;
  allowExternalOffers: boolean;
  membersCount: number;
  activeOffersCount: number;
  logo?: string;
  bannerImage?: string;
  primaryColor?: string;
  language: string;
  currency: string;
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  avatar?: string;
  reputation: number;
  joinedAt: string;
}

const typeLabels: Record<CommunityType, string> = {
  NEIGHBORHOOD: 'Barrio',
  VILLAGE: 'Pueblo',
  TOWN: 'Ciudad',
  COUNTY: 'Comarca',
  REGION: 'Región',
  CUSTOM: 'Personalizado',
};

const visibilityLabels: Record<CommunityVisibility, string> = {
  PRIVATE: 'Privada',
  PUBLIC: 'Pública',
  OPEN: 'Abierta',
  FEDERATED: 'Federada',
};

interface Activity {
  type: 'offer' | 'event' | 'proposal' | 'post';
  id: string;
  title: string | null;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

function CommunityActivity({ communityId }: { communityId: string }) {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['community-activity', communityId],
    queryFn: async () => {
      const response = await api.get(`/communities/${communityId}/activity?limit=10`);
      return response.data;
    },
  });

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'offer': return '🛍️';
      case 'event': return '📅';
      case 'proposal': return '📜';
      case 'post': return '📝';
      default: return '📌';
    }
  };

  const getActivityLink = (activity: Activity) => {
    switch (activity.type) {
      case 'offer': return `/offers/${activity.id}`;
      case 'event': return `/events/${activity.id}`;
      case 'proposal': return `/governance/proposals/${activity.id}`;
      case 'post': return `/social/posts/${activity.id}`;
      default: return '#';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Actividad reciente</h2>
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Cargando actividad...</p>
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Link
              key={`${activity.type}-${activity.id}`}
              href={getActivityLink(activity)}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  {activity.title && (
                    <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>👤 {activity.user.name}</span>
                    <span>•</span>
                    <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No hay actividad reciente en esta comunidad</p>
        </div>
      )}
    </div>
  );
}

export default function CommunityDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const queryClient = useQueryClient();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: community, isLoading } = useQuery<Community>({
    queryKey: ['community', slug],
    queryFn: async () => {
      const response = await api.get(`/communities/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const { data: members } = useQuery<Member[]>({
    queryKey: ['community-members', community?.id],
    queryFn: async () => {
      const response = await api.get(`/communities/${community?.id}/members`);
      return response.data;
    },
    enabled: !!community?.id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/communities/${community?.id}/join`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Te has unido a la comunidad!');
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
      setShowJoinModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al unirse a la comunidad');
    },
  });

  if (isLoading) {
    return (
      <Layout title="Cargando...">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Cargando comunidad...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout title="Comunidad no encontrada">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏘️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Comunidad no encontrada</h1>
            <p className="text-gray-600 mb-6">La comunidad que buscas no existe</p>
            <Link
              href="/communities"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver todas las comunidades
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${community.name} - Comunidad`}>
      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div
          className="h-64 bg-gradient-to-r from-blue-500 to-green-500 relative"
          style={
            community.primaryColor
              ? {
                  background: `linear-gradient(135deg, ${community.primaryColor}, ${community.primaryColor}dd)`,
                }
              : community.bannerImage
              ? { backgroundImage: `url(${community.bannerImage})`, backgroundSize: 'cover' }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Header Info */}
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              {community.logo && (
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className="px-4 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {typeLabels[community.type]}
                  </span>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-medium ${
                      community.visibility === 'OPEN'
                        ? 'bg-green-100 text-green-800'
                        : community.visibility === 'PUBLIC'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {visibilityLabels[community.visibility]}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">{community.name}</h1>

                {community.location && (
                  <p className="text-lg text-gray-600 mb-4">📍 {community.location}</p>
                )}

                {community.description && (
                  <p className="text-gray-700 mb-6">{community.description}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {community.membersCount}
                    </span>
                    <span className="text-gray-600"> miembros</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">
                      {community.activeOffersCount}
                    </span>
                    <span className="text-gray-600"> ofertas activas</span>
                  </div>
                  {community.radiusKm && (
                    <div>
                      <span className="font-semibold text-gray-900">{community.radiusKm}</span>
                      <span className="text-gray-600"> km de radio</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                >
                  Unirse a la comunidad
                </button>
                <Link
                  href={`/communities/${slug}/offers`}
                  className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-center"
                >
                  Ver ofertas
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre esta comunidad</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tipo de comunidad</h3>
                    <p className="text-gray-700">{typeLabels[community.type]}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Acceso</h3>
                    <p className="text-gray-700">
                      {community.visibility === 'OPEN'
                        ? 'Comunidad abierta - Cualquiera puede unirse'
                        : community.visibility === 'PUBLIC'
                        ? 'Comunidad pública - Requiere aprobación para unirse'
                        : community.visibility === 'PRIVATE'
                        ? 'Comunidad privada - Solo por invitación'
                        : 'Comunidad federada - Conectada con otras comunidades'}
                    </p>
                  </div>

                  {community.allowExternalOffers && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Ofertas externas</h3>
                      <p className="text-gray-700">
                        Esta comunidad permite ver ofertas de comunidades conectadas
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Idioma</h3>
                    <p className="text-gray-700">{community.language.toUpperCase()}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Moneda</h3>
                    <p className="text-gray-700">{community.currency}</p>
                  </div>
                </div>
              </div>

              {/* Members Preview */}
              {members && members.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Miembros ({members.length})
                    </h2>
                    <Link
                      href={`/communities/${slug}/members`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Ver todos →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {members.slice(0, 6).map((member) => (
                      <div key={member.id} className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center text-2xl">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            '👤'
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600">⭐ {member.reputation} ayudas</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <CommunityActivity communityId={community.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Miembros:</span>
                    <span className="font-bold text-gray-900">{community.membersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ofertas:</span>
                    <span className="font-bold text-gray-900">
                      {community.activeOffersCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creada:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(community.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>
                <div className="space-y-3">
                  <Link
                    href={`/communities/${slug}/offers`}
                    className="block w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
                  >
                    🛍️ Ver ofertas
                  </Link>
                  <Link
                    href={`/communities/${slug}/events`}
                    className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center font-medium"
                  >
                    📅 Ver eventos
                  </Link>
                  <Link
                    href={`/mutual-aid/needs?communityId=${community.id}`}
                    className="block w-full px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-center font-medium"
                  >
                    🆘 Necesidades
                  </Link>
                  <Link
                    href={`/mutual-aid/projects?communityId=${community.id}`}
                    className="block w-full px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors text-center font-medium"
                  >
                    🤝 Proyectos
                  </Link>
                  <Link
                    href={`/housing?communityId=${community.id}`}
                    className="block w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-center font-medium"
                  >
                    🏡 Vivienda
                  </Link>
                  <Link
                    href={`/communities/${slug}/governance`}
                    className="block w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-center font-medium"
                  >
                    🏛️ Gobernanza
                  </Link>
                </div>
              </div>

              {/* Share */}
              <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">¿Te gusta esta comunidad?</h3>
                <p className="text-sm opacity-90 mb-4">Compártela con tus amigos y vecinos</p>
                <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  📤 Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Unirse a {community.name}
            </h3>

            {community.requiresApproval ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Esta comunidad requiere aprobación manual. Tu solicitud será revisada por
                  los administradores.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-sm text-green-800">
                  ✅ Puedes unirte inmediatamente a esta comunidad abierta
                </p>
              </div>
            )}

            <p className="text-gray-700 mb-6">
              Al unirte a esta comunidad podrás:
            </p>

            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li>✓ Acceder a ofertas exclusivas de la comunidad</li>
              <li>✓ Participar en eventos locales</li>
              <li>✓ Conectar con vecinos</li>
              <li>✓ Votar en decisiones comunitarias</li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {joinMutation.isPending ? 'Uniéndose...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export async function getStaticPaths() {
  // Return empty paths with fallback to generate pages on-demand
  return {
    paths: [],
    fallback: 'blocking', // Generate pages on-demand with SSR
  };
}

export { getI18nProps as getStaticProps };
