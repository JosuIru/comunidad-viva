/**
 * Platform Statistics Component
 * Shows aggregate stats to create sense of activity
 */

import { useMemo } from 'react';
import {
  UserGroupIcon,
  ShoppingBagIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { DemoContentManager } from '@/lib/demoContent';

interface PlatformStatsProps {
  realUsersCount?: number;
  realOffersCount?: number;
  realCommunitiesCount?: number;
  realEventsCount?: number;
  showDisclaimer?: boolean;
  variant?: 'default' | 'compact' | 'hero';
}

export default function PlatformStats({
  realUsersCount = 0,
  realOffersCount = 0,
  realCommunitiesCount = 0,
  realEventsCount = 0,
  showDisclaimer = true,
  variant = 'default',
}: PlatformStatsProps) {
  const demoStats = DemoContentManager.getDemoStats();

  // Calculate total stats (real + demo)
  const totalStats = useMemo(() => ({
    users: 1234 + realUsersCount, // Base number + real users
    offers: demoStats.totalOffers + realOffersCount,
    communities: demoStats.totalCommunities + realCommunitiesCount,
    events: demoStats.totalEvents + realEventsCount,
  }), [realUsersCount, realOffersCount, realCommunitiesCount, realEventsCount, demoStats]);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <UserGroupIcon className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {totalStats.users.toLocaleString()}
          </span>
          <span className="text-gray-500 dark:text-gray-400">usuarios</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBagIcon className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {totalStats.offers.toLocaleString()}
          </span>
          <span className="text-gray-500 dark:text-gray-400">ofertas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {totalStats.communities}
          </span>
          <span className="text-gray-500 dark:text-gray-400">comunidades</span>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="h-6 w-6" />
          <h3 className="text-xl font-bold">Comunidad Activa</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-4xl font-bold mb-1">
              {totalStats.users.toLocaleString()}
            </div>
            <div className="text-sm text-blue-100">Usuarios activos</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-4xl font-bold mb-1">
              {totalStats.offers}
            </div>
            <div className="text-sm text-blue-100">Ofertas publicadas</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-4xl font-bold mb-1">
              {totalStats.events}
            </div>
            <div className="text-sm text-blue-100">Eventos próximos</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="text-4xl font-bold mb-1">
              {totalStats.communities}
            </div>
            <div className="text-sm text-blue-100">Comunidades</div>
          </motion.div>
        </div>

        {showDisclaimer && (
          <p className="text-xs text-blue-100 mt-6 text-center opacity-75">
            *Incluye contenido de demostración para mejorar la experiencia
          </p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Actividad en la Plataforma
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<UserGroupIcon className="h-6 w-6" />}
          label="Usuarios activos"
          value={totalStats.users}
          color="blue"
        />
        <StatCard
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          label="Ofertas publicadas"
          value={totalStats.offers}
          color="green"
        />
        <StatCard
          icon={<SparklesIcon className="h-6 w-6" />}
          label="Eventos próximos"
          value={totalStats.events}
          color="purple"
        />
        <StatCard
          icon={<MapPinIcon className="h-6 w-6" />}
          label="Comunidades"
          value={totalStats.communities}
          color="pink"
        />
      </div>

      {showDisclaimer && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          *Incluye ejemplos de demostración
        </p>
      )}
    </div>
  );
}

/**
 * Individual Stat Card
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'pink';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    pink: {
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-200 dark:border-pink-800',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
      <div className={`${colors.text} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </div>
    </div>
  );
}
