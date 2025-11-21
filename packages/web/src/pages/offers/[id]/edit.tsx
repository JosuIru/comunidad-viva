import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';
import { useTranslations } from 'next-intl';

const OFFER_TYPES = [
  { value: 'PRODUCT', label: 'Producto' },
  { value: 'SERVICE', label: 'Servicio' },
  { value: 'SKILL', label: 'Habilidad' },
  { value: 'SPACE', label: 'Espacio' },
  { value: 'TOOL', label: 'Herramienta' },
];

const CATEGORIES = [
  { value: 'FOOD', label: 'Alimentación' },
  { value: 'CLOTHING', label: 'Ropa y Textil' },
  { value: 'HOUSING', label: 'Vivienda' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'EDUCATION', label: 'Educación' },
  { value: 'HEALTH', label: 'Salud' },
  { value: 'TECHNOLOGY', label: 'Tecnología' },
  { value: 'ART_CULTURE', label: 'Arte y Cultura' },
  { value: 'CARE', label: 'Cuidados' },
  { value: 'REPAIR', label: 'Reparación' },
  { value: 'OTHER', label: 'Otro' },
];

export default function EditOfferPage() {
  const router = useRouter();
  const { id } = router.query;
  const t = useTranslations('offerCreate');
  const tToasts = useTranslations('toasts');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PRODUCT',
    category: 'OTHER',
    priceEur: '',
    priceCredits: '',
    stock: '',
    address: '',
    lat: '',
    lng: '',
    tags: '',
    images: [] as File[],
    existingImages: [] as string[],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch existing offer
  const { data: offer, isLoading } = useQuery({
    queryKey: ['offer', id],
    queryFn: async () => {
      const { data } = await api.get(`/offers/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // Populate form with existing data
  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        type: offer.type || 'PRODUCT',
        category: offer.category || 'OTHER',
        priceEur: offer.priceEur?.toString() || '',
        priceCredits: offer.priceCredits?.toString() || '',
        stock: offer.stock?.toString() || '',
        address: offer.address || '',
        lat: offer.lat?.toString() || '',
        lng: offer.lng?.toString() || '',
        tags: offer.tags?.join(', ') || '',
        images: [],
        existingImages: offer.images || [],
      });
    }
  }, [offer]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/offers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(tToasts('success.offerUpdated'));
      queryClient.invalidateQueries({ queryKey: ['offer', id] });
      router.push(`/offers/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || tToasts('error.updateOffer'));
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, images: files });

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setFormData({
      ...formData,
      existingImages: formData.existingImages.filter((_, i) => i !== index),
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
        toast.error(`${tToasts('error.uploadImage')}: ${image.name}`);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload new images
      const newImageUrls = await uploadImages();

      // Combine existing and new images
      const allImages = [...formData.existingImages, ...newImageUrls];

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        priceEur: formData.priceEur ? parseFloat(formData.priceEur) : undefined,
        priceCredits: formData.priceCredits ? parseInt(formData.priceCredits) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        address: formData.address || undefined,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: allImages,
      };

      updateMutation.mutate(payload);
    } catch (error) {
      toast.error(tToasts('error.updateOffer'));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!offer) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Oferta no encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Editar Oferta
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Type & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {OFFER_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Categoría *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Precio (€)
                    </label>
                    <input
                      type="number"
                      name="priceEur"
                      value={formData.priceEur}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Precio (Créditos)
                    </label>
                    <input
                      type="number"
                      name="priceCredits"
                      value={formData.priceCredits}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Etiquetas
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Separadas por comas"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Existing Images */}
                {formData.existingImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Imágenes Actuales
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.existingImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Agregar Nuevas Imágenes
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
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

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Oferta'}
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

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
