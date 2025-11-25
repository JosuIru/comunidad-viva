# Economy Progression System - Integration Guide

## Overview
The progressive economy system introduces EUR, Credits, and Time Banking gradually to avoid overwhelming new users.

## Files Created

1. `/packages/web/src/lib/economyProgression.ts` - Core progression manager
2. `/packages/web/src/components/EconomyUnlockModal.tsx` - Celebration modal
3. `/packages/web/src/hooks/useEconomyProgression.ts` - React hook for progression

## Integration Points

### 1. Global Integration (DONE in _app.tsx)

```typescript
import EconomyUnlockModal from '../components/EconomyUnlockModal';
import { useEconomyProgression } from '../hooks/useEconomyProgression';

// In component:
const {
  tier,
  showUnlockModal,
  unlockedTier,
  setShowUnlockModal,
} = useEconomyProgression();

// Add modal before </QueryClientProvider>:
<EconomyUnlockModal
  isOpen={showUnlockModal}
  tier={unlockedTier}
  onClose={() => setShowUnlockModal(false)}
  onExplore={() => {
    if (unlockedTier === 'intermediate') {
      router.push('/offers?credits=true');
    } else if (unlockedTier === 'advanced') {
      router.push('/timebank');
    }
  }}
/>
```

### 2. Navbar Integration

Add to `/packages/web/src/components/Navbar.tsx`:

```typescript
import { EconomyProgressionManager } from '@/lib/economyProgression';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// In component:
const [economyTier, setEconomyTier] = useState<'basic' | 'intermediate' | 'advanced'>('basic');

useEffect(() => {
  const tier = EconomyProgressionManager.getCurrentTier();
  setEconomyTier(tier);

  // Migrate existing users with balances
  if (balanceData) {
    const creditsBalance = balanceData.balance || 0;
    // Fetch timebank balance too
    EconomyProgressionManager.migrateExistingUser(creditsBalance, 0);
  }
}, [balanceData]);

// In Credit Balance Section (line ~407):
{economyTier !== 'basic' && (
  <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
    {/* ... existing credit balance code ... */}
  </div>
)}
```

### 3. Create Offer Form Integration

Add to `/packages/web/src/pages/offers/new.tsx`:

```typescript
import { EconomyProgressionManager } from '@/lib/economyProgression';

// In component:
const economyTier = EconomyProgressionManager.getCurrentTier();
const canUseCredits = economyTier !== 'basic';
const canUseTimebank = economyTier === 'advanced';

// Filter type options:
const typeOptions = useMemo(
  () => [
    { value: 'PRODUCT', label: t('form.typeOptions.PRODUCT') },
    { value: 'SERVICE', label: t('form.typeOptions.SERVICE') },
    { value: 'EVENT', label: t('form.typeOptions.EVENT') },
    ...(canUseCredits ? [{ value: 'GROUP_BUY', label: t('form.typeOptions.GROUP_BUY') }] : []),
    ...(canUseTimebank ? [{ value: 'TIME_BANK', label: t('form.typeOptions.TIME_BANK') }] : []),
  ],
  [t, canUseCredits, canUseTimebank]
);

// Hide credits price field for basic tier (around line ~319):
{canUseCredits && (
  <div>
    <InfoTooltip content="Opcional. Acepta créditos además de €" position="right">
      <label htmlFor="priceCredits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('form.priceCredits.label')}
      </label>
    </InfoTooltip>
    <input
      type="number"
      id="priceCredits"
      name="priceCredits"
      min="0"
      step="1"
      {...getInputProps('priceCredits', {
        transform: (v) => v === '' ? undefined : parseInt(v, 10)
      })}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
        errors.priceCredits ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
      placeholder={t('form.priceCredits.placeholder')}
    />
    {errors.priceCredits && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priceCredits}</p>
    )}
  </div>
)}

{!canUseCredits && (
  <div className="col-span-1">
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
        🔒 Créditos bloqueados
      </p>
      <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
        Completa tu primera transacción para desbloquear los créditos
      </p>
      <button
        type="button"
        onClick={() => {
          // Show info about credits
          alert('Los créditos son moneda local de la comunidad. Desbloquéalos completando tu primera transacción!');
        }}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        ¿Qué son los créditos?
      </button>
    </div>
  </div>
)}
```

### 4. Map Filter Panel Integration

Add to `/packages/web/src/components/MapFilterPanel.tsx`:

```typescript
import { EconomyProgressionManager } from '@/lib/economyProgression';

// In component:
const economyTier = EconomyProgressionManager.getCurrentTier();

// Filter content types based on tier (around line ~42):
const contentTypes = [
  { id: 'offer', labelKey: 'offers', icon: ShoppingBagIcon, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: 'service', labelKey: 'services', icon: Cog6ToothIcon, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { id: 'event', labelKey: 'events', icon: CalendarDaysIcon, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { id: 'need', labelKey: 'needs', icon: ExclamationTriangleIcon, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { id: 'project', labelKey: 'projects', icon: RocketLaunchIcon, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  { id: 'housing', labelKey: 'housing', icon: HomeIcon, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
].filter(type => {
  // Hide GROUP_BUY for basic tier (requires credits)
  if (type.id === 'group_buy' && economyTier === 'basic') return false;
  // Hide TIME_BANK for basic/intermediate tier
  if (type.id === 'timebank' && economyTier !== 'advanced') return false;
  return true;
});
```

