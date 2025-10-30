import { useState, useEffect } from 'react';
import axios from 'axios';

interface Badge {
  id: string;
  badgeType: string;
  earnedAt: string;
  progress: number;
  isNew: boolean;
  metadata: {
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'SECRET';
    category: string;
  };
}

interface BadgeProgress {
  badgeType: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewards?: {
    credits?: number;
    xp?: number;
  };
}

interface BadgeStats {
  total: number;
  unlocked: number;
  byRarity: {
    COMMON: number;
    RARE: number;
    EPIC: number;
    LEGENDARY: number;
    SECRET: number;
  };
  byCategory: Record<string, number>;
}

const rarityColors = {
  COMMON: 'from-gray-400 to-gray-600',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-yellow-400 to-yellow-600',
  SECRET: 'from-pink-400 to-pink-600',
};

const rarityBorders = {
  COMMON: 'border-gray-400',
  RARE: 'border-blue-400',
  EPIC: 'border-purple-400',
  LEGENDARY: 'border-yellow-400',
  SECRET: 'border-pink-400',
};

const categoryNames: Record<string, string> = {
  AYUDA_MUTUA: 'Ayuda Mutua',
  TIEMPO: 'Tiempo',
  EVENTOS: 'Eventos',
  ECO: 'Ecología',
  SOCIAL: 'Social',
  APRENDIZAJE: 'Aprendizaje',
  ENSENANZA: 'Enseñanza',
  AHORRO: 'Ahorro',
  COMUNIDAD: 'Comunidad',
  GOBERNANZA: 'Gobernanza',
  MODERACION: 'Moderación',
  SOCIAL_MEDIA: 'Redes Sociales',
  ESPECIAL: 'Especial',
};

export default function BadgeGallery() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<BadgeProgress[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  useEffect(() => {
    fetchBadgeData();
  }, []);

  const fetchBadgeData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [badgesRes, progressRes, statsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/achievements/my-badges`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/achievements/progress`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/achievements/stats`, { headers }),
      ]);

      setBadges(badgesRes.data);
      setProgress(progressRes.data);
      setStats(statsRes.data);

      // Mark new badges as seen after a delay
      const newBadgeTypes = badgesRes.data
        .filter((b: Badge) => b.isNew)
        .map((b: Badge) => b.badgeType);

      if (newBadgeTypes.length > 0) {
        setTimeout(() => {
          axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/achievements/mark-seen`,
            { badgeTypes: newBadgeTypes },
            { headers }
          );
        }, 5000);
      }
    } catch (error) {
      console.error('Error fetching badge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = progress.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
    if (showUnlockedOnly && !item.unlocked) return false;
    return true;
  });

  const categories = Array.from(new Set(progress.map((p) => p.category)));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Galería de Badges</h1>
          <p className="text-gray-600">Colecciona badges completando acciones en la comunidad</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.unlocked}</div>
              <div className="text-sm text-gray-600">Desbloqueados</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-gray-400">{stats.byRarity.COMMON}</div>
              <div className="text-sm text-gray-600">Comunes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.byRarity.RARE}</div>
              <div className="text-sm text-gray-600">Raros</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-purple-500">{stats.byRarity.EPIC}</div>
              <div className="text-sm text-gray-600">Épicos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-yellow-500">{stats.byRarity.LEGENDARY}</div>
              <div className="text-sm text-gray-600">Legendarios</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryNames[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rareza</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todas</option>
                <option value="COMMON">Común</option>
                <option value="RARE">Raro</option>
                <option value="EPIC">Épico</option>
                <option value="LEGENDARY">Legendario</option>
                <option value="SECRET">Secreto</option>
              </select>
            </div>

            {/* Unlocked Filter */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnlockedOnly}
                  onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo desbloqueados
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProgress.map((item) => (
            <BadgeCard key={item.badgeType} badge={item} />
          ))}
        </div>

        {filteredProgress.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron badges con estos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: BadgeProgress }) {
  const isUnlocked = badge.unlocked;
  const progressPercent = badge.maxProgress > 0
    ? Math.min((badge.progress / badge.maxProgress) * 100, 100)
    : 0;

  const rarity = badge.rarity as keyof typeof rarityColors;

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300
        ${isUnlocked ? 'hover:scale-105 hover:shadow-xl' : 'opacity-60'}
        ${isUnlocked ? `border-2 ${rarityBorders[rarity]}` : 'border border-gray-300'}
      `}
    >
      {/* Rarity Gradient Header */}
      {isUnlocked && (
        <div className={`h-2 bg-gradient-to-r ${rarityColors[rarity]}`}></div>
      )}

      {/* Badge Content */}
      <div className="p-4">
        {/* Icon */}
        <div className="text-5xl text-center mb-3">
          {isUnlocked ? badge.icon : '🔒'}
        </div>

        {/* Name */}
        <h3 className={`text-center font-bold mb-1 ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
          {isUnlocked ? badge.name : '???'}
        </h3>

        {/* Description */}
        <p className={`text-xs text-center mb-3 min-h-[3rem] ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {isUnlocked ? badge.description : 'Badge secreto. ¡Sigue explorando!'}
        </p>

        {/* Progress Bar */}
        {!isUnlocked && badge.maxProgress > 0 && (
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-1">
              {badge.progress} / {badge.maxProgress}
            </p>
          </div>
        )}

        {/* Rewards */}
        {isUnlocked && badge.rewards && (
          <div className="flex justify-center gap-3 text-xs">
            {badge.rewards.credits && (
              <span className="flex items-center text-yellow-600">
                <span className="mr-1">💰</span>
                {badge.rewards.credits}
              </span>
            )}
            {badge.rewards.xp && (
              <span className="flex items-center text-blue-600">
                <span className="mr-1">⭐</span>
                {badge.rewards.xp}
              </span>
            )}
          </div>
        )}

        {/* Rarity Badge */}
        <div className="mt-2 text-center">
          <span
            className={`
              inline-block px-2 py-1 text-xs font-semibold rounded-full
              ${rarity === 'COMMON' && 'bg-gray-200 text-gray-700'}
              ${rarity === 'RARE' && 'bg-blue-200 text-blue-700'}
              ${rarity === 'EPIC' && 'bg-purple-200 text-purple-700'}
              ${rarity === 'LEGENDARY' && 'bg-yellow-200 text-yellow-700'}
              ${rarity === 'SECRET' && 'bg-pink-200 text-pink-700'}
            `}
          >
            {badge.rarity}
          </span>
        </div>
      </div>

      {/* New Badge Indicator */}
      {isUnlocked && badges.find((b: Badge) => b.badgeType === badge.badgeType)?.isNew && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
          ¡NUEVO!
        </div>
      )}
    </div>
  );
}
