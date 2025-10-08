'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ReviewListProps {
  entityType: 'offer' | 'user' | 'event';
  entityId: string;
  currentUserId?: string;
  allowReview?: boolean;
}

export default function ReviewList({
  entityType,
  entityId,
  currentUserId,
  allowReview = false,
}: ReviewListProps) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reviews and stats
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', entityType, entityId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/reviews/entity/${entityType}/${entityId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!response.ok) throw new Error('Error al cargar reseñas');
      return response.json();
    },
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment?: string }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewType: entityType,
          reviewedEntityId: entityId,
          ...reviewData,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear reseña');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', entityType, entityId] });
      setShowForm(false);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al eliminar reseña');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', entityType, entityId] });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const { reviews = [], stats = { averageRating: 0, totalReviews: 0 } } = data || {};
  const userHasReviewed = reviews.some((r: any) => r.reviewer.id === currentUserId);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-3">Reseñas y valoraciones</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-gray-900">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          </div>
          <div>
            <StarRating
              rating={stats.averageRating}
              readonly
              size="md"
              showCount
              count={stats.totalReviews}
            />
          </div>
        </div>
      </div>

      {/* Review Form */}
      {allowReview && currentUserId && !userHasReviewed && (
        <div>
          {showForm ? (
            <ReviewForm
              entityType={entityType}
              entityId={entityId}
              onSubmit={(data) => createReviewMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
              loading={createReviewMutation.isPending}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Escribir una reseña
            </button>
          )}
        </div>
      )}

      {userHasReviewed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          Ya has escrito una reseña para este elemento
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            <p>Aún no hay reseñas</p>
            {allowReview && currentUserId && (
              <p className="text-sm mt-2">¡Sé el primero en escribir una!</p>
            )}
          </div>
        ) : (
          reviews.map((review: any) => (
            <ReviewCard
              key={review.id}
              review={review}
              canDelete={review.reviewer.id === currentUserId}
              onDelete={() => deleteReviewMutation.mutate(review.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
