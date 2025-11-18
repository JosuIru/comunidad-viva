import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { GiftIcon, HandRaisedIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

interface Offer {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  interested: number;
  views: number;
  createdAt: string;
  interestedUsers: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
}

export default function MyOffers() {
  const queryClient = useQueryClient();
  const tToasts = useTranslations('toasts');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showInterestedModal, setShowInterestedModal] = useState(false);

  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ['my-offers'],
    queryFn: async () => {
      const { data } = await api.get('/offers/user/my-offers');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (offerId: string) => {
      await api.delete(`/offers/${offerId}`);
    },
    onSuccess: () => {
      toast.success(tToasts('success.offerDeleted'));
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
    },
    onError: () => {
      toast.error(tToasts('error.deleteOffer'));
    },
  });

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const iconComponents: { [key: string]: JSX.Element } = {
      OFFER: <GiftIcon className="h-8 w-8" />,
      REQUEST: <HandRaisedIcon className="h-8 w-8" />,
    };
    return iconComponents[type] || <CubeIcon className="h-8 w-8" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <CubeIcon className="h-24 w-24 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          No tienes ofertas aún
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Crea tu primera oferta para empezar a intercambiar con la comunidad
        </p>
        <Link
          href="/offers/create"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Crear Oferta
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Mis Ofertas ({offers.length})
        </h2>
        <Link
          href="/offers/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nueva Oferta
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-gray-600 dark:text-gray-400">{getTypeIcon(offer.type)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {offer.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(offer.status)}`}>
                        {offer.status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {offer.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{offer.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {offer.views} vistas
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOffer(offer);
                      setShowInterestedModal(true);
                    }}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {offer.interested} interesados
                  </button>
                  <span>
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Link
                  href={`/offers/${offer.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Ver detalles"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar esta oferta?')) {
                      deleteMutation.mutate(offer.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Eliminar"
                  disabled={deleteMutation.isPending}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interested Users Modal */}
      {showInterestedModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Personas Interesadas ({selectedOffer.interestedUsers.length})
              </h3>
              <button
                onClick={() => setShowInterestedModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {selectedOffer.interestedUsers.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Aún no hay personas interesadas en esta oferta
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedOffer.interestedUsers.map(({ user }) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      <Link
                        href={`mailto:${user.email}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Contactar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
