'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Schema de validación para la solicitud
const createRequestSchema = z.object({
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  hours: z.number().min(0.5, 'Mínimo 0.5 horas').max(24, 'Máximo 24 horas'),
  scheduledFor: z.string().min(1, 'La fecha es requerida'),
});

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

interface CreateRequestModalProps {
  offer?: any;
  onClose: () => void;
}

export default function CreateRequestModal({ offer, onClose }: CreateRequestModalProps) {
  const queryClient = useQueryClient();
  const tToasts = useTranslations('toasts');

  // Initialize form validation
  const {
    formData,
    errors,
    getInputProps,
    handleChange,
    validateForm,
  } = useFormValidation<CreateRequestFormData>({
    schema: createRequestSchema,
    initialData: {
      description: offer?.offer?.title || '',
      hours: offer?.estimatedHours || 1,
      scheduledFor: '',
    },
  });

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

    // Validate form
    const validation = validateForm();
    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    createMutation.mutate({
      providerId: offer.offer.userId,
      offerId: offer.id,
      description: validation.data.description,
      hours: validation.data.hours,
      scheduledFor: validation.data.scheduledFor,
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
            aria-label="Cerrar modal"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
              {...getInputProps('description')}
              required
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe qué necesitas..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Hours */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horas estimadas
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                {...getInputProps('hours', {
                  transform: (v) => v === '' ? 0 : parseFloat(v)
                })}
                required
                min="0.5"
                step="0.5"
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.hours ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="text-sm text-gray-600">
                = {Math.round(formData.hours || 0)} créditos
              </span>
            </div>
            {errors.hours && (
              <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
            )}
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
              {...getInputProps('scheduledFor')}
              required
              min={new Date().toISOString().slice(0, 16)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.scheduledFor ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.scheduledFor && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledFor}</p>
            )}
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
