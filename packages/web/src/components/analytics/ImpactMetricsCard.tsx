import React from 'react';

interface ImpactMetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const ImpactMetricsCard: React.FC<ImpactMetricsCardProps> = ({
  title,
  value,
  unit,
  icon,
  subtitle,
  trend,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {unit && (
              <span className="ml-2 text-sm font-medium text-gray-500">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactMetricsCard;
