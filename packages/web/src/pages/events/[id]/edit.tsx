import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';

interface EditEventForm {
  title: string;
  description: string;
  type: string;
  startsAt: string;
  endsAt: string;
  address: string;
  lat: string;
  lng: string;
  capacity: string;
  creditsReward: string;
  images: File[];
  existingImage?: string;
}

export default function EditEvent() {
  const router = useRouter();
  const { id } = router.query;
  const t = useTranslations('eventCreate');
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState<EditEventForm>({
    title: '',
    description: '',
    type: 'WORKSHOP',
    startsAt: '',
    endsAt: '',
    address: '',
    lat: '',
    lng: '',
    capacity: '',
    creditsReward: '0',
    images: [],
  });

  // Fetch existing event data
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // Populate form when event data loads
  useEffect(() => {
    if (event) {
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: event.title || '',
        description: event.description || '',
        type: event.type || 'WORKSHOP',
        startsAt: event.startsAt ? formatDateForInput(event.startsAt) : '',
        endsAt: event.endsAt ? formatDateForInput(event.endsAt) : '',
        address: event.address || '',
        lat: event.lat?.toString() || '',
        lng: event.lng?.toString() || '',
        capacity: event.capacity?.toString() || '',
        creditsReward: event.creditsReward?.toString() || '0',
        images: [],
        existingImage: event.image,
      });
    }
  }, [event]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({
          ...prev,
          lat: lat,
          lng: lon,
        }));
        toast.success('Coordenadas obtenidas');
      } else {
        toast.error(t('errors.getCoordinates'));
      }
    } catch (error) {
      logger.error('Error geocoding address', { error });
      toast.error(t('errors.getCoordinates'));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: files }));

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = () => {
    setFormData(prev => ({ ...prev, existingImage: undefined }));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (formData.images.length === 0) return [];

    const uploadedUrls: string[] = [];
    const token = localStorage.getItem('access_token');

    for (const image of formData.images) {
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
        logger.error('Error uploading image', { error });
        toast.error(t('errors.uploadImage', { name: image.name }));
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dates
      const startDate = new Date(formData.startsAt);
      const endDate = new Date(formData.endsAt);

      if (endDate <= startDate) {
        toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
        setLoading(false);
        return;
      }

      // Upload new images if any
      const imageUrls = await uploadImages();

      // Prepare event data
      const capacity = formData.capacity ? parseInt(formData.capacity, 10) : null;
      const creditsReward = formData.creditsReward ? parseInt(formData.creditsReward, 10) : 0;
      const lat = formData.lat ? parseFloat(formData.lat) : 0;
      const lng = formData.lng ? parseFloat(formData.lng) : 0;

      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        address: formData.address,
        lat,
        lng,
        tags: [],
        requirements: [],
        ...(capacity && !isNaN(capacity) && { capacity }),
        ...(!isNaN(creditsReward) && { creditsReward }),
        ...(imageUrls.length > 0 ? { image: imageUrls[0] } : formData.existingImage ? { image: formData.existingImage } : {}),
      };

      const token = localStorage.getItem('access_token');
      await api.put(`/events/${id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Evento actualizado exitosamente');
      router.push(`/events/${id}`);
    } catch (error: unknown) {
      logger.error('Error updating event', { error });
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al actualizar el evento';
      toast.error(errorMessage || 'Error al actualizar el evento');
    } finally {
      setLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Evento no encontrado</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Editar Evento</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">Editar Evento</h1>

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
                min={formData.startsAt}
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
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('form.images.label')}
            </label>

            {/* Existing image */}
            {formData.existingImage && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Imagen actual:</p>
                <div className="relative inline-block">
                  <img
                    src={formData.existingImage}
                    alt="Current event"
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeExistingImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    x
                  </button>
                </div>
              </div>
            )}

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

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Actualizar Evento'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async (context: any) => getI18nProps(context);
