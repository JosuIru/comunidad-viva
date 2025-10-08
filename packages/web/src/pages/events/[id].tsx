import { useRouter } from 'next/router';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import toast from 'react-hot-toast';
import { useState } from 'react';

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

  const { data: event, isLoading, error } = useQuery<{ data: EventDetail }>({
    queryKey: ['event', id],
    queryFn: () => api.get(`/events/${id}`),
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post(`/events/${id}/register`),
    onSuccess: () => {
      toast.success('Te has registrado exitosamente al evento');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setIsRegistering(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al registrarse al evento';
      toast.error(message);
      setIsRegistering(false);
    },
  });

  const handleContactOrganizer = () => {
    if (!eventData.organizer) {
      toast.error('No se pudo encontrar al organizador');
      return;
    }

    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Debes iniciar sesión para contactar al organizador');
      router.push('/auth/login');
      return;
    }

    const currentUser = JSON.parse(user);
    if (currentUser.id === eventData.organizer.id) {
      toast.error('No puedes contactarte a ti mismo');
      return;
    }

    router.push(`/messages/${eventData.organizer.id}`);
  };

  const handleRegister = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Debes iniciar sesión para registrarte');
      router.push('/auth/login');
      return;
    }

    if (eventData.capacity && eventData.attendeesCount >= eventData.capacity) {
      toast.error('El evento ha alcanzado su capacidad máxima');
      return;
    }

    if (eventData.isAttending) {
      toast.info('Ya estás registrado en este evento');
      return;
    }

    setIsRegistering(true);
    registerMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando evento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event?.data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento no encontrado</h2>
            <p className="text-gray-600 mb-6">
              Lo sentimos, no pudimos encontrar el evento que buscas.
            </p>
            <button
              onClick={() => router.push('/events')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Ver todos los eventos
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const eventData = event.data;
  const isPastEvent = new Date(eventData.endsAt) < new Date();

  return (
    <Layout title={`${eventData.title} - Comunidad Viva`}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
          >
            ← Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Event Image */}
                <div className="h-96 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                  {eventData.image ? (
                    <img
                      src={getImageUrl(eventData.image)}
                      alt={eventData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-2">📅</div>
                      <span className="text-gray-400 text-lg">Evento</span>
                    </div>
                  )}
                  {isPastEvent && (
                    <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 text-white px-4 py-2 rounded-full font-medium">
                      Finalizado
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Event Type Badge */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-medium">
                      {eventData.type.replace('_', ' ')}
                    </span>
                    {eventData.creditsReward && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm rounded-full font-medium">
                        +{eventData.creditsReward} créditos
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">{eventData.title}</h1>

                  {/* Event Dates */}
                  <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📆</span>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Inicio</p>
                        <p className="text-gray-900 font-medium">{formatDate(eventData.startsAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏁</span>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Fin</p>
                        <p className="text-gray-900 font-medium">{formatDate(eventData.endsAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {eventData.address && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ubicación</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-xl">📍</span>
                        <p>{eventData.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {eventData.description}
                      </p>
                    </div>
                  </div>

                  {/* Capacity Info */}
                  {eventData.capacity && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                          <p className="text-lg font-bold text-gray-900">
                            {eventData.attendeesCount} / {eventData.capacity} asistentes
                          </p>
                        </div>
                        <div className="text-4xl">👥</div>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{
                            width: `${Math.min((eventData.attendeesCount / eventData.capacity) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Attendees List */}
                  {eventData.attendees && eventData.attendees.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Asistentes ({eventData.attendees.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {eventData.attendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mb-2">
                              {attendee.avatar ? (
                                <img
                                  src={attendee.avatar}
                                  alt={attendee.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {attendee.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 truncate w-full">
                              {attendee.name || 'Usuario'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 pt-6 border-t border-gray-200 text-gray-600 text-sm flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="text-lg">👥</span>
                      {eventData.attendeesCount} asistente{eventData.attendeesCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-lg">📅</span>
                      Publicado {new Date(eventData.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-6">
                {/* Register Button */}
                {!isPastEvent && (
                  <div>
                    <button
                      onClick={handleRegister}
                      disabled={
                        isRegistering ||
                        eventData.isAttending ||
                        (eventData.capacity !== undefined &&
                          eventData.attendeesCount >= eventData.capacity)
                      }
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        eventData.isAttending
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : eventData.capacity !== undefined &&
                            eventData.attendeesCount >= eventData.capacity
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isRegistering
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isRegistering
                        ? 'Registrando...'
                        : eventData.isAttending
                        ? '✓ Registrado'
                        : eventData.capacity !== undefined &&
                          eventData.attendeesCount >= eventData.capacity
                        ? 'Capacidad completa'
                        : 'Registrarse'}
                    </button>
                    {eventData.creditsReward && !eventData.isAttending && (
                      <p className="text-sm text-center text-purple-600 mt-2">
                        Asiste y gana {eventData.creditsReward} créditos
                      </p>
                    )}
                  </div>
                )}

                {/* Organizer Info */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizado por</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                      {eventData.organizer?.avatar ? (
                        <img
                          src={eventData.organizer.avatar}
                          alt={eventData.organizer?.name || 'Organizador'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {eventData.organizer?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {eventData.organizer?.name || 'Organizador'}
                      </p>
                      {eventData.organizer?.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {eventData.organizer.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleContactOrganizer}
                    className="w-full py-2 px-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                  >
                    Contactar organizador
                  </button>
                </div>

                {/* Event Stats */}
                <div className="pt-6 border-t border-gray-200 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tipo de evento</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {eventData.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fecha de inicio</span>
                    <span className="font-medium text-gray-900">
                      {formatDateShort(eventData.startsAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fecha de fin</span>
                    <span className="font-medium text-gray-900">
                      {formatDateShort(eventData.endsAt)}
                    </span>
                  </div>
                  {eventData.capacity && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Plazas disponibles</span>
                      <span className="font-medium text-gray-900">
                        {Math.max(0, eventData.capacity - eventData.attendeesCount)}
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

export { getI18nProps as getStaticProps };
