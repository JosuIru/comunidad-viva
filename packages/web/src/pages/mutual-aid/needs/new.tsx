import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const SCOPE_OPTIONS = [
  { value: 'PERSONAL', label: 'Personal', description: 'Necesidad individual' },
  { value: 'COMMUNITY', label: 'Comunitaria', description: 'Para tu comunidad local' },
  { value: 'INTERCOMMUNITY', label: 'Intercomunitaria', description: 'Entre varias comunidades' },
  { value: 'GLOBAL', label: 'Global', description: 'Impacto global o internacional' },
];

const TYPE_OPTIONS = [
  { value: 'FOOD', label: 'Alimentos' },
  { value: 'HOUSING', label: 'Vivienda' },
  { value: 'HEALTH', label: 'Salud' },
  { value: 'EDUCATION', label: 'Educación' },
  { value: 'INFRASTRUCTURE', label: 'Infraestructura' },
  { value: 'WATER_SANITATION', label: 'Agua y Saneamiento' },
  { value: 'ENVIRONMENT', label: 'Medio Ambiente' },
  { value: 'AUZOLAN', label: 'Auzolan' },
];

export default function NewNeedPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    scope: 'PERSONAL',
    type: 'FOOD',
    title: '',
    description: '',
    location: '',
    targetEur: '',
    targetCredits: '',
    targetHours: '',
    neededSkills: '',
    urgencyLevel: '5',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/mutual-aid/needs', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Necesidad publicada exitosamente');
      router.push(`/mutual-aid/needs/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al publicar la necesidad');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      scope: formData.scope,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      urgencyLevel: parseInt(formData.urgencyLevel),
      resourceTypes: [],
    };

    if (formData.targetEur) {
      payload.targetEur = parseFloat(formData.targetEur);
      payload.resourceTypes.push('EUR');
    }

    if (formData.targetCredits) {
      payload.targetCredits = parseInt(formData.targetCredits);
      payload.resourceTypes.push('CREDITS');
    }

    if (formData.targetHours) {
      payload.targetHours = parseFloat(formData.targetHours);
      payload.resourceTypes.push('TIME_HOURS');
    }

    if (formData.neededSkills) {
      payload.neededSkills = formData.neededSkills.split('\n').filter(Boolean);
      if (!payload.resourceTypes.includes('SKILLS')) {
        payload.resourceTypes.push('SKILLS');
      }
    }

    if (payload.resourceTypes.length === 0) {
      toast.error('Debes especificar al menos un tipo de recurso necesario');
      return;
    }

    createMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Publicar Necesidad
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Scope */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alcance *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SCOPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, scope: option.value })}
                        className={`p-3 border-2 rounded-lg text-left transition ${
                          formData.scope === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Necesidad *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Necesito ayuda con..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe tu necesidad con el mayor detalle posible..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Madrid, España"
                  />
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nivel de Urgencia: {formData.urgencyLevel}/10
                  </label>
                  <input
                    type="range"
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Baja</span>
                    <span>Media</span>
                    <span>Alta</span>
                  </div>
                </div>

                {/* Resources Needed */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recursos Necesarios
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Especifica al menos un tipo de recurso que necesitas
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Euros (€)
                      </label>
                      <input
                        type="number"
                        name="targetEur"
                        value={formData.targetEur}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Créditos
                      </label>
                      <input
                        type="number"
                        name="targetCredits"
                        value={formData.targetCredits}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Horas
                      </label>
                      <input
                        type="number"
                        name="targetHours"
                        value={formData.targetHours}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Needed Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Habilidades Necesarias
                  </label>
                  <textarea
                    name="neededSkills"
                    value={formData.neededSkills}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Una habilidad por línea&#10;Ej: carpintería&#10;fontanería&#10;electricidad"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Publicando...' : 'Publicar Necesidad'}
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

export const getStaticProps = getI18nProps;
