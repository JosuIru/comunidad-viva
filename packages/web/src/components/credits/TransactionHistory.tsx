'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TransactionHistoryProps {
  userId?: string;
}

const REASON_LABELS: Record<string, string> = {
  TIME_BANK_COMPLETED: 'Banco de tiempo',
  EVENT_ATTENDANCE: 'Asistencia a evento',
  LOCAL_PURCHASE: 'Compra local',
  REFERRAL: 'Referido',
  RECYCLING: 'Reciclaje',
  OFFER_CREATED: 'Oferta publicada',
  REVIEW: 'Reseña',
  ADMIN_GRANT: 'Otorgado por admin',
  PURCHASE: 'Compra',
  DISCOUNT: 'Descuento',
  SERVICE: 'Servicio',
  EVENT_ACCESS: 'Acceso a evento',
  ADJUSTMENT: 'Ajuste',
};

export default function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'earning' | 'spending'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['credits', 'transactions', userId, filter],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);

      const response = await fetch(`${API_URL}/credits/transactions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar transacciones');
      return response.json();
    },
    enabled: !!userId,
  });

  if (!userId) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Historial de créditos</h3>

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
            onClick={() => setFilter('earning')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'earning'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ganados
          </button>
          <button
            onClick={() => setFilter('spending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'spending'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Gastados
          </button>
        </div>
      </div>

      {/* Transactions list */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : data?.transactions?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>No hay transacciones todavía</p>
          </div>
        ) : (
          data.transactions.map((tx: any) => {
            const timeAgo = formatDistanceToNow(new Date(tx.createdAt), {
              addSuffix: true,
              locale: es,
            });
            const isPositive = tx.amount > 0;

            return (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPositive ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <span className="text-xl">
                      {isPositive ? '💚' : '💸'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {tx.description || REASON_LABELS[tx.reason] || tx.reason}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p
                      className={`text-lg font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}{tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      Balance: {tx.balance}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with total */}
      {data?.transactions?.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          {data.total} transacciones en total
        </div>
      )}
    </div>
  );
}
