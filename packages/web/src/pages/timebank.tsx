import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import SkeletonLoader from '@/components/SkeletonLoader';
import { staggerContainer, listItem } from '@/utils/animations';

interface TimeBankOffer {
  id: string;
  offer: {
    id: string;
    title: string;
    description: string;
    category: string;
    images: string[];
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  estimatedHours: number;
  canTeach: boolean;
  experienceLevel: string;
}

interface TimeBankTransaction {
  id: string;
  description: string;
  hours: number;
  credits: number;
  scheduledFor: string;
  completedAt?: string;
  status: string;
  provider: {
    id: string;
    name: string;
    avatar?: string;
  };
  requester: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface TimeBankStats {
  hoursGiven: number;
  hoursReceived: number;
  totalTransactions: number;
  pendingRequests: number;
}

export default function TimeBankPage() {
  const t = useTranslations('timebank');
  const [activeTab, setActiveTab] = useState<'offers' | 'transactions' | 'stats'>('offers');

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: ['timebank-offers'],
    queryFn: async () => {
      const response = await api.get('/timebank/offers');
      return (response.data.offers || response.data) as TimeBankOffer[];
    },
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['timebank-transactions'],
    queryFn: async () => {
      const response = await api.get('/timebank/transactions');
      return (response.data.transactions || response.data) as TimeBankTransaction[];
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['timebank-stats'],
    queryFn: async () => {
      const response = await api.get('/timebank/stats');
      return response.data as TimeBankStats;
    },
  });

  const offers = offersData || [];
  const transactions = transactionsData || [];
  const stats = statsData || {
    hoursGiven: 0,
    hoursReceived: 0,
    totalTransactions: 0,
    pendingRequests: 0,
  };

  return (
    <Layout title={`${t('title')} - Truk`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">⏰ {t('title')}</h1>
            <p className="text-xl opacity-90">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.hoursGiven}h</p>
              <p className="text-gray-600 dark:text-gray-400">{t('stats.hoursShared')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.hoursReceived}h</p>
              <p className="text-gray-600 dark:text-gray-400">{t('stats.hoursReceived')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalTransactions}</p>
              <p className="text-gray-600 dark:text-gray-400">{t('stats.exchanges')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingRequests}</p>
              <p className="text-gray-600 dark:text-gray-400">{t('stats.pending')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'offers'
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {t('tabs.offers')}
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'transactions'
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {t('tabs.exchanges')}
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'offers' && (
                <div>
                  {offersLoading ? (
                    <SkeletonLoader type="card" count={6} />
                  ) : offers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400 text-lg">{t('empty.offers')}</p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {offers.map((offer) => (
                        <motion.div key={offer.id} variants={listItem}>
                          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar
                                  name={offer.offer.user?.name || 'User'}
                                  src={offer.offer.user?.avatar}
                                  size="sm"
                                />
                              <div>
                                <p className="font-medium">{offer.offer.user?.name}</p>
                                <p className="text-xs text-gray-500">{offer.offer.category}</p>
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {offer.offer.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                              {offer.offer.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('estimatedHours', { hours: offer.estimatedHours })}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  offer.experienceLevel === 'EXPERT'
                                    ? 'bg-purple-100 text-purple-600'
                                    : offer.experienceLevel === 'INTERMEDIATE'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-green-100 text-green-600'
                                }`}
                              >
                                {offer.experienceLevel}
                              </span>
                            </div>
                            {offer.canTeach && (
                              <div className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full inline-block">
                                {t('canTeach')}
                              </div>
                            )}
                          </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  {transactionsLoading ? (
                    <SkeletonLoader type="list" count={5} />
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400 text-lg">{t('empty.exchanges')}</p>
                    </div>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {transactions.map((transaction) => (
                        <motion.div key={transaction.id} variants={listItem}>
                          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar
                                    name={transaction.provider?.name || 'Provider'}
                                    src={transaction.provider?.avatar}
                                    size="sm"
                                  />
                                <div>
                                  <p className="font-medium">{transaction.provider?.name}</p>
                                  <p className="text-xs text-gray-500">{t('roles.provider')}</p>
                                </div>
                                <span className="text-gray-400">→</span>
                                <Avatar
                                  name={transaction.requester?.name || 'Requester'}
                                  src={transaction.requester?.avatar}
                                  size="sm"
                                />
                                <div>
                                  <p className="font-medium">{transaction.requester?.name}</p>
                                  <p className="text-xs text-gray-500">{t('roles.requester')}</p>
                                </div>
                              </div>
                              <p className="text-gray-900 dark:text-gray-100 mb-2">{transaction.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>⏱️ {transaction.hours}h</span>
                                <span>💰 {transaction.credits} créditos</span>
                                <span>
                                  📅{' '}
                                  {new Date(transaction.scheduledFor).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-600'
                                    : transaction.status === 'CONFIRMED'
                                    ? 'bg-blue-100 text-blue-600'
                                    : transaction.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
