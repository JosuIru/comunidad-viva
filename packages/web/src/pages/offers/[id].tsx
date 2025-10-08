import { useRouter } from 'next/router';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import toast from 'react-hot-toast';

interface OfferDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  priceEur?: number;
  priceCredits?: number;
  images: string[];
  tags: string[];
  lat?: number;
  lng?: number;
  address?: string;
  views: number;
  interested: number;
  userIsInterested?: boolean;
  user: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  createdAt: string;
}

export default function OfferDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const { data: offer, isLoading } = useQuery<{ data: OfferDetail }>({
    queryKey: ['offer', id],
    queryFn: () => api.get(`/offers/${id}`),
    enabled: !!id,
  });

  const interestMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/offers/${id}/interested`);
      return data;
    },
    onSuccess: (data) => {
      if (data.interested) {
        toast.success('Marcado como interesado');
      } else {
        toast.success('Interés removido');
      }
      queryClient.invalidateQueries({ queryKey: ['offer', id] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al marcar interés';
      toast.error(message);
    },
  });

  const handleContact = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Debes iniciar sesión para contactar');
      router.push('/auth/login');
      return;
    }

    const currentUser = JSON.parse(user);
    if (currentUser.id === offerData.user.id) {
      toast.error('No puedes contactarte a ti mismo');
      return;
    }

    router.push(`/messages/${offerData.user.id}`);
  };

  const handleInterest = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Debes iniciar sesión para marcar interés');
      router.push('/auth/login');
      return;
    }

    interestMutation.mutate();
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

  if (!offer?.data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Oferta no encontrada</p>
        </div>
      </Layout>
    );
  }

  const offerData = offer.data;

  return (
    <Layout title={`${offerData.title} - Comunidad Viva`}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  {offerData.images?.length > 0 ? (
                    <img
                      src={getImageUrl(offerData.images[0])}
                      alt={offerData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-lg">Sin imagen</span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-medium">
                      {offerData.type.replace('_', ' ')}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      {offerData.category}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{offerData.title}</h1>

                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-line">{offerData.description}</p>
                  </div>

                  {offerData.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {offerData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-600 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {offerData.address && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ubicación</h3>
                      <p className="text-gray-600">📍 {offerData.address}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-6 border-t border-gray-200 text-gray-600">
                    <span>👁️ {offerData.views} vistas</span>
                    <span>⭐ {offerData.interested} interesados</span>
                    <span>📅 {new Date(offerData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <div className="mb-6">
                  {offerData.priceEur && (
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      €{offerData.priceEur.toFixed(2)}
                    </div>
                  )}
                  {offerData.priceCredits && (
                    <div className="text-2xl font-bold text-purple-600">
                      {offerData.priceCredits} créditos
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleContact}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Contactar
                  </button>
                  <button
                    onClick={handleInterest}
                    disabled={interestMutation.isPending}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      offerData.userIsInterested
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                    } ${interestMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {interestMutation.isPending
                      ? 'Procesando...'
                      : offerData.userIsInterested
                      ? '✓ Ya me interesa'
                      : 'Me interesa'}
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ofrecido por</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{offerData.user?.name || 'Usuario'}</p>
                      {offerData.user?.bio && (
                        <p className="text-sm text-gray-600">{offerData.user.bio}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => offerData.user?.id && router.push(`/profile/${offerData.user.id}`)}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Ver perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export { getI18nProps as getStaticProps };
