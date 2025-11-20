/**
 * Economy Progression System
 *
 * Introduces EUR, Credits, and Time Banking gradually to avoid overwhelming new users.
 *
 * Tiers:
 * - BASIC (Week 1): EUR only
 * - INTERMEDIATE (Week 2+): EUR + Credits
 * - ADVANCED (Month 2+): EUR + Credits + Time Banking
 */

export type EconomyTier = 'basic' | 'intermediate' | 'advanced';

export interface EconomyFeature {
  id: string;
  tier: EconomyTier;
  unlockedAt: Date | null;
  enabled: boolean;
}

export interface EconomyProgressionData {
  tier: EconomyTier;
  unlockedAtIntermediate: number | null;
  unlockedAtAdvanced: number | null;
  transactionsCount: number;
  creditsTransactionsCount: number;
  firstTransactionAt: number | null;
  accountCreatedAt: number;
}

export interface UnlockConditions {
  tier: EconomyTier;
  conditions: {
    description: string;
    met: boolean;
  }[];
  canUnlock: boolean;
}

const STORAGE_KEYS = {
  TIER: 'economy_tier',
  UNLOCKED_INTERMEDIATE: 'economy_unlocked_at_intermediate',
  UNLOCKED_ADVANCED: 'economy_unlocked_at_advanced',
  TRANSACTIONS_COUNT: 'economy_transactions_count',
  CREDITS_TRANSACTIONS: 'economy_credits_transactions',
  FIRST_TRANSACTION: 'economy_first_transaction_at',
  ACCOUNT_CREATED: 'economy_account_created_at',
  ONBOARDING_SHOWN: 'economy_onboarding_shown',
};

export class EconomyProgressionManager {
  /**
   * Initialize progression data for new users
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    const existing = localStorage.getItem(STORAGE_KEYS.TIER);
    if (existing) return; // Already initialized

    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.TIER, 'basic');
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_CREATED, now.toString());
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS_COUNT, '0');
    localStorage.setItem(STORAGE_KEYS.CREDITS_TRANSACTIONS, '0');
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_SHOWN, 'false');
  }

  /**
   * Get current economy tier
   */
  static getCurrentTier(): EconomyTier {
    if (typeof window === 'undefined') return 'basic';

    this.initialize();
    const tier = localStorage.getItem(STORAGE_KEYS.TIER);
    return (tier as EconomyTier) || 'basic';
  }

  /**
   * Set economy tier
   */
  static setTier(tier: EconomyTier): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const currentTier = this.getCurrentTier();

    localStorage.setItem(STORAGE_KEYS.TIER, tier);

