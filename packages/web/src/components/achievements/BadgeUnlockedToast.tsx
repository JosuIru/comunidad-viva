import { useEffect, useState } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface BadgeNotification {
  badgeType: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'SECRET';
  rewards?: {
    credits?: number;
    xp?: number;
  };
}

const rarityColors = {
  COMMON: 'from-gray-400 to-gray-600',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-yellow-400 to-yellow-600',
  SECRET: 'from-pink-400 to-pink-600',
};

export default function BadgeUnlockedToast() {
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);
  const webSocket = useWebSocket();

  useEffect(() => {
    const unsubscribe = webSocket.onNotification((notification: any) => {
      if (notification.type === 'badge_unlocked' && notification.data) {
        const badge: BadgeNotification = {
          badgeType: notification.data.badgeType,
          name: notification.data.name,
          description: notification.data.description,
          icon: notification.data.icon,
          rarity: notification.data.rarity,
          rewards: notification.data.rewards,
        };

        setNotifications((prev) => [...prev, badge]);

        // Auto-remove after 8 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.badgeType !== badge.badgeType));
        }, 8000);
      }
    });

    return unsubscribe;
  }, [webSocket]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-4">
      {notifications.map((badge) => (
        <BadgeToast key={badge.badgeType} badge={badge} />
      ))}
    </div>
  );
}

function BadgeToast({ badge }: { badge: BadgeNotification }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-sm border-2 border-yellow-400">
        {/* Rarity Gradient Header */}
        <div className={`h-2 bg-gradient-to-r ${rarityColors[badge.rarity]}`}></div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="text-4xl animate-bounce">{badge.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">{badge.name}</h3>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
                  {badge.rarity}
                </span>
              </div>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          </div>

          {/* Rewards */}
          {badge.rewards && (
            <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Recompensas:</span>
              {badge.rewards.credits && (
                <span className="flex items-center text-sm text-yellow-600 font-medium">
                  <span className="mr-1">💰</span>
                  +{badge.rewards.credits}
                </span>
              )}
              {badge.rewards.xp && (
                <span className="flex items-center text-sm text-blue-600 font-medium">
                  <span className="mr-1">⭐</span>
                  +{badge.rewards.xp} XP
                </span>
              )}
            </div>
          )}

          {/* Celebration Text */}
          <div className="mt-3 text-center">
            <p className="text-lg font-bold text-green-600 animate-pulse">
              🎉 ¡Badge Desbloqueado! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
