import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

interface TimeBankOffer {
  id: string;
  hourlyRate: number;
  experienceLevel: string;
  createdAt: string;
  offer: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
  };
  skill: {
    id: string;
    name: string;
  };
}

interface Transaction {
  id: string;
  description: string;
  hours: number;
  credits: number;
  status: string;
  scheduledFor: string;
  requester: {
    id: string;
    name: string;
    avatar?: string;
  };
  provider: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function MyTimeBank() {
  const { data: offers = [], isLoading: offersLoading } = useQuery<TimeBankOffer[]>({
    queryKey: ['my-timebank-offers'],
    queryFn: async () => {
      const { data } = await api.get('/timebank/user/my-offers');
      return data;
    },
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['my-timebank-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/timebank/transactions');
      return data;
    },
  });

  const getExperienceBadge = (level: string) => {
    const badges = {
      BEGINNER: 'bg-green-100 text-green-800',
      INTERMEDIATE: 'bg-blue-100 text-blue-800',
      EXPERT: 'bg-purple-100 text-purple-800',
    };
    return badges[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (offersLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mis Ofertas de Tiempo */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Mis Servicios ({offers.length})
          </h2>
          <Link
            href="/timebank/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nuevo Servicio
          </Link>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No tienes servicios de tiempo aún
            </h3>
            <p className="text-gray-600 mb-6">
              Ofrece tus habilidades para intercambiar tiempo con la comunidad
            </p>
            <Link
              href="/timebank/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Servicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">⏰</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {offer.offer.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {offer.skill.name}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceBadge(offer.experienceLevel)}`}>
                            {offer.experienceLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{offer.offer.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {offer.hourlyRate} créditos/hora
                      </div>
                      <span>
                        Creado {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/offers/${offer.offer.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg ml-4"
                    title="Ver detalles"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mis Transacciones */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Transacciones Recientes ({transactions.length})
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600">
              No tienes transacciones aún
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transaction.description}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Solicitante:</span>
                        <div className="font-medium">{transaction.requester.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Proveedor:</span>
                        <div className="font-medium">{transaction.provider.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duración:</span>
                        <div className="font-medium">{transaction.hours} horas</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Créditos:</span>
                        <div className="font-medium">{transaction.credits} cr</div>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      Programado para: {new Date(transaction.scheduledFor).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
