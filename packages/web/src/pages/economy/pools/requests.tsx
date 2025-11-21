import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Pool {
  type: string;
  balance: number;
}

interface Vote {
  id: string;
  vote: boolean;
  comment?: string;
  voter: User;
  createdAt: string;
}

interface PoolRequest {
  id: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISTRIBUTED' | 'CANCELLED';
  user: User;
  pool: Pool;
  votes: Vote[];
  createdAt: string;
}

const POOL_ICONS: Record<string, string> = {
  NEEDS: '🆘',
  PROJECTS: '🚀',
  EMERGENCY: '⚡',
  CELEBRATION: '🎉',
  EQUALITY: '⚖️',
};

const POOL_COLORS: Record<string, string> = {
  NEEDS: 'from-red-500 to-orange-600',
  PROJECTS: 'from-blue-500 to-purple-600',
  EMERGENCY: 'from-yellow-500 to-red-600',
  CELEBRATION: 'from-pink-500 to-purple-600',
  EQUALITY: 'from-green-500 to-teal-600',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  DISTRIBUTED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const STATUS_ICONS: Record<string, string> = {
  PENDING: '⏳',
  APPROVED: '✅',
  REJECTED: '❌',
  DISTRIBUTED: '💰',
  CANCELLED: '🚫',
};

export default function PoolRequestsPage() {
  const router = useRouter();
  const t = useTranslations('pools');
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error(t('mustLogin'));
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
  }, [router, t]);

  const { data: requests, isLoading } = useQuery<PoolRequest[]>({
    queryKey: ['pool-requests', filter],
    queryFn: async () => {
      const url = filter === 'ALL'
        ? '/flow-economics/pool-requests'
        : `/flow-economics/pool-requests?status=${filter}`;
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!userId,
  });

  const getVoteStats = (votes: Vote[]) => {
    const approveVotes = votes.filter((v) => v.vote).length;
    const rejectVotes = votes.filter((v) => !v.vote).length;
    return { approveVotes, rejectVotes, total: votes.length };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const filteredRequests = requests || [];

  return (
    <Layout title={t('requestsPageTitle')}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
            >
              {t('requests.back')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('requests.title')}</h1>
            <p className="text-gray-600">
              {t('requests.subtitle')}
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DISTRIBUTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? t('requests.all') : t(`status.${status}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('requests.noRequests')}
              </h3>
              <p className="text-gray-600">
                {filter === 'ALL'
                  ? t('requests.noRequestsYet')
                  : t('requests.noRequestsWithStatus', { status: t(`status.${filter}`) })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const poolIcon = POOL_ICONS[request.pool.type];
                const poolColor = POOL_COLORS[request.pool.type];
                const statusColor = STATUS_COLORS[request.status];
                const statusIcon = STATUS_ICONS[request.status];
                const voteStats = getVoteStats(request.votes);
                const hasUserVoted = request.votes.some((v) => v.voter.id === userId);

                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/economy/pools/requests/${request.id}`)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {request.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{request.user.name}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                          {statusIcon} {t(`status.${request.status}`)}
                        </span>
                      </div>

                      {/* Pool Type */}
                      <div className={`bg-gradient-to-r ${poolColor} rounded-lg p-4 text-white mb-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{poolIcon}</span>
                            <span className="font-semibold">{t(`poolTypes.${request.pool.type}.name`)}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{request.amount}</div>
                            <div className="text-sm text-white/80">{t('requests.creditsRequested')}</div>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-1">{t('requests.reason')}</div>
                        <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {request.reason}
                        </div>
                      </div>

                      {/* Vote Stats */}
                      {request.status === 'PENDING' && (
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-semibold">✓ {voteStats.approveVotes}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-red-600 font-semibold">✗ {voteStats.rejectVotes}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {voteStats.total} {voteStats.total === 1 ? t('requests.vote') : t('requests.votes')}
                          </div>
                          {hasUserVoted && (
                            <span className="ml-auto text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                              {t('requests.alreadyVoted')}
                            </span>
                          )}
                          {!hasUserVoted && (
                            <span className="ml-auto text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                              {t('requests.pendingYourVote')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
