import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { getI18nProps } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createEventSchema, type CreateEventFormData } from '@/lib/validations';

export default function NewEvent() {
  const router = useRouter();
  const t = useTranslations('eventCreate');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Initialize form validation
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    validateForm,
    setValues,
  } = useFormValidation<CreateEventFormData>({
    schema: createEventSchema,
    initialData: {
      title: '',
      description: '',
      type: 'IN_PERSON',
      startsAt: '',
      address: '',
      tags: [],
      requirements: [],
    },
  });

  // Wrapper for handleChange to work with input events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof CreateEventFormData, value);
  };

  const geocodeAddress = async () => {
    if (!formData.address) {
      toast.error(t('form.address.placeholder'));
      return;
    }

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
        toast.success(t('form.address.placeholder'));
      } else {
        toast.error(t('errors.getCoordinates'));
      }
    } catch (error) {
      logger.error('Error geocoding address', { error, address: formData.address });
      toast.error(t('errors.getCoordinates'));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('image', file);
      const preview = URL.createObjectURL(file);
      setImagePreviews([preview]);
    }
  };

  const removeImage = () => {
    handleChange('image', undefined);
    if (imagePreviews[0]) {
      URL.revokeObjectURL(imagePreviews[0]);
    }
    setImagePreviews([]);
  };

  const uploadImage = async (): Promise<string | null> => {
    const image = formData.image;
    if (!image) return null;

    const token = localStorage.getItem('access_token');
    const imageFormData = new FormData();
    imageFormData.append('file', image);

    try {
      const response = await api.post('/upload/image', imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.url;
    } catch (error) {
      logger.error('Error uploading image', { error, imageName: image.name });
      toast.error(t('errors.uploadImage', { name: image.name }));
      return null;
    }
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
      // Upload image first
      const imageUrl = await uploadImage();

      // Prepare event data with validated data
      const eventData = {
        title: validation.data.title,
        description: validation.data.description,
        type: validation.data.type,
        startsAt: new Date(validation.data.startsAt).toISOString(),
        ...(validation.data.endsAt && { endsAt: new Date(validation.data.endsAt).toISOString() }),
        address: validation.data.address,
        lat: validation.data.lat,
        lng: validation.data.lng,
        ...(validation.data.capacity && { capacity: validation.data.capacity }),
        ...(validation.data.creditsReward && { creditsReward: validation.data.creditsReward }),
        ...(validation.data.tags && validation.data.tags.length > 0 && { tags: validation.data.tags }),
        ...(validation.data.requirements && validation.data.requirements.length > 0 && { requirements: validation.data.requirements }),
        ...(imageUrl && { image: imageUrl }),
      };

      const token = localStorage.getItem('access_token');
      const response = await api.post('/events', eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Evento creado exitosamente');
      router.push(`/events/${response.data.id}`);
    } catch (error: unknown) {
      logger.error('Error creating event', { error });
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : t('errors.createEvent');
      toast.error(errorMessage || t('errors.createEvent'));
    }
  };

  const eventTypes = [
    { value: 'WORKSHOP', label: 'Taller' },
    { value: 'CLEANUP', label: 'Limpieza Comunitaria' },
    { value: 'MARKET', label: 'Mercado' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'REPAIR_CAFE', label: 'Café de Reparación' },
    { value: 'COMMUNITY_MEAL', label: 'Comida Comunitaria' },
    { value: 'SKILLSHARE', label: 'Intercambio de Habilidades' },
  ];

  // Get current date/time for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <>
      <Head>
        <title>{t('layout.title')}</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">{t('heading')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.title.label')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('form.title.placeholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.description.label')}
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('form.description.placeholder')}
            />
          </div>

          {/* Event Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Evento *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.startDate.label')}
              </label>
              <input
                type="datetime-local"
                id="startsAt"
                name="startsAt"
                required
                min={minDateTime}
                value={formData.startsAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.endDate.label')}
              </label>
              <input
                type="datetime-local"
                id="endsAt"
                name="endsAt"
                required
                min={formData.startsAt || minDateTime}
                value={formData.endsAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
                required
                value={formData.address}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('form.address.placeholder')}
              />
              <button
                type="button"
                onClick={geocodeAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {t('form.address.button')}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Introduce la dirección y haz clic en "Obtener coordenadas" para rellenar automáticamente lat/lng
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
                value={formData.lat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('form.lat.placeholder')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Coordenada de latitud</p>
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
                value={formData.lng}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('form.lng.placeholder')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Coordenada de longitud</p>
            </div>
          </div>

          {/* Capacity and Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.capacity.label')}
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                step="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('form.capacity.placeholder')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Dejar vacío para sin límite</p>
            </div>

            <div>
              <label htmlFor="creditsReward" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.rewardCredits.label')}
              </label>
              <input
                type="number"
                id="creditsReward"
                name="creditsReward"
                min="0"
                step="1"
                value={formData.creditsReward}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('form.rewardCredits.placeholder')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Créditos que ganarán los asistentes</p>
            </div>
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Consejos para tu evento:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Describe claramente qué se hará en el evento</li>
                  <li>Especifica si se requiere algún material o preparación</li>
                  <li>Indica el nivel de dificultad si es un taller</li>
                  <li>Menciona si hay algún requisito especial para asistir</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
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
