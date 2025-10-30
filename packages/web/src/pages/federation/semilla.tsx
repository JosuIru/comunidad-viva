import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  fromDID: string;
  toDID: string;
  amount: number;
  reason: string;
  type: string;
  pohChange: number;
  createdAt: string;
}

interface SemillaBalance {
  balance: number;
  did: string;
}

export default function SemillaWallet() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    toDID: '',
    amount: '',
    reason: '',
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);
    setUserId(storedUserId);
  }, []);

  // Fetch balance
  const { data: balanceData, isLoading } = useQuery<SemillaBalance>({
    queryKey: ['semilla-balance'],
    queryFn: async () => {
      const response = await api.get('/federation/semilla/balance');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Fetch transactions
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['semilla-transactions'],
    queryFn: async () => {
      const response = await api.get('/federation/semilla/transactions', {
        params: { limit: 50 },
      });
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Grant initial tokens mutation
  const grantInitialMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/federation/semilla/grant-initial');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semilla-balance'] });
      queryClient.invalidateQueries({ queryKey: ['semilla-transactions'] });
      alert('¡100 SEMILLA recibidos! Bienvenido a la federación');
    },
  });

  // Send SEMILLA mutation
  const sendMutation = useMutation({
    mutationFn: async (data: { toDID: string; amount: number; reason: string }) => {
      const response = await api.post('/federation/semilla/transfer', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semilla-balance'] });
      queryClient.invalidateQueries({ queryKey: ['semilla-transactions'] });
      setShowSendModal(false);
      setSendForm({ toDID: '', amount: '', reason: '' });
      alert('¡Transferencia exitosa!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al enviar SEMILLA');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.toDID || !sendForm.amount || !sendForm.reason) {
      alert('Por favor completa todos los campos');
      return;
    }
    sendMutation.mutate({
      toDID: sendForm.toDID,
      amount: parseFloat(sendForm.amount),
      reason: sendForm.reason,
    });
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              Autenticación requerida
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Necesitas iniciar sesión para acceder a tu wallet SEMILLA
            </p>
            <div className="mt-6">
              <a
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wallet SEMILLA
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tu moneda federada para transacciones en la red Gailu Labs
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-xl p-8 mb-8 text-white">
              <p className="text-green-100 text-sm mb-2">Balance Disponible</p>
              <div className="flex items-end gap-2 mb-6">
                <h2 className="text-5xl font-bold">{balanceData?.balance.toFixed(2)}</h2>
                <span className="text-2xl font-semibold mb-1">SEMILLA</span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSendModal(true)}
                  className="flex-1 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowUpIcon className="h-5 w-5" />
                  Enviar
                </button>
                {balanceData && balanceData.balance === 0 && (
                  <button
                    onClick={() => grantInitialMutation.mutate()}
                    disabled={grantInitialMutation.isPending}
                    className="flex-1 bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <GiftIcon className="h-5 w-5" />
                    {grantInitialMutation.isPending ? 'Procesando...' : 'Reclamar 100 SEMILLA'}
                  </button>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ¿Qué es SEMILLA?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Moneda federada que recompensa la contribución y el Proof of Help.
                  Circula en toda la red Gailu Labs.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Cómo ganar SEMILLA
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ Contribuir a la comunidad</li>
                  <li>✓ Participar en círculos</li>
                  <li>✓ Ayuda mutua federada</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Usos de SEMILLA
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Transferencias federadas</li>
                  <li>• Acceso a recursos</li>
                  <li>• Votación en círculos</li>
                </ul>
              </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Historial de Transacciones
              </h3>

              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => {
                    const isReceived = tx.toDID === balanceData?.did;
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${isReceived ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                            {isReceived ? (
                              <ArrowDownIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowUpIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {isReceived ? 'Recibido' : 'Enviado'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tx.reason}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(tx.createdAt).toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${isReceived ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isReceived ? '+' : '-'}{tx.amount.toFixed(2)} SEMILLA
                          </p>
                          {tx.pohChange !== 0 && (
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              PoH: {tx.pohChange > 0 ? '+' : ''}{tx.pohChange}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    No hay transacciones todavía
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Comienza enviando o recibiendo SEMILLA
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Send Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Enviar SEMILLA
              </h3>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    DID del destinatario
                  </label>
                  <input
                    type="text"
                    value={sendForm.toDID}
                    onChange={(e) => setSendForm({ ...sendForm, toDID: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="did:gailu:..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Motivo
                  </label>
                  <textarea
                    value={sendForm.reason}
                    onChange={(e) => setSendForm({ ...sendForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="¿Por qué estás enviando SEMILLA?"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sendMutation.isPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {sendMutation.isPending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
