import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface CreateEventForm {
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
}

export default function NewEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateEventForm>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const geocodeAddress = async () => {
    if (!formData.address) {
      toast.error('Por favor ingresa una dirección primero');
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
        toast.success('Coordenadas obtenidas correctamente');
      } else {
        toast.error('No se encontraron coordenadas para esta dirección');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Error al obtener coordenadas');
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
        console.error('Error uploading image:', error);
        toast.error(`Error al subir imagen: ${image.name}`);
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

      // Upload images first
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
        tags: [], // Empty tags array
        requirements: [], // Empty requirements array
        ...(capacity && !isNaN(capacity) && { capacity }),
        ...(!isNaN(creditsReward) && { creditsReward }),
        ...(imageUrls.length > 0 && { image: imageUrls[0] }),
      };

      const token = localStorage.getItem('access_token');
      const response = await api.post('/events', eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Evento creado exitosamente');
      router.push(`/events/${response.data.id}`);
    } catch (error: unknown) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al crear el evento';
      toast.error(errorMessage || 'Error al crear el evento');
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

  // Get current date/time for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <>
      <Head>
        <title>Crear Nuevo Evento - Comunidad Viva</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Organizar Nuevo Evento</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título del Evento *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Taller de huerto urbano"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe el evento, qué actividades habrá, quién puede participar..."
            />
          </div>

          {/* Event Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                id="startsAt"
                name="startsAt"
                required
                min={minDateTime}
                value={formData.startsAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora de Fin *
              </label>
              <input
                type="datetime-local"
                id="endsAt"
                name="endsAt"
                required
                min={formData.startsAt || minDateTime}
                value={formData.endsAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Calle Mayor 1, Madrid"
              />
              <button
                type="button"
                onClick={geocodeAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                📍 Obtener coordenadas
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Introduce la dirección y haz clic en "Obtener coordenadas" para rellenar automáticamente lat/lng
            </p>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
                Latitud (para aparecer en el mapa)
              </label>
              <input
                type="number"
                id="lat"
                name="lat"
                step="any"
                value={formData.lat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: 40.416775"
              />
              <p className="mt-1 text-xs text-gray-500">Coordenada de latitud</p>
            </div>

            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
                Longitud (para aparecer en el mapa)
              </label>
              <input
                type="number"
                id="lng"
                name="lng"
                step="any"
                value={formData.lng}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: -3.703790"
              />
              <p className="mt-1 text-xs text-gray-500">Coordenada de longitud</p>
            </div>
          </div>

          {/* Capacity and Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad (opcional)
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                step="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Número máximo de asistentes"
              />
              <p className="mt-1 text-xs text-gray-500">Dejar vacío para sin límite</p>
            </div>

            <div>
              <label htmlFor="creditsReward" className="block text-sm font-medium text-gray-700 mb-1">
                Recompensa en Créditos
              </label>
              <input
                type="number"
                id="creditsReward"
                name="creditsReward"
                min="0"
                step="1"
                value={formData.creditsReward}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500">Créditos que ganarán los asistentes</p>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del Evento
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-blue-800">
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
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
