'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface BeginnerWelcomeProps {
  userName: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function BeginnerWelcome({ userName, onComplete, onSkip }: BeginnerWelcomeProps) {
  const t = useTranslations('beginnerWelcome');
  const router = useRouter();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const actions = [
    {
      id: 'explore',
      icon: MagnifyingGlassIcon,
      title: t('actions.explore.title'),
      description: t('actions.explore.description'),
      href: '/offers',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      id: 'create',
      icon: PlusCircleIcon,
      title: t('actions.create.title'),
      description: t('actions.create.description'),
      href: '/offers/new',
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:from-green-600 hover:to-emerald-700',
    },
    {
      id: 'community',
      icon: UserGroupIcon,
      title: t('actions.community.title'),
      description: t('actions.community.description'),
      href: '/communities',
      color: 'from-purple-500 to-pink-600',
      hoverColor: 'hover:from-purple-600 hover:to-pink-700',
    },
  ];

  const handleActionClick = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    newCompleted.add(actionId);
    setCompletedActions(newCompleted);

    // Mark as completed in localStorage
    localStorage.setItem('beginner_actions_completed', JSON.stringify([...newCompleted]));

    // If all actions completed, trigger onComplete
    if (newCompleted.size >= 2) {
      localStorage.setItem('beginner_mode_completed', 'true');
    }
  };

  const handleSkipBeginner = () => {
    localStorage.setItem('beginner_mode_completed', 'true');
    onSkip();
  };

  const firstName = userName.split(' ')[0];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400 font-medium mb-4">
          <SparklesIcon className="h-5 w-5" />
          <span>{t('badge')}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('greeting', { name: firstName })}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12"
      >
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            <Link
              href={action.href}
              onClick={() => handleActionClick(action.id)}
              className={`
                relative block p-6 rounded-2xl bg-gradient-to-br ${action.color} ${action.hoverColor}
                text-white shadow-lg hover:shadow-xl transition-all duration-300
                transform hover:scale-105 group
              `}
            >
              {completedActions.has(action.id) && (
                <div className="absolute top-3 right-3">
                  <CheckCircleIcon className="h-6 w-6 text-white/80" />
                </div>
              )}

              <action.icon className="h-10 w-10 mb-4 group-hover:scale-110 transition-transform" />

              <h3 className="text-xl font-bold mb-2">{action.title}</h3>

              <p className="text-sm text-white/90 mb-4">{action.description}</p>

              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{t('startNow')}</span>
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center mb-8"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {t('progress', { completed: completedActions.size, total: 2 })}
        </p>
        <div className="flex gap-2 justify-center">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full transition-colors ${
                i < completedActions.size
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Skip Option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <button
          onClick={handleSkipBeginner}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors"
        >
          {t('skipToFullDashboard')}
        </button>
      </motion.div>

      {/* Completion Message */}
      {completedActions.size >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('completed.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('completed.message')}
            </p>
            <button
              onClick={onComplete}
              className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
            >
              {t('completed.button')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
