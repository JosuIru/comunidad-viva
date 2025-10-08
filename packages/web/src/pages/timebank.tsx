import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface TimeBankOffer {
  id: string;
  offer: {
    id: string;
    title: string;
    description: string;
    category: string;
    images: string[];
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  estimatedHours: number;
  canTeach: boolean;
  experienceLevel: string;
}

interface TimeBankTransaction {
  id: string;
  description: string;
  hours: number;
  credits: number;
  scheduledFor: string;
  completedAt?: string;
  status: string;
  provider: {
    id: string;
    name: string;
    avatar?: string;
  };
  requester: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface TimeBankStats {
  hoursGiven: number;
  hoursReceived: number;
  totalTransactions: number;
  pendingRequests: number;
}

export default function TimeBankPage() {
  const [activeTab, setActiveTab] = useState<'offers' | 'transactions' | 'stats'>('offers');

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: ['timebank-offers'],
    queryFn: async () => {
      const response = await api.get('/timebank/offers');
      return (response.data.offers || response.data) as TimeBankOffer[];
    },
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['timebank-transactions'],
    queryFn: async () => {
      const response = await api.get('/timebank/transactions');
      return (response.data.transactions || response.data) as TimeBankTransaction[];
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['timebank-stats'],
    queryFn: async () => {
      const response = await api.get('/timebank/stats');
      return response.data as TimeBankStats;
    },
  });

  const offers = offersData || [];
  const transactions = transactionsData || [];
  const stats = statsData || {
    hoursGiven: 0,
    hoursReceived: 0,
    totalTransactions: 0,
    pendingRequests: 0,
  };

  return (
    <Layout title="Banco de Tiempo - Comunidad Viva">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">⏰ Banco de Tiempo</h1>
            <p className="text-xl opacity-90">
              Comparte tus habilidades y aprende de otros
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-green-600">{stats.hoursGiven}h</p>
              <p className="text-gray-600">Horas Compartidas</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-blue-600">{stats.hoursReceived}h</p>
              <p className="text-gray-600">Horas Recibidas</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-purple-600">{stats.totalTransactions}</p>
              <p className="text-gray-600">Intercambios</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
              <p className="text-gray-600">Pendientes</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'offers'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ofertas Disponibles
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'transactions'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mis Intercambios
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'offers' && (
                <div>
                  {offersLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                      <p className="mt-4 text-gray-600">Cargando ofertas...</p>
                    </div>
                  ) : offers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-lg">No hay ofertas disponibles</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold">
                                  {offer.offer.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{offer.offer.user?.name}</p>
                                <p className="text-xs text-gray-500">{offer.offer.category}</p>
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {offer.offer.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {offer.offer.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                ⏱️ {offer.estimatedHours}h estimadas
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  offer.experienceLevel === 'EXPERT'
                                    ? 'bg-purple-100 text-purple-600'
                                    : offer.experienceLevel === 'INTERMEDIATE'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-green-100 text-green-600'
                                }`}
                              >
                                {offer.experienceLevel}
                              </span>
                            </div>
                            {offer.canTeach && (
                              <div className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full inline-block">
                                👨‍🏫 Puede enseñar
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  {transactionsLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                      <p className="mt-4 text-gray-600">Cargando intercambios...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-lg">No tienes intercambios aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="bg-white border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 font-semibold">
                                    {transaction.provider?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.provider?.name}</p>
                                  <p className="text-xs text-gray-500">Proveedor</p>
                                </div>
                                <span className="text-gray-400">→</span>
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {transaction.requester?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.requester?.name}</p>
                                  <p className="text-xs text-gray-500">Solicitante</p>
                                </div>
                              </div>
                              <p className="text-gray-900 mb-2">{transaction.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>⏱️ {transaction.hours}h</span>
                                <span>💰 {transaction.credits} créditos</span>
                                <span>
                                  📅{' '}
                                  {new Date(transaction.scheduledFor).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-600'
                                    : transaction.status === 'CONFIRMED'
                                    ? 'bg-blue-100 text-blue-600'
                                    : transaction.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
