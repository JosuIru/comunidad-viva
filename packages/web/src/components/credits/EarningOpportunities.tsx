'use client';

import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const OPPORTUNITY_ICONS: Record<string, string> = {
  TIME_BANK_COMPLETED: '⏰',
  EVENT_ATTENDANCE: '📅',
  LOCAL_PURCHASE: '🛒',
  REFERRAL: '👥',
  RECYCLING: '♻️',
  OFFER_CREATED: '🏪',
  REVIEW: '⭐',
};

export default function EarningOpportunities() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['credits', 'opportunities'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/credits/opportunities`);
      if (!response.ok) throw new Error('Error al cargar oportunidades');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cómo ganar créditos</h3>
        <div className="space-y-3 animate-pulse">
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
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Cómo ganar créditos</h3>
      <p className="text-sm text-gray-600 mb-4">Participa en la comunidad y gana recompensas</p>

      <div className="space-y-3">
        {opportunities.map((opp: any) => (
          <div
            key={opp.reason}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors"
          >
            <div className="text-3xl flex-shrink-0">
              {OPPORTUNITY_ICONS[opp.reason] || '💚'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{opp.description}</p>
              {opp.dailyLimit && (
                <p className="text-xs text-gray-500 mt-1">
                  Límite: {opp.dailyLimit} créditos/día
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{opp.amount} 💚
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Los límites diarios se reinician a medianoche
        </p>
      </div>
    </div>
  );
}
