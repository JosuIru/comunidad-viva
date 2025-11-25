import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { ClockIcon } from '@heroicons/react/24/outline';

interface FlashDeal {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  discount: number;
  maxRedemptions: number;
  currentRedemptions: number;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SOLD_OUT';
  merchant?: {
    id: string;
    businessName: string;
    category: string;
    user: {
      lat?: number;
      lng?: number;
      address?: string;
    };
  };
}

export default function FlashDeals() {
  const queryClient = useQueryClient();
  const t = useTranslations('flashDeals');

  // Fetch active flash deals
  const { data: deals = [], isLoading } = useQuery<FlashDeal[]>({
    queryKey: ['flash-deals'],
    queryFn: async () => {
      const { data } = await api.get('/viral/flash-deals');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Redeem deal mutation
  const redeemMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const { data } = await api.post(`/viral/flash-deals/${dealId}/redeem`);
      return data;
    },
    onSuccess: () => {
      toast.success(t('toastSuccess'), {
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['flash-deals'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toastError'));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <ClockIcon className="h-16 w-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('empty.title')}
        </h3>
        <p className="text-gray-600">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('header.title')}
        </h2>
        <div className="text-sm text-gray-600">
          {t('header.count', { count: deals.length })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <FlashDealCard
            key={deal.id}
            deal={deal}
            onRedeem={() => redeemMutation.mutate(deal.id)}
            isRedeeming={redeemMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function FlashDealCard({
  deal,
  onRedeem,
  isRedeeming,
}: {
  deal: FlashDeal;
  onRedeem: () => void;
  isRedeeming: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const t = useTranslations('flashDeals');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(deal.expiresAt).getTime();
      const distance = expires - now;

      if (distance < 0) {
        setTimeLeft(t('timer.expired'));
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        hours > 0
          ? t('timer.hoursMinutes', { hours, minutes })
          : t('timer.minutesSeconds', { minutes, seconds })
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deal.expiresAt, t]);

  const remaining = deal.maxRedemptions - deal.currentRedemptions;
  const percentUsed = (deal.currentRedemptions / deal.maxRedemptions) * 100;
  const isAlmostGone = remaining <= 3;
  const isSoldOut = remaining <= 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-200 relative">
      {/* Discount Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg transform rotate-12">
          <span className="text-2xl font-bold">-{deal.discount}%</span>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeLeft}
          </span>
          <span className="text-sm opacity-90">{t('timer.label')}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {deal.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm">
          {deal.description}
        </p>

        {/* Merchant Info */}
        {deal.merchant && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {deal.merchant.businessName}
              </span>
            </div>
            {deal.merchant.user.address && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {deal.merchant.user.address}
              </div>
            )}
          </div>
        )}

        {/* Stock Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('stock.remaining', { remaining, total: deal.maxRedemptions })}
            </span>
            {isAlmostGone && !isSoldOut && (
              <span className="text-xs font-bold text-red-600 animate-pulse">
                {t('stock.almostGone')}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentUsed > 80
                  ? 'bg-red-500'
                  : percentUsed > 50
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${100 - percentUsed}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRedeem}
          disabled={isSoldOut || isRedeeming || deal.status !== 'ACTIVE'}
          className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
            isSoldOut || deal.status !== 'ACTIVE'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isRedeeming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('button.loading')}
            </span>
          ) : isSoldOut ? (
            t('button.soldOut')
          ) : deal.status !== 'ACTIVE' ? (
            t('button.expired')
          ) : (
            t('button.active')
          )}
        </button>
      </div>

      {/* Pulsing animation for hot deals */}
      {isAlmostGone && !isSoldOut && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-red-500 rounded-xl animate-pulse" />
        </div>
      )}
    </div>
  );
}
