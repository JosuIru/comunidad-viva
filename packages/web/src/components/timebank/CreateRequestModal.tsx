'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CreateRequestModalProps {
  offer?: any;
  onClose: () => void;
}

export default function CreateRequestModal({ offer, onClose }: CreateRequestModalProps) {
  const [description, setDescription] = useState(offer?.offer?.title || '');
  const [hours, setHours] = useState(offer?.estimatedHours || 1);
  const [scheduledFor, setScheduledFor] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/timebank/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear solicitud');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timebank', 'transactions'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledFor) {
      alert('Por favor selecciona una fecha y hora');
      return;
    }

    createMutation.mutate({
      providerId: offer.offer.userId,
      offerId: offer.id,
      description,
      hours: parseFloat(hours.toString()),
      scheduledFor,
    });
  };

  if (!offer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Solicitar tiempo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Provider info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-lg font-bold">
              {offer.offer.user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{offer.offer.user.name}</p>
              {offer.skill && (
                <p className="text-sm text-gray-600">{offer.skill.name}</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del servicio
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe qué necesitas..."
            />
          </div>

          {/* Hours */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horas estimadas
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                required
                min="0.5"
                step="0.5"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-600">
                = {Math.round(hours)} créditos
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Estimadas: {offer.estimatedHours}h según la oferta
            </p>
          </div>

          {/* Scheduled date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Tools needed info */}
          {offer.toolsNeeded?.length > 0 && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Herramientas necesarias:
              </p>
              <p className="text-sm text-blue-800">
                {offer.toolsNeeded.join(', ')}
              </p>
            </div>
          )}

          {/* Error message */}
          {createMutation.isError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {createMutation.error.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-medium mb-1">ℹ️ Cómo funciona:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Envías tu solicitud al proveedor</li>
            <li>El proveedor acepta o rechaza</li>
            <li>Realizan el intercambio en la fecha acordada</li>
            <li>Ambos confirman y valoran la experiencia</li>
            <li>Se otorgan los créditos al proveedor automáticamente</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
