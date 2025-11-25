import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createNeedSchema, type CreateNeedFormData } from '@/lib/validations';

export default function NewNeedPage() {
  const router = useRouter();
  const t = useTranslations('mutualAid');
  const tCommon = useTranslations('common');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const SCOPE_OPTIONS: Array<{ value: 'INDIVIDUAL' | 'FAMILY' | 'COMMUNITY'; label: string; description: string }> = [
    { value: 'INDIVIDUAL', label: t('scope.PERSONAL'), description: t('newNeed.scopeDescriptions.PERSONAL') },
    { value: 'FAMILY', label: t('scope.FAMILY') || 'Familia', description: t('newNeed.scopeDescriptions.FAMILY') || 'Para tu familia' },
    { value: 'COMMUNITY', label: t('scope.COMMUNITY'), description: t('newNeed.scopeDescriptions.COMMUNITY') },
  ];

  const TYPE_OPTIONS = [
    { value: 'FOOD', label: t('needType.FOOD') },
    { value: 'HOUSING', label: t('needType.HOUSING') },
    { value: 'HEALTH', label: t('needType.HEALTH') },
    { value: 'EDUCATION', label: t('needType.EDUCATION') },
    { value: 'INFRASTRUCTURE', label: t('newNeed.types.INFRASTRUCTURE') },
    { value: 'WATER_SANITATION', label: t('newNeed.types.WATER_SANITATION') },
    { value: 'ENVIRONMENT', label: t('newNeed.types.ENVIRONMENT') },
    { value: 'AUZOLAN', label: t('newNeed.types.AUZOLAN') },
  ];

  // Initialize form validation
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    createOnChange,
    validateForm,
    setFormData,
  } = useFormValidation<CreateNeedFormData>({
    schema: createNeedSchema,
    initialData: {
      title: '',
      description: '',
      scope: 'INDIVIDUAL',
      type: 'FOOD',
      urgencyLevel: 'MEDIUM',
      resourceTypes: ['EUR'],
      neededSkills: [],
      images: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/mutual-aid/needs', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t('newNeed.toasts.success'));
      router.push(`/mutual-aid/needs/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('newNeed.toasts.error'));
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

    // Prepare need data with validated data
    const payload: any = {
      title: validation.data.title,
      description: validation.data.description,
      scope: validation.data.scope,
      type: validation.data.type,
      urgencyLevel: validation.data.urgencyLevel,
      resourceTypes: validation.data.resourceTypes,
      ...(validation.data.targetEur && { targetEur: validation.data.targetEur }),
      ...(validation.data.targetCredits && { targetCredits: validation.data.targetCredits }),
      ...(validation.data.targetHours && { targetHours: validation.data.targetHours }),
      ...(validation.data.neededSkills && validation.data.neededSkills.length > 0 && { neededSkills: validation.data.neededSkills }),
      ...(validation.data.location && { location: validation.data.location }),
      ...(validation.data.lat && { lat: validation.data.lat }),
      ...(validation.data.lng && { lng: validation.data.lng }),
    };

    createMutation.mutate(payload);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('newNeed.title')}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Scope */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newNeed.labels.scope')} *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SCOPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, scope: option.value })}
                        className={`p-3 border-2 rounded-lg text-left transition ${
                          formData.scope === option.value
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{option.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newNeed.labels.type')} *
                  </label>
                  <select
                    name="type"
                    value={formData.type ?? 'FOOD'}
                    onChange={createOnChange('type')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newNeed.labels.needTitle')} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title ?? ''}
                    onChange={createOnChange('title')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('needTitlePlaceholder')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newNeed.labels.description')} *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description ?? ''}
                    onChange={createOnChange('description')}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('needDescPlaceholder')}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newNeed.labels.location')} *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location ?? ''}
                    onChange={createOnChange('location')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('newNeed.placeholders.location')}
                  />
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newNeed.labels.urgencyLevel')}: {formData.urgencyLevel}/10
                  </label>
                  <input
                    type="range"
                    name="urgencyLevel"
                    value={formData.urgencyLevel ?? 'MEDIUM'}
                    onChange={createOnChange('urgencyLevel')}
                    min="1"
                    max="10"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{t('newNeed.urgency.low')}</span>
                    <span>{t('newNeed.urgency.medium')}</span>
                    <span>{t('newNeed.urgency.high')}</span>
                  </div>
                </div>

                {/* Resources Needed */}
                <div className="border-t dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {t('newNeed.sections.resourcesNeeded')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('newNeed.resourcesDescription')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newNeed.labels.euros')}
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
                        {t('newNeed.labels.credits')}
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
                        {t('newNeed.labels.hours')}
                      </label>
                      <input
                        type="number"
                        name="targetHours"
                        value={formData.targetHours ?? ''}
                        onChange={createOnChange('targetHours', (v) => v === '' ? undefined : parseFloat(v))}
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Needed Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newNeed.labels.neededSkills')}
                  </label>
                  <textarea
                    name="neededSkills"
                    value={Array.isArray(formData.neededSkills) ? formData.neededSkills.join(', ') : formData.neededSkills ?? ''}
                    onChange={createOnChange('neededSkills', (v) => v.split(',').map(s => s.trim()).filter(Boolean))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('newNeed.placeholders.skills')}
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
                    {createMutation.isPending ? t('newNeed.buttons.publishing') : t('newNeed.buttons.publish')}
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
