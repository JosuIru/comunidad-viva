'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface UserMetrics {
  savings: {
    total: number;
    currency: string;
  };
  hoursExchanged: {
    given: number;
    received: number;
    total: number;
  };
  co2Avoided: {
    total: number;
    unit: string;
  };
  participation: {
    groupBuys: number;
    events: number;
    timeTransactions: number;
  };
  credits: {
    earned: number;
    spent: number;
    balance: number;
  };
}

const UserImpactCard: React.FC = () => {
  const { data: metrics, isLoading } = useQuery<UserMetrics>({
    queryKey: ['userMetrics'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/user/metrics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch user metrics');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Your Impact</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm opacity-90">Savings</p>
          <p className="text-2xl font-bold">
            {metrics.savings.total.toFixed(2)}
          </p>
          <p className="text-xs opacity-75">{metrics.savings.currency}</p>
        </div>

        <div>
          <p className="text-sm opacity-90">Hours</p>
          <p className="text-2xl font-bold">{metrics.hoursExchanged.total}</p>
          <p className="text-xs opacity-75">
            {metrics.hoursExchanged.given} given, {metrics.hoursExchanged.received} received
          </p>
        </div>

        <div>
          <p className="text-sm opacity-90">CO₂ Avoided</p>
          <p className="text-2xl font-bold">
            {metrics.co2Avoided.total.toFixed(1)}
          </p>
          <p className="text-xs opacity-75">{metrics.co2Avoided.unit}</p>
        </div>
      </div>

      <div className="border-t border-white border-opacity-20 pt-4">
        <p className="text-sm opacity-90 mb-2">Participation</p>
        <div className="flex items-center justify-between text-sm">
          <span>{metrics.participation.groupBuys} group buys</span>
          <span>{metrics.participation.events} events</span>
          <span>{metrics.participation.timeTransactions} time trades</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-90">Credit Balance</span>
          <span className="text-lg font-bold">{metrics.credits.balance}</span>
        </div>
      </div>
    </div>
  );
};

export default UserImpactCard;
