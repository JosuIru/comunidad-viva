import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import EmptyState from './EmptyState';
import { isValidImageSrc, handleImageError } from '@/lib/imageUtils';
import {
  BookOpenIcon,
  HandRaisedIcon,
  GiftIcon,
  HeartIcon,
  TrophyIcon,
  FlagIcon,
  LightBulbIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon,
  GlobeAltIcon,
  UserIcon,
  StarIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

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

// Memoized config to prevent recreation on every render
const POST_TYPES_CONFIG: Record<PostType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  STORY: { icon: BookOpenIcon, color: 'blue' },
  NEED: { icon: HandRaisedIcon, color: 'orange' },
  OFFER: { icon: GiftIcon, color: 'green' },
  THANKS: { icon: HeartIcon, color: 'pink' },
  ACHIEVEMENT: { icon: TrophyIcon, color: 'yellow' },
  MILESTONE: { icon: FlagIcon, color: 'purple' },
  TIP: { icon: LightBulbIcon, color: 'indigo' },
};

const SCOPE_FILTERS_CONFIG: Record<ScopeFilter, { icon: React.ComponentType<{ className?: string }> }> = {
  local: { icon: HomeIcon },
  community: { icon: BuildingOfficeIcon },
  region: { icon: MapIcon },
  global: { icon: GlobeAltIcon },
};

export default function Feed() {
  const queryClient = useQueryClient();
  const t = useTranslations('feed');
  const router = useRouter();
  const userLocale = router.locale || 'es';
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
      toast.success(t('toast.created'));
      setNewPostContent('');
      setShowCreatePost(false);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toast.error'));
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

  // Memoized handlers to prevent recreation on every render
  const handleCreatePost = useCallback(() => {
    if (!newPostContent.trim()) {
      toast.error(t('toast.writeFirst'));
      return;
    }
    createPostMutation.mutate({
      content: newPostContent,
      type: newPostType,
    });
  }, [newPostContent, newPostType, createPostMutation, t]);

  const handleReact = useCallback((postId: string, type: string) => {
    reactMutation.mutate({ postId, type });
  }, [reactMutation]);

  // Memoized style generator
  const getTypeStyle = useMemo(() => (type: PostType) => {
    const config = POST_TYPES_CONFIG[type];
    return {
      bg: `bg-${config.color}-100`,
      text: `text-${config.color}-800`,
      border: `border-${config.color}-200`,
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-800 dark:text-red-300">{t('errors.load')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scope Selector */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 rounded-lg p-6 text-white shadow-lg">
        <h3 className="font-bold text-lg mb-3">{t('scope.title')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(SCOPE_FILTERS_CONFIG) as ScopeFilter[]).map((key) => {
            const filter = SCOPE_FILTERS_CONFIG[key];
            const IconComponent = filter.icon;
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
                <div className="flex justify-center mb-1">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="font-semibold text-sm">{t(`scope.filters.${key}.label`)}</div>
              </button>
            );
          })}
        </div>
        <p className="text-sm opacity-90 mt-3 text-center">
          {t(`scope.filters.${scope}.description`)}
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedType === 'ALL'
                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t('types.all')}
          </button>
          {(Object.keys(POST_TYPES_CONFIG) as PostType[]).map((type) => {
            const config = POST_TYPES_CONFIG[type];
            const IconComponent = config.icon;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedType === type
                    ? `bg-${config.color}-600 text-white`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                {t(`types.${type}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {!showCreatePost ? (
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left text-gray-600 dark:text-gray-300 transition-colors"
          >
            {t('create.prompt')}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <select
                value={newPostType}
                onChange={(e) => setNewPostType(e.target.value as PostType)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {(Object.keys(POST_TYPES_CONFIG) as PostType[]).map((type) => {
                  return (
                    <option key={type} value={type}>
                      {t(`types.${type}`)}
                    </option>
                  );
                })}
              </select>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={t('create.placeholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreatePost(false);
                  setNewPostContent('');
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                {t('create.cancel')}
              </button>
              <button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending || !newPostContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {createPostMutation.isPending ? t('create.submitting') : t('create.submit')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">{t('loading')}</p>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((post) => {
            const typeConfig = POST_TYPES_CONFIG[post.type];
            const typeLabel = t(`types.${post.type}`);
            const formattedDate = new Intl.DateTimeFormat(userLocale, {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(new Date(post.createdAt));
            return (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${post.author.id}`}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg hover:opacity-80 transition-opacity"
                      >
                        {isValidImageSrc(post.author.avatar) ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          post.author.name[0].toUpperCase()
                        )}
                      </Link>
                      <div>
                        <Link
                          href={`/profile/${post.author.id}`}
                          className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {post.author.name}
                        </Link>
                        {post.author.reputation && (
                          <span className="ml-2 text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                            <StarIcon className="h-4 w-4" />
                            {post.author.reputation}
                          </span>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-${typeConfig.color}-100 text-${typeConfig.color}-800 flex items-center gap-1`}
                    >
                      {(() => {
                        const IconComponent = typeConfig.icon;
                        return <IconComponent className="h-4 w-4" />;
                      })()}
                      <span>{typeLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <Link href={`/social/posts/${post.id}`} className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-4">{post.content}</p>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {post.images.filter(isValidImageSrc).map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt=""
                          className="w-full rounded-lg object-cover max-h-96"
                          onError={handleImageError}
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
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex gap-6">
                    <button
                      onClick={() => handleReact(post.id, 'THANKS')}
                      className={`flex items-center gap-2 transition-colors ${
                        post.userReaction === 'THANKS'
                          ? 'text-pink-600 dark:text-pink-400 font-bold'
                          : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
                      }`}
                    >
                      <HeartIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.thanksCount}</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, 'SUPPORT')}
                      className={`flex items-center gap-2 transition-colors ${
                        post.userReaction === 'SUPPORT'
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      <HandThumbUpIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.supportsCount}</span>
                    </button>

                    <Link
                      href={`/social/posts/${post.id}`}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.commentsCount}</span>
                    </Link>

                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <ArrowPathIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.sharesCount}</span>
                    </button>

                    {post.helpedCount > 0 && (
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <HandRaisedIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {t('helped', { count: post.helpedCount })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <EmptyState
            icon={<InboxIcon className="h-16 w-16" />}
            title={t('create.emptyTitle')}
            description={t('create.emptyDescription')}
            actions={[
              {
                label: t('create.open'),
                onClick: () => setShowCreatePost(true),
                variant: 'primary',
              },
              {
                label: t('explore.offers'),
                href: '/offers',
                variant: 'secondary',
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
