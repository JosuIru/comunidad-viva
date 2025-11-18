import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import CommunityPackCard from '@/components/community-packs/CommunityPackCard';

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
  const t = useTranslations('communityDetail');
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('activity.title')}</h2>
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('activity.loading')}</p>
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Link
              key={`${activity.type}-${activity.id}`}
              href={getActivityLink(activity)}
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  {activity.title && (
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{activity.title}</h3>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500">
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{t('activity.empty')}</p>
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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userCommunityId, setUserCommunityId] = useState<string | null>(null);
  const t = useTranslations('communityDetail');
  const tCommon = useTranslations('communities');
  const tToasts = useTranslations('toasts');

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      const userData = JSON.parse(userStr);
      setCurrentUserId(userData.id);
    }
  }, []);

  // Get user profile to check their community
  const { data: userProfile } = useQuery({
    queryKey: ['profile', currentUserId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${currentUserId}`);
      return data;
    },
    enabled: !!currentUserId,
  });

  useEffect(() => {
    if (userProfile?.communityId) {
      setUserCommunityId(userProfile.communityId);
    }
  }, [userProfile]);

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
      toast.success(t('toasts.joinSuccess'));
      queryClient.invalidateQueries({ queryKey: ['community', slug] });

      // Invalidate user queries to update profile and other pages
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userStr) {
        const userData = JSON.parse(userStr);
        queryClient.invalidateQueries({ queryKey: ['user', userData.id] });
        queryClient.invalidateQueries({ queryKey: ['profile', userData.id] });
      }

      setShowJoinModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.joinError'));
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/communities/${community?.id}/leave`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(tToasts('success.communityLeft'));
      queryClient.invalidateQueries({ queryKey: ['community', slug] });

      // Invalidate user queries to update profile and other pages
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['user', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['profile', currentUserId] });
      }

      setShowLeaveModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || tToasts('error.leaveCommunity'));
    },
  });

  if (isLoading) {
    return (
      <Layout title={t('loading.title')}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('loading.text')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout title={t('notFound.title')}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏘️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('notFound.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('notFound.description')}</p>
            <Link
              href="/communities"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('notFound.button')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${community.name} - Comunidad`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              {community.logo && (
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className="px-4 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {t(`type.${community.type}`)}
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
                    {t(`visibility.${community.visibility}`)}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{community.name}</h1>

                {community.location && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">📍 {community.location}</p>
                )}

                {community.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{community.description}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {community.membersCount}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400"> {t('stats.members')}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {community.activeOffersCount}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400"> {t('stats.activeOffers')}</span>
                  </div>
                  {community.radiusKm && (
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{community.radiusKm}</span>
                      <span className="text-gray-600 dark:text-gray-400"> {t('stats.radius')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3">
                {userCommunityId === community.id ? (
                  <>
                    <div className="px-8 py-3 bg-green-100 border-2 border-green-600 text-green-800 rounded-lg font-semibold text-center">
                      ✓ Miembro de esta comunidad
                    </div>
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg"
                    >
                      Abandonar comunidad
                    </button>
                  </>
                ) : userCommunityId ? (
                  <div className="px-8 py-3 bg-yellow-50 border-2 border-yellow-400 text-yellow-800 rounded-lg font-semibold text-center text-sm">
                    Ya perteneces a otra comunidad
                  </div>
                ) : (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                  >
                    {t('buttons.join')}
                  </button>
                )}
                <Link
                  href={`/communities/${slug}/offers`}
                  className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-center"
                >
                  {t('buttons.viewOffers')}
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('about.title')}</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('about.communityType')}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{t(`type.${community.type}`)}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('about.access')}</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {community.visibility === 'OPEN'
                        ? t('about.accessOpen')
                        : community.visibility === 'PUBLIC'
                        ? t('about.accessPublic')
                        : community.visibility === 'PRIVATE'
                        ? t('about.accessPrivate')
                        : t('about.accessFederated')}
                    </p>
                  </div>

                  {community.allowExternalOffers && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('about.externalOffers')}</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {t('about.externalOffersText')}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('about.language')}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{community.language.toUpperCase()}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('about.currency')}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{community.currency}</p>
                  </div>
                </div>
              </div>

              {/* Members Preview */}
              {members && members.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {t('members.title')} ({members.length})
                    </h2>
                    <Link
                      href={`/communities/${slug}/members`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      {t('buttons.viewAll')}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {members.slice(0, 6).map((member) => (
                      <div key={member.id} className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-2 flex items-center justify-center text-2xl">
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
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">⭐ {member.reputation} {t('members.helps')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Pack */}
              <CommunityPackCard
                communityId={community.id}
                communitySlug={community.slug}
                isAdmin={isMember}
              />

              {/* Recent Activity */}
              <CommunityActivity communityId={community.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('stats.statistics')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('stats.membersLabel')}</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{community.membersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('stats.offersLabel')}</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {community.activeOffersCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('stats.created')}</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {new Date(community.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('actions.title')}</h3>
                <div className="space-y-3">
                  <Link
                    href={`/communities/${slug}/offers`}
                    className="block w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
                  >
                    {t('buttons.seeOffers')}
                  </Link>
                  <Link
                    href={`/communities/${slug}/events`}
                    className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center font-medium"
                  >
                    {t('buttons.seeEvents')}
                  </Link>
                  <Link
                    href={`/mutual-aid/needs?communityId=${community.id}`}
                    className="block w-full px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-center font-medium"
                  >
                    🆘 {t('actions.needs')}
                  </Link>
                  <Link
                    href={`/mutual-aid/projects?communityId=${community.id}`}
                    className="block w-full px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors text-center font-medium"
                  >
                    🤝 {t('actions.projects')}
                  </Link>
                  <Link
                    href={`/housing?communityId=${community.id}`}
                    className="block w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-center font-medium"
                  >
                    🏡 {t('actions.housing')}
                  </Link>
                  <Link
                    href={`/communities/${slug}/governance`}
                    className="block w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-center font-medium"
                  >
                    🏛️ {t('actions.governance')}
                  </Link>
                </div>
              </div>

              {/* Share */}
              <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">{t('share.title')}</h3>
                <p className="text-sm opacity-90 mb-4">{t('share.description')}</p>
                <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  📤 {t('share.button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('joinModal.title', { name: community.name })}
            </h3>

            {community.requiresApproval ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  {t('joinModal.requiresApproval')}
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-sm text-green-800">
                  {t('joinModal.openCommunity')}
                </p>
              </div>
            )}

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('joinModal.benefits')}
            </p>

            <ul className="space-y-2 mb-6 text-sm text-gray-700 dark:text-gray-300">
              <li>{t('joinModal.benefitsList.offers')}</li>
              <li>{t('joinModal.benefitsList.events')}</li>
              <li>{t('joinModal.benefitsList.connect')}</li>
              <li>{t('joinModal.benefitsList.vote')}</li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium"
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {joinMutation.isPending ? t('joinModal.joining') : t('joinModal.join')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Abandonar {community.name}
              </h3>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm text-red-800">
                Estás a punto de abandonar esta comunidad. Esta acción es reversible, pero perderás el acceso inmediato a:
              </p>
            </div>

            <ul className="space-y-2 mb-6 text-sm text-gray-700 dark:text-gray-300">
              <li>❌ Ofertas exclusivas de la comunidad</li>
              <li>❌ Eventos y actividades comunitarias</li>
              <li>❌ Propuestas de gobernanza y votaciones</li>
              <li>❌ Comunicación directa con otros miembros</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm">
              Podrás volver a unirte en cualquier momento visitando la página de la comunidad.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
              >
                {leaveMutation.isPending ? 'Abandonando...' : 'Sí, abandonar'}
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

export const getStaticProps = async (context: any) => getI18nProps(context);
