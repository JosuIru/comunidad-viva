import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface GroupBuy {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  product: string;
  basePrice: number;
  currentDiscount: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  expiresAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  merchant: {
    id: string;
    name: string;
    avatar?: string;
  };
  userJoined?: boolean;
  discountTiers: DiscountTier[];
}

interface DiscountTier {
  participants: number;
  discount: number;
}

interface CreateGroupBuyData {
  title: string;
  description: string;
  product: string;
  basePrice: number;
  minParticipants: number;
  maxParticipants: number;
  duration: number; // hours
  discountTiers: DiscountTier[];
}

export default function GroupBuysPage() {
  const t = useTranslations('gamification');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [selectedBuy, setSelectedBuy] = useState<GroupBuy | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Form state for creating group buy
  const [formData, setFormData] = useState<CreateGroupBuyData>({
    title: '',
    description: '',
    product: '',
    basePrice: 0,
    minParticipants: 5,
    maxParticipants: 50,
    duration: 48,
    discountTiers: [
      { participants: 5, discount: 10 },
      { participants: 10, discount: 20 },
      { participants: 25, discount: 30 },
      { participants: 50, discount: 40 },
    ],
  });

  // Fetch group buys
  const { data: groupBuys, isLoading } = useQuery<GroupBuy[]>({
    queryKey: ['group-buys', filterStatus],
    queryFn: async () => {
      const endpoint = filterStatus === 'ALL'
        ? '/viral-features/group-buys'
        : `/viral-features/group-buys?status=${filterStatus}`;
      const response = await api.get(endpoint);
      return response.data.groupBuys || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Join group buy mutation
  const joinMutation = useMutation({
    mutationFn: async (groupBuyId: string) => {
      const response = await api.post(`/viral-features/group-buys/${groupBuyId}/join`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('groupBuys.joinedSuccess'));
      queryClient.invalidateQueries({ queryKey: ['group-buys'] });
      setSelectedBuy(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('groupBuys.joinError'));
    },
  });

  // Leave group buy mutation
  const leaveMutation = useMutation({
    mutationFn: async (groupBuyId: string) => {
      const response = await api.post(`/viral-features/group-buys/${groupBuyId}/leave`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('groupBuys.leftSuccess'));
      queryClient.invalidateQueries({ queryKey: ['group-buys'] });
      setSelectedBuy(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('groupBuys.leaveError'));
    },
  });

  // Create group buy mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateGroupBuyData) => {
      const response = await api.post('/viral-features/group-buys/create', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('groupBuys.createdSuccess'));
      queryClient.invalidateQueries({ queryKey: ['group-buys'] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('groupBuys.createError'));
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      product: '',
      basePrice: 0,
      minParticipants: 5,
      maxParticipants: 50,
      duration: 48,
      discountTiers: [
        { participants: 5, discount: 10 },
        { participants: 10, discount: 20 },
        { participants: 25, discount: 30 },
        { participants: 50, discount: 40 },
      ],
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const end = new Date(expiresAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return t('groupBuys.expired');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getCurrentPrice = (groupBuy: GroupBuy) => {
    return groupBuy.basePrice * (1 - groupBuy.currentDiscount / 100);
  };

  const getNextTier = (groupBuy: GroupBuy) => {
    return groupBuy.discountTiers.find(
      (tier) => tier.participants > groupBuy.currentParticipants
    );
  };

  const getProgressPercentage = (groupBuy: GroupBuy) => {
    return (groupBuy.currentParticipants / groupBuy.maxParticipants) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:text-blue-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
    }
  };

  return (
    <Layout title="Group Buys - Truk">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-4">{t('groupBuys.title')}</h1>
                <p className="text-xl opacity-90">
                  {t('groupBuys.subtitle')}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-white text-blue-600 dark:text-blue-400 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                + {t('createGroupBuy')}
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">👥</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('groupBuys.morePeople')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('groupBuys.biggerDiscount')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">💰</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('groupBuys.upTo50Off')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('groupBuys.progressiveDiscounts')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('groupBuys.winWin')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('groupBuys.everyoneSaves')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {status === 'ALL' ? t('groupBuys.filterAll') : status === 'ACTIVE' ? t('groupBuys.filterActive') : t('groupBuys.filterCompleted')}
              </button>
            ))}
          </div>

          {/* Group Buys Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : groupBuys && groupBuys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupBuys.map((groupBuy) => {
                const nextTier = getNextTier(groupBuy);
                const progressPercentage = getProgressPercentage(groupBuy);

                return (
                  <div
                    key={groupBuy.id}
                    className="bg-white rounded dark:bg-gray-800-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 flex items-center justify-between">
                      <span className="font-bold text-lg">-{groupBuy.currentDiscount}% OFF</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(groupBuy.status)}`}>
                        {groupBuy.status}
                      </span>
                    </div>

                    <div className="p-6">
                      {/* Title & Description */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{groupBuy.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{groupBuy.description}</p>

                      {/* Product */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-blue-900 dark:text-blue-300 font-semibold mb-1">{t('groupBuys.product')}</div>
                        <div className="text-blue-700">{groupBuy.product}</div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            €{getCurrentPrice(groupBuy).toFixed(2)}
                          </span>
                          <span className="text-lg text-gray-400 line-through">
                            €{groupBuy.basePrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-green-600 font-semibold">
                          {t('groupBuys.youSave')} €{(groupBuy.basePrice - getCurrentPrice(groupBuy)).toFixed(2)}
                        </div>
                      </div>

                      {/* Participants Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">{t('groupBuys.participants')}</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {groupBuy.currentParticipants} / {groupBuy.maxParticipants}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        {groupBuy.currentParticipants < groupBuy.minParticipants && (
                          <div className="text-xs text-orange-600 mt-1">
                            {t('groupBuys.minimumRequired', { count: groupBuy.minParticipants })}
                          </div>
                        )}
                      </div>

                      {/* Next Tier */}
                      {nextTier && groupBuy.status === 'ACTIVE' && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-700 text-sm font-semibold">
                              {t('groupBuys.nextLevel', { discount: nextTier.discount })}
                            </span>
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            {t('groupBuys.peopleMissing', { count: nextTier.participants - groupBuy.currentParticipants })}
                          </div>
                        </div>
                      )}

                      {/* Time & Merchant */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <span>{groupBuy.merchant?.name || t('groupBuys.merchant')}</span>
                        </div>
                        <div>⏰ {getTimeRemaining(groupBuy.expiresAt)}</div>
                      </div>

                      {/* Actions */}
                      {groupBuy.status === 'ACTIVE' && (
                        <>
                          {groupBuy.userJoined ? (
                            <button
                              onClick={() => leaveMutation.mutate(groupBuy.id)}
                              disabled={leaveMutation.isPending}
                              className="w-full py-3 px-4 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              {t('groupBuys.leaveBuy')}
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedBuy(groupBuy)}
                              disabled={groupBuy.currentParticipants >= groupBuy.maxParticipants}
                              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {groupBuy.currentParticipants >= groupBuy.maxParticipants
                                ? t('groupBuys.buyFull')
                                : t('groupBuys.joinNow')}
                            </button>
                          )}
                        </>
                      )}

                      {groupBuy.status === 'COMPLETED' && (
                        <div className="w-full py-3 px-4 bg-blue-100 text-blue-700 rounded-lg font-bold text-center">
                          {t('groupBuys.buyCompleted')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('groupBuys.noGroupBuys', { status: filterStatus.toLowerCase() })}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filterStatus === 'ACTIVE'
                  ? t('groupBuys.createFirstOrWait')
                  : t('groupBuys.changeFilter')}
              </p>
              {filterStatus === 'ACTIVE' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  + {t('createGroupBuy')}
                </button>
              )}
            </div>
          )}

          {/* How it Works */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('groupBuys.howItWorks')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-bold mb-2">{t('groupBuys.step1Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('groupBuys.step1Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-bold mb-2">{t('groupBuys.step2Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('groupBuys.step2Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-bold mb-2">{t('groupBuys.step3Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('groupBuys.step3Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">4️⃣</div>
                <h4 className="font-bold mb-2">{t('groupBuys.step4Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('groupBuys.step4Desc')}
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3">{t('groupBuys.progressiveDiscountsTitle')}</h4>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                {t('groupBuys.progressiveDiscountsDesc')}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{t('groupBuys.people', { count: 5 })}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">10% OFF</div>
                </div>
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{t('groupBuys.people', { count: 10 })}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">20% OFF</div>
                </div>
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{t('groupBuys.people', { count: 25 })}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">30% OFF</div>
                </div>
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{t('groupBuys.peopleOrMore', { count: 50 })}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">40% OFF</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Modal */}
        {selectedBuy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded dark:bg-gray-800-lg max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('groupBuys.joinGroupBuy')}</h3>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-lg mb-2">{selectedBuy.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedBuy.product}</p>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    €{getCurrentPrice(selectedBuy).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    €{selectedBuy.basePrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  {t('groupBuys.currentDiscount', { discount: selectedBuy.currentDiscount })}
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">{t('groupBuys.important')}</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                  <li>• {t('groupBuys.importantNote1')}</li>
                  <li>• {t('groupBuys.importantNote2', { time: getTimeRemaining(selectedBuy.expiresAt) })}</li>
                  <li>• {t('groupBuys.importantNote3', { count: selectedBuy.minParticipants })}</li>
                  <li>• {t('groupBuys.importantNote4')}</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedBuy(null)}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:bg-gray-600 transition-colors font-semibold"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={() => joinMutation.mutate(selectedBuy.id)}
                  disabled={joinMutation.isPending}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {joinMutation.isPending ? t('groupBuys.joining') : t('groupBuys.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded dark:bg-gray-800-lg max-w-2xl w-full p-8 my-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('createGroupBuy')}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('groupBuys.formTitle')}</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('productNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('groupBuys.formDescription')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder={t('productDescPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('groupBuys.product')}</label>
                  <input
                    type="text"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('specificProductPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('groupBuys.basePrice')}</label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('groupBuys.duration')}</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('groupBuys.minParticipants')}</label>
                    <input
                      type="number"
                      value={formData.minParticipants}
                      onChange={(e) => setFormData({ ...formData, minParticipants: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('groupBuys.maxParticipants')}</label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="2"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">{t('groupBuys.discountLevels')}</h4>
                  <div className="space-y-2">
                    {formData.discountTiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="number"
                          value={tier.participants}
                          onChange={(e) => {
                            const newTiers = [...formData.discountTiers];
                            newTiers[index].participants = parseInt(e.target.value);
                            setFormData({ ...formData, discountTiers: newTiers });
                          }}
                          className="w-24 px-3 py-2 border border-blue-300 rounded-lg"
                          min="1"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('groupBuys.peopleEquals')}</span>
                        <input
                          type="number"
                          value={tier.discount}
                          onChange={(e) => {
                            const newTiers = [...formData.discountTiers];
                            newTiers[index].discount = parseInt(e.target.value);
                            setFormData({ ...formData, discountTiers: newTiers });
                          }}
                          className="w-24 px-3 py-2 border border-blue-300 rounded-lg"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">% OFF</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:bg-gray-600 transition-colors font-semibold"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={createMutation.isPending || !formData.title || !formData.product || formData.basePrice <= 0}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {createMutation.isPending ? t('groupBuys.creating') : t('groupBuys.createButton')}
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
