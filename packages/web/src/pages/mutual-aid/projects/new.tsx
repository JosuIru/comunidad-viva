import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createProjectSchema, type CreateProjectFormData } from '@/lib/validations';

export default function NewProjectPage() {
  const router = useRouter();
  const t = useTranslations('mutualAid');
  const tCommon = useTranslations('common');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);

  const PROJECT_TYPES = [
    { value: 'INFRASTRUCTURE', label: t('newProject.types.INFRASTRUCTURE') },
    { value: 'WATER_SANITATION', label: t('newProject.types.WATER_SANITATION') },
    { value: 'EDUCATION', label: t('projectType.EDUCATION') },
    { value: 'HEALTH', label: t('projectType.HEALTH') },
    { value: 'ENVIRONMENT', label: t('projectType.ENVIRONMENT') },
    { value: 'AGRICULTURE', label: t('newProject.types.AGRICULTURE') },
    { value: 'ENERGY', label: t('newProject.types.ENERGY') },
    { value: 'HOUSING', label: t('needType.HOUSING') },
    { value: 'AUZOLAN', label: t('newProject.types.AUZOLAN') },
    { value: 'CULTURAL', label: t('projectType.CULTURAL') },
    { value: 'TECHNOLOGY', label: t('newProject.types.TECHNOLOGY') },
    { value: 'EMERGENCY_RELIEF', label: t('newProject.types.EMERGENCY_RELIEF') },
  ];

  const SDG_GOALS = [
    { value: 1, label: t('sdg.1') },
    { value: 2, label: t('sdg.2') },
    { value: 3, label: t('sdg.3') },
    { value: 4, label: t('sdg.4') },
    { value: 5, label: t('sdg.5') },
    { value: 6, label: t('sdg.6') },
    { value: 7, label: t('sdg.7') },
    { value: 8, label: t('sdg.8') },
    { value: 9, label: t('sdg.9') },
    { value: 10, label: t('sdg.10') },
    { value: 11, label: t('sdg.11') },
    { value: 12, label: t('sdg.12') },
    { value: 13, label: t('sdg.13') },
    { value: 14, label: t('sdg.14') },
    { value: 15, label: t('sdg.15') },
    { value: 16, label: t('sdg.16') },
    { value: 17, label: t('sdg.17') },
  ];

  // Initialize form validation
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    createOnChange,
    validateForm,
  } = useFormValidation<CreateProjectFormData>({
    schema: createProjectSchema,
    initialData: {
      title: '',
      description: '',
      type: 'INFRASTRUCTURE',
      location: '',
      country: '',
      lat: 0,
      lng: 0,
      impactGoals: [],
      sdgGoals: [],
      tags: [],
      images: [],
    },
  });

  // Toggle SDG selection
  const toggleSDG = (sdgValue: number) => {
    setSelectedSDGs((prev) => {
      const newSDGs = prev.includes(sdgValue)
        ? prev.filter((value) => value !== sdgValue)
        : [...prev, sdgValue];

      // Sync with formData
      handleChange('sdgGoals', newSDGs);
      return newSDGs;
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/mutual-aid/projects', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t('newProject.toasts.success'));
      router.push(`/mutual-aid/projects/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('newProject.toasts.error'));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Prepare project data with validated data
    const payload: any = {
      title: validation.data.title,
      description: validation.data.description,
      type: validation.data.type,
      location: validation.data.location,
      country: validation.data.country,
      lat: validation.data.lat,
      lng: validation.data.lng,
      impactGoals: validation.data.impactGoals,
      sdgGoals: validation.data.sdgGoals,
      ...(validation.data.vision && { vision: validation.data.vision }),
      ...(validation.data.targetEur && { targetEur: validation.data.targetEur }),
      ...(validation.data.targetCredits && { targetCredits: validation.data.targetCredits }),
      ...(validation.data.beneficiaries && { beneficiaries: validation.data.beneficiaries }),
      ...(validation.data.volunteersNeeded && { volunteersNeeded: validation.data.volunteersNeeded }),
      ...(validation.data.estimatedMonths && { estimatedMonths: validation.data.estimatedMonths }),
      ...(validation.data.tags && validation.data.tags.length > 0 && { tags: validation.data.tags }),
    };

    createMutation.mutate(payload);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('newProject.title')}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newProject.labels.projectType')} *
                  </label>
                  <select
                    name="type"
                    value={formData.type ?? 'INFRASTRUCTURE'}
                    onChange={createOnChange('type')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newProject.labels.projectTitle')} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title ?? ''}
                    onChange={createOnChange('title')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('projectTitlePlaceholder')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newProject.labels.description')} *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description ?? ''}
                    onChange={createOnChange('description')}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('projectDescPlaceholder')}
                  />
                </div>

                {/* Vision */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newProject.labels.vision')} *
                  </label>
                  <textarea
                    name="vision"
                    value={formData.vision ?? ''}
                    onChange={createOnChange('vision')}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('impactPlaceholder')}
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('newProject.labels.location')} *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location ?? ''}
                      onChange={createOnChange('location')}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder={t('cityPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('newProject.labels.country')} *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country ?? ''}
                      onChange={createOnChange('country')}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder={t('countryPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('newProject.labels.region')}
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={formData.lat ?? ''}
                      onChange={createOnChange('lat', (v) => v === '' ? 0 : parseFloat(v))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder={t('regionPlaceholder')}
                    />
                  </div>
                </div>

                {/* Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('newProject.labels.beneficiaries')}
                    </label>
                    <input
                      type="number"
                      name="beneficiaries"
                      value={formData.beneficiaries ?? ''}
                      onChange={createOnChange('beneficiaries', (v) => v === '' ? undefined : parseInt(v, 10))}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder={t('beneficiariesPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('newProject.labels.estimatedDuration')}
                    </label>
                    <input
                      type="number"
                      name="estimatedMonths"
                      value={formData.estimatedMonths ?? ''}
                      onChange={createOnChange('estimatedMonths', (v) => v === '' ? undefined : parseInt(v, 10))}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder={t('newProject.placeholders.months')}
                    />
                  </div>
                </div>

                {/* Resources Needed */}
                <div className="border-t dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {t('newProject.sections.resourcesNeeded')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newProject.labels.targetEur')}
                      </label>
                      <input
                        type="number"
                        name="targetEur"
                        value={formData.targetEur ?? ''}
                        onChange={createOnChange('targetEur', (v) => v === '' ? undefined : parseFloat(v))}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newProject.labels.targetCredits')}
                      </label>
                      <input
                        type="number"
                        name="targetCredits"
                        value={formData.targetCredits ?? ''}
                        onChange={createOnChange('targetCredits', (v) => v === '' ? undefined : parseInt(v, 10))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newProject.labels.volunteerHours')}
                      </label>
                      <input
                        type="number"
                        name="volunteersNeeded"
                        value={formData.volunteersNeeded ?? ''}
                        onChange={createOnChange('volunteersNeeded', (v) => v === '' ? undefined : parseInt(v, 10))}
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newProject.labels.volunteersNeeded')}
                      </label>
                      <input
                        type="number"
                        name="lng"
                        value={formData.lng ?? ''}
                        onChange={createOnChange('lng', (v) => v === '' ? 0 : parseFloat(v))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Impact Goals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newProject.labels.impactGoals')} *
                  </label>
                  <textarea
                    name="impactGoals"
                    value={Array.isArray(formData.impactGoals) ? formData.impactGoals.join(', ') : formData.impactGoals ?? ''}
                    onChange={createOnChange('impactGoals', (v) => v.split(',').map(s => s.trim()).filter(Boolean))}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('newProject.placeholders.impactGoals')}
                  />
                </div>

                {/* SDG Goals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('sdg.title')}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    {SDG_GOALS.map((sdg) => (
                      <label key={sdg.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSDGs.includes(sdg.value)}
                          onChange={() => toggleSDG(sdg.value)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm dark:text-gray-300">{sdg.value}. {sdg.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newProject.labels.tags')}
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags ?? ''}
                    onChange={createOnChange('tags', (v) => v.split(',').map(s => s.trim()).filter(Boolean))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('newProject.placeholders.tags')}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {createMutation.isPending ? t('newProject.buttons.creating') : t('newProject.buttons.create')}
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

export const getStaticProps = async (context: any) => getI18nProps(context);
