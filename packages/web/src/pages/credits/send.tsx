import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
}

interface FlowPreview {
  baseAmount: number;
  flowMultiplier: number;
  totalValue: number;
  bonusValue: number;
  poolContribution: number;
}

export default function SendCreditsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get current user
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Debes iniciar sesión');
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUserId(user.id);
  }, [router]);

  // Fetch current user profile
  const { data: currentUser } = useQuery<User>({
    queryKey: ['profile', currentUserId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${currentUserId}`);
      return data;
    },
    enabled: !!currentUserId,
  });

  // Fetch all users for selection
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      // This would need a proper users list endpoint
      // For now, return empty array
      return [];
    },
  });

  // Calculate flow multiplier preview
  const calculateFlowMultiplier = (fromBalance: number, toBalance: number): number => {
    if (toBalance >= fromBalance) return 1.0;

    const balanceRatio = fromBalance / Math.max(toBalance, 1);

    if (balanceRatio >= 10) return 1.5;
    if (balanceRatio >= 5) return 1.3;
    if (balanceRatio >= 2) return 1.15;
    return 1.05;
  };

  // Get recipient data
  const { data: recipient } = useQuery<User>({
    queryKey: ['user', recipientId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${recipientId}`);
      return data;
    },
    enabled: !!recipientId && recipientId !== currentUserId,
  });

  // Calculate preview
  const preview: FlowPreview | null = (() => {
    if (!currentUser || !recipient || !amount || parseFloat(amount) <= 0) {
      return null;
    }

    const baseAmount = parseFloat(amount);
    const flowMultiplier = calculateFlowMultiplier(currentUser.credits, recipient.credits);
    const totalValue = Math.floor(baseAmount * flowMultiplier);
    const bonusValue = totalValue - baseAmount;
    const poolContribution = Math.floor(baseAmount * 0.02);

    return {
      baseAmount,
      flowMultiplier,
      totalValue,
      bonusValue,
      poolContribution,
    };
  })();

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: async (data: { toUserId: string; amount: number; description?: string }) => {
      const response = await api.post('/flow-economics/send', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Créditos enviados exitosamente');
      queryClient.invalidateQueries({ queryKey: ['profile', currentUserId] });
      // Reset form
      setRecipientId('');
      setAmount('');
      setDescription('');
      // Redirect to profile
      setTimeout(() => router.push('/profile'), 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al enviar créditos';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId) {
      toast.error('Selecciona un destinatario');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    if (parseFloat(amount) > (currentUser?.credits || 0)) {
      toast.error('No tienes suficientes créditos');
      return;
    }

    sendMutation.mutate({
      toUserId: recipientId,
      amount: parseFloat(amount),
      description: description.trim() || undefined,
    });
  };

  return (
    <Layout title="Enviar Créditos - Comunidad Viva">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Volver
            </button>
          </div>

          {/* Current Balance */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow p-6 text-white mb-6">
            <div className="text-sm text-white/80">Tu balance actual</div>
            <div className="text-4xl font-bold mt-2">{currentUser?.credits || 0} créditos</div>
          </div>

          {/* Send Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Enviar Créditos con Multiplicador de Flujo
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Email Input */}
              <div>
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email del destinatario <span className="text-red-500">*</span>
                </label>
                <input
                  id="recipientEmail"
                  type="email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={async () => {
                    if (searchQuery) {
                      try {
                        // Search user by email
                        const { data } = await api.get(`/users/search/email/${encodeURIComponent(searchQuery)}`);
                        if (data && data.id) {
                          setRecipientId(data.id);
                        } else {
                          toast.error('Usuario no encontrado');
                        }
                      } catch (error) {
                        toast.error('Usuario no encontrado');
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              {/* Show recipient info */}
              {recipient && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {recipient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{recipient.name}</div>
                      <div className="text-sm text-gray-600">{recipient.email}</div>
                      <div className="text-sm text-gray-500">Balance: {recipient.credits} créditos</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
                {currentUser && amount && parseFloat(amount) > currentUser.credits && (
                  <p className="text-red-500 text-sm mt-1">No tienes suficientes créditos</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ej: Gracias por tu ayuda..."
                />
              </div>

              {/* Flow Preview */}
              {preview && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ✨ Preview del Multiplicador de Flujo
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Envías</span>
                      <span className="text-xl font-bold text-gray-900">
                        {preview.baseAmount} créditos
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Multiplicador de flujo</span>
                      <span className="text-xl font-bold text-purple-600">
                        {preview.flowMultiplier.toFixed(2)}x
                      </span>
                    </div>

                    <div className="h-px bg-gray-300"></div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Destinatario recibe</span>
                      <span className="text-2xl font-bold text-green-600">
                        {preview.totalValue} créditos
                      </span>
                    </div>

                    {preview.bonusValue > 0 && (
                      <div className="p-3 bg-green-100 border border-green-300 rounded text-sm">
                        <span className="text-green-800 font-medium">
                          🎁 Bonus de {preview.bonusValue} créditos generados por el flujo económico
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Contribución a pool comunitario (2%)</span>
                      <span className="text-gray-700 font-medium">
                        {preview.poolContribution} créditos
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 ¿Cómo funciona el Multiplicador de Flujo?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Cuando envías créditos a alguien con menos balance, se genera valor extra</li>
                  <li>• Mayor diferencia de balance = mayor multiplicador (hasta 1.5x)</li>
                  <li>• El 2% va al pool comunitario para ayudar a quien lo necesite</li>
                  <li>• Fomenta la circulación y generosidad en la comunidad</li>
                </ul>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={sendMutation.isPending || !preview || parseFloat(amount) > (currentUser?.credits || 0)}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMutation.isPending ? 'Enviando...' : 'Enviar Créditos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
