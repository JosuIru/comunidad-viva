import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const SCOPES = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'FAMILY', label: 'Familiar' },
  { value: 'COMMUNITY', label: 'Comunitaria' },
];

const TYPES = [
  { value: 'URGENT', label: 'Urgente' },
  { value: 'RECURRING', label: 'Recurrente' },
  { value: 'INFRASTRUCTURE', label: 'Infraestructura' },
];

const URGENCY_LEVELS = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

export default function EditNeedPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    scope: 'INDIVIDUAL',
    type: 'URGENT',
    title: '',
    description: '',
    location: '',
    urgencyLevel: 'MEDIUM',
    targetEur: '',
    targetCredits: '',
    targetHours: '',
    neededSkills: '',
  });

  // Fetch existing need
  const { data: need, isLoading } = useQuery({
    queryKey: ['need', id],
    queryFn: async () => {
      const { data } = await api.get(`/mutual-aid/needs/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // Populate form with existing data
  useEffect(() => {
    if (need) {
      setFormData({
        scope: need.scope || 'INDIVIDUAL',
        type: need.type || 'URGENT',
        title: need.title || '',
        description: need.description || '',
        location: need.location || '',
        urgencyLevel: need.urgencyLevel || 'MEDIUM',
        targetEur: need.targetEur?.toString() || '',
        targetCredits: need.targetCredits?.toString() || '',
        targetHours: need.targetHours?.toString() || '',
        neededSkills: need.neededSkills?.join('\n') || '',
      });
    }
  }, [need]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/mutual-aid/needs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Necesidad actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['need', id] });
      router.push(`/mutual-aid/needs/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la necesidad');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build resourceTypes array from filled fields
    const resourceTypes = [];
    if (formData.targetEur) resourceTypes.push('MONEY');
    if (formData.targetCredits) resourceTypes.push('CREDITS');
    if (formData.targetHours) resourceTypes.push('TIME');

    if (resourceTypes.length === 0) {
      toast.error('Debes especificar al menos un tipo de recurso (dinero, créditos o tiempo)');
      return;
    }

    const payload = {
      scope: formData.scope,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      urgencyLevel: formData.urgencyLevel,
      resourceTypes,
      targetEur: formData.targetEur ? parseFloat(formData.targetEur) : undefined,
      targetCredits: formData.targetCredits ? parseInt(formData.targetCredits) : undefined,
      targetHours: formData.targetHours ? parseInt(formData.targetHours) : undefined,
      neededSkills: formData.neededSkills.split('\n').map(s => s.trim()).filter(Boolean),
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!need) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Necesidad no encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Editar Necesidad
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Scope & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Alcance *
                    </label>
                    <select
                      name="scope"
                      value={formData.scope}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {SCOPES.map(scope => (
                        <option key={scope.value} value={scope.value}>{scope.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Location & Urgency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nivel de Urgencia *
                    </label>
                    <select
                      name="urgencyLevel"
                      value={formData.urgencyLevel}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {URGENCY_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resource Targets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Recursos Necesarios (especifica al menos uno)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Dinero (€)
                      </label>
                      <input
                        type="number"
                        name="targetEur"
                        value={formData.targetEur}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Créditos
                      </label>
                      <input
                        type="number"
                        name="targetCredits"
                        value={formData.targetCredits}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Horas de Tiempo
                      </label>
                      <input
                        type="number"
                        name="targetHours"
                        value={formData.targetHours}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Needed Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Habilidades Necesarias
                  </label>
                  <textarea
                    name="neededSkills"
                    value={formData.neededSkills}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Una habilidad por línea&#10;Ej: Carpintería&#10;Fontanería&#10;Electricidad"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Necesidad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
