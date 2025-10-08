'use client';

import { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  entityType: 'offer' | 'user' | 'event';
  entityId: string;
  onSubmit: (data: { rating: number; comment?: string }) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function ReviewForm({
  entityType,
  entityId,
  onSubmit,
  onCancel,
  loading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor selecciona una valoración');
      return;
    }
    onSubmit({ rating, comment: comment.trim() || undefined });
  };

  const entityTypeLabel = {
    offer: 'la oferta',
    user: 'el usuario',
    event: 'el evento',
  }[entityType];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Escribir una reseña</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Cómo valoras {entityTypeLabel}?
        </label>
        <StarRating
          rating={rating}
          onChange={setRating}
          size="lg"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Comentario (opcional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Comparte tu experiencia..."
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 caracteres
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Enviando...' : 'Publicar reseña'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
