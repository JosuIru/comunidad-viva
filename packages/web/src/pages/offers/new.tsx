import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { getI18nProps } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createOfferSchema, type CreateOfferFormData } from '@/lib/validations';
import InfoTooltip from '@/components/InfoTooltip';

export default function NewOffer() {
  const router = useRouter();
  const t = useTranslations('offerCreate');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize form validation
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    getInputProps,
    getSelectProps,
    validateForm,
    setValues,
  } = useFormValidation<CreateOfferFormData>({
    schema: createOfferSchema,
    initialData: {
      title: '',
      description: '',
      type: 'PRODUCT',
      category: '',
      tags: [],
      images: [],
    },
  });

  // Load draft data from intention onboarding
  useEffect(() => {
    const draftData = localStorage.getItem('offer_draft');
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        setValues({
          title: draft.title || '',
          type: draft.category === 'service' ? 'SERVICE' : 'PRODUCT',
          price: draft.price ? parseFloat(draft.price) : undefined,
        });
        // Clear the draft after loading
        localStorage.removeItem('offer_draft');
        toast.success('Datos cargados desde tu borrador');
      } catch (error) {
        logger.error('Error loading offer draft', { error });
      }
    }
  }, [setValues]);

  const geocodeAddress = async () => {
    if (!formData.address) {
      toast.error(t('toasts.addressRequired'));
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setValues({
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        });
        toast.success(t('toasts.geocodeSuccess'));
      } else {
        toast.error(t('toasts.geocodeNotFound'));
      }
    } catch (error) {
      logger.error('Error geocoding address', { error, address: formData.address });
      toast.error(t('toasts.geocodeError'));
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleChange('images', files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    handleChange('images', newImages);

    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const images = formData.images || [];
    if (images.length === 0) return [];

    const uploadedUrls: string[] = [];
    const token = localStorage.getItem('access_token');

    for (const image of images) {
      const imageFormData = new FormData();
      imageFormData.append('file', image);

      try {
        const response = await api.post('/upload/image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        uploadedUrls.push(response.data.url);
      } catch (error) {
        logger.error('Error uploading image', { error, imageName: image.name });
        toast.error(t('toasts.uploadError', { name: image.name }));
      }
    }

    return uploadedUrls;
  };

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

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Prepare offer data with validated data
      const offerData = {
        title: validation.data.title,
        description: validation.data.description,
        type: validation.data.type,
        category: validation.data.category,
        ...(validation.data.priceEur && { priceEur: validation.data.priceEur }),
        ...(validation.data.priceCredits && { priceCredits: validation.data.priceCredits }),
        ...(validation.data.stock && { stock: validation.data.stock }),
        ...(validation.data.address && { address: validation.data.address }),
        ...(validation.data.lat && { lat: validation.data.lat }),
        ...(validation.data.lng && { lng: validation.data.lng }),
        ...(validation.data.tags && validation.data.tags.length > 0 && { tags: validation.data.tags }),
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };

      const token = localStorage.getItem('access_token');
      const response = await api.post('/offers', offerData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(t('toasts.createSuccess'));
      router.push(`/offers/${response.data.id}`);
    } catch (error: unknown) {
      logger.error('Error creating offer', { error });
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || t('toasts.createError'));
    }
  };

  const categories = useMemo(() => t.raw('form.categories') as string[], [t]);
  const typeOptions = useMemo(
    () => [
      { value: 'PRODUCT', label: t('form.typeOptions.PRODUCT') },
      { value: 'SERVICE', label: t('form.typeOptions.SERVICE') },
      { value: 'TIME_BANK', label: t('form.typeOptions.TIME_BANK') },
      { value: 'GROUP_BUY', label: t('form.typeOptions.GROUP_BUY') },
      { value: 'EVENT', label: t('form.typeOptions.EVENT') },
    ],
    [t]
  );

  return (
    <>
      <Head>
        <title>{t('layout.title')}</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">{t('headings.title')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.title.label')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              {...getInputProps('title')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('form.title.placeholder')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.description.label')} *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              {...getInputProps('description')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('form.description.placeholder')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {(formData.description || '').length} / 2000 caracteres
            </p>
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InfoTooltip
                content={formData.type === 'PRODUCT' ? 'Artículo físico para vender' :
                  formData.type === 'SERVICE' ? 'Tu tiempo o habilidad' :
                  formData.type === 'TIME_BANK' ? 'Intercambio de horas 1:1' :
                  formData.type === 'GROUP_BUY' ? 'Compra grupal con descuento' : 'Selecciona un tipo'}
                position="right"
              >
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.type')} *
                </label>
              </InfoTooltip>
              <select
                id="type"
                name="type"
                required
                {...getSelectProps('type')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                {...getSelectProps('category')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">{t('form.categoryPlaceholder')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="priceEur" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.priceEur.label')}
              </label>
              <input
                type="number"
                id="priceEur"
                name="priceEur"
                min="0"
                step="0.01"
                {...getInputProps('priceEur', {
                  transform: (v) => v === '' ? undefined : parseFloat(v)
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.priceEur ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('form.priceEur.placeholder')}
              />
              {errors.priceEur && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priceEur}</p>
              )}
            </div>

            <div>
              <InfoTooltip content="Opcional. Acepta créditos además de €" position="right">
                <label htmlFor="priceCredits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.priceCredits.label')}
                </label>
              </InfoTooltip>
              <input
                type="number"
                id="priceCredits"
                name="priceCredits"
                min="0"
                step="1"
                {...getInputProps('priceCredits', {
                  transform: (v) => v === '' ? undefined : parseInt(v, 10)
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.priceCredits ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('form.priceCredits.placeholder')}
              />
              {errors.priceCredits && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priceCredits}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.stock.label')}
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                step="1"
                {...getInputProps('stock', {
                  transform: (v) => v === '' ? undefined : parseInt(v, 10)
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('form.stock.placeholder')}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.address.label')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="address"
                name="address"
                {...getInputProps('address')}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('form.address.placeholder')}
              />
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={isGeocoding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeocoding ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Buscando...
                  </span>
                ) : t('form.address.button')}
              </button>
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('form.address.help')}
            </p>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.lat.label')}
              </label>
              <input
                type="number"
                id="lat"
                name="lat"
                step="any"
                {...getInputProps('lat', {
                  transform: (v) => v === '' ? undefined : parseFloat(v)
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.lat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('form.lat.placeholder')}
              />
              {errors.lat && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lat}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('form.lat.help')}</p>
            </div>

            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.lng.label')}
              </label>
              <input
                type="number"
                id="lng"
                name="lng"
                step="any"
                {...getInputProps('lng', {
                  transform: (v) => v === '' ? undefined : parseFloat(v)
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.lng ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('form.lng.placeholder')}
              />
              {errors.lng && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lng}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('form.lng.help')}</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.tags.label')}
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              {...getInputProps('tags', {
                transform: (v) => v.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                errors.tags ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('form.tags.placeholder')}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.images.label')}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={t('form.images.previewAlt', { index: index + 1 })}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Eliminar imagen ${index + 1}`}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? t('form.submit.pending') : t('form.submit.default')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('form.cancel')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
