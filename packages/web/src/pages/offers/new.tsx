import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface CreateOfferForm {
  title: string;
  description: string;
  type: 'PRODUCT' | 'SERVICE' | 'TIME_BANK' | 'GROUP_BUY' | 'EVENT';
  category: string;
  priceEur: string;
  priceCredits: string;
  stock: string;
  address: string;
  lat: string;
  lng: string;
  tags: string;
  images: File[];
}

export default function NewOffer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateOfferForm>({
    title: '',
    description: '',
    type: 'PRODUCT',
    category: '',
    priceEur: '',
    priceCredits: '',
    stock: '1',
    address: '',
    lat: '',
    lng: '',
    tags: '',
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
      // Upload images first
      const imageUrls = await uploadImages();

      // Prepare offer data
      const offerData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        ...(formData.priceEur && { priceEur: parseFloat(formData.priceEur) }),
        ...(formData.priceCredits && { priceCredits: parseInt(formData.priceCredits) }),
        ...(formData.stock && { stock: parseInt(formData.stock) }),
        ...(formData.address && { address: formData.address }),
        ...(formData.lat && { lat: parseFloat(formData.lat) }),
        ...(formData.lng && { lng: parseFloat(formData.lng) }),
        ...(formData.tags && { tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) }),
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };

      const token = localStorage.getItem('access_token');
      const response = await api.post('/offers', offerData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('¡Oferta creada exitosamente!');
      router.push(`/offers/${response.data.id}`);
    } catch (error: unknown) {
      console.error('Error creating offer:', error);
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al crear la oferta';
      toast.error(errorMessage || 'Error al crear la oferta');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Transporte',
    'Electrónica',
    'Hogar',
    'Jardinería',
    'Educación',
    'Salud',
    'Alimentación',
    'Ropa',
    'Servicios',
    'Otros',
  ];

  return (
    <>
      <Head>
        <title>Crear Nueva Oferta - Comunidad Viva</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Crear Nueva Oferta</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Bicicleta en buen estado"
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
              placeholder="Describe tu oferta en detalle..."
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="PRODUCT">Producto</option>
                <option value="SERVICE">Servicio</option>
                <option value="TIME_BANK">Banco de Tiempo</option>
                <option value="GROUP_BUY">Compra Grupal</option>
                <option value="EVENT">Evento</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="priceEur" className="block text-sm font-medium text-gray-700 mb-1">
                Precio (EUR)
              </label>
              <input
                type="number"
                id="priceEur"
                name="priceEur"
                min="0"
                step="0.01"
                value={formData.priceEur}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="priceCredits" className="block text-sm font-medium text-gray-700 mb-1">
                Precio (Créditos)
              </label>
              <input
                type="number"
                id="priceCredits"
                name="priceCredits"
                min="0"
                step="1"
                value={formData.priceCredits}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="address"
                name="address"
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

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="bicicleta, transporte, ecológico"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imágenes
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
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Oferta'}
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
