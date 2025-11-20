import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import SkeletonLoader from '@/components/SkeletonLoader';

interface OfferDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  priceEur?: number;
  priceCredits?: number;
  images: string[];
  tags: string[];
  lat?: number;
  lng?: number;
  address?: string;
  views: number;
  interested: number;
  userIsInterested?: boolean;
  user: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    email?: string;
    phone?: string;
    contactPreference?: 'APP' | 'TELEGRAM' | 'WHATSAPP' | 'EMAIL' | 'PHONE';
    telegramUsername?: string;
    whatsappNumber?: string;
  };
  createdAt: string;
}

export default function OfferDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const t = useTranslations('offerDetail');
  const tToasts = useTranslations('toasts');
  const userLocale = router.locale || 'es';
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
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: 'EUR',
      }),
    [userLocale]
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(userLocale, {
        dateStyle: 'medium',
      }),
    [userLocale]
  );

  const { data: offer, isLoading } = useQuery<{ data: OfferDetail }>({
    queryKey: ['offer', id],
    queryFn: () => api.get(`/offers/${id}`),
    enabled: !!id,
  });

  const interestMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/offers/${id}/interested`);
      return data;
    },
    onSuccess: (data) => {
      if (data.interested) {
        toast.success(t('toasts.markInterested'));
      } else {
        toast.success(t('toasts.unmarkInterested'));
      }
      queryClient.invalidateQueries({ queryKey: ['offer', id] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('toasts.markError');
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success(tToasts('success.offerDeleted'));
      router.push('/offers');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || tToasts('error.deleteOffer');
      toast.error(message);
    },
  });

  const handleEdit = () => {
    router.push(`/offers/${id}/edit`);
  };

  const handleDelete = () => {
    if (confirm(tToasts('confirmations.deleteOffer'))) {
      deleteMutation.mutate();
    }
  };

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user).id;
    } catch {
      return null;
    }
  };

  const handleContact = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error(t('toasts.loginContact'));
      router.push('/auth/login');
      return;
    }

    const currentUser = JSON.parse(user);
    if (currentUser.id === offerData.user.id) {
      toast.error(t('toasts.selfContact'));
      return;
    }

    router.push(`/messages/${offerData.user.id}`);
  };

  const handleInterest = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error(t('toasts.loginInterest'));
      router.push('/auth/login');
      return;
    }

    interestMutation.mutate();
  };

  const getExternalContactLink = (
    preference: string,
    telegramUsername?: string,
    whatsappNumber?: string,
    email?: string,
    phone?: string
  ) => {
    switch (preference) {
      case 'TELEGRAM':
        return telegramUsername ? `https://t.me/${telegramUsername.replace('@', '')}` : null;
      case 'WHATSAPP':
        return whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}` : null;
      case 'EMAIL':
        return email ? `mailto:${email}` : null;
      case 'PHONE':
        return phone ? `tel:${phone}` : null;
      default:
        return null;
    }
  };

  const getContactLabel = (preference: string) => {
    const labels: Record<string, string> = {
      TELEGRAM: t('contact.telegram'),
      WHATSAPP: t('contact.whatsapp'),
      EMAIL: t('contact.email'),
      PHONE: t('contact.phone'),
    };
    return labels[preference] || preference;
  };

  const getContactIcon = (preference: string) => {
    const icons: Record<string, string> = {
      TELEGRAM: '📱',
      WHATSAPP: '💬',
      EMAIL: '✉️',
      PHONE: '📞',
    };
    return icons[preference] || '📧';
  };

  if (isLoading) {
    return (
      <Layout title={t('layout.loadingTitle')}>
        <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!offer?.data) {
    return (
      <Layout title={t('layout.loadingTitle')}>
        <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">{t('info.notFound')}</p>
        </div>
      </Layout>
    );
  }

  const offerData = offer.data;
  const typeLabels: Record<string, string> = {
    PRODUCT: t('tags.type.PRODUCT'),
    SERVICE: t('tags.type.SERVICE'),
    TIME_BANK: t('tags.type.TIME_BANK'),
    GROUP_BUY: t('tags.type.GROUP_BUY'),
    EVENT: t('tags.type.EVENT'),
    DONATION: t('tags.type.DONATION'),
  };
  const typeLabel = typeLabels[offerData.type] || offerData.type.replace('_', ' ');
  const formattedDate = dateFormatter.format(new Date(offerData.createdAt));

  return (
    <Layout title={t('layout.title', { title: offerData.title })}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2"
          >
            {t('buttons.back')}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {offerData.images?.length > 0 ? (
                    <img
                      src={getImageUrl(offerData.images[0])}
                      alt={offerData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-lg">{t('sections.noImage')}</span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm rounded-full font-medium">
                      {typeLabel}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                      {offerData.category}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{offerData.title}</h1>

                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{offerData.description}</p>
                  </div>

                  {offerData.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {offerData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {offerData.address && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('sections.locationTitle')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('sections.locationValue', { address: offerData.address })}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                    <span>{t('stats.views', { count: offerData.views })}</span>
                    <span>{t('stats.interested', { count: offerData.interested })}</span>
                    <span>{t('stats.date', { date: formattedDate })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
                <div className="mb-6">
                  {offerData.priceEur && (
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {currencyFormatter.format(offerData.priceEur)}
                    </div>
                  )}
                  {offerData.priceCredits && (
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {t('price.credits', { amount: numberFormatter.format(offerData.priceCredits) })}
                    </div>
                  )}
                </div>

                {/* Edit/Delete buttons for owner */}
                {getCurrentUserId() === offerData.user?.id && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={handleEdit}
                      className="flex-1 py-2 px-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 py-2 px-4 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Eliminando...' : '🗑️ Eliminar'}
                    </button>
                  </div>
                )}

                {getCurrentUserId() !== offerData.user?.id && (
                  <>
                    <div className="space-y-3 mb-6">
                      <button
                        onClick={handleContact}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        {t('buttons.contact')}
                      </button>
                      <button
                        onClick={handleInterest}
                        disabled={interestMutation.isPending}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          offerData.userIsInterested
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600'
                        } ${interestMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {interestMutation.isPending
                          ? t('buttons.processing')
                          : offerData.userIsInterested
                          ? t('buttons.alreadyInterested')
                          : t('buttons.interest')}
                      </button>
                    </div>

                    {offerData.user?.contactPreference &&
                      offerData.user.contactPreference !== 'APP' &&
                      (() => {
                        const contactLink = getExternalContactLink(
                          offerData.user.contactPreference,
                          offerData.user.telegramUsername,
                          offerData.user.whatsappNumber,
                          offerData.user.email,
                          offerData.user.phone
                        );
                        if (!contactLink) return null;

                        return (
                          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              {t('contact.title')}
                            </h4>
                            <a
                              href={contactLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between w-full py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-lg">
                                  {getContactIcon(offerData.user.contactPreference)}
                                </span>
                                <span className="font-medium">
                                  {getContactLabel(offerData.user.contactPreference)}
                                </span>
                              </span>
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </div>
                        );
                      })()}
                  </>
                )}

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('sections.offeredBy')}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {offerData.user?.name || t('sections.userFallback')}
                      </p>
                      {offerData.user?.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{offerData.user.bio}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => offerData.user?.id && router.push(`/profile/${offerData.user.id}`)}
                    className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                  >
                    {t('buttons.viewProfile')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export const getStaticProps = async (context: any) => getI18nProps(context);
