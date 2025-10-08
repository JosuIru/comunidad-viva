import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { toast } from 'react-hot-toast';

type CommunityType = 'NEIGHBORHOOD' | 'VILLAGE' | 'TOWN' | 'COUNTY' | 'REGION' | 'CUSTOM';
type CommunityVisibility = 'PRIVATE' | 'PUBLIC' | 'OPEN' | 'FEDERATED';

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location?: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  membersCount: number;
  activeOffersCount: number;
  createdAt: string;
}

interface CreateCommunityForm {
  slug: string;
  name: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  radiusKm: number;
  type: CommunityType;
  visibility: CommunityVisibility;
  requiresApproval: boolean;
  allowExternalOffers: boolean;
  primaryColor: string;
  language: string;
  currency: string;
}

export default function CommunitiesAdminPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateCommunityForm>({
    slug: '',
    name: '',
    description: '',
    location: '',
    radiusKm: 5,
    type: 'NEIGHBORHOOD',
    visibility: 'PUBLIC',
    requiresApproval: false,
    allowExternalOffers: true,
    primaryColor: '#4CAF50',
    language: 'es',
    currency: 'EUR',
  });

  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ['communities'],
    queryFn: async () => {
      const response = await api.get('/communities');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCommunityForm) => {
      const response = await api.post('/communities', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Comunidad creada exitosamente!');
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear comunidad');
    },
  });

  const resetForm = () => {
    setFormData({
      slug: '',
      name: '',
      description: '',
      location: '',
      radiusKm: 5,
      type: 'NEIGHBORHOOD',
      visibility: 'PUBLIC',
      requiresApproval: false,
      allowExternalOffers: true,
      primaryColor: '#4CAF50',
      language: 'es',
      currency: 'EUR',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseFloat(value)
          : value,
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData((prev) => ({ ...prev, slug }));
  };

  if (isLoading) {
    return (
      <Layout title="Admin - Comunidades">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin - Gestión de Comunidades">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Comunidades</h1>
              <p className="text-gray-600 mt-2">
                Administra y crea nuevas comunidades locales
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {showForm ? '✕ Cancelar' : '+ Nueva Comunidad'}
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Crear Nueva Comunidad</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Barrio de Gracia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug (URL) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="gracia-barcelona"
                      />
                      <button
                        type="button"
                        onClick={generateSlug}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe tu comunidad..."
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Barcelona, España"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Radio (km)
                    </label>
                    <input
                      type="number"
                      name="radiusKm"
                      value={formData.radiusKm}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitud
                    </label>
                    <input
                      type="number"
                      name="lat"
                      value={formData.lat || ''}
                      onChange={handleChange}
                      step="0.0001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="41.4036"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitud
                    </label>
                    <input
                      type="number"
                      name="lng"
                      value={formData.lng || ''}
                      onChange={handleChange}
                      step="0.0001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2.1589"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color Principal
                    </label>
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="NEIGHBORHOOD">Barrio</option>
                      <option value="VILLAGE">Pueblo</option>
                      <option value="TOWN">Ciudad</option>
                      <option value="COUNTY">Comarca</option>
                      <option value="REGION">Región</option>
                      <option value="CUSTOM">Personalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Visibilidad *
                    </label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="PRIVATE">Privada</option>
                      <option value="PUBLIC">Pública (con aprobación)</option>
                      <option value="OPEN">Abierta (cualquiera puede unirse)</option>
                      <option value="FEDERATED">Federada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="es">Español</option>
                      <option value="eu">Euskera</option>
                      <option value="ca">Catalán</option>
                      <option value="gl">Gallego</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="requiresApproval"
                      checked={formData.requiresApproval}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Requiere aprobación manual para nuevos miembros
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="allowExternalOffers"
                      checked={formData.allowExternalOffers}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Permitir ofertas de comunidades conectadas
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear Comunidad'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Communities List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Comunidades Existentes ({communities?.length || 0})
              </h2>
            </div>

            {communities && communities.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {communities.map((community) => (
                  <div key={community.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {community.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">/{community.slug}</p>
                        {community.description && (
                          <p className="text-gray-700 mb-3">{community.description}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-600">
                            📍 {community.location || 'Sin ubicación'}
                          </span>
                          <span className="text-gray-600">
                            👥 {community.membersCount} miembros
                          </span>
                          <span className="text-gray-600">
                            🛍️ {community.activeOffersCount} ofertas
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            community.visibility === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : community.visibility === 'PUBLIC'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {community.visibility}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {community.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <div className="text-6xl mb-4">🏘️</div>
                <p className="text-lg">No hay comunidades creadas todavía</p>
                <p className="text-sm mt-2">Crea la primera comunidad usando el botón de arriba</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
