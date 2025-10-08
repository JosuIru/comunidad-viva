'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactionButton from './ReactionButton';

interface Post {
  id: string;
  content: string;
  media?: string[];
  createdAt: string | Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  reactions: {
    id: string;
    type: string;
    user: { id: string; name: string };
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string | Date;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
  }[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onReact: (type: string) => void;
  onRemoveReaction: () => void;
  onComment: (content: string) => void;
  onDelete?: () => void;
}

export default function PostCard({
  post,
  currentUserId,
  onReact,
  onRemoveReaction,
  onComment,
  onDelete,
}: PostCardProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const displayedComments = showAllComments ? post.comments : post.comments.slice(0, 3);
  const hasMoreComments = post.comments.length > 3;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      onComment(commentContent.trim());
      setCommentContent('');
      setShowCommentForm(false);
    }
  };

  const isOwner = post.author.id === currentUserId;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold text-lg">
                  {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{post.author?.name || 'Usuario'}</p>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          {isOwner && onDelete && (
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Eliminar publicación"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`mt-4 grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.media.map((url, index) => (
              <img
                key={index}
                src={url}
                alt=""
                className="w-full rounded-lg object-cover max-h-96"
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {(post._count?.reactions || post._count?.comments) && (
        <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>{post._count.reactions || post.reactions.length} reacciones</span>
          <span>{post._count.comments || post.comments.length} comentarios</span>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-200 flex items-center gap-2">
        <ReactionButton
          postId={post.id}
          reactions={post.reactions}
          currentUserId={currentUserId}
          onReact={onReact}
          onRemove={onRemoveReaction}
        />
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">Comentar</span>
        </button>
      </div>

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 space-y-3">
          {displayedComments.map((comment) => {
            const commentTime = formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: es,
            });
            return (
              <div key={comment.id} className="flex gap-2">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-semibold text-xs">
                      {comment.author?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-gray-500">{commentTime}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            );
          })}
          {hasMoreComments && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-sm text-green-600 hover:underline"
            >
              Ver {post.comments.length - 3} comentarios más
            </button>
          )}
        </div>
      )}

      {/* Comment Form */}
      {showCommentForm && (
        <div className="px-4 py-3 border-t border-gray-200">
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!commentContent.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
