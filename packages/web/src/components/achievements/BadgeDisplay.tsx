import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Badge {
  id: string;
  badgeType: string;
  earnedAt: string;
  metadata: {
    name: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'SECRET';
  };
}

interface BadgeDisplayProps {
  userId?: string;
  limit?: number;
  showViewAll?: boolean;
}

const rarityBorders = {
  COMMON: 'border-gray-400',
  RARE: 'border-blue-400',
  EPIC: 'border-purple-400',
  LEGENDARY: 'border-yellow-400',
  SECRET: 'border-pink-400',
};

export default function BadgeDisplay({ userId, limit = 6, showViewAll = true }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/achievements/my-badges`,
        { headers }
      );

      const allBadges = response.data;
      setTotalCount(allBadges.length);

      // Sort by rarity and recency, then take limit
      const sortedBadges = allBadges
        .sort((a: Badge, b: Badge) => {
          // Sort by rarity first
          const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, SECRET: 3, COMMON: 4 };
          const rarityDiff = rarityOrder[a.metadata.rarity] - rarityOrder[b.metadata.rarity];
          if (rarityDiff !== 0) return rarityDiff;

          // Then by date (most recent first)
          return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
        })
        .slice(0, limit);

      setBadges(sortedBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">🏆 Sin badges aún</p>
        <p className="text-sm text-gray-400">
          ¡Participa en la comunidad para desbloquear badges!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🏆 Badges ({totalCount})
        </h3>
        {showViewAll && totalCount > limit && (
          <Link href="/achievements">
            <a className="text-sm text-green-600 hover:text-green-700 font-medium">
              Ver todos →
            </a>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`
              relative bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200
              border-2 ${rarityBorders[badge.metadata.rarity]}
              hover:scale-105 cursor-pointer
            `}
            title={badge.metadata.name}
          >
            <div className="p-2">
              <div className="text-3xl text-center">{badge.metadata.icon}</div>
            </div>

            {/* Rarity indicator dot */}
            <div className="absolute -top-1 -right-1">
              <div
                className={`
                  w-3 h-3 rounded-full border-2 border-white
                  ${badge.metadata.rarity === 'LEGENDARY' && 'bg-yellow-400'}
                  ${badge.metadata.rarity === 'EPIC' && 'bg-purple-400'}
                  ${badge.metadata.rarity === 'RARE' && 'bg-blue-400'}
                  ${badge.metadata.rarity === 'SECRET' && 'bg-pink-400'}
                  ${badge.metadata.rarity === 'COMMON' && 'bg-gray-400'}
                `}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {showViewAll && totalCount > limit && (
        <div className="mt-4 text-center">
          <Link href="/achievements">
            <a className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Ver galería completa
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
