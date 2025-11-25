import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  balance?: number;
}

interface FlowPreview {
  originalAmount: number;
  multiplier: number;
  finalAmount: number;
  poolContribution: number;
  senderBalance: number;
  receiverBalance: number;
  balanceDifference: number;
}

export default function FlowSendPage() {
  const t = useTranslations('flowEconomics');
  const tToasts = useTranslations('toasts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  // Search users
  const { data: users, isLoading: searchingUsers } = useQuery<User[]>({
    queryKey: ['users-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await api.get(`/users?search=${encodeURIComponent(searchTerm)}`);
      return response.data;
    },
    enabled: searchTerm.length >= 2,
  });

  // Get flow preview
  const { data: flowPreview, isLoading: loadingPreview } = useQuery<FlowPreview>({
    queryKey: ['flow-preview', selectedUser?.id, amount],
    queryFn: async () => {
      const response = await api.get(
        `/flow-economics/preview?toUserId=${selectedUser!.id}&amount=${amount}`
      );
      return response.data;
    },
    enabled: !!selectedUser && !!amount && parseFloat(amount) > 0,
  });

  // Send credits mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/flow-economics/send', {
        toUserId: selectedUser!.id,
        amount: parseFloat(amount),
        message: message || undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(tToasts('success.creditsSent'));
      setSelectedUser(null);
      setAmount('');
      setMessage('');
      setSearchTerm('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || tToasts('error.sendCredits'));
    },
  });

  const handleSend = () => {
    if (!selectedUser) {
      toast.error(tToasts('error.selectRecipient'));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(tToasts('error.invalidAmount'));
      return;
    }
    sendMutation.mutate();
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 1.5) return 'text-green-600 dark:text-green-400';
    if (multiplier >= 1.25) return 'text-blue-600 dark:text-blue-400';
    if (multiplier >= 1.1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getMultiplierBadge = (multiplier: number) => {
    if (multiplier >= 1.5)
      return { text: t('preview.excellent'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (multiplier >= 1.25)
      return { text: t('preview.veryGood'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    if (multiplier >= 1.1)
      return { text: t('preview.good'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { text: t('preview.standard'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/flow-economics"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {t('send.backToDashboard')}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <PaperAirplaneIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('send.title')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('send.description')}
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-8 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('send.howItWorks.title')}
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>
                  • <strong>{t('send.howItWorks.balanceDifference')}</strong>
                </li>
                <li>• {t('send.howItWorks.lowerBalance')}</li>
                <li>• {t('send.howItWorks.poolContribution')}</li>
                <li>• {t('send.howItWorks.incentive')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('send.sendCredits')}
            </h2>

            {/* Search User */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('send.searchRecipient')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('send.searchPlaceholder')}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Search Results */}
              {searchingUsers && (
                <div className="mt-2 text-sm text-gray-500">{t('send.searching')}</div>
              )}
              {users && users.length > 0 && (
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchTerm('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User */}
            {selectedUser && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('send.sendingTo')}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUser.email}
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('send.changeRecipient')}
                </button>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('send.amount')}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('send.message')}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('send.messagePlaceholder')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!selectedUser || !amount || sendMutation.isPending}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {sendMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('send.sending')}
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5" />
                  {t('send.sendButton')}
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('preview.title')}
            </h2>

            {loadingPreview ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : flowPreview ? (
              <div className="space-y-6">
                {/* Multiplier Badge */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <SparklesIcon className="h-8 w-8 text-yellow-500" />
                    <span className={`text-6xl font-bold ${getMultiplierColor(flowPreview.multiplier)}`}>
                      {flowPreview.multiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        getMultiplierBadge(flowPreview.multiplier).color
                      }`}
                    >
                      {getMultiplierBadge(flowPreview.multiplier).text}
                    </span>
                  </div>
                </div>

                {/* Flow Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('preview.originalAmount')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {flowPreview.originalAmount.toLocaleString()} {t('preview.credits')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('preview.multiplier')}</span>
                    <span className={`font-bold ${getMultiplierColor(flowPreview.multiplier)}`}>
                      x{flowPreview.multiplier.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('preview.communityPool')}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      -{flowPreview.poolContribution.toLocaleString()} {t('preview.credits')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-green-50 dark:bg-green-900/20 rounded-lg px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {t('preview.willReceive')}
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {flowPreview.finalAmount.toLocaleString()} {t('preview.credits')}
                    </span>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('preview.balanceInfo.title')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('preview.balanceInfo.yourBalance')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {flowPreview.senderBalance.toLocaleString()} {t('preview.credits')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('preview.balanceInfo.recipientBalance')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {flowPreview.receiverBalance.toLocaleString()} {t('preview.credits')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">{t('preview.balanceInfo.difference')}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {flowPreview.balanceDifference.toLocaleString()} {t('preview.credits')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                  {t('preview.tip')}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('preview.selectRecipient')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
