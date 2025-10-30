import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

type PostType = 'STORY' | 'NEED' | 'OFFER' | 'THANKS' | 'ACHIEVEMENT' | 'MILESTONE' | 'TIP';
type ScopeFilter = 'local' | 'community' | 'region' | 'global';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation?: number;
  };
  content: string;
  type: PostType;
  images?: string[];
  tags?: string[];
  createdAt: string;
  thanksCount: number;
  supportsCount: number;
  commentsCount: number;
  sharesCount: number;
  helpedCount: number;
  relatedOfferId?: string;
  userReaction?: string;
}

const POST_TYPES = {
  STORY: { label: 'Historia', icon: '📖', color: 'blue' },
  NEED: { label: 'Necesidad', icon: '🙏', color: 'orange' },
  OFFER: { label: 'Oferta', icon: '🎁', color: 'green' },
  THANKS: { label: 'Agradecimiento', icon: '💚', color: 'pink' },
  ACHIEVEMENT: { label: 'Logro', icon: '🏆', color: 'yellow' },
  MILESTONE: { label: 'Hito', icon: '🎯', color: 'purple' },
  TIP: { label: 'Consejo', icon: '💡', color: 'indigo' },
};

const SCOPE_FILTERS = {
  local: { label: 'Mi barrio', icon: '🏠', description: 'Publicaciones de tu vecindad' },
  community: { label: 'Mi comunidad', icon: '🏘️', description: 'Publicaciones de tu comunidad' },
  region: { label: 'Región', icon: '🗺️', description: 'Publicaciones de tu región' },
  global: { label: 'Global', icon: '🌍', description: 'Todas las publicaciones' },
};

export default function Feed() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<PostType | 'ALL'>('ALL');
  const [scope, setScope] = useState<ScopeFilter>('community');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('STORY');

  // Fetch feed
  const { data, isLoading, error } = useQuery<{ data: Post[]; hasMore: boolean }>({
    queryKey: ['feed', selectedType, scope],
    queryFn: async () => {
      const params: any = { limit: 20 };
      if (selectedType !== 'ALL') params.type = selectedType;
      const response = await api.get('/social/feed', { params });
      return response.data;
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; type: PostType }) => {
      const response = await api.post('/social/posts', postData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Publicación creada!');
      setNewPostContent('');
      setShowCreatePost(false);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear publicación');
    },
  });

  // React to post mutation
  const reactMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: string }) => {
      const response = await api.post(`/social/posts/${postId}/reactions`, { type });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error('Escribe algo primero');
      return;
    }
    createPostMutation.mutate({
      content: newPostContent,
      type: newPostType,
    });
  };

  const handleReact = (postId: string, type: string) => {
    reactMutation.mutate({ postId, type });
  };

  const getTypeStyle = (type: PostType) => {
    const config = POST_TYPES[type];
    return {
      bg: `bg-${config.color}-100`,
      text: `text-${config.color}-800`,
      border: `border-${config.color}-200`,
    };
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Error al cargar el feed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scope Selector */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white shadow-lg">
        <h3 className="font-bold text-lg mb-3">🌍 Alcance del Feed</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(SCOPE_FILTERS) as ScopeFilter[]).map((key) => {
            const filter = SCOPE_FILTERS[key];
            return (
              <button
                key={key}
                onClick={() => setScope(key)}
                className={`p-3 rounded-lg transition-all ${
                  scope === key
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <div className="text-2xl mb-1">{filter.icon}</div>
                <div className="font-semibold text-sm">{filter.label}</div>
              </button>
            );
          })}
        </div>
        <p className="text-sm opacity-90 mt-3 text-center">
          {SCOPE_FILTERS[scope].description}
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedType === 'ALL'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 Todas
          </button>
          {(Object.keys(POST_TYPES) as PostType[]).map((type) => {
            const config = POST_TYPES[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? `bg-${config.color}-600 text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.icon} {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {!showCreatePost ? (
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-600 transition-colors"
          >
            💬 ¿Qué quieres compartir con tu comunidad?
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                👤
              </div>
              <select
                value={newPostType}
                onChange={(e) => setNewPostType(e.target.value as PostType)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
              >
                {(Object.keys(POST_TYPES) as PostType[]).map((type) => {
                  const config = POST_TYPES[type];
                  return (
                    <option key={type} value={type}>
                      {config.icon} {config.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Escribe tu publicación..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreatePost(false);
                  setNewPostContent('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending || !newPostContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {createPostMutation.isPending ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Cargando publicaciones...</p>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((post) => {
            const typeConfig = POST_TYPES[post.type];
            return (
              <div key={post.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${post.author.id}`}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg hover:opacity-80 transition-opacity"
                      >
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          post.author.name[0].toUpperCase()
                        )}
                      </Link>
                      <div>
                        <Link
                          href={`/profile/${post.author.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {post.author.name}
                        </Link>
                        {post.author.reputation && (
                          <span className="ml-2 text-sm text-orange-600 font-medium">
                            ⭐ {post.author.reputation}
                          </span>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-${typeConfig.color}-100 text-${typeConfig.color}-800 flex items-center gap-1`}
                    >
                      <span>{typeConfig.icon}</span>
                      <span>{typeConfig.label}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <Link href={`/social/posts/${post.id}`} className="block p-6 hover:bg-gray-50 transition-colors">
                  <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {post.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt=""
                          className="w-full rounded-lg object-cover max-h-96"
                        />
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-6">
                    <button
                      onClick={() => handleReact(post.id, 'THANKS')}
                      className={`flex items-center gap-2 transition-colors ${
                        post.userReaction === 'THANKS'
                          ? 'text-pink-600 font-bold'
                          : 'text-gray-600 hover:text-pink-600'
                      }`}
                    >
                      <span className="text-xl">💚</span>
                      <span className="text-sm font-medium">{post.thanksCount}</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, 'SUPPORT')}
                      className={`flex items-center gap-2 transition-colors ${
                        post.userReaction === 'SUPPORT'
                          ? 'text-blue-600 font-bold'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <span className="text-xl">🤝</span>
                      <span className="text-sm font-medium">{post.supportsCount}</span>
                    </button>

                    <Link
                      href={`/social/posts/${post.id}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <span className="text-xl">💬</span>
                      <span className="text-sm font-medium">{post.commentsCount}</span>
                    </Link>

                    <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                      <span className="text-xl">🔄</span>
                      <span className="text-sm font-medium">{post.sharesCount}</span>
                    </button>

                    {post.helpedCount > 0 && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <span className="text-xl">🙌</span>
                        <span className="text-sm font-medium">{post.helpedCount} ayudados</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No hay publicaciones aún
          </h3>
          <p className="text-gray-600 mb-6">
            Sé el primero en compartir algo con tu comunidad
          </p>
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Crear publicación
          </button>
        </div>
      )}
    </div>
  );
}