    // Track unlock timestamps
    if (tier === 'intermediate' && currentTier === 'basic') {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_INTERMEDIATE, now.toString());
    } else if (tier === 'advanced' && currentTier !== 'advanced') {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_ADVANCED, now.toString());
    }
  }

  /**
   * Get full progression data
   */
  static getProgressionData(): EconomyProgressionData {
    if (typeof window === 'undefined') {
      return {
        tier: 'basic',
        unlockedAtIntermediate: null,
        unlockedAtAdvanced: null,
        transactionsCount: 0,
        creditsTransactionsCount: 0,
        firstTransactionAt: null,
        accountCreatedAt: Date.now(),
      };
    }

    this.initialize();

    return {
      tier: this.getCurrentTier(),
      unlockedAtIntermediate: this.getTimestamp(STORAGE_KEYS.UNLOCKED_INTERMEDIATE),
      unlockedAtAdvanced: this.getTimestamp(STORAGE_KEYS.UNLOCKED_ADVANCED),
      transactionsCount: this.getCount(STORAGE_KEYS.TRANSACTIONS_COUNT),
      creditsTransactionsCount: this.getCount(STORAGE_KEYS.CREDITS_TRANSACTIONS),
      firstTransactionAt: this.getTimestamp(STORAGE_KEYS.FIRST_TRANSACTION),
      accountCreatedAt: this.getTimestamp(STORAGE_KEYS.ACCOUNT_CREATED) || Date.now(),
    };
  }

  /**
   * Check if a specific feature is unlocked
   */
  static isFeatureUnlocked(feature: string): boolean {
    const tier = this.getCurrentTier();

    // Basic tier features (EUR only)
    const basicFeatures = ['eur_payments', 'eur_offers'];

    // Intermediate tier features (EUR + Credits)
    const intermediateFeatures = [
      ...basicFeatures,
      'credits_balance',
      'credits_payments',
      'credits_offers',
      'credits_filter',
      'credits_earn',
    ];

    // Advanced tier features (EUR + Credits + Time Banking)
    const advancedFeatures = [
      ...intermediateFeatures,
      'timebank_balance',
      'timebank_offers',
      'timebank_transactions',
      'timebank_filter',
      'timebank_create',
    ];

    if (tier === 'basic') {
      return basicFeatures.includes(feature);
    } else if (tier === 'intermediate') {
      return intermediateFeatures.includes(feature);
    } else {
      return advancedFeatures.includes(feature);
    }
  }

  /**
   * Record a transaction and check for tier unlock
   */
  static recordTransaction(usedCredits: boolean = false): boolean {
    if (typeof window === 'undefined') return false;

    const data = this.getProgressionData();
    const newTransactionCount = data.transactionsCount + 1;

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS_COUNT, newTransactionCount.toString());

    // Record first transaction
    if (!data.firstTransactionAt) {
      localStorage.setItem(STORAGE_KEYS.FIRST_TRANSACTION, Date.now().toString());
    }

    // Track credits transactions
    if (usedCredits) {
      const newCreditsCount = data.creditsTransactionsCount + 1;
      localStorage.setItem(STORAGE_KEYS.CREDITS_TRANSACTIONS, newCreditsCount.toString());
    }

    // Check for automatic tier unlock
    return this.checkAndUnlockNextTier();
  }

  /**
   * Check conditions for unlocking next tier
   */
  static getUnlockConditions(): UnlockConditions {
    const tier = this.getCurrentTier();
    const data = this.getProgressionData();
    const now = Date.now();
    const accountAgeDays = Math.floor((now - data.accountCreatedAt) / (1000 * 60 * 60 * 24));
    const intermediateDays = data.unlockedAtIntermediate
      ? Math.floor((now - data.unlockedAtIntermediate) / (1000 * 60 * 60 * 24))
      : 0;

    if (tier === 'basic') {
      const conditions = [
        {
          description: 'Primera transacción exitosa',
          met: data.transactionsCount >= 1,
        },
        {
          description: '3 días de uso activo',
          met: accountAgeDays >= 3,
        },
      ];

      return {
        tier: 'intermediate',
        conditions,
        canUnlock: conditions.some((c) => c.met),
      };
    } else if (tier === 'intermediate') {
      const conditions = [
        {
          description: '5 transacciones con créditos',
          met: data.creditsTransactionsCount >= 5,
        },
        {
          description: '2 semanas en tier intermedio',
          met: intermediateDays >= 14,
        },
        {
          description: '10 transacciones totales',
          met: data.transactionsCount >= 10,
        },
      ];

      return {
        tier: 'advanced',
        conditions,
        canUnlock: conditions.some((c) => c.met),
      };
    }

    return {
      tier: 'advanced',
      conditions: [],
      canUnlock: false,
    };
  }

  /**
   * Check and automatically unlock next tier if conditions met
   */
  static checkAndUnlockNextTier(): boolean {
    const conditions = this.getUnlockConditions();

    if (conditions.canUnlock) {
      const currentTier = this.getCurrentTier();
      if (currentTier === 'basic') {
        this.setTier('intermediate');
        return true;
      } else if (currentTier === 'intermediate') {
        this.setTier('advanced');
        return true;
      }
    }

    return false;
  }

  /**
   * Manually unlock next tier (for user-initiated unlock)
   */
  static unlockNextTier(): boolean {
    const currentTier = this.getCurrentTier();

    if (currentTier === 'basic') {
      this.setTier('intermediate');
      return true;
    } else if (currentTier === 'intermediate') {
      this.setTier('advanced');
      return true;
    }

    return false;
  }

  /**
   * Check if onboarding modal should be shown
   */
  static shouldShowOnboarding(): boolean {
    if (typeof window === 'undefined') return false;

    const shown = localStorage.getItem(STORAGE_KEYS.ONBOARDING_SHOWN);
    return shown !== 'true';
  }

  /**
   * Mark onboarding as shown
   */
  static markOnboardingShown(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_SHOWN, 'true');
  }

  /**
   * Migrate existing users with credits/timebank activity
   */
  static migrateExistingUser(userCreditsBalance: number, userTimeBankBalance: number): void {
    if (typeof window === 'undefined') return;

    const existingTier = localStorage.getItem(STORAGE_KEYS.TIER);
    if (existingTier) return; // Already migrated

    this.initialize();

    // If user has credits or timebank balance, set to advanced
    if (userCreditsBalance > 0 || userTimeBankBalance !== 0) {
      this.setTier('advanced');
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS_COUNT, '10'); // Assume they're active
      localStorage.setItem(STORAGE_KEYS.CREDITS_TRANSACTIONS, '5');
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_SHOWN, 'true'); // Skip onboarding
    }
  }

  /**
   * Reset progression (for testing)
   */
  static reset(): void {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  // Helper methods
  private static getTimestamp(key: string): number | null {
    const value = localStorage.getItem(key);
    return value ? parseInt(value, 10) : null;
  }

  private static getCount(key: string): number {
    const value = localStorage.getItem(key);
    return value ? parseInt(value, 10) : 0;
  }
}

/**
 * Analytics helper for tracking economy progression events
 */
export function trackEconomyEvent(
  event: 'ECONOMY_TIER_UNLOCKED' | 'ECONOMY_FEATURE_USED_FIRST_TIME',
  data: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Send to analytics service
  console.log('[Economy Analytics]', event, data);

  // Could integrate with Google Analytics, Mixpanel, etc.
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', event, data);
  }
}

/**
 * Get tier configuration for UI display
 */
export function getTierConfig(tier: EconomyTier) {
  const configs = {
    basic: {
      name: 'Básico',
      badge: '💶',
      color: 'blue',
      description: 'Compra y vende con euros',
      features: ['Pagos en EUR', 'Ofertas con precio en euros'],
    },
    intermediate: {
      name: 'Intermedio',
      badge: '💰',
      color: 'green',
      description: 'Usa euros y créditos locales',
      features: [
        'Todo de Básico',
        'Balance de créditos',
        'Pagar con créditos',
        'Ganar créditos por acciones',
        'Filtrar por ofertas que aceptan créditos',
      ],
    },
    advanced: {
      name: 'Avanzado',
      badge: '⏰',
      color: 'purple',
      description: 'Economía completa: EUR, créditos y banco de tiempo',
      features: [
        'Todo de Intermedio',
        'Balance de banco de tiempo',
        'Intercambiar horas 1:1',
        'Crear ofertas de tiempo',
        'Estadísticas de tiempo compartido',
      ],
    },
  };

  return configs[tier];
}
