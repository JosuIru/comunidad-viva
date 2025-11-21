import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

type EconomicLayer = 'TRADITIONAL' | 'TRANSITIONAL' | 'GIFT_PURE' | 'CHAMELEON';

interface Celebration {
  id: string;
  userId: string;
  userName: string;
  fromLayer: EconomicLayer;
  toLayer: EconomicLayer;
  reason: string;
  createdAt: string;
  congratulations: number;
  userCongratulated?: boolean;
}

interface BridgeEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  targetLayers: EconomicLayer[];
  attendees: number;
  maxAttendees?: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  userAttending?: boolean;
  organizer: {
    id: string;
    name: string;
  };
}

interface CreateEventData {
  name: string;
  description: string;
  date: string;
  location?: string;
  targetLayers: EconomicLayer[];
  maxAttendees?: number;
}

const layerEmojis: Record<EconomicLayer, string> = {
  TRADITIONAL: '💼',
  TRANSITIONAL: '🔄',
  GIFT_PURE: '🎁',
  CHAMELEON: '🦎',
};

const layerColors: Record<EconomicLayer, string> = {
  TRADITIONAL: 'from-blue-500 to-indigo-500',
  TRANSITIONAL: 'from-green-500 to-teal-500',
  GIFT_PURE: 'from-purple-500 to-pink-500',
  CHAMELEON: 'from-orange-500 to-red-500',
};