### 5. Recording Transactions

When a user completes a transaction (purchase, sale, etc.), record it:

```typescript
import { EconomyProgressionManager } from '@/lib/economyProgression';

// After successful transaction:
const usedCredits = paymentMethod === 'CREDITS'; // or however you track this
EconomyProgressionManager.recordTransaction(usedCredits);

// This will automatically:
// - Increment transaction counter
// - Check unlock conditions
// - Unlock next tier if conditions met
// - Show celebration modal
```

### 6. Timebank Page Integration

Hide timebank features for basic/intermediate users:

```typescript
import { EconomyProgressionManager } from '@/lib/economyProgression';
import { useRouter } from 'next/router';

export default function TimeBankPage() {
  const router = useRouter();
  const economyTier = EconomyProgressionManager.getCurrentTier();

  // Redirect if not advanced
  useEffect(() => {
    if (economyTier !== 'advanced') {
      toast.error('Banco de tiempo aún no desbloqueado');
      router.push('/offers');
    }
  }, [economyTier, router]);

  if (economyTier !== 'advanced') {
    return (
      <Layout title="Banco de Tiempo - Bloqueado">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">🔒 Banco de Tiempo</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Completa más transacciones con créditos para desbloquear el banco de tiempo
          </p>
          <div className="max-w-md mx-auto">
            {/* Show unlock conditions */}
            {EconomyProgressionManager.getUnlockConditions().conditions.map((cond, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <span className={cond.met ? 'text-green-500' : 'text-gray-400'}>
                  {cond.met ? '✓' : '○'}
                </span>
                <span>{cond.description}</span>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // ... rest of timebank page
}
```

## Testing the System

### Test Scenario 1: New User (Basic Tier)
1. Clear localStorage: `localStorage.clear()`
2. Register/login
3. Verify:
   - Credit balance hidden in navbar
   - Only EUR price field shown in create offer
   - No TIME_BANK type in offer types
   - No GROUP_BUY type in filters

### Test Scenario 2: Unlock Intermediate Tier
1. Complete first transaction (or wait 3 days)
2. Verify:
   - Celebration modal appears with confetti
   - "50 créditos gratis" gift shown
   - Credit balance now visible in navbar
   - Credits field shown in create offer form

### Test Scenario 3: Unlock Advanced Tier
1. Complete 5 credit transactions (or wait 2 weeks in intermediate)
2. Verify:
   - Celebration modal with purple theme
   - "5 horas iniciales" gift shown
   - Time bank features accessible
   - TIME_BANK type available in offer form

### Manual Testing Commands
```javascript
// In browser console:

// Check current tier
EconomyProgressionManager.getCurrentTier()

// Get progression data
EconomyProgressionManager.getProgressionData()

// Manually unlock next tier
EconomyProgressionManager.unlockNextTier()

// Record transaction
EconomyProgressionManager.recordTransaction(true) // with credits

// Check unlock conditions
EconomyProgressionManager.getUnlockConditions()

// Reset (for testing)
EconomyProgressionManager.reset()

// Migrate existing user to advanced
EconomyProgressionManager.migrateExistingUser(100, 10)
```

## Analytics Events

The system tracks:
1. `ECONOMY_TIER_UNLOCKED` - When user unlocks intermediate/advanced tier
2. `ECONOMY_FEATURE_USED_FIRST_TIME` - First use of credits/timebank

Integrate with your analytics service in `trackEconomyEvent()` function in `/packages/web/src/lib/economyProgression.ts`.

## Dependencies

Added:
- `canvas-confetti` - For celebration animations

## Next Steps

1. ✅ Core system implemented
2. ✅ Global modal integration
3. ⏳ Integrate in Navbar (show/hide credits based on tier)
4. ⏳ Integrate in Create Offer form (hide credits field for basic tier)
5. ⏳ Integrate in Map Filters (hide GROUP_BUY/TIME_BANK for lower tiers)
6. ⏳ Add transaction recording in checkout/payment flows
7. ⏳ Add "locked" state UI for timebank page
8. ⏳ Add unlock progress indicator in profile page
9. ⏳ Test migration for existing users
10. ⏳ Add i18n translations

## Key Design Decisions

1. **Progressive Disclosure**: Features unlock based on user activity, not arbitrary delays
2. **Clear Communication**: Unlock modals explain WHY features were unlocked and WHAT they enable
3. **Celebration**: Confetti and gifts make unlocking feel rewarding
4. **Transparency**: Users can always see unlock conditions
5. **No Gatekeeping**: EUR economy always available, additions are bonuses
6. **Migration-Safe**: Existing users with balances automatically advanced tier

## Troubleshooting

### Modal doesn't appear
- Check browser console for errors
- Verify `canvas-confetti` is installed
- Check `_app.tsx` integration

### Credits still showing for basic users
- Ensure `economyTier` state is properly initialized
- Check that components are reading from `EconomyProgressionManager.getCurrentTier()`

### Unlock not triggering
- Verify transaction is being recorded with `recordTransaction()`
- Check localStorage for `economy_transactions_count`
- Check unlock conditions with `getUnlockConditions()`
