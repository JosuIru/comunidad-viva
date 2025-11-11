import { useState, useEffect, useMemo } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
}

interface FlowPreview {
  baseAmount: number;
  flowMultiplier: number;
  totalValue: number;
  bonusValue: number;
  poolContribution: number;
}

export default function SendCreditsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('creditsSend');
  const userLocale = router.locale || 'es';
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(userLocale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [userLocale]
  );
  const decimalFormatter = useMemo(
    () =>
      new Intl.NumberFormat(userLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [userLocale]
  );

  // Get current user
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error(t('toasts.loginRequired'));
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUserId(user.id);
  }, [router, t]);

  // Fetch current user profile
  const { data: currentUser } = useQuery<User>({
    queryKey: ['profile', currentUserId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${currentUserId}`);
      return data;
    },
    enabled: !!currentUserId,
  });

  // Fetch all users for selection
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      // This would need a proper users list endpoint
      // For now, return empty array
      return [];
    },
  });

  // Calculate flow multiplier preview
  const calculateFlowMultiplier = (fromBalance: number, toBalance: number): number => {
    if (toBalance >= fromBalance) return 1.0;

    const balanceRatio = fromBalance / Math.max(toBalance, 1);

    if (balanceRatio >= 10) return 1.5;
    if (balanceRatio >= 5) return 1.3;
    if (balanceRatio >= 2) return 1.15;
    return 1.05;
  };

  // Get recipient data
  const { data: recipient } = useQuery<User>({
    queryKey: ['user', recipientId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${recipientId}`);
      return data;
    },
    enabled: !!recipientId && recipientId !== currentUserId,
  });

  // Calculate preview
  const preview: FlowPreview | null = (() => {
    if (!currentUser || !recipient || !amount || parseFloat(amount) <= 0) {
      return null;
    }

    const baseAmount = parseFloat(amount);
    const flowMultiplier = calculateFlowMultiplier(currentUser.credits, recipient.credits);
    const totalValue = Math.floor(baseAmount * flowMultiplier);
    const bonusValue = totalValue - baseAmount;
    const poolContribution = Math.floor(baseAmount * 0.02);

    return {
      baseAmount,
      flowMultiplier,
      totalValue,
      bonusValue,
      poolContribution,
    };
  })();

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: async (data: { toUserId: string; amount: number; description?: string }) => {
      const response = await api.post('/flow-economics/send', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || t('toasts.success'));
      queryClient.invalidateQueries({ queryKey: ['profile', currentUserId] });
      // Reset form
      setRecipientId('');
      setAmount('');
      setDescription('');
      // Redirect to profile
      setTimeout(() => router.push('/profile'), 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('toasts.error');
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId) {
      toast.error(t('toasts.selectRecipient'));
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('toasts.invalidAmount'));
      return;
    }

    if (parseFloat(amount) > (currentUser?.credits || 0)) {
      toast.error(t('toasts.insufficientCredits'));
      return;
    }

    sendMutation.mutate({
      toUserId: recipientId,
      amount: parseFloat(amount),
      description: description.trim() || undefined,
    });
  };

  return (
    <Layout title={t('layout.title')}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              {t('nav.back')}
            </button>
          </div>

          {/* Current Balance */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow p-6 text-white mb-6">
            <div className="text-sm text-white/80">{t('balance.label')}</div>
            <div className="text-4xl font-bold mt-2">
              {t('balance.amount', { amount: numberFormatter.format(currentUser?.credits || 0) })}
            </div>
          </div>

          {/* Send Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {t('form.title')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Email Input */}
              <div>
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.recipient.label')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="recipientEmail"
                  type="email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={async () => {
                    if (searchQuery) {
                      try {
                        // Search user by email
                        const { data } = await api.get(`/users/search/email/${encodeURIComponent(searchQuery)}`);
                        if (data && data.id) {
                          setRecipientId(data.id);
                        } else {
                          toast.error(t('toasts.userNotFound'));
                        }
                      } catch (error) {
                        toast.error(t('toasts.userNotFound'));
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('form.recipient.placeholder')}
                  required
                />
              </div>

              {/* Show recipient info */}
              {recipient && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {recipient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{recipient.name}</div>
                      <div className="text-sm text-gray-600">{recipient.email}</div>
                      <div className="text-sm text-gray-500">
                        {t('recipient.balance', { amount: numberFormatter.format(recipient.credits) })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.amount.label')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('form.amount.placeholder')}
                  required
                />
                {currentUser && amount && parseFloat(amount) > currentUser.credits && (
                  <p className="text-red-500 text-sm mt-1">{t('form.amount.insufficient')}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.description.label')}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('form.description.placeholder')}
                />
              </div>

              {/* Flow Preview */}
              {preview && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('preview.title')}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('preview.send')}</span>
                      <span className="text-xl font-bold text-gray-900">
                        {t('balance.amount', { amount: numberFormatter.format(preview.baseAmount) })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('preview.multiplier')}</span>
                      <span className="text-xl font-bold text-purple-600">
                        {decimalFormatter.format(preview.flowMultiplier)}x
                      </span>
                    </div>

                    <div className="h-px bg-gray-300"></div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">{t('preview.receive')}</span>
                      <span className="text-2xl font-bold text-green-600">
                        {t('balance.amount', { amount: numberFormatter.format(preview.totalValue) })}
                      </span>
                    </div>

                    {preview.bonusValue > 0 && (
                      <div className="p-3 bg-green-100 border border-green-300 rounded text-sm">
                        <span className="text-green-800 font-medium">
                          {t('preview.bonus', {
                            bonus: numberFormatter.format(preview.bonusValue),
                          })}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('preview.pool')}</span>
                      <span className="text-gray-700 font-medium">
                        {t('balance.amount', { amount: numberFormatter.format(preview.poolContribution) })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  {t('info.title')}
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {(t.raw('info.items') as string[]).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={sendMutation.isPending || !preview || parseFloat(amount) > (currentUser?.credits || 0)}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMutation.isPending ? t('form.submit.pending') : t('form.submit.default')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