export default function HybridEventsPage() {
  const t = useTranslations('hybrid.events');
  const queryClient = useQueryClient();

  const layerNames: Record<EconomicLayer, string> = {
    TRADITIONAL: t('layers.traditional'),
    TRANSITIONAL: t('layers.transitional'),
    GIFT_PURE: t('layers.giftPure'),
    CHAMELEON: t('layers.chameleon'),
  };
  const [activeTab, setActiveTab] = useState<'celebrations' | 'events'>('celebrations');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  const [formData, setFormData] = useState<CreateEventData>({
    name: '',
    description: '',
    date: '',
    location: '',
    targetLayers: [],
    maxAttendees: undefined,
  });

  // Fetch celebrations
  const { data: celebrations, isLoading: celebrationsLoading } = useQuery<Celebration[]>({
    queryKey: ['celebrations'],
    queryFn: async () => {
      const response = await api.get('/hybrid/celebrations');
      return response.data.celebrations || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch bridge events
  const { data: events, isLoading: eventsLoading } = useQuery<BridgeEvent[]>({
    queryKey: ['bridge-events'],
    queryFn: async () => {
      const response = await api.get('/hybrid/bridge-events');
      return response.data.events || [];
    },
    refetchInterval: 60000,
  });

  // Congratulate mutation
  const congratulateMutation = useMutation({
    mutationFn: async (celebrationId: string) => {
      const response = await api.post(`/hybrid/celebrations/${celebrationId}/congratulate`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.congratulationSent'));
      queryClient.invalidateQueries({ queryKey: ['celebrations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.congratulationError'));
    },
  });

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.post(`/hybrid/bridge-events/${eventId}/attend`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.eventRegistered'));
      queryClient.invalidateQueries({ queryKey: ['bridge-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.eventRegistrationError'));
    },
  });

  // Leave event mutation
  const leaveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.post(`/hybrid/bridge-events/${eventId}/leave`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.attendanceCancelled'));
      queryClient.invalidateQueries({ queryKey: ['bridge-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.attendanceCancelError'));
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventData) => {
      const response = await api.post('/hybrid/bridge-events/create', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('toasts.eventCreated'));
      queryClient.invalidateQueries({ queryKey: ['bridge-events'] });
      setShowCreateEventModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.eventCreationError'));
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      location: '',
      targetLayers: [],
      maxAttendees: undefined,
    });
  };

  const toggleLayer = (layer: EconomicLayer) => {
    setFormData({
      ...formData,
      targetLayers: formData.targetLayers.includes(layer)
        ? formData.targetLayers.filter((l) => l !== layer)
        : [...formData.targetLayers, layer],
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return t('time.daysAgo', { days });
    if (hours > 0) return t('time.hoursAgo', { hours });
    if (minutes > 0) return t('time.minutesAgo', { minutes });
    return t('time.now');
  };

  const getEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title={t('title')}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-700 dark:via-pink-700 dark:to-red-700 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-4">{t('header.title')}</h1>
                <p className="text-xl opacity-90">
                  {t('header.subtitle')}
                </p>
              </div>
              {activeTab === 'events' && (
                <button
                  onClick={() => setShowCreateEventModal(true)}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 rounded-lg font-bold hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('createEvent')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('celebrations')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'celebrations'
                    ? 'border-b-2 border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('tabs.celebrations')}
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'events'
                    ? 'border-b-2 border-pink-500 dark:border-pink-400 text-pink-600 dark:text-pink-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('tabs.events')}
              </button>
            </div>
          </div>

          {/* Celebrations Tab */}
          {activeTab === 'celebrations' && (
            <div>
              {celebrationsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
                </div>
              ) : celebrations && celebrations.length > 0 ? (
                <div className="space-y-6">
                  {celebrations.map((celebration) => (
                    <div
                      key={celebration.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className={`bg-gradient-to-r ${layerColors[celebration.toLayer]} text-white px-6 py-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">
                              {layerEmojis[celebration.fromLayer]} → {layerEmojis[celebration.toLayer]}
                            </span>
                            <div>
                              <h3 className="text-xl font-bold">{celebration.userName}</h3>
                              <p className="text-sm opacity-90">
                                {t('celebration.migratedFrom', { from: layerNames[celebration.fromLayer], to: layerNames[celebration.toLayer] })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm opacity-80">{getTimeAgo(celebration.createdAt)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 dark:border-purple-600 rounded p-4 mb-4">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">{t('celebration.migrationReason')}</h4>
                          <p className="text-purple-800 dark:text-purple-300">{celebration.reason}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span className="text-2xl">👏</span>
                            <span className="font-semibold">{t('celebration.congratulations', { count: celebration.congratulations })}</span>
                          </div>

                          {!celebration.userCongratulated ? (
                            <button
                              onClick={() => congratulateMutation.mutate(celebration.id)}
                              disabled={congratulateMutation.isPending}
                              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-colors font-semibold disabled:opacity-50"
                            >
                              👏 {t('celebration.congratulate')}
                            </button>
                          ) : (
                            <div className="px-6 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-lg font-semibold">
                              ✓ {t('celebration.alreadyCongratulated')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">🎊</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('noCelebrations.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('noCelebrations.description')}
                  </p>
                </div>
              )}

              {/* Info Section */}
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('celebrationsInfo.title')}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {t('celebrationsInfo.description')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                    <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">💼 → 🔄 {t('celebrationsInfo.traditionalToTransitional.title')}</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      {t('celebrationsInfo.traditionalToTransitional.description')}
                    </p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg p-4">
                    <h4 className="font-bold text-pink-900 dark:text-pink-200 mb-2">🔄 → 🎁 {t('celebrationsInfo.transitionalToGift.title')}</h4>
                    <p className="text-sm text-pink-800 dark:text-pink-300">
                      {t('celebrationsInfo.transitionalToGift.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              {eventsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 dark:border-pink-400"></div>
                </div>
              ) : events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventStatusColor(event.status)}`}>
                            {event.status === 'UPCOMING' ? t('event.status.upcoming') : event.status === 'IN_PROGRESS' ? t('event.status.inProgress') : event.status === 'COMPLETED' ? t('event.status.completed') : t('event.status.cancelled')}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{event.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{event.description}</p>

                        {/* Date & Location */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span>📅</span>
                            <span>{getEventDate(event.date)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span>📍</span>
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Target Layers */}
                        <div className="mb-4">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('event.targetLayers')}</div>
                          <div className="flex flex-wrap gap-2">
                            {event.targetLayers.map((layer) => (
                              <span
                                key={layer}
                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold flex items-center gap-1"
                              >
                                {layerEmojis[layer]} {layerNames[layer]}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Attendees */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">{t('event.attendees')}</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              {event.attendees} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''}
                            </span>
                          </div>
                          {event.maxAttendees && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                                style={{ width: `${Math.min((event.attendees / event.maxAttendees) * 100, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {/* Organizer */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {t('event.organizer')} <span className="font-semibold">{event.organizer.name}</span>
                        </div>

                        {/* Actions */}
                        {event.status === 'UPCOMING' && (
                          <>
                            {event.userAttending ? (
                              <button
                                onClick={() => leaveEventMutation.mutate(event.id)}
                                disabled={leaveEventMutation.isPending}
                                className="w-full py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                              >
                                {t('event.cancelAttendance')}
                              </button>
                            ) : (
                              <button
                                onClick={() => joinEventMutation.mutate(event.id)}
                                disabled={joinEventMutation.isPending || (event.maxAttendees !== undefined && event.attendees >= event.maxAttendees)}
                                className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-700 dark:to-purple-700 text-white rounded-lg font-bold hover:from-pink-700 hover:to-purple-700 dark:hover:from-pink-600 dark:hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {event.maxAttendees !== undefined && event.attendees >= event.maxAttendees
                                  ? t('event.eventFull')
                                  : t('event.willAttend')}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">🌉</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('noEvents.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('noEvents.description')}
                  </p>
                  <button
                    onClick={() => setShowCreateEventModal(true)}
                    className="px-6 py-3 bg-pink-600 dark:bg-pink-700 text-white rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 transition-colors font-semibold"
                  >
                    {t('noEvents.createFirst')}
                  </button>
                </div>
              )}

              {/* Info Section */}
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('eventsInfo.title')}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {t('eventsInfo.description')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🤝</div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('eventsInfo.connection.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('eventsInfo.connection.description')}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('eventsInfo.learning.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('eventsInfo.learning.description')}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🌱</div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('eventsInfo.evolution.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('eventsInfo.evolution.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-8 my-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('createModal.title')}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('createModal.eventName')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500"
                    placeholder={t('createModal.eventNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('createModal.description')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500"
                    rows={4}
                    placeholder={t('createModal.descriptionPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('createModal.dateTime')}</label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('createModal.maxAttendees')}
                    </label>
                    <input
                      type="number"
                      value={formData.maxAttendees || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxAttendees: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500"
                      placeholder={t('createModal.maxAttendeesPlaceholder')}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('createModal.location')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500"
                    placeholder={t('createModal.locationPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('createModal.targetLayers')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['TRADITIONAL', 'TRANSITIONAL', 'GIFT_PURE', 'CHAMELEON'] as EconomicLayer[]).map(
                      (layer) => (
                        <button
                          key={layer}
                          type="button"
                          onClick={() => toggleLayer(layer)}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            formData.targetLayers.includes(layer)
                              ? `bg-gradient-to-r ${layerColors[layer]} text-white`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {layerEmojis[layer]} {layerNames[layer]}
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('createModal.targetLayersHint')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateEventModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  {t('createModal.cancel')}
                </button>
                <button
                  onClick={() => createEventMutation.mutate(formData)}
                  disabled={
                    createEventMutation.isPending ||
                    !formData.name ||
                    !formData.description ||
                    !formData.date ||
                    formData.targetLayers.length < 2
                  }
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-700 dark:to-purple-700 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 dark:hover:from-pink-600 dark:hover:to-purple-600 transition-colors font-semibold disabled:opacity-50"
                >
                  {createEventMutation.isPending ? t('createModal.creating') : t('createModal.create')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
