import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('adminCommunities');
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
      toast.success(t('toasts.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('toasts.createError'));
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

  const geocodeLocation = async () => {
    if (!formData.location) {
      toast.error(t('toasts.locationRequired'));
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        }));
        toast.success(t('toasts.geocodeSuccess'));
      } else {
        toast.error(t('toasts.geocodeNotFound'));
      }
    } catch (error) {
      toast.error(t('toasts.geocodeError'));
    }
  };

  if (isLoading) {
    return (
      <Layout title={t('layout.loadingTitle')}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">{t('loading.text')}</div>
        </div>
      </Layout>
    );
  }

  const typeOptions: Array<{ value: CommunityType; label: string }> = [
    { value: 'NEIGHBORHOOD', label: t('selects.typeOptions.NEIGHBORHOOD') },
    { value: 'VILLAGE', label: t('selects.typeOptions.VILLAGE') },
    { value: 'TOWN', label: t('selects.typeOptions.TOWN') },
    { value: 'COUNTY', label: t('selects.typeOptions.COUNTY') },
    { value: 'REGION', label: t('selects.typeOptions.REGION') },
    { value: 'CUSTOM', label: t('selects.typeOptions.CUSTOM') },
  ];

  const visibilityOptions: Array<{ value: CommunityVisibility; label: string }> = [
    { value: 'PRIVATE', label: t('selects.visibilityOptions.PRIVATE') },
    { value: 'PUBLIC', label: t('selects.visibilityOptions.PUBLIC') },
    { value: 'OPEN', label: t('selects.visibilityOptions.OPEN') },
    { value: 'FEDERATED', label: t('selects.visibilityOptions.FEDERATED') },
  ];

  const languageOptions = [
    { value: 'es', label: t('selects.languageOptions.es') },
    { value: 'eu', label: t('selects.languageOptions.eu') },
    { value: 'ca', label: t('selects.languageOptions.ca') },
    { value: 'gl', label: t('selects.languageOptions.gl') },
    { value: 'en', label: t('selects.languageOptions.en') },
  ];

  const currencyOptions = [
    { value: 'EUR', label: t('selects.currencyOptions.EUR') },
    { value: 'USD', label: t('selects.currencyOptions.USD') },
    { value: 'GBP', label: t('selects.currencyOptions.GBP') },
  ];

  const visibilityLabels: Record<CommunityVisibility, string> = {
    PRIVATE: t('selects.visibilityOptions.PRIVATE'),
    PUBLIC: t('selects.visibilityOptions.PUBLIC'),
    OPEN: t('selects.visibilityOptions.OPEN'),
    FEDERATED: t('selects.visibilityOptions.FEDERATED'),
  };

  const typeLabels: Record<CommunityType, string> = {
    NEIGHBORHOOD: t('selects.typeOptions.NEIGHBORHOOD'),
    VILLAGE: t('selects.typeOptions.VILLAGE'),
    TOWN: t('selects.typeOptions.TOWN'),
    COUNTY: t('selects.typeOptions.COUNTY'),
    REGION: t('selects.typeOptions.REGION'),
    CUSTOM: t('selects.typeOptions.CUSTOM'),
  };

  return (
    <Layout title={t('layout.title')}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('header.title')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('header.description')}</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {showForm ? t('header.cancel') : t('header.new')}
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('form.title')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.name.label')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('form.fields.name.placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.slug.label')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('form.fields.slug.placeholder')}
                      />
                      <button
                        type="button"
                        onClick={generateSlug}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
                      >
                        {t('form.fields.slug.auto')}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.fields.description.label')}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('form.fields.description.placeholder')}
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.location.label')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('form.fields.location.placeholder')}
                      />
                      <button
                        type="button"
                        onClick={geocodeLocation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
                      >
                        {t('form.fields.location.button')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.radius')}
                    </label>
                    <input
                      type="number"
                      name="radiusKm"
                      value={formData.radiusKm}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.latitude.label')}{' '}
                      {formData.lat && (
                        <span className="text-xs text-green-600 dark:text-green-400">{t('form.fields.latitude.autoFilled')}</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="lat"
                      value={formData.lat || ''}
                      onChange={handleChange}
                      step="0.0001"
                      className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100 ${
                        formData.lat ? 'bg-green-50 dark:bg-green-900' : 'dark:bg-gray-700'
                      }`}
                      placeholder={t('form.fields.latitude.placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.longitude.label')}{' '}
                      {formData.lng && (
                        <span className="text-xs text-green-600 dark:text-green-400">{t('form.fields.longitude.autoFilled')}</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="lng"
                      value={formData.lng || ''}
                      onChange={handleChange}
                      step="0.0001"
                      className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100 ${
                        formData.lng ? 'bg-green-50 dark:bg-green-900' : 'dark:bg-gray-700'
                      }`}
                      placeholder={t('form.fields.longitude.placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.primaryColor')}
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.type')}
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.visibility')}
                    </label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {visibilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.language')}
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {languageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('form.fields.currency')}
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('form.checkboxes.requiresApproval')}
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('form.checkboxes.allowExternalOffers')}
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
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    {t('form.actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                  >
                    {createMutation.isPending ? t('form.actions.submitting') : t('form.actions.submit')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Communities List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('list.title', { count: communities?.length || 0 })}
              </h2>
            </div>

            {communities && communities.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {communities.map((community) => (
                  <div key={community.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {community.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">/{community.slug}</p>
                        {community.description && (
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{community.description}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            📍 {community.location || t('list.locationUnknown')}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            👥 {t('list.members', { count: community.membersCount })}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            🛍️ {t('list.offers', { count: community.activeOffersCount })}
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
                          {visibilityLabels[community.visibility]}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {typeLabels[community.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">🏘️</div>
                <p className="text-lg">{t('empty.title')}</p>
                <p className="text-sm mt-2">{t('empty.description')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
