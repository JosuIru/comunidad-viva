import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface LevelProgress {
  current: number;
  next: number;
  progress: number;
  currentXP: number;
  xpNeeded: number;
  perks: string[];
}

export function useUserLevel() {
  const [level, setLevel] = useState<number>(1);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevel = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to get from localStorage first for immediate UI
        const cachedLevel = localStorage.getItem('user_level');
        if (cachedLevel) {
          setLevel(parseInt(cachedLevel, 10));
        }

        // Fetch fresh data from API
        const response = await api.get('/viral-features/levels/progress');
        if (response.data) {
          const userLevel = response.data.current || response.data.currentLevel || 1;
          setLevel(userLevel);
          setLevelProgress(response.data);
          localStorage.setItem('user_level', userLevel.toString());
        }
      } catch (error) {
        // If API fails, try localStorage
        const cachedLevel = localStorage.getItem('user_level');
        if (cachedLevel) {
          setLevel(parseInt(cachedLevel, 10));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevel();
  }, []);

  // Helper functions for feature gating
  const canAccess = (minLevel: number) => level >= minLevel;

  const getFeatureVisibility = () => ({
    // Basic features - always visible
    offers: true,
    events: true,
    communities: true,

    // Level 2+ features
    mutualAid: canAccess(2),
    timebank: canAccess(2),

    // Level 3+ features
    challenges: canAccess(3),
    groupBuys: canAccess(3),

    // Level 5+ features
    proposals: canAccess(5),
    impact: canAccess(5),

    // Level 8+ features (expert)
    analytics: canAccess(8),
    delegation: canAccess(8),
  });

  return {
    level,
    levelProgress,
    isLoading,
    canAccess,
    getFeatureVisibility,
  };
}
