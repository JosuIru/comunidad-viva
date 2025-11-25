'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import StarRating from './StarRating';
import { isValidImageSrc, handleImageError } from '@/lib/imageUtils';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string | Date;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewCardProps {
  review: Review;
  onDelete?: () => void;
  canDelete?: boolean;
}

export default function ReviewCard({ review, onDelete, canDelete = false }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {isValidImageSrc(review.reviewer.avatar) ? (
            <img
              src={review.reviewer.avatar}
              alt={review.reviewer.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold text-lg">
                {review.reviewer?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{review.reviewer?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>
        {canDelete && onDelete && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Eliminar reseña"
          >
            Eliminar
          </button>
        )}
      </div>

      <div className="mb-2">
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
