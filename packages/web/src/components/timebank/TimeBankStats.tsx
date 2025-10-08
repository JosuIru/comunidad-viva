'use client';

import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TimeBankStatsProps {
  userId?: string;
}

export default function TimeBankStats({ userId }: TimeBankStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['timebank', 'stats', userId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/timebank/stats`, {
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
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Mis estadísticas de Banco de Tiempo
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hours provided */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {stats.hoursProvided}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Horas ofrecidas
          </div>
        </div>

        {/* Hours received */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {stats.hoursReceived}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Horas recibidas
          </div>
        </div>

        {/* Transactions completed */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">
            {stats.transactionsCompleted}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Intercambios
          </div>
        </div>

        {/* Average rating */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-1">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
            {stats.averageRating > 0 && <span className="text-xl">⭐</span>}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Valoración media
            {stats.totalRatings > 0 && (
              <span className="text-xs block text-gray-500">
                ({stats.totalRatings} {stats.totalRatings === 1 ? 'valoración' : 'valoraciones'})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Balance info */}
      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Balance de horas</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Diferencia entre horas ofrecidas y recibidas
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                stats.hoursProvided - stats.hoursReceived > 0
                  ? 'text-green-600'
                  : stats.hoursProvided - stats.hoursReceived < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {stats.hoursProvided - stats.hoursReceived > 0 ? '+' : ''}
              {(stats.hoursProvided - stats.hoursReceived).toFixed(1)}h
            </div>
          </div>
        </div>
      </div>

      {/* Motivation message */}
      {stats.transactionsCompleted === 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium">💡 ¿Sabías que...?</p>
          <p className="mt-1">
            El banco de tiempo te permite intercambiar habilidades con tu comunidad.
            ¡Comienza ofreciendo algo que se te da bien!
          </p>
        </div>
      )}

      {stats.transactionsCompleted > 0 && stats.averageRating >= 4.5 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p className="font-medium">🌟 ¡Excelente trabajo!</p>
          <p className="mt-1">
            Tu alta valoración demuestra tu compromiso con la comunidad. ¡Sigue así!
          </p>
        </div>
      )}
    </div>
  );
}
