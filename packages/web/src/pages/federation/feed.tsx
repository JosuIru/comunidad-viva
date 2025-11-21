import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import toast from 'react-hot-toast';
import {
  GlobeAltIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Activity {
  id: string;
  type: string;
  actorDID: string;
  actorName: string;
  actorNode: string;
  objectType: string;
  objectId: string;
  content: string;
  visibility: string;
  metadata: any;
  likes: number;
  shares: number;
  createdAt: string;
  hasLiked?: boolean;
}

export default function FederatedFeed() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState<'all' | 'posts' | 'offers'>('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch federated feed
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['federated-feed', filter],
    queryFn: async () => {
      const response = await api.get('/federation/feed', {
        params: { limit: 50 },
      });
      const data = response.data;

      // Filter by type if needed
      if (filter === 'posts') {
        return data.filter((a: Activity) => a.objectType === 'POST');
      } else if (filter === 'offers') {
        return data.filter((a: Activity) => a.objectType === 'OFFER');
      }
      return data;
    },
  });

  // Like activity mutation
  const likeMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const response = await api.post(`/federation/activities/${activityId}/like`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['federated-feed'] });
    },
  });

  // Share activity mutation
  const shareMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const response = await api.post(`/federation/activities/${activityId}/share`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['federated-feed'] });
      toast.success('¡Actividad compartida!');
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'POST':
        return '📝';
      case 'OFFER':
        return '🎁';
      case 'SHARE':
        return '🔄';
      default:
        return '✨';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'POST':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'OFFER':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      case 'SHARE':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <GlobeAltIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Feed Federado
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Contenido de toda la red Gailu Labs en tiempo real
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setFilter('posts')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'posts'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setFilter('offers')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'offers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Ofertas
          </button>
        </div>

        {/* Activities Feed */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
                        {activity.actorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {activity.actorName}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.objectType)}`}>
                            {getActivityIcon(activity.objectType)} {activity.objectType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <ServerIcon className="h-4 w-4" />
                          <span>{activity.actorNode}</span>
                          <span>•</span>
                          <span>{new Date(activity.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {activity.content}
                  </p>

                  {/* Metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Información adicional:
                      </p>
                      <div className="space-y-1">
                        {activity.metadata.category && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📂 Categoría: {activity.metadata.category}
                          </p>
                        )}
                        {activity.metadata.price && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            💰 Precio: {activity.metadata.price}
                          </p>
                        )}
                        {activity.metadata.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📍 Ubicación: {activity.metadata.location}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => isAuthenticated && likeMutation.mutate(activity.id)}
                      disabled={!isAuthenticated || likeMutation.isPending}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {activity.hasLiked ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">{activity.likes}</span>
                    </button>

                    <button
                      onClick={() => isAuthenticated && shareMutation.mutate(activity.id)}
                      disabled={!isAuthenticated || shareMutation.isPending}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                    >
                      <ShareIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{activity.shares}</span>
                    </button>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Comentarios próximamente</span>
                    </div>

                    <div className="ml-auto">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.visibility === 'PUBLIC'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {activity.visibility === 'PUBLIC' ? '🌍 Público' : '🔒 Comunidad'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <GlobeAltIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay actividades todavía
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sé el primero en publicar contenido en la red federada
            </p>
            {!isAuthenticated && (
              <div className="mt-6">
                <a
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar Sesión
                </a>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!isAuthenticated && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💡 ¿Quieres interactuar con el feed?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Inicia sesión para dar likes, compartir contenido y publicar en la red federada.
            </p>
            <a
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
