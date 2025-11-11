import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { api } from '../../lib/api';

// Lazy load modal - only loaded when user clicks join button
const JoinGroupBuyModal = dynamic(() => import('../../components/groupbuys/JoinGroupBuyModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function GroupBuyDetailPage() {
  const t = useTranslations('groupBuyDetail');
  const router = useRouter();
  const { id } = router.query;
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: groupBuy, isLoading } = useQuery({
    queryKey: ['groupbuy', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/groupbuys/${id}`);
      if (!response.ok) throw new Error(t('errors.load'));
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading || !groupBuy) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const deadline = new Date(groupBuy.deadline);
  const timeLeft = formatDistanceToNow(deadline, { locale: es });
  const progressPercent = (groupBuy.currentParticipants / groupBuy.minParticipants) * 100;
  const isFull = groupBuy.currentParticipants >= groupBuy.maxParticipants;
  const isActive = groupBuy.currentParticipants >= groupBuy.minParticipants;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2"
          >
            <span>←</span>
            <span>{t('back')}</span>
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{groupBuy.offer?.title}</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                    {groupBuy.offer?.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span>{groupBuy.offer?.user?.name}</span>
                </div>
              </div>

              {/* Status badge */}
              {isActive && (
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {t('status.active')}
                </span>
              )}
              {isFull && (
                <span className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  {t('status.full')}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>
                  {t('progress.participants', { current: groupBuy.currentParticipants, min: groupBuy.minParticipants })}
                </span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-white transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-blue-100">
                {t('progress.maxParticipants', { max: groupBuy.maxParticipants })}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            {groupBuy.offer?.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('sections.description')}</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{groupBuy.offer.description}</p>
              </div>
            )}

            {/* Current pricing */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('sections.currentPrice')}</h2>
              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg border-2 border-blue-200 dark:border-blue-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                      {groupBuy.currentTier?.pricePerUnit}€ <span className="text-base font-normal text-gray-600 dark:text-gray-400">{t('sections.pricePerUnit')}</span>
                    </p>
                    {groupBuy.currentTier?.savings > 0 && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {t('sections.savings', { percent: groupBuy.currentTier.savings })}
                      </p>
                    )}
                  </div>
                  {groupBuy.nextTier && (
                    <div className="text-right">
                      <p className="text-sm text-blue-700">{t('sections.nextDiscount')}</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {groupBuy.nextTier.pricePerUnit}€/ud
                      </p>
                      <p className="text-sm text-blue-600">
                        {t('sections.unitsNeeded', { units: groupBuy.nextTier.minQuantity - groupBuy.totalQuantity })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price breaks */}
            {groupBuy.priceBreaks && groupBuy.priceBreaks.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('sections.volumeDiscounts')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {groupBuy.priceBreaks.map((tier: any) => {
                    const isCurrentTier = groupBuy.currentTier?.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        className={`p-4 rounded-lg text-center transition-all ${
                          isCurrentTier
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <p className="text-2xl font-bold mb-1">{tier.pricePerUnit}€</p>
                        <p className="text-sm opacity-90">{t('sections.fromUnits', { units: tier.minQuantity })}</p>
                        {tier.savings > 0 && (
                          <p className={`text-xs mt-1 ${isCurrentTier ? 'text-blue-100' : 'text-green-600'}`}>
                            -{tier.savings}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('sections.details')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('sections.totalQuantity')}</p>
                    <p className="text-gray-600 dark:text-gray-400">{groupBuy.totalQuantity || 0} {t('sections.unitsOrdered')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('sections.pickupPoint')}</p>
                    <p className="text-gray-600 dark:text-gray-400">{groupBuy.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('sections.closingDate')}</p>
                    <p className="text-gray-600 dark:text-gray-400">{t('sections.in', { time: timeLeft })}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{deadline.toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                {groupBuy.offer?.category && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-2xl">🏷️</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{t('sections.category')}</p>
                      <p className="text-gray-600 dark:text-gray-400">{groupBuy.offer.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            {groupBuy.participants && groupBuy.participants.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('sections.participants', { count: groupBuy.participants.length })}</h2>
                <div className="space-y-2">
                  {groupBuy.participants.map((participant: any) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {participant.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{participant.user?.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {participant.quantity} {participant.quantity !== 1 ? t('sections.units') : t('sections.unit')}
                        </p>
                        {participant.committedAmount && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('sections.committed', { amount: participant.committedAmount })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {!isFull ? (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  {t('actions.join')}
                </button>
              ) : (
                <div className="flex-1 px-6 py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-medium text-lg">
                  {t('actions.full')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <JoinGroupBuyModal
          groupBuy={groupBuy}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

import { getI18nProps } from '@/lib/i18n';

export const getStaticProps = async (context: any) => getI18nProps(context);
