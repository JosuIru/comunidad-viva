import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Analytics, { ANALYTICS_EVENTS } from '@/lib/analytics';
import {
  ShoppingBagIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  HomeIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export default function QuickActions() {
  const t = useTranslations('quickActions');
  const [showAll, setShowAll] = useState(false);

  // Primary actions (most used/important)
  const primaryActions = [
    {
      href: '/offers/new',
      icon: ShoppingBagIcon,
      label: t('createOffer'),
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      shadow: 'hover:shadow-blue-500/50',
      priority: 1
    },
    {
      href: '/events/new',
      icon: CalendarDaysIcon,
      label: t('createEvent'),
      gradient: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      shadow: 'hover:shadow-green-500/50',
      priority: 1
    },
    {
      href: '/timebank',
      icon: ClockIcon,
      label: t('timeBank'),
      gradient: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
      shadow: 'hover:shadow-purple-500/50',
      priority: 1
    },
    {
      href: '/mutual-aid/needs/new',
      icon: ExclamationTriangleIcon,
      label: t('publishNeed'),
      gradient: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
      shadow: 'hover:shadow-red-500/50',
      priority: 1
    },
  ];

  // Secondary actions (less frequently used)
  const secondaryActions = [
    {
      href: '/mutual-aid/projects/new',
      icon: RocketLaunchIcon,
      label: t('createProject'),
      gradient: 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
      shadow: 'hover:shadow-indigo-500/50',
      priority: 2
    },
    {
      href: '/housing',
      icon: HomeIcon,
      label: t('housingCommunity'),
      gradient: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
      shadow: 'hover:shadow-amber-500/50',
      priority: 2
    },
  ];

  const actions = showAll ? [...primaryActions, ...secondaryActions] : primaryActions;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-6 w-6 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h3>
        </div>
        {!showAll && secondaryActions.length > 0 && (
          <button
            onClick={() => {
              setShowAll(true);
              Analytics.track(ANALYTICS_EVENTS.QUICK_ACTIONS_EXPANDED, { expanded: true });
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            {t('showMore')}
          </button>
        )}
        {showAll && (
          <button
            onClick={() => {
              setShowAll(false);
              Analytics.track(ANALYTICS_EVENTS.QUICK_ACTIONS_EXPANDED, { expanded: false });
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
          >
            {t('showLess')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {actions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Link
                href={action.href}
                onClick={() => {
                  Analytics.track(ANALYTICS_EVENTS.QUICK_ACTION_CLICKED, { action: action.label });
                }}
                className={`
                  group relative flex flex-col items-center justify-center gap-2
                  px-4 py-5 bg-gradient-to-br ${action.gradient}
                  text-white rounded-lg transition-all duration-300
                  hover:scale-105 hover:shadow-lg ${action.shadow}
                  border border-white/20
                `}
              >
                <action.icon className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs font-semibold text-center leading-tight">
                  {action.label}
                </span>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
