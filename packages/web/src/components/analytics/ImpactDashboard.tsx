'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ImpactMetricsCard from './ImpactMetricsCard';

interface CommunityMetrics {
  savings: {
    total: number;
    currency: string;
  };
  hoursExchanged: {
    total: number;
    transactionCount: number;
  };
  co2Avoided: {
    total: number;
    unit: string;
    breakdown: {
      groupBuys: number;
      timeBank: number;
      events: number;
    };
  };
  participants: {
    activeUsers: number;
    groupBuyParticipations: number;
    eventAttendances: number;
  };
  credits: {
    earned: number;
    spent: number;
    circulating: number;
  };
}

const ImpactDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | '1y'>('all');

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date | undefined;

    switch (dateRange) {
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = undefined;
    }

    return { startDate, endDate };
  };

  // Fetch community metrics
  const { data: metrics, isLoading } = useQuery<CommunityMetrics>({
    queryKey: ['communityMetrics', dateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate && dateRange !== 'all') params.append('endDate', endDate.toISOString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/community/metrics?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
  });

  const handleExportCSV = async () => {
    const { startDate, endDate } = getDateRange();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate && dateRange !== 'all') params.append('endDate', endDate.toISOString());

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/analytics/export/csv?${params}`,
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No metrics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Impact</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the positive impact of our community initiatives
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Date range selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ImpactMetricsCard
          title="Total Savings"
          value={metrics.savings.total.toFixed(2)}
          unit={metrics.savings.currency}
          icon="💰"
          subtitle="Through collective purchases"
        />

        <ImpactMetricsCard
          title="Hours Exchanged"
          value={metrics.hoursExchanged.total}
          unit="hours"
          icon="⏱️"
          subtitle={`${metrics.hoursExchanged.transactionCount} transactions`}
        />

        <ImpactMetricsCard
          title="CO₂ Avoided"
          value={metrics.co2Avoided.total.toFixed(1)}
          unit={metrics.co2Avoided.unit}
          icon="🌱"
          subtitle="Environmental impact"
        />

        <ImpactMetricsCard
          title="Active Users"
          value={metrics.participants.activeUsers}
          unit="members"
          icon="👥"
          subtitle="Community participants"
        />

        <ImpactMetricsCard
          title="Credits Circulating"
          value={metrics.credits.circulating}
          unit="credits"
          icon="🪙"
          subtitle={`${metrics.credits.earned} earned, ${metrics.credits.spent} spent`}
        />

        <ImpactMetricsCard
          title="Event Attendances"
          value={metrics.participants.eventAttendances}
          unit="check-ins"
          icon="📅"
          subtitle="Community gatherings"
        />
      </div>

      {/* CO2 Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          CO₂ Impact Breakdown
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg mr-3">
                🛒
              </div>
              <span className="text-sm font-medium text-gray-700">
                Collective Purchases
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {metrics.co2Avoided.breakdown.groupBuys.toFixed(1)} kg
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg mr-3">
                ⏱️
              </div>
              <span className="text-sm font-medium text-gray-700">
                Time Bank Exchanges
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {metrics.co2Avoided.breakdown.timeBank.toFixed(1)} kg
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg mr-3">
                📅
              </div>
              <span className="text-sm font-medium text-gray-700">
                Local Events
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {metrics.co2Avoided.breakdown.events.toFixed(1)} kg
            </span>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Participation Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Group Buy Participations</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.participants.groupBuyParticipations}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Event Attendances</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.participants.eventAttendances}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time Transactions</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.hoursExchanged.transactionCount}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Credit Economy
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Earned</span>
              <span className="text-sm font-semibold text-green-600">
                +{metrics.credits.earned}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Spent</span>
              <span className="text-sm font-semibold text-red-600">
                -{metrics.credits.spent}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Currently Circulating</span>
              <span className="text-sm font-semibold text-blue-600">
                {metrics.credits.circulating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;
