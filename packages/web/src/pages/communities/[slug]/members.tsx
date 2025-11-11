import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Member {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  level: number;
  credits: number;
}

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export default function CommunityMembersPage() {
  const router = useRouter();
  const { slug } = router.query;
  const t = useTranslations('communityMembers');

  const { data: community, isLoading: communityLoading } = useQuery<Community>({
    queryKey: ['community', slug],
    queryFn: async () => {
      const response = await api.get(`/communities/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ['community-members', community?.id],
    queryFn: async () => {
      const response = await api.get(`/communities/${community?.id}/members`);
      return response.data || [];
    },
    enabled: !!community?.id,
  });

  const isLoading = communityLoading || membersLoading;

  if (isLoading) {
    return (
      <Layout title={t('loading')}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout title={t('notFound')}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">{t('notFound')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${t('title')} ${community.name}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/communities/${slug}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block"
            >
              ← {t('backTo')} {community.name}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('title')} {community.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {members?.length || 0} {t('membersCount')}
            </p>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members && members.length > 0 ? (
              members.map((member) => (
                <Link
                  key={member.id}
                  href={`/profile/${member.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {member.name}
                      </h3>

                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('level')} {member.level}
                        </span>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {member.credits} {t('credits')}
                        </span>
                      </div>

                      {member.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('noMembers')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = getI18nProps;
export const getStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
});
