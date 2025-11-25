'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TimeBankTransactionsProps {
  userId?: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  DISPUTED: 'En disputa',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  DISPUTED: 'bg-red-100 text-red-800',
};

export default function TimeBankTransactions({ userId }: TimeBankTransactionsProps) {
  const [filter, setFilter] = useState<'all' | 'requester' | 'provider'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [impactStory, setImpactStory] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['timebank', 'transactions', userId, filter],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('role', filter);

      const response = await fetch(`${API_URL}/timebank/transactions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar transacciones');
      return response.json();
    },
    enabled: !!userId,
  });

  const confirmMutation = useMutation({
    mutationFn: async ({ transactionId, accept }: { transactionId: string; accept: boolean }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/timebank/transactions/${transactionId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accept }),
      });
      if (!response.ok) throw new Error('Error al confirmar transacción');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timebank', 'transactions'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: any }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/timebank/transactions/${transactionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al completar transacción');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timebank', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      setShowRatingModal(false);
      setSelectedTransaction(null);
      setRating(5);
      setComment('');
      setImpactStory('');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/timebank/transactions/${transactionId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cancelar transacción');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timebank', 'transactions'] });
    },
  });

  const handleComplete = (tx: any) => {
    setSelectedTransaction(tx);
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (!selectedTransaction) return;

    completeMutation.mutate({
      transactionId: selectedTransaction.id,
      data: {
        rating,
        comment: comment || undefined,
        impactStory: impactStory || undefined,
      },
    });
  };

  if (!userId) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mis Transacciones</h3>

          {/* Filter tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('requester')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'requester'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Solicitadas
            </button>
            <button
              onClick={() => setFilter('provider')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'provider'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ofrecidas
            </button>
          </div>
        </div>

        {/* Transactions list */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-6 space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.transactions?.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">⏰</div>
              <p className="font-medium mb-1">No hay transacciones todavía</p>
              <p className="text-sm">Comienza intercambiando tiempo con tu comunidad</p>
            </div>
          ) : (
            data.transactions.map((tx: any) => {
              const isRequester = tx.requesterId === userId;
              const otherUser = isRequester ? tx.provider : tx.requester;
              const scheduledDate = new Date(tx.scheduledFor);
              const timeAgo = formatDistanceToNow(scheduledDate, { addSuffix: true, locale: es });

              return (
                <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {otherUser.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* User and role */}
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{otherUser.name}</p>
                        <span className="text-xs text-gray-500">
                          {isRequester ? '(provee)' : '(solicita)'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[tx.status] || tx.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-900 mb-2">{tx.description}</p>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <span>⏱️</span>
                          {tx.hours}h · {tx.credits} créditos
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          {scheduledDate.toLocaleDateString('es-ES')} · {timeAgo}
                        </span>
                      </div>

                      {/* Ratings */}
                      {(tx.requesterRating || tx.providerRating) && (
                        <div className="mt-2 text-xs space-y-1">
                          {isRequester && tx.requesterRating && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <span>⭐</span>
                              Tu valoración: {tx.requesterRating}/5
                              {tx.requesterComment && (
                                <span className="text-gray-600 ml-2">· {tx.requesterComment}</span>
                              )}
                            </div>
                          )}
                          {!isRequester && tx.providerRating && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <span>⭐</span>
                              Tu valoración: {tx.providerRating}/5
                              {tx.providerComment && (
                                <span className="text-gray-600 ml-2">· {tx.providerComment}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {/* Provider can confirm/reject pending requests */}
                        {!isRequester && tx.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => confirmMutation.mutate({ transactionId: tx.id, accept: true })}
                              disabled={confirmMutation.isPending}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => confirmMutation.mutate({ transactionId: tx.id, accept: false })}
                              disabled={confirmMutation.isPending}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </>
                        )}

                        {/* Both parties can complete confirmed transactions */}
                        {tx.status === 'CONFIRMED' && (
                          <>
                            {(isRequester && !tx.requesterRating) || (!isRequester && !tx.providerRating) ? (
                              <button
                                onClick={() => handleComplete(tx)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                              >
                                Completar y valorar
                              </button>
                            ) : (
                              <span className="text-xs text-gray-600">Esperando valoración de la otra parte...</span>
                            )}
                          </>
                        )}

                        {/* Cancel option */}
                        {(tx.status === 'PENDING' || tx.status === 'CONFIRMED') && (
                          <button
                            onClick={() => cancelMutation.mutate(tx.id)}
                            disabled={cancelMutation.isPending}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {data?.transactions?.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
            {data.total} transacciones en total
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Completar transacción
            </h3>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cómo fue la experiencia? (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={`text-3xl transition-opacity ${
                      value <= rating ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Comparte tu experiencia..."
              />
            </div>

            {/* Impact story */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💚 Lo mejor de este intercambio (opcional)
              </label>
              <textarea
                value={impactStory}
                onChange={(e) => setImpactStory(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Esto ayudará a inspirar a otros..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedTransaction(null);
                  setRating(5);
                  setComment('');
                  setImpactStory('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submitRating}
                disabled={completeMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {completeMutation.isPending ? 'Guardando...' : 'Completar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
