import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createHousingSchema, type CreateHousingFormData } from '@/lib/validations';
import { useTranslations } from 'next-intl';

const SOLUTION_TYPE_VALUES = ['SPACE_BANK', 'TEMPORARY_HOUSING', 'HOUSING_COOP', 'COMMUNITY_GUARANTEE'] as const;

export default function NewHousingSolutionPage() {
  const router = useRouter();
  const tToasts = useTranslations('toasts');
  const t = useTranslations('housing');
  const tCommon = useTranslations('common');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [solutionType, setSolutionType] = useState<string>('SPACE_BANK');

  // Initialize form validation
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    validateForm,
  } = useFormValidation<CreateHousingFormData>({
    schema: createHousingSchema,
    initialData: {
      title: '',
      description: '',
      location: '',
      solutionType: 'SPACE_BANK',
      lat: 0,
      lng: 0,
      amenities: [],
      houseRules: [],
      images: [],
    },
  });

  // Sync solutionType with formData
  const handleSolutionTypeChange = (type: string) => {
    setSolutionType(type);
    handleChange('solutionType', type);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/housing/solutions', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(tToasts('success.housingCreated'));
      router.push(`/housing/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || tToasts('error.createHousing'));
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

    // Prepare housing data with validated data
    const payload: any = {
      title: validation.data.title,
      description: validation.data.description,
      location: validation.data.location,
      lat: validation.data.lat,
      lng: validation.data.lng,
      solutionType: validation.data.solutionType,
      ...(validation.data.accommodationType && { accommodationType: validation.data.accommodationType }),
      ...(validation.data.capacity && { capacity: validation.data.capacity }),
      ...(validation.data.beds && { beds: validation.data.beds }),
      ...(validation.data.bathrooms && { bathrooms: validation.data.bathrooms }),
      ...(validation.data.availableFrom && { availableFrom: validation.data.availableFrom }),
      ...(validation.data.availableUntil && { availableUntil: validation.data.availableUntil }),
      ...(validation.data.pricePerNight && { pricePerNight: validation.data.pricePerNight }),
      ...(validation.data.minStay && { minStay: validation.data.minStay }),
      ...(validation.data.maxStay && { maxStay: validation.data.maxStay }),
      ...(validation.data.amenities && validation.data.amenities.length > 0 && { amenities: validation.data.amenities }),
      ...(validation.data.houseRules && validation.data.houseRules.length > 0 && { houseRules: validation.data.houseRules }),
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
                {t('newSolution.pageTitle')}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Solution Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newSolution.solutionTypeLabel')}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SOLUTION_TYPE_VALUES.map((typeValue) => (
                      <button
                        key={typeValue}
                        type="button"
                        onClick={() => handleSolutionTypeChange(typeValue)}
                        className={`p-4 border-2 rounded-lg text-left transition ${
                          solutionType === typeValue
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{t(`solutionTypes.${typeValue}`)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t(`solutionTypeDescriptions.${typeValue}`)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newSolution.titleLabel')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('titlePlaceholder')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newSolution.descriptionLabel')}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('descPlaceholder')}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newSolution.locationLabel')}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('locationPlaceholder')}
                  />
                </div>

                {/* Conditional Fields Based on Type */}
                {(solutionType === 'SPACE_BANK' || solutionType === 'TEMPORARY_HOUSING') && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('newSolution.capacityLabel')}
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder={t('capacityPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('newSolution.minStayLabel')}
                        </label>
                        <input
                          type="number"
                          name="minStayDays"
                          value={formData.minStayDays}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('newSolution.maxStayLabel')}
                        </label>
                        <input
                          type="number"
                          name="maxStayDays"
                          value={formData.maxStayDays}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newSolution.amenitiesLabel')}
                      </label>
                      <textarea
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder={t('amenitiesPlaceholder')}
                      />
                    </div>
                  </>
                )}

                {solutionType === 'HOUSING_COOP' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('newSolution.targetMembersLabel')}
                        </label>
                        <input
                          type="number"
                          name="targetMembers"
                          value={formData.targetMembers}
                          onChange={handleChange}
                          required
                          min="2"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('newSolution.initialContributionLabel')}
                        </label>
                        <input
                          type="number"
                          name="initialContribution"
                          value={formData.initialContribution}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newSolution.monthlyContributionLabel')}
                      </label>
                      <input
                        type="number"
                        name="monthlyContribution"
                        value={formData.monthlyContribution}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </>
                )}

                {solutionType === 'COMMUNITY_GUARANTEE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newSolution.guaranteeAmountLabel')}
                      </label>
                      <input
                        type="number"
                        name="guaranteeAmount"
                        value={formData.guaranteeAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('newSolution.monthlyContributionLabel')}
                      </label>
                      <input
                        type="number"
                        name="monthlyContribution"
                        value={formData.monthlyContribution}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newSolution.requirementsLabel')}
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('requirementsPlaceholder')}
                  />
                </div>

                {/* Rules */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('newSolution.rulesLabel')}
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t('rulesPlaceholder')}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition font-semibold"
                  >
                    {t('newSolution.cancelButton')}
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {createMutation.isPending ? t('newSolution.creating') : t('newSolution.createButton')}
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
