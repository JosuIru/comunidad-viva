import { useQuery } from '@tanstack/react-query';
import { getI18nProps } from '@/lib/i18n';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  startsAt: string;
  endsAt: string;
  capacity?: number;
  address: string;
  type: string;
  creditsReward: number;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: any[];
}

export default function EventsPage() {
  const { data: eventsResponse, isLoading } = useQuery<{ data: { events: Event[]; total: number } }>({
    queryKey: ['events'],
    queryFn: () => api.get('/events'),
  });

  const events = eventsResponse?.data?.events || [];

  return (
    <Layout title="Eventos - Comunidad Viva">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">Eventos Comunitarios</h1>
            <p className="text-xl opacity-90">
              Participa, aprende y conecta con tu comunidad
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando eventos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    {event.image ? (
                      <img
                        src={getImageUrl(event.image)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-6xl">🎉</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                        {event.type}
                      </span>
                      {event.creditsReward > 0 && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">
                          +{event.creditsReward} créditos
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span>📅</span>
                        {new Date(event.startsAt).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>🕒</span>
                        {new Date(event.startsAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        {event.address}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>👥</span>
                        {event.attendees?.length || 0}
                        {event.capacity && ` / ${event.capacity}`} asistentes
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Organizado por {event.organizer?.name || 'Organizador'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No hay eventos próximos</p>
              <Link
                href="/events/new"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Organizar un evento
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
