import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Pool {
  type: string;
  balance: number;
  totalReceived: number;
  totalDistributed: number;
}

interface EconomicMetrics {
  pools: Pool[];
  totalPoolBalance: number;
}

const POOL_INFO = {
  NEEDS: {
    name: 'Necesidades Básicas',
    icon: '🆘',
    description: 'Apoyo de emergencia para necesidades básicas como alimentos, vivienda, salud',
    color: 'from-red-500 to-orange-600',
  },
  PROJECTS: {
    name: 'Proyectos Comunitarios',
    icon: '🚀',
    description: 'Financiamiento para iniciativas que benefician a toda la comunidad',
    color: 'from-blue-500 to-purple-600',
  },
  EMERGENCY: {
    name: 'Emergencias',
    icon: '⚡',
    description: 'Respuesta rápida a situaciones de emergencia urgentes',
    color: 'from-yellow-500 to-red-600',
  },
  CELEBRATION: {
    name: 'Celebraciones',
    icon: '🎉',
    description: 'Eventos comunitarios, fiestas, y celebraciones colectivas',
    color: 'from-pink-500 to-purple-600',
  },
  EQUALITY: {
    name: 'Igualdad Económica',
    icon: '⚖️',
    description: 'Redistribución para mantener la igualdad económica en la comunidad',
    color: 'from-green-500 to-teal-600',
  },
};

export default function CommunityPoolsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Debes iniciar sesión');
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
  }, [router]);

  const { data: metrics, isLoading } = useQuery<EconomicMetrics>({
    queryKey: ['economy-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/flow-economics/metrics');
      return data;
    },
  });

  // Create pool request mutation
  const requestMutation = useMutation({
    mutationFn: async (data: { poolType: string; amount: number; reason: string }) => {
      const response = await api.post('/flow-economics/pool-request', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Solicitud enviada. La comunidad la revisará pronto.');
      setShowRequestModal(false);
      setSelectedPool(null);
      setRequestAmount('');
      setRequestReason('');
      queryClient.invalidateQueries({ queryKey: ['economy-metrics'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al enviar solicitud';
      toast.error(message);
    },
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPool) {
      toast.error('Selecciona un pool');
      return;
    }

    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    if (!requestReason.trim()) {
      toast.error('Describe el motivo de tu solicitud');
      return;
    }

    requestMutation.mutate({
      poolType: selectedPool,
      amount: parseFloat(requestAmount),
      reason: requestReason.trim(),
    });
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

  return (
    <Layout title="Pools Comunitarios - Truk">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pools Comunitarios</h1>
                <p className="text-gray-600">
                  Recursos colectivos para apoyarnos mutuamente y fortalecer nuestra comunidad
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/economy/pools/requests')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  📋 Ver Solicitudes
                </button>
              </div>
            </div>
          </div>

          {/* Total Balance */}
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/80 mb-2">Balance Total de Pools</div>
                <div className="text-6xl font-bold mb-2">{metrics?.totalPoolBalance || 0}</div>
                <div className="text-xl text-white/90">Créditos disponibles para la comunidad</div>
              </div>
              <div className="text-8xl opacity-20">🏦</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 ¿Cómo funcionan los Pools?</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                Los pools comunitarios se alimentan automáticamente del 2% de cada transacción P2P.
                Son recursos colectivos para apoyar diferentes necesidades de la comunidad.
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Cualquier miembro puede solicitar apoyo de un pool</li>
                <li>Las solicitudes se revisan y aprueban por consenso comunitario</li>
                <li>Los recursos están diseñados para circular y ayudar a quien más lo necesita</li>
                <li>Contribuir a la comunidad aumenta tu reputación y generosityScore</li>
              </ul>
            </div>
          </div>

          {/* Pools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics?.pools.map((pool) => {
              const info = POOL_INFO[pool.type as keyof typeof POOL_INFO];
              if (!info) return null;

              return (
                <div
                  key={pool.type}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className={`bg-gradient-to-br ${info.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold">{info.name}</h3>
                      <span className="text-4xl">{info.icon}</span>
                    </div>
                    <p className="text-sm text-white/90">{info.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Balance Actual</span>
                        <span className="text-2xl font-bold text-gray-900">{pool.balance}</span>
                      </div>
                      <div className="h-px bg-gray-200"></div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Recibido</span>
                        <span className="text-gray-700">{pool.totalReceived}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Distribuido</span>
                        <span className="text-gray-700">{pool.totalDistributed}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPool(pool.type);
                        setShowRequestModal(true);
                      }}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Solicitar Apoyo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Request Modal */}
          {showRequestModal && selectedPool && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Solicitar Apoyo</h2>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedPool(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {POOL_INFO[selectedPool as keyof typeof POOL_INFO]?.icon}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {POOL_INFO[selectedPool as keyof typeof POOL_INFO]?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Balance disponible:{' '}
                        {metrics?.pools.find((p) => p.type === selectedPool)?.balance || 0} créditos
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Monto solicitado <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="amount"
                      type="number"
                      min="1"
                      step="1"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de la solicitud <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reason"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Explica por qué necesitas este apoyo y cómo te ayudará..."
                      required
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Tu solicitud será revisada por la comunidad. Sé honesto y específico sobre
                      tu necesidad.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestModal(false);
                        setSelectedPool(null);
                      }}
                      className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={requestMutation.isPending}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {requestMutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* How to Contribute */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💚 ¿Cómo Contribuir?</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                Los pools se alimentan automáticamente del 2% de cada transacción P2P que realices.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💸</span>
                  <div>
                    <div className="font-semibold">Envía Créditos</div>
                    <div className="text-sm text-gray-600">
                      Cada transacción contribuye automáticamente
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <div className="font-semibold">Ayuda Directa</div>
                    <div className="text-sm text-gray-600">
                      Participa en la revisión de solicitudes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
