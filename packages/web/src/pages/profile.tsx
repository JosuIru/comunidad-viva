import { useEffect, useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import SkeletonLoader from '@/components/SkeletonLoader';
import { fadeInUp } from '@/utils/animations';

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
  const t = useTranslations('profilePage');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error(t('auth.mustLogin'));
      router.push('/auth/login');
      return;
    }
    const userData = JSON.parse(user);
    setUserId(userData.id);
  }, [router, t]);

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
      toast.success(t('success.profileUpdated'));
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errors.updateProfile'));
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    toast.success(t('auth.sessionClosed'));
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

  if (!userId || isLoading || !profile || !profile.data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <SkeletonLoader type="profile" />
        </div>
      </Layout>
    );
  }

  const user = profile.data;

  return (
    <Layout title={t('title', { name: user.name })}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header del perfil */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-start gap-6">
                <Avatar name={user?.name || 'Usuario'} src={user?.avatar} size="xl" className="w-24 h-24" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:bg-gray-800 border-b-2 border-blue-500 focus:outline-none"
                        placeholder={t('yourName')}
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user?.name || t('defaultUser')}</h1>
                    )}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => setIsEditing(false)}
                          >
                            {t('buttons.cancel')}
                          </Button>
                          <Button
                            variant="primary"
                            onClick={handleSaveProfile}
                            isLoading={updateProfileMutation.isPending}
                          >
                            {t('buttons.save')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleEditProfile}
                          >
                            {t('buttons.editProfile')}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={handleLogout}
                          >
                            {t('buttons.logout')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                  {isEditing ? (
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder={t('aboutPlaceholder')}
                    />
                  ) : (
                    user.bio && <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {t('level', { level: user.level })}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                      {t('credits', { credits: user.credits })}
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                      {t('semilla', { balance: user.semillaBalance?.toFixed(2) || '0.00' })}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comunidad del usuario */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('sections.myCommunity')}</h3>
                {user.community ? (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.community.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('sections.activeMember')}</p>
                    </div>
                    <Link href={`/communities/${user.community.slug}`}>
                      <Button variant="primary">
                        {t('buttons.viewCommunity')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{t('sections.notInCommunity')}</p>
                    <Link href="/communities">
                      <Button variant="primary" size="md">
                        {t('sections.exploreCommunities')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">€{user.totalSaved}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.saved')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{user.hoursShared}h</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.hoursShared')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{user.co2Avoided}kg</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.co2Avoided')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{user.peopleHelped}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.peopleHelped')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Habilidades */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('sections.skills')}</h2>
                {user.skills?.length > 0 ? (
                  <div className="space-y-3">
                    {user.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{skill.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{skill.category}</p>
                        </div>
                        {skill.verified && (
                          <span className="text-green-600">{t('badges.verified')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    {t('sections.noSkills')}
                  </p>
                )}
              </div>

              {/* Insignias */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('sections.badges')}</h2>
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
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {badge.badgeType.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    {t('sections.noBadges')}
                  </p>
                )}
              </div>
            </div>

            {/* Progreso de nivel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('sections.levelProgress')}</h2>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('level', { level: user?.level || 1 })} - {t('experience', { exp: user?.experience || 0 })}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('sections.nextLevel')} {((user?.level || 1) + 1) * 100} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
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

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
