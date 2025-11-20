# IntentionOnboarding Component

## Overview
A comprehensive onboarding system that captures user intention on first visit and guides them directly to their desired action.

## Features

### 4 Intention Flows

1. **Search** (🔍 Buscar algo)
   - Immediate search input
   - Shows results without requiring registration
   - Prompts for registration only when user wants to contact
   - Redirects to: `/offers?search={query}`

2. **Offer** (⚡ Ofrecer algo)
   - Mini-form with 3 fields:
     * Title (required)
     * Category (product/service/other)
     * Price (optional)
   - Saves draft to localStorage
   - Prompts for registration to publish
   - Redirects to: `/offers/new` with pre-filled data

3. **Community** (👥 Unirme a comunidad)
   - Location input (GPS or manual)
   - Interest tags selection
   - Shows relevant communities
   - Prompts for registration to join
   - Redirects to: `/communities?location={location}&interests={tags}`

4. **Explore** (🗺️ Solo explorar)
   - Immediate redirect to homepage
   - Shows public content
   - Banner: "Register when ready"
   - Redirects to: `/`

## Usage

```tsx
import IntentionOnboarding from '@/components/IntentionOnboarding';

<IntentionOnboarding
  isOpen={showIntentionOnboarding}
  onClose={() => setShowIntentionOnboarding(false)}
  onIntentionSelected={(intention) => {
    console.log('User selected:', intention);
  }}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when modal is closed |
| `onIntentionSelected` | `(intention: UserIntention) => void` | Called when user completes an intention flow |

## LocalStorage Keys

- `user_intention`: Stores the selected intention ('search' \| 'offer' \| 'community' \| 'explore')
- `intention_onboarding_completed`: Flag to prevent showing onboarding again
- `offer_draft`: Stores offer draft data (for 'offer' flow)

## Analytics Events

Tracked via Analytics.track():

- `INTENTION_ONBOARDING_OPENED`: When modal opens
- `INTENTION_SELECTED`: When user clicks an intention option
- `INTENTION_COMPLETED`: When user completes a flow
  - Properties: `intention`, `timeToCompleteMs`, flow-specific data
- `INTENTION_ABANDONED`: When user closes without completing
  - Properties: `intention`, `step`

## Integration Points

### Homepage (`/pages/index.tsx`)
- Shows on first visit (authenticated users only)
- Shows if `intention_onboarding_completed` is not set
- Shows if user has no activity (0 offers, 0 communities)

### Navbar
- Accessible via "¿Qué puedo hacer?" in user menu
- Allows users to restart the onboarding flow

### Offer Creation (`/pages/offers/new.tsx`)
- Loads draft data from localStorage on mount
- Pre-fills form with title, category, and price
- Clears draft after loading

## Design

### Desktop
- Centered modal (max-width: 2xl)
- Grid layout for intention cards (2x2)
- Smooth animations with Framer Motion

### Mobile
- Full-screen modal
- Stacked intention cards
- Touch-optimized buttons (min 120px height)

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus management (auto-focus on inputs)
- Close button clearly labeled

## Performance

- Lazy loaded via dynamic import
- Minimal re-renders with proper state management
- Analytics events throttled
- LocalStorage operations are synchronous but minimal

## Testing

See `__tests__/IntentionOnboarding.test.tsx` for comprehensive test coverage including:
- Rendering all intention options
- Each intention flow (search, offer, community, explore)
- Back navigation
- Form validation
- Analytics tracking
- LocalStorage persistence

## Future Enhancements

- [ ] Add GPS location detection for community search
- [ ] Add image preview for offer flow
- [ ] Multi-language support via next-intl
- [ ] Add skip/dismiss tracking for better UX insights
- [ ] A/B test different intention copy
