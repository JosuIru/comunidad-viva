import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface FlashDeal {
  id: string;
  merchantId: string;
  title: string;
  discount: number;
  product: string;
  originalPrice: number;
  expiresAt: string;
  quantity: number;
  remainingQuantity: number;
  merchant: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface HappyHourStatus {
  active: boolean;
  multiplier: number;
  endsAt?: string;
  message?: string;
}

export default function FlashDealsPage() {
  const t = useTranslations('gamification');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [selectedDeal, setSelectedDeal] = useState<FlashDeal | null>(null);

  // Fetch active flash deals
  const { data: deals, isLoading } = useQuery<FlashDeal[]>({
    queryKey: ['flash-deals'],
    queryFn: async () => {
      const response = await api.get('/viral-features/flash-deals/active');
      return response.data.deals || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch happy hour status
  const { data: happyHour } = useQuery<HappyHourStatus>({
    queryKey: ['happy-hour'],
    queryFn: async () => {
      const response = await api.get('/viral-features/happy-hour/status');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Claim deal mutation
  const claimMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const response = await api.post(`/viral-features/flash-deals/claim/${dealId}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t('flashDeals.claimedSuccess', { code: data.code }));
      queryClient.invalidateQueries({ queryKey: ['flash-deals'] });
      setSelectedDeal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('flashDeals.claimError'));
    },
  });

  const getTimeRemaining = (expiresAt: string) => {
    const end = new Date(expiresAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return t('flashDeals.expired');

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getDiscountedPrice = (originalPrice: number, discount: number) => {
    return (originalPrice * (1 - discount / 100)).toFixed(2);
  };

  const getUrgencyColor = (remainingQuantity: number, totalQuantity: number) => {
    const percentage = (remainingQuantity / totalQuantity) * 100;
    if (percentage < 20) return 'text-red-600';
    if (percentage < 50) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Layout title="Flash Deals - Truk">
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">{t('flashDeals.title')}</h1>
            <p className="text-xl opacity-90">
              {t('flashDeals.subtitle')}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Happy Hour Banner */}
          {happyHour?.active && (
            <div className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="text-6xl">🎉</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{t('flashDeals.happyHourActive')}</h3>
                  <p className="text-lg opacity-90">{happyHour.message}</p>
                  <p className="text-sm opacity-80">
                    {t('flashDeals.multiplier', { multiplier: happyHour.multiplier })} • {t('flashDeals.endsIn')}{' '}
                    {happyHour.endsAt && getTimeRemaining(happyHour.endsAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">⏰</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('flashDeals.limitedTime')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('flashDeals.hoursPerDeal')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">💰</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('flashDeals.upTo70Off')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('flashDeals.incredibleDiscounts')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🔥</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('flashDeals.limitedStock')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('flashDeals.firstComeFirstServe')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Deals Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : deals && deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => {
                const urgencyColor = getUrgencyColor(deal.remainingQuantity, deal.quantity);
                return (
                  <div
                    key={deal.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Deal Badge */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between">
                      <span className="font-bold text-lg">-{deal.discount}% OFF</span>
                      <span className="text-sm">⏰ {getTimeRemaining(deal.expiresAt)}</span>
                    </div>

                    <div className="p-6">
                      {/* Product Info */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{deal.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{deal.product}</p>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                            €{getDiscountedPrice(deal.originalPrice, deal.discount)}
                          </span>
                          <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                            €{deal.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                          {t('flashDeals.youSave')} €
                          {(
                            deal.originalPrice - parseFloat(getDiscountedPrice(deal.originalPrice, deal.discount))
                          ).toFixed(2)}
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{t('flashDeals.availableStock')}</span>
                          <span className={`font-bold ${urgencyColor}`}>
                            {deal.remainingQuantity} / {deal.quantity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              deal.remainingQuantity / deal.quantity < 0.2
                                ? 'bg-red-500'
                                : deal.remainingQuantity / deal.quantity < 0.5
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${(deal.remainingQuantity / deal.quantity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Merchant */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span>{deal.merchant?.name || t('flashDeals.merchant')}</span>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => setSelectedDeal(deal)}
                        disabled={deal.remainingQuantity === 0}
                        className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deal.remainingQuantity === 0 ? t('flashDeals.soldOut') : t('flashDeals.claimNow')}
                      </button>

                      {deal.remainingQuantity < deal.quantity * 0.2 && deal.remainingQuantity > 0 && (
                        <div className="mt-2 text-center text-sm text-red-600 font-semibold animate-pulse">
                          {t('flashDeals.onlyLeft', { count: deal.remainingQuantity })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('flashDeals.noActiveDeals')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('flashDeals.dealsRotateDaily')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">{t('flashDeals.comeBackSoon')}</p>
            </div>
          )}

          {/* How it Works */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('flashDeals.howItWorks')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('flashDeals.step1Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('flashDeals.step1Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('flashDeals.step2Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('flashDeals.step2Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('flashDeals.step3Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('flashDeals.step3Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">4️⃣</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('flashDeals.step4Title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('flashDeals.step4Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Modal */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('flashDeals.confirmDeal')}</h3>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">{selectedDeal.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedDeal.product}</p>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    €{getDiscountedPrice(selectedDeal.originalPrice, selectedDeal.discount)}
                  </span>
                  <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                    €{selectedDeal.originalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  {t('flashDeals.discount', { discount: selectedDeal.discount })}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">{t('flashDeals.important')}</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                  <li>• {t('flashDeals.importantNote1', { time: getTimeRemaining(selectedDeal.expiresAt) })}</li>
                  <li>• {t('flashDeals.importantNote2')}</li>
                  <li>• {t('flashDeals.importantNote3')}</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={() => claimMutation.mutate(selectedDeal.id)}
                  disabled={claimMutation.isPending}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {claimMutation.isPending ? t('flashDeals.claiming') : t('flashDeals.claim')}
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
