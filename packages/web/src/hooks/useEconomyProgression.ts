import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  EconomyProgressionManager,
  EconomyTier,
  trackEconomyEvent,
} from '@/lib/economyProgression';

export function useEconomyProgression() {
  const [tier, setTier] = useState<EconomyTier>('basic');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedTier, setUnlockedTier] = useState<'intermediate' | 'advanced'>('intermediate');
  const [initialized, setInitialized] = useState(false);

  // Fetch user balance data to initialize/migrate
  const { data: balanceData } = useQuery({
    queryKey: ['credits', 'balance'],
    queryFn: async () => {
      const response = await api.get('/credits/balance');
      return response.data;
    },
    enabled: typeof window !== 'undefined',
  });

  // Fetch timebank stats for migration
  const { data: timebankData } = useQuery({
    queryKey: ['timebank-stats'],
    queryFn: async () => {
      const response = await api.get('/timebank/stats');
      return response.data;
    },
    enabled: typeof window !== 'undefined',
  });

  // Initialize/migrate economy progression
  useEffect(() => {
    if (typeof window === 'undefined' || initialized) return;

    EconomyProgressionManager.initialize();

    // Migrate existing users
    if (balanceData && timebankData) {
      const creditsBalance = balanceData.balance || 0;
      const timeBankBalance = (timebankData.hoursGiven || 0) + (timebankData.hoursReceived || 0);

      EconomyProgressionManager.migrateExistingUser(creditsBalance, timeBankBalance);
    }

    const currentTier = EconomyProgressionManager.getCurrentTier();
    setTier(currentTier);
    setInitialized(true);
  }, [balanceData, timebankData, initialized]);

  // Check for tier unlock
  const checkUnlock = useCallback(() => {
    const unlocked = EconomyProgressionManager.checkAndUnlockNextTier();
    if (unlocked) {
      const newTier = EconomyProgressionManager.getCurrentTier();
      setTier(newTier);

      if (newTier !== 'basic') {
        setUnlockedTier(newTier as 'intermediate' | 'advanced');
        setShowUnlockModal(true);
      }
    }
    return unlocked;
  }, []);

  // Record transaction
  const recordTransaction = useCallback((usedCredits: boolean = false) => {
    const unlocked = EconomyProgressionManager.recordTransaction(usedCredits);
    if (unlocked) {
      const newTier = EconomyProgressionManager.getCurrentTier();
      setTier(newTier);

      if (newTier !== 'basic') {
        setUnlockedTier(newTier as 'intermediate' | 'advanced');
        setShowUnlockModal(true);
      }
    }
  }, []);

  // Manual unlock
  const unlockNextTier = useCallback(() => {
    const unlocked = EconomyProgressionManager.unlockNextTier();
    if (unlocked) {
      const newTier = EconomyProgressionManager.getCurrentTier();
      setTier(newTier);

      if (newTier !== 'basic') {
        setUnlockedTier(newTier as 'intermediate' | 'advanced');
        setShowUnlockModal(true);
      }
    }
  }, []);

  // Check if feature is unlocked
  const isFeatureUnlocked = useCallback((feature: string) => {
    return EconomyProgressionManager.isFeatureUnlocked(feature);
  }, []);

  // Get progression data
  const getProgressionData = useCallback(() => {
    return EconomyProgressionManager.getProgressionData();
  }, []);

  // Get unlock conditions
  const getUnlockConditions = useCallback(() => {
    return EconomyProgressionManager.getUnlockConditions();
  }, []);

  return {
    tier,
    showUnlockModal,
    unlockedTier,
    setShowUnlockModal,
    checkUnlock,
    recordTransaction,
    unlockNextTier,
    isFeatureUnlocked,
    getProgressionData,
    getUnlockConditions,
  };
}
