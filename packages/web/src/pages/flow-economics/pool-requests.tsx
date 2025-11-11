import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { CircleStackIcon, PlusIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { getI18nProps } from '@/lib/i18n';

interface PoolRequest {
  id: string;
  user: { name: string };
  poolType: string;
  amount: number;
  reason: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
}

export default function PoolRequestsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [poolType, setPoolType] = useState('EMERGENCY');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const { data: requests, isLoading } = useQuery<PoolRequest[]>({
    queryKey: ['pool-requests'],
    queryFn: async () => {
      const response = await api.get('/flow-economics/pool-requests');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/flow-economics/pool-request', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      setShowCreateModal(false);
      alert('¡Solicitud creada exitosamente!');
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (data: { id: string; vote: boolean }) => {
      const response = await api.post(`/flow-economics/pool-requests/${data.id}/vote`, { vote: data.vote });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-requests'] });
      alert('¡Voto registrado!');
    },
  });

  const handleCreate = () => {
    if (!amount || !reason) {
      alert('Por favor completa todos los campos');
      return;
    }

    createMutation.mutate({
      poolType,
      amount: parseFloat(amount),
      reason,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'DISTRIBUTED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPoolIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return '🚨';
      case 'COMMUNITY': return '🏘️';
      case 'REWARDS': return '🎁';
      default: return '💰';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <CircleStackIcon className="h-8 w-8 text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Solicitudes de Pool
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Solicita fondos de los pools comunitarios
              </p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md"
              >
                <PlusIcon className="inline h-5 w-5 mr-2" />
                Nueva Solicitud
              </button>
            )}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <CircleStackIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Inicia sesión para ver solicitudes
            </h3>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getPoolIcon(request.poolType)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {request.poolType} - {request.amount} créditos
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Por {request.user.name} • {new Date(request.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{request.reason}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <HandThumbUpIcon className="h-5 w-5" />
                    <span className="font-semibold">{request.votesFor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <HandThumbDownIcon className="h-5 w-5" />
                    <span className="font-semibold">{request.votesAgainst}</span>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => voteMutation.mutate({ id: request.id, vote: true })}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        A Favor
                      </button>
                      <button
                        onClick={() => voteMutation.mutate({ id: request.id, vote: false })}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        En Contra
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <CircleStackIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay solicitudes todavía
            </h3>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Nueva Solicitud de Pool
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Pool
                  </label>
                  <select
                    value={poolType}
                    onChange={(e) => setPoolType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="EMERGENCY">🚨 Emergencias</option>
                    <option value="COMMUNITY">🏘️ Comunidad</option>
                    <option value="REWARDS">🎁 Recompensas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cantidad de Créditos
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivo
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Describe por qué necesitas estos fondos..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear Solicitud'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
