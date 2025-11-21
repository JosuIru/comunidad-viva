import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import BadgeManager, { BADGES, Badge } from '@/lib/badges';
import { getI18nProps } from '@/lib/i18n';

const categoryNames: Record<string, string> = {
  onboarding: 'Introducción',
  social: 'Social',
  economy: 'Economía',
  community: 'Comunidad',
  special: 'Especial',
};

const categoryIcons: Record<string, string> = {
  onboarding: '🎓',
  social: '👥',
  economy: '💰',
  community: '🏘️',
  special: '⭐',
};

export default function AchievementsLocalPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const userBadges = BadgeManager.getUserBadges();
  const progress = BadgeManager.getBadgeProgress();
  const totalPoints = BadgeManager.getTotalPoints();

  const allBadges = Object.values(BADGES);

  const filteredBadges = allBadges.filter((badge) => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    if (showUnlockedOnly && !userBadges.includes(badge.id)) return false;
    return true;
  });

  const categories = Array.from(new Set(allBadges.map((b) => b.category)));

  const badgesByCategory = categories.map((category) => ({
    category,
    badges: allBadges.filter((b) => b.category === category),
    unlocked: allBadges.filter((b) => b.category === category && userBadges.includes(b.id)).length,
  }));

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
              <span>🏆</span>
              <span>Logros y Badges</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Colecciona badges completando acciones en la comunidad
            </p>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-xl p-8 mb-8 text-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{progress.earned}</div>
                <div className="text-xl opacity-90">Badges Desbloqueados</div>
                <div className="text-sm opacity-75 mt-1">de {progress.total} totales</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{progress.percentage}%</div>
                <div className="text-xl opacity-90">Completado</div>
                <div className="w-full bg-white/20 rounded-full h-3 mt-2">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{totalPoints}</div>
                <div className="text-xl opacity-90">Puntos Totales</div>
                <div className="text-sm opacity-75 mt-1">de {allBadges.reduce((sum, b) => sum + b.points, 0)} posibles</div>
              </div>
            </div>
          </motion.div>

          {/* Category Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            {badgesByCategory.map(({ category, badges, unlocked }) => (
              <div
                key={category}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
              >
                <div className="text-4xl mb-2">{categoryIcons[category]}</div>
                <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  {categoryNames[category]}
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {unlocked}/{badges.length}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Category Filter */}
              <div className="flex-1 w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtrar por categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryIcons[cat]} {categoryNames[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unlocked Filter */}
              <div className="flex items-center gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnlockedOnly}
                    onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Solo desbloqueados
                  </span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Badge Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {filteredBadges.map((badge, index) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isUnlocked={userBadges.includes(badge.id)}
                index={index}
              />
            ))}
          </motion.div>

          {filteredBadges.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No se encontraron badges con estos filtros
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  index: number;
}

function BadgeCard({ badge, isUnlocked, index }: BadgeCardProps) {
  const categoryColors: Record<string, string> = {
    onboarding: 'from-green-400 to-green-600',
    social: 'from-blue-400 to-blue-600',
    economy: 'from-yellow-400 to-yellow-600',
    community: 'from-purple-400 to-purple-600',
    special: 'from-pink-400 to-pink-600',
  };

  const categoryBorders: Record<string, string> = {
    onboarding: 'border-green-400',
    social: 'border-blue-400',
    economy: 'border-yellow-400',
    community: 'border-purple-400',
    special: 'border-pink-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300
        ${isUnlocked ? 'hover:scale-105 hover:shadow-2xl' : 'opacity-60'}
        ${isUnlocked ? `border-2 ${categoryBorders[badge.category]}` : 'border border-gray-300 dark:border-gray-600'}
      `}
    >
      {/* Category Gradient Header */}
      {isUnlocked && (
        <div className={`h-2 bg-gradient-to-r ${categoryColors[badge.category]}`}></div>
      )}

      {/* Badge Content */}
      <div className="p-5">
        {/* Icon */}
        <div className={`text-6xl text-center mb-3 ${isUnlocked ? 'animate-bounce-slow' : ''}`}>
          {isUnlocked ? badge.icon : '🔒'}
        </div>

        {/* Name */}
        <h3
          className={`text-center font-bold text-lg mb-2 ${
            isUnlocked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {isUnlocked ? badge.name : '???'}
        </h3>

        {/* Description */}
        <p
          className={`text-xs text-center mb-3 min-h-[3rem] ${
            isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {isUnlocked ? badge.description : 'Badge secreto. ¡Sigue explorando para desbloquearlo!'}
        </p>

        {/* Points Badge */}
        {isUnlocked && (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-full shadow-md">
              <span>⭐</span>
              <span>{badge.points} pts</span>
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {categoryIcons[badge.category]} {categoryNames[badge.category]}
          </span>
        </div>
      </div>

      {/* Locked Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/30 backdrop-blur-[1px] pointer-events-none"></div>
      )}
    </motion.div>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
