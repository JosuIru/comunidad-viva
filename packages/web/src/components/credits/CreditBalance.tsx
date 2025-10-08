'use client';

import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CreditBalanceProps {
  userId?: string;
}

export default function CreditBalance({ userId }: CreditBalanceProps) {
  const { data: balance, isLoading } = useQuery({
    queryKey: ['credits', 'balance', userId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/credits/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar balance');
      return response.json();
    },
    enabled: !!userId,
  });

  const { data: stats } = useQuery({
    queryKey: ['credits', 'stats', userId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/credits/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      return response.json();
    },
    enabled: !!userId,
  });

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white animate-pulse">
        <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
        <div className="h-12 bg-white/20 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-2/3"></div>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
      {/* Balance */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-green-100">Tus Créditos</p>
          <p className="text-4xl font-bold">{balance.balance}</p>
        </div>
        <div className="text-5xl">{balance.level.badge}</div>
      </div>

      {/* Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium">Nivel {balance.level.level}: {balance.level.name}</span>
          {balance.nextLevel && (
            <span className="text-green-100">
              {Math.round(balance.progress)}% → {balance.nextLevel.name}
            </span>
          )}
        </div>
        {balance.nextLevel && (
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${balance.progress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs text-green-100">Hoy</p>
            <p className="text-lg font-bold">+{stats.today}</p>
          </div>
          <div>
            <p className="text-xs text-green-100">Esta semana</p>
            <p className="text-lg font-bold">+{stats.week}</p>
          </div>
          <div>
            <p className="text-xs text-green-100">Este mes</p>
            <p className="text-lg font-bold">+{stats.month}</p>
          </div>
        </div>
      )}

      {/* Next level indicator */}
      {balance.nextLevel && (
        <div className="mt-4 pt-4 border-t border-white/20 text-sm text-green-100">
          <span className="font-medium">{balance.nextLevel.minCredits - balance.balance} créditos</span> para alcanzar{' '}
          <span className="font-medium">{balance.nextLevel.name} {balance.nextLevel.badge}</span>
        </div>
      )}
    </div>
  );
}
