import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { AcademicCapIcon, SparklesIcon, TrophyIcon, TicketIcon, CalendarIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  startsAt: string;
  location: string;
  maxAttendees?: number;
  _count: {
    attendees: number;
  };
  attendees: Array<{
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    checkedInAt: string | null;
  }>;
}

export default function MyEvents() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['my-events'],
    queryFn: async () => {
      const { data } = await api.get('/events/user/my-events');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/events/${eventId}`);
    },
    onSuccess: () => {
      toast.success('Evento eliminado');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar evento');
    },
  });

  const isPastEvent = (date: string) => {
    return new Date(date) < new Date();
  };

  const getTypeIcon = (type: string) => {
    const iconComponents: { [key: string]: JSX.Element } = {
      WORKSHOP: <AcademicCapIcon className="h-8 w-8" />,
      SOCIAL: <SparklesIcon className="h-8 w-8" />,
      SPORT: <TrophyIcon className="h-8 w-8" />,
      CULTURAL: <TicketIcon className="h-8 w-8" />,
      OTHER: <CalendarIcon className="h-8 w-8" />,
    };
    return iconComponents[type] || <CalendarIcon className="h-8 w-8" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <CalendarIcon className="h-24 w-24 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          No has creado eventos aún
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Organiza eventos para reunir a la comunidad
        </p>
        <Link
          href="/events/create"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Crear Evento
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Mis Eventos ({events.length})
        </h2>
        <Link
          href="/events/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nuevo Evento
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => {
          const isPast = isPastEvent(event.startsAt);
          const checkedInCount = event.attendees.filter(a => a.checkedInAt).length;

          return (
            <div
              key={event.id}
              className={`bg-white dark:bg-gray-800 border rounded-lg p-6 hover:shadow-md transition-shadow ${
                isPast ? 'border-gray-200 dark:border-gray-700 opacity-75' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-gray-600 dark:text-gray-400">{getTypeIcon(event.type)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {isPast && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            Finalizado
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.startsAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowAttendeesModal(true);
                      }}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {event._count.attendees} registrados
                      {checkedInCount > 0 && ` (${checkedInCount} asistieron)`}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Ver detalles"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de eliminar este evento?')) {
                        deleteMutation.mutate(event.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Eliminar"
                    disabled={deleteMutation.isPending}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendees Modal */}
      {showAttendeesModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Asistentes ({selectedEvent.attendees.length})
              </h3>
              <button
                onClick={() => setShowAttendeesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {selectedEvent.attendees.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Aún no hay personas registradas en este evento
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedEvent.attendees.map(({ user, checkedInAt }) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {checkedInAt ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckIcon className="h-4 w-4" /> Asistió {new Date(checkedInAt).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-500">Registrado</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {checkedInAt && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Confirmado
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
