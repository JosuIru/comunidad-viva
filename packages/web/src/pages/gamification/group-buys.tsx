import { useState } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface GroupBuy {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  product: string;
  basePrice: number;
  currentDiscount: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  expiresAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  merchant: {
    id: string;
    name: string;
    avatar?: string;
  };
  userJoined?: boolean;
  discountTiers: DiscountTier[];
}

interface DiscountTier {
  participants: number;
  discount: number;
}

interface CreateGroupBuyData {
  title: string;
  description: string;
  product: string;
  basePrice: number;
  minParticipants: number;
  maxParticipants: number;
  duration: number; // hours
  discountTiers: DiscountTier[];
}

export default function GroupBuysPage() {
  const queryClient = useQueryClient();
  const [selectedBuy, setSelectedBuy] = useState<GroupBuy | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Form state for creating group buy
  const [formData, setFormData] = useState<CreateGroupBuyData>({
    title: '',
    description: '',
    product: '',
    basePrice: 0,
    minParticipants: 5,
    maxParticipants: 50,
    duration: 48,
    discountTiers: [
      { participants: 5, discount: 10 },
      { participants: 10, discount: 20 },
      { participants: 25, discount: 30 },
      { participants: 50, discount: 40 },
    ],
  });

  // Fetch group buys
  const { data: groupBuys, isLoading } = useQuery<GroupBuy[]>({
    queryKey: ['group-buys', filterStatus],
    queryFn: async () => {
      const endpoint = filterStatus === 'ALL'
        ? '/viral-features/group-buys'
        : `/viral-features/group-buys?status=${filterStatus}`;
      const response = await api.get(endpoint);
      return response.data.groupBuys || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Join group buy mutation
  const joinMutation = useMutation({
    mutationFn: async (groupBuyId: string) => {
      const response = await api.post(`/viral-features/group-buys/${groupBuyId}/join`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Te has unido a la compra grupal!');
      queryClient.invalidateQueries({ queryKey: ['group-buys'] });
      setSelectedBuy(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al unirse a la compra grupal');
    },
  });

  // Leave group buy mutation
  const leaveMutation = useMutation({
    mutationFn: async (groupBuyId: string) => {
      const response = await api.post(`/viral-features/group-buys/${groupBuyId}/leave`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Has salido de la compra grupal');
      queryClient.invalidateQueries({ queryKey: ['group-buys'] });
      setSelectedBuy(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al salir de la compra grupal');
    },
  });

  // Create group buy mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateGroupBuyData) => {
      const response = await api.post('/viral-features/group-buys/create', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Compra grupal creada exitosamente!');
      queryClient.invalidateQueries({ queryKey: ['group-buys'] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear compra grupal');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      product: '',
      basePrice: 0,
      minParticipants: 5,
      maxParticipants: 50,
      duration: 48,
      discountTiers: [
        { participants: 5, discount: 10 },
        { participants: 10, discount: 20 },
        { participants: 25, discount: 30 },
        { participants: 50, discount: 40 },
      ],
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const end = new Date(expiresAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Expirado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getCurrentPrice = (groupBuy: GroupBuy) => {
    return groupBuy.basePrice * (1 - groupBuy.currentDiscount / 100);
  };

  const getNextTier = (groupBuy: GroupBuy) => {
    return groupBuy.discountTiers.find(
      (tier) => tier.participants > groupBuy.currentParticipants
    );
  };

  const getProgressPercentage = (groupBuy: GroupBuy) => {
    return (groupBuy.currentParticipants / groupBuy.maxParticipants) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:text-blue-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
    }
  };

  return (
    <Layout title="Group Buys - Truk">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-4">🛒 Compras Grupales</h1>
                <p className="text-xl opacity-90">
                  Únete con otros y obtén mejores descuentos
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-white text-blue-600 dark:text-blue-400 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                + Crear Compra Grupal
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">👥</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Más Gente</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mayor descuento</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">💰</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Hasta 50% OFF</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Descuentos progresivos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Win-Win</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Todos ahorran</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {status === 'ALL' ? 'Todas' : status === 'ACTIVE' ? 'Activas' : 'Completadas'}
              </button>
            ))}
          </div>

          {/* Group Buys Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : groupBuys && groupBuys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupBuys.map((groupBuy) => {
                const nextTier = getNextTier(groupBuy);
                const progressPercentage = getProgressPercentage(groupBuy);

                return (
                  <div
                    key={groupBuy.id}
                    className="bg-white rounded dark:bg-gray-800-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 flex items-center justify-between">
                      <span className="font-bold text-lg">-{groupBuy.currentDiscount}% OFF</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(groupBuy.status)}`}>
                        {groupBuy.status}
                      </span>
                    </div>

                    <div className="p-6">
                      {/* Title & Description */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{groupBuy.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{groupBuy.description}</p>

                      {/* Product */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-blue-900 dark:text-blue-300 font-semibold mb-1">Producto</div>
                        <div className="text-blue-700">{groupBuy.product}</div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            €{getCurrentPrice(groupBuy).toFixed(2)}
                          </span>
                          <span className="text-lg text-gray-400 line-through">
                            €{groupBuy.basePrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-green-600 font-semibold">
                          Ahorras €{(groupBuy.basePrice - getCurrentPrice(groupBuy)).toFixed(2)}
                        </div>
                      </div>

                      {/* Participants Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Participantes</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {groupBuy.currentParticipants} / {groupBuy.maxParticipants}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        {groupBuy.currentParticipants < groupBuy.minParticipants && (
                          <div className="text-xs text-orange-600 mt-1">
                            Mínimo {groupBuy.minParticipants} participantes requeridos
                          </div>
                        )}
                      </div>

                      {/* Next Tier */}
                      {nextTier && groupBuy.status === 'ACTIVE' && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-700 text-sm font-semibold">
                              🎯 Próximo nivel: {nextTier.discount}% OFF
                            </span>
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            Faltan {nextTier.participants - groupBuy.currentParticipants} personas
                          </div>
                        </div>
                      )}

                      {/* Time & Merchant */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <span>{groupBuy.merchant?.name || 'Comerciante'}</span>
                        </div>
                        <div>⏰ {getTimeRemaining(groupBuy.expiresAt)}</div>
                      </div>

                      {/* Actions */}
                      {groupBuy.status === 'ACTIVE' && (
                        <>
                          {groupBuy.userJoined ? (
                            <button
                              onClick={() => leaveMutation.mutate(groupBuy.id)}
                              disabled={leaveMutation.isPending}
                              className="w-full py-3 px-4 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Salir de la Compra
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedBuy(groupBuy)}
                              disabled={groupBuy.currentParticipants >= groupBuy.maxParticipants}
                              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {groupBuy.currentParticipants >= groupBuy.maxParticipants
                                ? 'Compra Llena'
                                : '🛒 Unirme Ahora'}
                            </button>
                          )}
                        </>
                      )}

                      {groupBuy.status === 'COMPLETED' && (
                        <div className="w-full py-3 px-4 bg-blue-100 text-blue-700 rounded-lg font-bold text-center">
                          ✅ Compra Completada
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded dark:bg-gray-800-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No hay compras grupales {filterStatus.toLowerCase()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filterStatus === 'ACTIVE'
                  ? 'Crea la primera o espera a que alguien más lo haga'
                  : 'Cambia el filtro para ver otras compras'}
              </p>
              {filterStatus === 'ACTIVE' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  + Crear Compra Grupal
                </button>
              )}
            </div>
          )}

          {/* How it Works */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">¿Cómo funcionan las Compras Grupales?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-bold mb-2">Encuentra o Crea</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Busca una compra grupal activa o crea una nueva
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-bold mb-2">Únete</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Haz clic en "Unirme" para participar
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-bold mb-2">Espera</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Más personas = mayor descuento para todos
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">4️⃣</div>
                <h4 className="font-bold mb-2">Compra</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contacta al vendedor con el descuento final
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3">💡 Descuentos Progresivos</h4>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                El descuento aumenta automáticamente según el número de participantes:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">5 personas</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">10% OFF</div>
                </div>
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">10 personas</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">20% OFF</div>
                </div>
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">25 personas</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">30% OFF</div>
                </div>
                <div className="bg-white rounded dark:bg-gray-800 p-3 text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">50+ personas</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">40% OFF</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Modal */}
        {selectedBuy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded dark:bg-gray-800-lg max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Unirse a Compra Grupal</h3>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-lg mb-2">{selectedBuy.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedBuy.product}</p>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    €{getCurrentPrice(selectedBuy).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    €{selectedBuy.basePrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  Descuento actual: {selectedBuy.currentDiscount}% OFF
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Importante</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                  <li>• El descuento puede mejorar si se unen más personas</li>
                  <li>• La compra expira en {getTimeRemaining(selectedBuy.expiresAt)}</li>
                  <li>• Mínimo {selectedBuy.minParticipants} participantes requeridos</li>
                  <li>• Recibirás un código cuando se complete la compra</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedBuy(null)}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:bg-gray-600 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => joinMutation.mutate(selectedBuy.id)}
                  disabled={joinMutation.isPending}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {joinMutation.isPending ? 'Uniéndome...' : '🛒 Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded dark:bg-gray-800-lg max-w-2xl w-full p-8 my-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Crear Compra Grupal</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Pack de productos orgánicos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe qué incluye la compra grupal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Producto</label>
                  <input
                    type="text"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre específico del producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Precio Base (€)</label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duración (horas)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min. Participantes</label>
                    <input
                      type="number"
                      value={formData.minParticipants}
                      onChange={(e) => setFormData({ ...formData, minParticipants: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max. Participantes</label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="2"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Niveles de Descuento</h4>
                  <div className="space-y-2">
                    {formData.discountTiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="number"
                          value={tier.participants}
                          onChange={(e) => {
                            const newTiers = [...formData.discountTiers];
                            newTiers[index].participants = parseInt(e.target.value);
                            setFormData({ ...formData, discountTiers: newTiers });
                          }}
                          className="w-24 px-3 py-2 border border-blue-300 rounded-lg"
                          min="1"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">personas =</span>
                        <input
                          type="number"
                          value={tier.discount}
                          onChange={(e) => {
                            const newTiers = [...formData.discountTiers];
                            newTiers[index].discount = parseInt(e.target.value);
                            setFormData({ ...formData, discountTiers: newTiers });
                          }}
                          className="w-24 px-3 py-2 border border-blue-300 rounded-lg"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">% OFF</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:bg-gray-600 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={createMutation.isPending || !formData.title || !formData.product || formData.basePrice <= 0}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creando...' : '🛒 Crear Compra Grupal'}
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
