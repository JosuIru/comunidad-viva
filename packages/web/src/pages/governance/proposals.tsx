import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';

type ProposalStatus = 'DISCUSSION' | 'VOTING' | 'APPROVED' | 'REJECTED';
type ProposalType = 'FEATURE' | 'RULE_CHANGE' | 'FUND_ALLOCATION' | 'PARTNERSHIP';

interface Proposal {
  id: string;
  type: ProposalType;
  title: string;
  description: string;
  requiredBudget: number;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  endsAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  hasVoted?: boolean;
}

interface UserReputation {
  userId: string;
  reputation: number;
  level: string;
  privileges: string[];
}

export default function ProposalsPage() {
  const t = useTranslations('governance.proposals');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [votePoints, setVotePoints] = useState(1);

  // New proposal form
  const [newProposal, setNewProposal] = useState({
    type: 'FEATURE' as ProposalType,
    title: '',
    description: '',
    requiredBudget: 0,
    implementationPlan: '',
  });

  // Fetch user reputation
  const { data: reputation } = useQuery<UserReputation>({
    queryKey: ['user-reputation'],
    queryFn: async () => {
      const response = await api.get('/consensus/reputation');
      return response.data;
    },
  });

  // Fetch proposals
  const { data: proposals, isLoading } = useQuery<Proposal[]>({
    queryKey: ['proposals', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const response = await api.get('/consensus/proposals', { params });
      return response.data;
    },
  });

  // Create proposal mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newProposal) => {
      const response = await api.post('/consensus/proposals', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setShowCreateModal(false);
      setNewProposal({
        type: 'FEATURE',
        title: '',
        description: '',
        requiredBudget: 0,
        implementationPlan: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.createError'));
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, points }: { proposalId: string; points: number }) => {
      const response = await api.post(`/consensus/proposals/${proposalId}/vote`, { points });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.voteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setShowVoteModal(false);
      setSelectedProposal(null);
      setVotePoints(1);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.voteError'));
    },
  });

  const handleCreateProposal = () => {
    if (!reputation || reputation.reputation < 20) {
      toast.error(t('toasts.reputationRequired'));
      return;
    }
    createMutation.mutate(newProposal);
  };

  const handleVote = () => {
    if (!selectedProposal) return;
    voteMutation.mutate({
      proposalId: selectedProposal.id,
      points: votePoints,
    });
  };

  const getVoteCost = (points: number) => points * points;

  const getStatusBadge = (status: ProposalStatus) => {
    const styles = {
      DISCUSSION: 'bg-blue-100 text-blue-800',
      VOTING: 'bg-purple-100 text-purple-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels = {
      DISCUSSION: t('status.DISCUSSION'),
      VOTING: t('status.VOTING'),
      APPROVED: t('status.APPROVED'),
      REJECTED: t('status.REJECTED'),
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeBadge = (type: ProposalType) => {
    const styles = {
      FEATURE: 'bg-indigo-100 text-indigo-800',
      RULE_CHANGE: 'bg-orange-100 text-orange-800',
      FUND_ALLOCATION: 'bg-green-100 text-green-800',
      PARTNERSHIP: 'bg-pink-100 text-pink-800',
    };
    const labels = {
      FEATURE: t('type.FEATURE'),
      RULE_CHANGE: t('type.RULE_CHANGE'),
      FUND_ALLOCATION: t('type.FUND_ALLOCATION'),
      PARTNERSHIP: t('type.PARTNERSHIP'),
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const canCreateProposal = reputation && reputation.reputation >= 20;

  return (
    <Layout title={t('layout.title')}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">{t('header.title')}</h1>
            <p className="text-xl opacity-90">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Reputation Card */}
          <div className="mb-8 bg-gradient-to-br from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 text-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">🏆</div>
                <div>
                  <div className="text-sm opacity-80 mb-1">{t('reputation.title')}</div>
                  <div className="text-4xl font-bold">{reputation?.reputation || 0}</div>
                  <div className="text-lg opacity-90">{reputation?.level || t('reputation.level')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80 mb-2">{t('reputation.privilegesTitle')}</div>
                <div className="space-y-1">
                  {reputation?.privileges.map((privilege, index) => (
                    <div key={index} className="text-sm bg-white bg-opacity-20 rounded px-3 py-1">
                      ✓ {privilege.replace('can_', '').replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {!canCreateProposal && (
              <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">
                  {t('reputation.requirementInfo', { current: reputation?.reputation || 0 })}
                </p>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('filters.all')}
              </button>
              <button
                onClick={() => setStatusFilter('DISCUSSION')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'DISCUSSION'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('filters.discussion')}
              </button>
              <button
                onClick={() => setStatusFilter('VOTING')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'VOTING'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('filters.voting')}
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'APPROVED'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('filters.approved')}
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!canCreateProposal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('buttons.newProposal')}
            </button>
          </div>

          {/* Proposals List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : proposals && proposals.length > 0 ? (
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getTypeBadge(proposal.type)}
                          {getStatusBadge(proposal.status)}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{proposal.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{proposal.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-lg">👤</span>
                            {proposal.author?.name || t('meta.author')}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-lg">📅</span>
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                          {proposal.requiredBudget > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="text-lg">💰</span>
                              {t('meta.budget', { amount: proposal.requiredBudget })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Voting Progress */}
                    {(proposal.status === 'VOTING' || proposal.status === 'APPROVED' || proposal.status === 'REJECTED') && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-green-600 font-semibold">
                            {t('voting.votesFor', { count: proposal.votesFor })}
                          </span>
                          <span className="text-red-600 font-semibold">
                            {t('voting.votesAgainst', { count: proposal.votesAgainst })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div className="h-full flex">
                            <div
                              className="bg-green-500 dark:bg-green-600 transition-all"
                              style={{
                                width: `${
                                  (proposal.votesFor / (proposal.votesFor + proposal.votesAgainst || 1)) * 100
                                }%`,
                              }}
                            ></div>
                            <div
                              className="bg-red-500 dark:bg-red-600 transition-all"
                              style={{
                                width: `${
                                  (proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst || 1)) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        href={`/governance/proposals/${proposal.id}`}
                        className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center font-medium"
                      >
                        {t('actions.viewDetails')}
                      </Link>
                      {proposal.status === 'VOTING' && !proposal.hasVoted && (
                        <button
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setShowVoteModal(true);
                          }}
                          className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
                        >
                          {t('actions.voteNow')}
                        </button>
                      )}
                      {proposal.hasVoted && (
                        <div className="flex-1 py-2 px-4 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                          {t('actions.alreadyVoted')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('empty.title')}</h3>
              <p className="text-gray-600 mb-6">{t('empty.description')}</p>
              {canCreateProposal && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  {t('empty.button')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create Proposal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-8 my-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('modal.newProposal')}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.typeLabel')}
                  </label>
                  <select
                    value={newProposal.type}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, type: e.target.value as ProposalType })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="FEATURE">{t('form.typeOptions.FEATURE')}</option>
                    <option value="RULE_CHANGE">{t('form.typeOptions.RULE_CHANGE')}</option>
                    <option value="FUND_ALLOCATION">{t('form.typeOptions.FUND_ALLOCATION')}</option>
                    <option value="PARTNERSHIP">{t('form.typeOptions.PARTNERSHIP')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('form.title.label')}</label>
                  <input
                    type="text"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('form.title.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.description.label')}
                  </label>
                  <textarea
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder={t('form.description.placeholder')}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.implementation.label')}
                  </label>
                  <textarea
                    value={newProposal.implementationPlan}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, implementationPlan: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder={t('form.implementation.placeholder')}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.budget.label')}
                  </label>
                  <input
                    type="number"
                    value={newProposal.requiredBudget}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, requiredBudget: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('form.budget.placeholder')}
                    min="0"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{t('form.processInfo.title')}</h4>
                <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>{t('form.processInfo.step1')}</li>
                  <li>{t('form.processInfo.step2')}</li>
                  <li>{t('form.processInfo.step3')}</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProposal({
                      type: 'FEATURE',
                      title: '',
                      description: '',
                      requiredBudget: 0,
                      implementationPlan: '',
                    });
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  {t('form.cancel')}
                </button>
                <button
                  onClick={handleCreateProposal}
                  disabled={
                    createMutation.isPending ||
                    !newProposal.title ||
                    !newProposal.description ||
                    !newProposal.implementationPlan
                  }
                  className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? t('form.submitting') : t('form.submit')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vote Modal */}
        {showVoteModal && selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('voteModal.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedProposal.title}</p>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 dark:bg-opacity-20 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-4">{t('voteModal.quadraticTitle')}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t('voteModal.quadraticInfo')}
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('voteModal.pointsLabel', { points: votePoints })}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={votePoints}
                    onChange={(e) => setVotePoints(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('voteModal.costLabel')}</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {t('voteModal.costAmount', { cost: getVoteCost(votePoints) })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowVoteModal(false);
                    setSelectedProposal(null);
                    setVotePoints(1);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  {t('voteModal.cancel')}
                </button>
                <button
                  onClick={handleVote}
                  disabled={voteMutation.isPending}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {voteMutation.isPending ? t('voteModal.confirming') : t('voteModal.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
