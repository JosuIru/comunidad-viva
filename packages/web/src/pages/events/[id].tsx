import { useMemo, useState, useEffect } from 'react';
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
import PublicViewBanner from '@/components/PublicViewBanner';
import {
  CalendarIcon,
  FlagIcon,
  MapPinIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface Attendee {
  id: string;
  name: string;
  avatar?: string;
}

interface Organizer {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  startsAt: string;
  endsAt: string;
  address?: string;
  capacity?: number;
  attendeesCount: number;
  creditsReward?: number;
  image?: string;
  organizer: Organizer;
  attendees?: Attendee[];
  isAttending?: boolean;
  createdAt: string;
}

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const t = useTranslations('eventDetail');
  const tToasts = useTranslations('toasts');
  const userLocale = router.locale || 'es';

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(userLocale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [userLocale]
  );

  const dateShortFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(userLocale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [userLocale]
  );

  const publishedFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(userLocale, {
        dateStyle: 'medium',
      }),
    [userLocale]
  );

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(userLocale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [userLocale]
  );

  const badgeLabels: Record<string, string> = {
    WORKSHOP: t('badges.type.WORKSHOP'),
    CONFERENCE: t('badges.type.CONFERENCE'),
    MEETUP: t('badges.type.MEETUP'),
    SOCIAL: t('badges.type.SOCIAL'),
    VOLUNTEER: t('badges.type.VOLUNTEER'),
    OTHER: t('badges.type.OTHER'),
  };

  const { data: event, isLoading, error } = useQuery<{ data: EventDetail }>({
    queryKey: ['event', id],
    queryFn: () => api.get(`/events/${id}`),
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post(`/events/${id}/register`),
    onSuccess: () => {
      toast.success(t('toasts.registerSuccess'));
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setIsRegistering(false);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('toasts.registerError');
      toast.error(message);
      setIsRegistering(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/events/${id}`),
    onSuccess: () => {
      toast.success(tToasts('success.eventDeleted'));
      router.push('/events');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || tToasts('error.deleteEvent');
      toast.error(message);
    },
  });

  const handleContactOrganizer = (organizer?: Organizer) => {
    if (!organizer) {
      toast.error(t('toasts.organizerNotFound'));
      return;
    }

    const user = localStorage.getItem('user');
    if (!user) {
      toast.error(t('toasts.loginContact'));
      router.push(`/auth/register?returnUrl=/events/${id}`);
      return;
    }

    const currentUser = JSON.parse(user);
    if (currentUser.id === organizer.id) {
      toast.error(t('toasts.selfContact'));
      return;
    }

    router.push(`/messages/${organizer.id}`);
  };

  const handleEdit = () => {
    router.push(`/events/${id}/edit`);
  };

  const handleDelete = () => {
    if (confirm(tToasts('confirmations.deleteEvent'))) {
      deleteMutation.mutate();
    }
  };

  // Check if current user is the organizer
  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user).id;
    } catch {
      return null;
    }
  };

  const isOrganizer = event?.data && getCurrentUserId() === event.data.organizer?.id;

  const handleRegister = (eventToRegister: EventDetail) => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error(t('toasts.loginRegister'));
      router.push(`/auth/register?returnUrl=/events/${id}`);
      return;
    }

    if (
      eventToRegister.capacity !== undefined &&
      eventToRegister.attendeesCount >= eventToRegister.capacity
    ) {
      toast.error(t('toasts.capacityReached'));
      return;
    }

    if (eventToRegister.isAttending) {
      toast(t('toasts.alreadyRegistered'), {
        icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      });
      return;
    }

    setIsRegistering(true);
    registerMutation.mutate();
  };

  if (isLoading) {
    return (
      <Layout title={t('layout.loadingTitle')}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <SkeletonLoader type="profile" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event?.data) {
    return (
      <Layout title={t('layout.loadingTitle')}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md px-4">
            <div className="mb-4 flex justify-center">
              <ExclamationTriangleIcon className="h-24 w-24 text-yellow-500 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('notFound.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('notFound.description')}</p>
            <Button
              onClick={() => router.push('/events')}
              variant="primary"
              size="md"
            >
              {t('notFound.button')}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const eventData = event.data;
  const isPastEvent = new Date(eventData.endsAt) < new Date();
  const eventTypeLabel =
    badgeLabels[eventData.type] ?? eventData.type.replace('_', ' ');
  const formattedStart = dateFormatter.format(new Date(eventData.startsAt));
  const formattedEnd = dateFormatter.format(new Date(eventData.endsAt));
  const formattedStartShort = dateShortFormatter.format(
    new Date(eventData.startsAt)
  );
  const formattedEndShort = dateShortFormatter.format(
    new Date(eventData.endsAt)
  );
  const formattedPublished = publishedFormatter.format(
    new Date(eventData.createdAt)
  );
  const progressPercent =
    eventData.capacity !== undefined && eventData.capacity > 0
      ? Math.min(
          (eventData.attendeesCount / eventData.capacity) * 100,
          100
        )
      : 0;
  const availableSpots =
    eventData.capacity !== undefined
      ? Math.max(0, eventData.capacity - eventData.attendeesCount)
      : null;

  return (
    <Layout title={t('layout.title', { title: eventData.title })}>
      {!isAuthenticated && <PublicViewBanner message="Únete gratis para registrarte en este evento" />}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8" style={{ paddingTop: !isAuthenticated ? '60px' : '0' }}>
        <div className="container mx-auto px-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="mb-6"
          >
            ← {t('buttons.back')}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="h-96 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                  {eventData.image ? (
                    <img
                      src={getImageUrl(eventData.image)}
                      alt={eventData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">
                        <CalendarIcon className="h-24 w-24 text-gray-400" />
                      </div>
                      <span className="text-gray-400 text-lg">
                        {t('sections.imageFallback')}
                      </span>
                    </div>
                  )}
                  {isPastEvent && (
                    <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 text-white px-4 py-2 rounded-full font-medium">
                      {t('status.finished')}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm rounded-full font-medium capitalize">
                      {eventTypeLabel}
                    </span>
                    {eventData.creditsReward && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm rounded-full font-medium">
                        {t('badges.reward', { credits: eventData.creditsReward })}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {eventData.title}
                  </h1>

                  <div className="mb-6 space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-6 w-6 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {t('sections.schedule.start')}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {formattedStart}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FlagIcon className="h-6 w-6 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {t('sections.schedule.end')}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {formattedEnd}
                        </p>
                      </div>
                    </div>
                  </div>

                  {eventData.address && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('sections.location.title')}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                        <p>{t('sections.location.value', { address: eventData.address })}</p>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      {t('sections.description')}
                    </h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {eventData.description}
                      </p>
                    </div>
                  </div>

                  {eventData.capacity && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {t('sections.capacity.label')}
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('sections.capacity.value', {
                              current: numberFormatter.format(eventData.attendeesCount),
                              capacity: numberFormatter.format(eventData.capacity),
                            })}
                          </p>
                        </div>
                        <UsersIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {eventData.attendees && eventData.attendees.length > 0 && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t('sections.attendees', {
                          count: eventData.attendees.length,
                        })}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {eventData.attendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Avatar
                              name={attendee.name || t('sections.attendeeFallback')}
                              src={attendee.avatar}
                              size="md"
                              className="mb-2"
                            />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate w-full">
                              {attendee.name || t('sections.attendeeFallback')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm flex-wrap">
                    <span className="flex items-center gap-1">
                      {t('sections.meta.attendees', { count: eventData.attendeesCount })}
                    </span>
                    <span className="flex items-center gap-1">
                      {t('sections.meta.published', { date: formattedPublished })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4 space-y-6">
                {/* Edit/Delete buttons for organizer */}
                {isOrganizer && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="md"
                      className="flex-1"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      size="md"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      isLoading={deleteMutation.isPending}
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                )}

                {!isPastEvent && !isOrganizer && (
                  <div>
                    <Button
                      onClick={() => handleRegister(eventData)}
                      disabled={
                        isRegistering ||
                        eventData.isAttending ||
                        (eventData.capacity !== undefined &&
                          eventData.attendeesCount >= eventData.capacity)
                      }
                      variant={eventData.isAttending ? "outline" : "primary"}
                      size="md"
                      isLoading={isRegistering}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {!isAuthenticated && <span>🔒</span>}
                      {eventData.isAttending
                        ? t('buttons.registered')
                        : eventData.capacity !== undefined &&
                          eventData.attendeesCount >= eventData.capacity
                        ? t('buttons.capacityFull')
                        : t('buttons.register')}
                    </Button>
                    {!isAuthenticated && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                          Regístrate gratis para asistir a este evento
                        </p>
                      </div>
                    )}
                    {eventData.creditsReward && !eventData.isAttending && (
                      <p className="text-sm text-center text-purple-600 dark:text-purple-400 mt-2">
                        {t('status.reward', { credits: eventData.creditsReward })}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {t('sections.organizer')}
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar
                      name={eventData.organizer?.name || t('sections.organizerFallback')}
                      src={eventData.organizer?.avatar}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {eventData.organizer?.name || t('sections.organizerFallback')}
                      </p>
                      {eventData.organizer?.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {eventData.organizer.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleContactOrganizer(eventData.organizer)}
                    variant="outline"
                    size="md"
                    className="w-full"
                  >
                    {t('buttons.contact')}
                  </Button>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('sections.details.title')}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('sections.details.type')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {eventTypeLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('sections.details.startDate')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formattedStartShort}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('sections.details.endDate')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formattedEndShort}
                    </span>
                  </div>
                  {availableSpots !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('sections.details.availableSpots')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {numberFormatter.format(availableSpots)}
                      </span>
                    </div>
                  )}
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

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
