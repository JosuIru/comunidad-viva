import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const SOLUTION_TYPES = [
  { value: 'SPACE_BANK', label: 'Banco de Espacios', description: 'Intercambio temporal de espacios habitables' },
  { value: 'TEMPORARY_HOUSING', label: 'Vivienda Temporal', description: 'Alojamiento temporal para personas en transición' },
  { value: 'HOUSING_COOP', label: 'Cooperativa de Vivienda', description: 'Propiedad colectiva de vivienda' },
  { value: 'COMMUNITY_GUARANTEE', label: 'Aval Comunitario', description: 'Garantía colectiva para alquiler' },
];

export default function NewHousingSolutionPage() {
  const router = useRouter();
  const [solutionType, setSolutionType] = useState('SPACE_BANK');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    capacity: '',
    monthlyContribution: '',
    initialContribution: '',
    targetMembers: '',
    guaranteeAmount: '',
    minStayDays: '',
    maxStayDays: '',
    requirements: '',
    rules: '',
    amenities: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/housing/solutions', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Solución de vivienda creada exitosamente');
      router.push(`/housing/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la solución');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      solutionType,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      requirements: formData.requirements.split('\n').filter(Boolean),
      rules: formData.rules.split('\n').filter(Boolean),
    };

    // Add type-specific fields
    if (solutionType === 'SPACE_BANK') {
      payload.capacity = parseInt(formData.capacity);
      payload.amenities = formData.amenities.split('\n').filter(Boolean);
      if (formData.minStayDays) payload.minStayDays = parseInt(formData.minStayDays);
      if (formData.maxStayDays) payload.maxStayDays = parseInt(formData.maxStayDays);
    }

    if (solutionType === 'TEMPORARY_HOUSING') {
      payload.capacity = parseInt(formData.capacity);
      payload.amenities = formData.amenities.split('\n').filter(Boolean);
      if (formData.minStayDays) payload.minStayDays = parseInt(formData.minStayDays);
      if (formData.maxStayDays) payload.maxStayDays = parseInt(formData.maxStayDays);
    }

    if (solutionType === 'HOUSING_COOP') {
      payload.targetMembers = parseInt(formData.targetMembers);
      if (formData.initialContribution) payload.initialContribution = parseFloat(formData.initialContribution);
      if (formData.monthlyContribution) payload.monthlyContribution = parseFloat(formData.monthlyContribution);
    }

    if (solutionType === 'COMMUNITY_GUARANTEE') {
      if (formData.guaranteeAmount) payload.guaranteeAmount = parseFloat(formData.guaranteeAmount);
      if (formData.monthlyContribution) payload.monthlyContribution = parseFloat(formData.monthlyContribution);
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
                Nueva Solución de Vivienda
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Solution Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Solución *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SOLUTION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setSolutionType(type.value)}
                        className={`p-4 border-2 rounded-lg text-left transition ${
                          solutionType === type.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                      </button>
                    ))}
                  </div>
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
                    placeholder="Ej: Piso compartido en el centro"
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
                    placeholder="Describe los detalles de esta solución de vivienda..."
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

                {/* Conditional Fields Based on Type */}
                {(solutionType === 'SPACE_BANK' || solutionType === 'TEMPORARY_HOUSING') && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Capacidad *
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Personas"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Estancia Mínima (días)
                        </label>
                        <input
                          type="number"
                          name="minStayDays"
                          value={formData.minStayDays}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Estancia Máxima (días)
                        </label>
                        <input
                          type="number"
                          name="maxStayDays"
                          value={formData.maxStayDays}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Comodidades
                      </label>
                      <textarea
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Una comodidad por línea&#10;Ej: WiFi&#10;Cocina equipada&#10;Lavadora"
                      />
                    </div>
                  </>
                )}

                {solutionType === 'HOUSING_COOP' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Miembros Objetivo *
                        </label>
                        <input
                          type="number"
                          name="targetMembers"
                          value={formData.targetMembers}
                          onChange={handleChange}
                          required
                          min="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Aportación Inicial (€)
                        </label>
                        <input
                          type="number"
                          name="initialContribution"
                          value={formData.initialContribution}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contribución Mensual (€)
                      </label>
                      <input
                        type="number"
                        name="monthlyContribution"
                        value={formData.monthlyContribution}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {solutionType === 'COMMUNITY_GUARANTEE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Monto del Aval (€)
                      </label>
                      <input
                        type="number"
                        name="guaranteeAmount"
                        value={formData.guaranteeAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contribución Mensual (€)
                      </label>
                      <input
                        type="number"
                        name="monthlyContribution"
                        value={formData.monthlyContribution}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requisitos
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Un requisito por línea&#10;Ej: No fumadores&#10;Respetar horarios de descanso"
                  />
                </div>

                {/* Rules */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Normas
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Una norma por línea&#10;Ej: Limpieza de espacios comunes&#10;No ruido después de las 22h"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
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
                    {createMutation.isPending ? 'Creando...' : 'Crear Solución'}
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
