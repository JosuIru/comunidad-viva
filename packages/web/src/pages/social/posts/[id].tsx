import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type PostType = 'STORY' | 'NEED' | 'OFFER' | 'THANKS' | 'ACHIEVEMENT' | 'MILESTONE' | 'TIP';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

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
  mentions?: string[];
  createdAt: string;
  thanksCount: number;
  supportsCount: number;
  commentsCount: number;
  sharesCount: number;
  helpedCount: number;
  relatedOfferId?: string;
  userReaction?: string;
  comments?: Comment[];
  reactions?: Array<{
    id: string;
    type: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

const POST_TYPE_CONFIG = {
  STORY: { icon: '📖', color: 'blue' },
  NEED: { icon: '🙏', color: 'orange' },
  OFFER: { icon: '🎁', color: 'green' },
  THANKS: { icon: '💚', color: 'pink' },
  ACHIEVEMENT: { icon: '🏆', color: 'yellow' },
  MILESTONE: { icon: '🎯', color: 'purple' },
  TIP: { icon: '💡', color: 'indigo' },
};

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const t = useTranslations('social');
  const tCommon = useTranslations('common');

  // Fetch post
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: async () => {
      const response = await api.get(`/social/posts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // React mutation
  const reactMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await api.post(`/social/posts/${id}/reactions`, { type });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/social/posts/${id}/comments`, { content });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('commentAdded'));
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errorAddingComment'));
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/social/comments/${commentId}`);
    },
    onSuccess: () => {
      toast.success(t('commentDeleted'));
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error(t('emptyCommentError'));
      return;
    }
    addCommentMutation.mutate(newComment);
  };

  if (isLoading) {
    return (
      <Layout title={tCommon('loading')}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">{t('loadingPost')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout title={t('postNotFound')}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('postNotFoundTitle')}</h1>
            <p className="text-gray-600 mb-6">{t('postNotFoundDescription')}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const typeConfig = POST_TYPE_CONFIG[post.type];
  const postTypeLabel = t(`postTypes.${post.type}`);

  return (
    <Layout title={`${postTypeLabel} - ${post.author.name}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('backToFeed')}
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Post Card */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            {/* Post Header */}
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
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold bg-${typeConfig.color}-100 text-${typeConfig.color}-800 flex items-center gap-1`}
                >
                  <span>{typeConfig.icon}</span>
                  <span>{postTypeLabel}</span>
                </span>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-6">
              <p className="text-gray-800 whitespace-pre-wrap text-lg mb-4">{post.content}</p>

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
                    <Link
                      key={idx}
                      href={`/social/hashtags/${tag}`}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 cursor-pointer"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Mentions */}
              {post.mentions && post.mentions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
                  {t('mentions')}: {post.mentions.map((mention, idx) => (
                    <span key={idx} className="text-blue-600">
                      @{mention}{idx < post.mentions!.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex gap-6">
                <button
                  onClick={() => reactMutation.mutate('THANKS')}
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
                  onClick={() => reactMutation.mutate('SUPPORT')}
                  className={`flex items-center gap-2 transition-colors ${
                    post.userReaction === 'SUPPORT'
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="text-xl">🤝</span>
                  <span className="text-sm font-medium">{post.supportsCount}</span>
                </button>

                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">💬</span>
                  <span className="text-sm font-medium">{post.commentsCount}</span>
                </div>

                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                  <span className="text-xl">🔄</span>
                  <span className="text-sm font-medium">{post.sharesCount}</span>
                </button>

                {post.helpedCount > 0 && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <span className="text-xl">🙌</span>
                    <span className="text-sm font-medium">{post.helpedCount} {t('helped')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('comments')} ({post.commentsCount})</h2>

            {/* Add Comment */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('writeComment')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {addCommentMutation.isPending ? t('posting') : t('comment')}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Link
                      href={`/profile/${comment.author.id}`}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity flex-shrink-0"
                    >
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        comment.author.name[0].toUpperCase()
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Link
                          href={`/profile/${comment.author.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {comment.author.name}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t('noCommentsYet')}
                </div>
              )}
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
