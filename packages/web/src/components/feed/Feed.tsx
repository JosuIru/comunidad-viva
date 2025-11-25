'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CreatePostForm from './CreatePostForm';
import PostCard from './PostCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FeedProps {
  currentUserId?: string;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function Feed({ currentUserId, currentUser }: FeedProps) {
  const [filter, setFilter] = useState<'all' | 'following'>('all');
  const queryClient = useQueryClient();

  // Fetch feed
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['feed', filter],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar el feed');
      return response.json();
    },
    enabled: !!currentUserId,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; media?: string[] }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al crear publicación');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: string }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error('Error al reaccionar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async (postId: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/posts/${postId}/react`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al eliminar reacción');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Error al comentar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/social/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al eliminar publicación');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  if (!currentUserId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Únete a la comunidad
          </h2>
          <p className="text-gray-600 mb-6">
            Inicia sesión para ver y compartir publicaciones
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Create Post */}
      <CreatePostForm
        currentUser={currentUser}
        onSubmit={(content) => createPostMutation.mutate({ content })}
        loading={createPostMutation.isPending}
      />

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-2 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Todas las publicaciones
        </button>
        <button
          onClick={() => setFilter('following')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'following'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Siguiendo
        </button>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay publicaciones aún
          </h3>
          <p className="text-gray-600">
            ¡Sé el primero en compartir algo con la comunidad!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReact={(type) => addReactionMutation.mutate({ postId: post.id, type })}
              onRemoveReaction={() => removeReactionMutation.mutate(post.id)}
              onComment={(content) =>
                addCommentMutation.mutate({ postId: post.id, content })
              }
              onDelete={
                post.author.id === currentUserId
                  ? () => {
                      if (confirm('¿Eliminar esta publicación?')) {
                        deletePostMutation.mutate(post.id);
                      }
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
