import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Delegate {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  reputation: number;
  expertise: string[];
  activeDelegations: number;
  successRate: number;
  bio: string;
}

interface Delegation {
  id: string;
  delegateId: string;
  delegateName: string;
  category?: string;
  votingPower: number;
  createdAt: string;
  expiresAt?: string;
  active: boolean;
}

interface UserDelegationStats {
  totalDelegated: number;
  totalDelegations: number;
  receivedDelegations: number;
  votingPowerDelegated: number;
}

export default function DelegationPage() {
  const t = useTranslations('governance.delegation');
  const queryClient = useQueryClient();
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const [delegationCategory, setDelegationCategory] = useState<string>('');
  const [delegationPower, setDelegationPower] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'delegates' | 'my-delegations'>('delegates');

  // Fetch available delegates
  const { data: delegates, isLoading: delegatesLoading } = useQuery<Delegate[]>({
    queryKey: ['available-delegates'],
    queryFn: async () => {
      const response = await api.get('/consensus/delegation/available');
      return response.data.delegates || [];
    },
  });

  // Fetch user's delegations
  const { data: myDelegations } = useQuery<Delegation[]>({
    queryKey: ['my-delegations'],
    queryFn: async () => {
      const response = await api.get('/consensus/delegation/my-delegations');
      return response.data.delegations || [];
    },
  });

  // Fetch delegation stats
  const { data: stats } = useQuery<UserDelegationStats>({
    queryKey: ['delegation-stats'],
    queryFn: async () => {
      const response = await api.get('/consensus/delegation/stats');
      return response.data;
    },
  });

  // Delegate mutation
  const delegateMutation = useMutation({
    mutationFn: async (data: { delegateId: string; category?: string; votingPower: number }) => {
      const response = await api.post('/consensus/delegation/delegate', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.delegateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['my-delegations'] });
      queryClient.invalidateQueries({ queryKey: ['delegation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['available-delegates'] });
      setSelectedDelegate(null);
      setDelegationCategory('');
      setDelegationPower(10);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.delegateError'));
    },
  });

  // Revoke delegation mutation
  const revokeMutation = useMutation({
    mutationFn: async (delegationId: string) => {
      const response = await api.post(`/consensus/delegation/revoke/${delegationId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.revokeSuccess'));
      queryClient.invalidateQueries({ queryKey: ['my-delegations'] });
      queryClient.invalidateQueries({ queryKey: ['delegation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['available-delegates'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.revokeError'));
    },
  });

  const categories = [
    t('categories.all'),
    t('categories.technology'),
    t('categories.economy'),
    t('categories.governance'),
    t('categories.development'),
    t('categories.community'),
    t('categories.sustainability'),
  ];

  const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return 'text-purple-600';
    if (reputation >= 50) return 'text-blue-600';
    if (reputation >= 20) return 'text-green-600';
    return 'text-gray-600';
  };

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 80) return t('reputation.expert');
    if (reputation >= 50) return t('reputation.advanced');
    if (reputation >= 20) return t('reputation.trusted');
    return t('reputation.new');
  };

  return (
    <Layout title={t('layout.title')}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">{t('header.title')}</h1>
            <p className="text-xl opacity-90">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalDelegations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.activeDelegations')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.votingPowerDelegated}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.delegatedPower')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">{stats.receivedDelegations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.receivedDelegations')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.totalDelegated}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('stats.totalManaged')}</div>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-300 dark:border-indigo-700 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">{t('info.title')}</h3>
                <p className="text-indigo-800 dark:text-indigo-300 text-sm">
                  {t('info.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('delegates')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'delegates'
                    ? 'border-b-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('tabs.availableDelegates')}
              </button>
              <button
                onClick={() => setActiveTab('my-delegations')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'my-delegations'
                    ? 'border-b-2 border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('tabs.myDelegations')}
              </button>
            </div>
          </div>

          {/* Delegates Tab */}
          {activeTab === 'delegates' && (
            <div>
              {delegatesLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                </div>
              ) : delegates && delegates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {delegates.map((delegate) => (
                    <div
                      key={delegate.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                            {delegate.avatar || '👤'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold">{delegate.userName}</h3>
                            <p className={`text-sm font-semibold ${getReputationColor(delegate.reputation)}`}>
                              {getReputationBadge(delegate.reputation)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Bio */}
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{delegate.bio}</p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{delegate.reputation}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{t('delegateCard.reputation')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{delegate.activeDelegations}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{t('delegateCard.delegations')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                              {Math.round(delegate.successRate)}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{t('delegateCard.success')}</div>
                          </div>
                        </div>

                        {/* Expertise */}
                        {delegate.expertise && delegate.expertise.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('delegateCard.expertise')}</div>
                            <div className="flex flex-wrap gap-2">
                              {delegate.expertise.map((exp, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold"
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delegate Button */}
                        <button
                          onClick={() => setSelectedDelegate(delegate)}
                          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-colors font-semibold"
                        >
                          {t('delegateCard.delegateVote')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('empty.noDelegates.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('empty.noDelegates.description')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* My Delegations Tab */}
          {activeTab === 'my-delegations' && (
            <div>
              {myDelegations && myDelegations.length > 0 ? (
                <div className="space-y-4">
                  {myDelegations.map((delegation) => (
                    <div
                      key={delegation.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 dark:from-indigo-600 dark:to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {delegation.delegateName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{delegation.delegateName}</h4>
                          {delegation.category && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('myDelegations.category')}: {delegation.category}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span>{t('myDelegations.power')}: {delegation.votingPower}</span>
                            <span>
                              {t('myDelegations.since')}: {new Date(delegation.createdAt).toLocaleDateString()}
                            </span>
                            {delegation.expiresAt && (
                              <span>
                                {t('myDelegations.expires')}: {new Date(delegation.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            delegation.active
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {delegation.active ? t('myDelegations.active') : t('myDelegations.inactive')}
                        </span>
                        {delegation.active && (
                          <button
                            onClick={() => revokeMutation.mutate(delegation.id)}
                            disabled={revokeMutation.isPending}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-semibold disabled:opacity-50"
                          >
                            {t('myDelegations.revoke')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('empty.noDelegations.title')}</h3>
                  <p className="text-gray-600 mb-6">
                    {t('empty.noDelegations.description')}
                  </p>
                  <button
                    onClick={() => setActiveTab('delegates')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    {t('empty.noDelegations.button')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* How it Works */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('howItWorks.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1</div>
                <h4 className="font-bold mb-2">{t('howItWorks.step1.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('howItWorks.step1.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2</div>
                <h4 className="font-bold mb-2">{t('howItWorks.step2.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('howItWorks.step2.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3</div>
                <h4 className="font-bold mb-2">{t('howItWorks.step3.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('howItWorks.step3.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">4</div>
                <h4 className="font-bold mb-2">{t('howItWorks.step4.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('howItWorks.step4.description')}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-3">{t('howItWorks.benefits.title')}</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>{t('howItWorks.benefits.item1')}</li>
                  <li>{t('howItWorks.benefits.item2')}</li>
                  <li>{t('howItWorks.benefits.item3')}</li>
                  <li>{t('howItWorks.benefits.item4')}</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                <h4 className="font-bold text-purple-900 mb-3">{t('howItWorks.tips.title')}</h4>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>{t('howItWorks.tips.item1')}</li>
                  <li>{t('howItWorks.tips.item2')}</li>
                  <li>{t('howItWorks.tips.item3')}</li>
                  <li>{t('howItWorks.tips.item4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Delegate Modal */}
        {selectedDelegate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('modal.title')}</h3>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl">
                    {selectedDelegate.avatar || '👤'}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedDelegate.userName}</h4>
                    <p className="text-sm text-gray-600">
                      {t('modal.reputation')}: {selectedDelegate.reputation} • {t('modal.success')}: {Math.round(selectedDelegate.successRate)}%
                    </p>
                  </div>
                </div>

                {selectedDelegate.expertise && selectedDelegate.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedDelegate.expertise.map((exp, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs font-semibold"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.categoryLabel')}
                  </label>
                  <select
                    value={delegationCategory}
                    onChange={(e) => setDelegationCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category === t('categories.all') ? '' : category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('modal.categoryHint')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.powerLabel', { power: delegationPower })}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={delegationPower}
                    onChange={(e) => setDelegationPower(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-900 mb-2">{t('modal.important.title')}</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>{t('modal.important.item1')}</li>
                  <li>{t('modal.important.item2')}</li>
                  <li>{t('modal.important.item3')}</li>
                  <li>{t('modal.important.item4')}</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedDelegate(null)}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  onClick={() =>
                    delegateMutation.mutate({
                      delegateId: selectedDelegate.id,
                      category: delegationCategory || undefined,
                      votingPower: delegationPower,
                    })
                  }
                  disabled={delegateMutation.isPending}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {delegateMutation.isPending ? t('modal.delegating') : t('modal.confirm')}
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
