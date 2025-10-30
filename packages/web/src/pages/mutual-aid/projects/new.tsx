import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

const PROJECT_TYPES = [
  { value: 'INFRASTRUCTURE', label: 'Infraestructura' },
  { value: 'WATER_SANITATION', label: 'Agua y Saneamiento' },
  { value: 'EDUCATION', label: 'Educación' },
  { value: 'HEALTH', label: 'Salud' },
  { value: 'ENVIRONMENT', label: 'Medio Ambiente' },
  { value: 'AGRICULTURE', label: 'Agricultura' },
  { value: 'ENERGY', label: 'Energía' },
  { value: 'HOUSING', label: 'Vivienda' },
  { value: 'AUZOLAN', label: 'Auzolan' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'TECHNOLOGY', label: 'Tecnología' },
  { value: 'EMERGENCY_RELIEF', label: 'Ayuda de Emergencia' },
];

const SDG_GOALS = [
  { value: 1, label: '1. Fin de la Pobreza' },
  { value: 2, label: '2. Hambre Cero' },
  { value: 3, label: '3. Salud y Bienestar' },
  { value: 4, label: '4. Educación de Calidad' },
  { value: 5, label: '5. Igualdad de Género' },
  { value: 6, label: '6. Agua Limpia y Saneamiento' },
  { value: 7, label: '7. Energía Asequible y No Contaminante' },
  { value: 8, label: '8. Trabajo Decente y Crecimiento Económico' },
  { value: 9, label: '9. Industria, Innovación e Infraestructura' },
  { value: 10, label: '10. Reducción de Desigualdades' },
  { value: 11, label: '11. Ciudades y Comunidades Sostenibles' },
  { value: 12, label: '12. Producción y Consumo Responsables' },
  { value: 13, label: '13. Acción por el Clima' },
  { value: 14, label: '14. Vida Submarina' },
  { value: 15, label: '15. Vida de Ecosistemas Terrestres' },
  { value: 16, label: '16. Paz, Justicia e Instituciones Sólidas' },
  { value: 17, label: '17. Alianzas para Lograr los Objetivos' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: 'INFRASTRUCTURE',
    title: '',
    description: '',
    vision: '',
    location: '',
    country: '',
    region: '',
    beneficiaries: '',
    targetEur: '',
    targetCredits: '',
    targetHours: '',
    volunteersNeeded: '',
    estimatedMonths: '',
    impactGoals: '',
    tags: '',
  });
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/mutual-aid/projects', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Proyecto creado exitosamente');
      router.push(`/mutual-aid/projects/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el proyecto');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      vision: formData.vision,
      location: formData.location,
      country: formData.country,
      region: formData.region || undefined,
      impactGoals: formData.impactGoals.split('\n').filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      sdgGoals: selectedSDGs,
    };

    if (formData.beneficiaries) {
      payload.beneficiaries = parseInt(formData.beneficiaries);
    }

    if (formData.targetEur) {
      payload.targetEur = parseFloat(formData.targetEur);
    }

    if (formData.targetCredits) {
      payload.targetCredits = parseInt(formData.targetCredits);
    }

    if (formData.targetHours) {
      payload.targetHours = parseFloat(formData.targetHours);
    }

    if (formData.volunteersNeeded) {
      payload.volunteersNeeded = parseInt(formData.volunteersNeeded);
    }

    if (formData.estimatedMonths) {
      payload.estimatedMonths = parseInt(formData.estimatedMonths);
    }

    createMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleSDG = (sdg: number) => {
    setSelectedSDGs(prev =>
      prev.includes(sdg) ? prev.filter(s => s !== sdg) : [...prev, sdg]
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Crear Proyecto Comunitario
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Proyecto *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PROJECT_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Escuela en Ghana"
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
                    placeholder="Describe el proyecto en detalle..."
                  />
                </div>

                {/* Vision */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Visión *
                  </label>
                  <textarea
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="¿Qué impacto quieres lograr con este proyecto?"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      País *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="País"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Región
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Región/Estado"
                    />
                  </div>
                </div>

                {/* Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Beneficiarios
                    </label>
                    <input
                      type="number"
                      name="beneficiaries"
                      value={formData.beneficiaries}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Número de personas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duración Estimada (meses)
                    </label>
                    <input
                      type="number"
                      name="estimatedMonths"
                      value={formData.estimatedMonths}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Meses"
                    />
                  </div>
                </div>

                {/* Resources Needed */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recursos Necesarios
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Meta en Euros (€)
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
                        Meta en Créditos
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
                        Horas de Voluntariado
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

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Voluntarios Necesarios
                      </label>
                      <input
                        type="number"
                        name="volunteersNeeded"
                        value={formData.volunteersNeeded}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Impact Goals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Objetivos de Impacto *
                  </label>
                  <textarea
                    name="impactGoals"
                    value={formData.impactGoals}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Un objetivo por línea&#10;Ej: Proveer educación a 200 niños&#10;Construir 4 aulas equipadas&#10;Formar 10 profesores locales"
                  />
                </div>

                {/* SDG Goals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Objetivos de Desarrollo Sostenible (ODS)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {SDG_GOALS.map((sdg) => (
                      <label key={sdg.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSDGs.includes(sdg.value)}
                          onChange={() => toggleSDG(sdg.value)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm">{sdg.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="educación, infantil, África (separadas por comas)"
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
                    {createMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
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
