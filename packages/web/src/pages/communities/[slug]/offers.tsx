import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getI18nProps } from '@/lib/i18n';

interface Offer {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: string;
  status: string;
  price?: number;
  images?: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export default function CommunityOffersPage() {
  const router = useRouter();
  const { slug } = router.query;

  const { data: community, isLoading: communityLoading } = useQuery<Community>({
    queryKey: ['community', slug],
    queryFn: async () => {
      const response = await api.get(`/communities/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const { data: offers, isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ['community-offers', community?.id],
    queryFn: async () => {
      const response = await api.get(`/communities/${community?.id}/offers`);
      return response.data || [];
    },
    enabled: !!community?.id,
  });

  const isLoading = communityLoading || offersLoading;

  if (isLoading) {
    return (
      <Layout title="Cargando...">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Cargando ofertas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout title="Comunidad no encontrada">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏘️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Comunidad no encontrada</h1>
            <p className="text-gray-600 mb-6">La comunidad que buscas no existe</p>
            <Link
              href="/communities"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver todas las comunidades
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Ofertas - ${community.name}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-4">
              <Link
                href={`/communities/${slug}`}
                className="inline-flex items-center text-white/80 hover:text-white transition-colors"
              >
                ← Volver a {community.name}
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-4">Ofertas de {community.name}</h1>
            <p className="text-xl opacity-90">
              Explora todas las ofertas disponibles en esta comunidad
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {!offers || offers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-lg">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No hay ofertas disponibles
              </h2>
              <p className="text-gray-600 mb-6">
                Sé el primero en crear una oferta en esta comunidad
              </p>
              <Link
                href="/offers/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear oferta
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  {offer.images && offer.images.length > 0 ? (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={offer.images[0]}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {offer.category}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {offer.type === 'EXCHANGE' ? 'Intercambio' : offer.type === 'TIME_BANK' ? 'Banco de Tiempo' : 'Venta'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {offer.title}
                    </h3>

                    {offer.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{offer.description}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {offer.user.avatar ? (
                            <img
                              src={offer.user.avatar}
                              alt={offer.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            '👤'
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{offer.user.name}</span>
                      </div>

                      {offer.price !== undefined && offer.price !== null && (
                        <span className="text-lg font-bold text-green-600">
                          {offer.price} €
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
