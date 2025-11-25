# Demo Content System Implementation

## Overview
Complete implementation of a demo content system to solve the "cold start problem" where new users see an empty platform.

## Files Created

### 1. `/packages/web/src/lib/demoContent.ts`
Core library with demo content data and management logic.

**Features:**
- 30 varied demo offers across different categories (FOOD, EDUCATION, SERVICES, GOODS, HEALTH)
- 15 demo events (community activities, workshops, social events)
- 10 demo communities across major Spanish cities
- Geolocation-based filtering
- Intelligent blending with real content (max 50% demos)

**Classes:**
- `DemoContentManager`: Main class with static methods for:
  - `getDemoOffersByLocation(lat, lng, radius)` - Get nearby demo offers
  - `getDemoEventsByLocation(lat, lng, radius)` - Get nearby demo events
  - `getDemoCommunitiesByLocation(lat, lng, radius)` - Get nearby demo communities
  - `blendDemoWithReal(realContent, demoContent, maxDemos)` - Smart blending
  - `isDemo(itemId)` - Check if item is demo
  - `getDemoStats()` - Get statistics
  - `hasDismissedDemoNotice()` / `dismissDemoNotice()` - Notice management

**Data Coverage:**
- 30 demo offers across 8+ cities in Spain
- Categories: Food, Education, Services, Goods, Health
- Mix of free and paid offerings
- Realistic pricing and descriptions

### 2. `/packages/web/src/components/DemoBadge.tsx`
Visual badge component to mark demo content.

**Components:**
- `DemoBadge`: Main badge with tooltip
- `DemoIndicator`: Compact inline indicator

**Features:**
- 3 size variants (small, medium, large)
- Optional tooltip explaining demo content
- Accessible and clearly visible
- Dark mode support

### 3. `/packages/web/src/components/DemoContentNotice.tsx`
Modal/notice to explain demo content to users.

**Components:**
- `DemoContentNotice`: Full modal with explanation
- `CompactDemoNotice`: Inline compact notice

**Features:**
- Shows only once (uses localStorage)
- Platform statistics display
- Benefits list
- CTA to create real content
- Analytics tracking
- Can be dismissed permanently

### 4. `/packages/web/src/components/PlatformStats.tsx`
Component showing aggregate platform statistics.

**Features:**
- Shows total users, offers, events, communities
- 3 display variants: default, compact, hero
- Blends real + demo stats
- Optional disclaimer
- Animated entry
- Dark mode support

## Integration Points

### 1. UnifiedFeed Component
**File:** `/packages/web/src/components/UnifiedFeed.tsx`

**Changes:**
- Added `isDemo` field to `UnifiedResource` interface
- Created `resourcesWithDemos` useMemo that blends demo content
- Added demo click handler that shows modal and tracks analytics
- Modified `ResourceCard` to show `DemoBadge` on demo items
- Wrapped demo items with click handler instead of Link
- Added `CompactDemoNotice` display when demos are shown
- Updated counts to include demo content

**Logic:**
1. Fetch real content via React Query
2. Get demo content based on user location
3. Transform demo content to UnifiedResource format
4. Blend demo with real (max 50% demos, real content first)
5. Show notice if demos are included
6. Display with appropriate badges and handling

### 2. Homepage (index.tsx)
**File:** `/packages/web/src/pages/index.tsx`

**Changes:**
- Imported `DemoContentNotice` and `PlatformStats`
- Added `DemoContentNotice` component to modals section
- Analytics tracking for demo interactions

## Analytics Events

Added to `/packages/web/src/lib/analytics.ts`:

```typescript
DEMO_CONTENT_VIEWED: 'demo_content_viewed',
DEMO_CONTENT_CLICKED: 'demo_content_clicked',
DEMO_CONTENT_DISMISSED: 'demo_content_dismissed',
DEMO_CONVERTED_TO_REGISTER: 'demo_converted_to_register',
```

## Rules & Behavior

### Blending Rules
1. **Maximum 50% demos**: Total content should never be more than 50% demo
2. **Real content first**: Real content always prioritized in display
3. **Geolocation-based**: Demo content filtered by user location (50km radius default)
4. **Diverse content**: No duplicate demos
5. **Recent dates**: Demo content has realistic "created X days ago" dates

### Display Rules
1. **Clear marking**: All demo items have "Ejemplo" badge
2. **Tooltips**: Hover shows explanation
3. **Click behavior**: Clicking demo shows modal with CTA
4. **Notice**: Compact notice shown when demos are present
5. **One-time modal**: Full explanation modal shown once per user

### Storage Keys
- `demo_content_dismissed`: boolean
- `demo_content_last_shown`: timestamp

## Demo Content Details

### Offers (30 total)
**Categories:**
- FOOD (4): Vegetables, bread, honey, cheese
- EDUCATION (4): Guitar, math tutoring, English, pottery
- SERVICES (4): Bike repair, graphic design, photography, gardening
- GOODS (4): Bicycle, books, furniture, baby clothes
- HEALTH (3): Yoga, massage, nutrition
- FREE (4): Moving help, language exchange, tutoring, dog walking
- MISC (7): Tech repair, sewing, piano, fitness, art, cleaning, childcare

**Locations:**
- Barcelona (Gràcia, Eixample, El Raval, Poblenou, El Born, Sarrià)
- Madrid (Malasaña, Chamberí, Lavapiés, Moncloa, Arganzuela, Chueca, Tetuán, Retiro, Salamanca)
- Valencia (Ruzafa, El Carmen, Benimaclet)
- Sevilla (Triana, Nervión)
- Bilbao (Casco Viejo, Indautxu)
- Granada, Zaragoza, Pamplona

### Events (15 total)
**Types:**
- Community: Park cleanup, urban garden, swap market
- Education: Composting workshop, repair café, photography workshop
- Health: Yoga, meditation
- Culture: Book exchange, concert, film forum
- Online: Crypto webinar
- Social: Bike ride, cooking workshop, entrepreneurship fair

**Future dates:** All events scheduled 1-14 days from now

### Communities (10 total)
- Major Spanish cities (Barcelona, Madrid, Valencia, Bilbao, Sevilla, etc.)
- Member counts: 134-521 members
- Active offers and events per community
- Mix of neighborhood and city-wide communities

## Usage Examples

### Get demo content for a location:
```typescript
import { DemoContentManager } from '@/lib/demoContent';

// Barcelona coordinates
const demoOffers = DemoContentManager.getDemoOffersByLocation(41.3874, 2.1686, 50);
// Returns demo offers within 50km of Barcelona
```

### Blend with real content:
```typescript
const blended = DemoContentManager.blendDemoWithReal(
  realOffers,    // Your real offers
  demoOffers,    // Demo offers from above
  10             // Max 10 demos
);
// Returns real offers first, then up to 10 demos (max 50% total)
```

### Check if item is demo:
```typescript
if (DemoContentManager.isDemo(offerId)) {
  // Handle demo click differently
}
```

### Get statistics:
```typescript
const stats = DemoContentManager.getDemoStats();
// { totalOffers: 30, totalEvents: 15, totalCommunities: 10, citiesCovered: 10 }
```

## Testing

### Manual Testing Checklist
- [ ] Demo offers appear when real content is sparse
- [ ] Demo badge is clearly visible on all demo items
- [ ] Clicking demo shows modal with CTA
- [ ] Demo notice appears on first view
- [ ] Demo notice can be dismissed
- [ ] Stats component shows correct totals
- [ ] Demo content disappears when >20 real items
- [ ] Geolocation filtering works
- [ ] Analytics events fire correctly
- [ ] Dark mode displays correctly

### Test Scenarios
1. **Empty state**: No real content → Shows many demos
2. **Sparse content**: 5 real items → Shows ~5 demos
3. **Rich content**: 20+ real items → No demos shown
4. **Location-based**: Madrid user sees Madrid demos first
5. **Mixed content**: Real + demo sorted by proximity

## Performance Considerations

1. **Memoization**: All demo blending is memoized with useMemo
2. **Lazy loading**: Demo data loaded only when needed
3. **Static data**: Demo content is compile-time static (no API calls)
4. **Efficient filtering**: Single-pass filters for location/type
5. **Component memoization**: ResourceCard is memoized

## Future Enhancements

1. **More demo content**: Add more cities and categories
2. **Images**: Add placeholder images for demo content
3. **Localization**: Translate demo content to other languages
4. **Admin panel**: Allow admins to manage demo content
5. **A/B testing**: Test different demo content strategies
6. **User preferences**: Let users hide/show demos
7. **Real-time sync**: Update demo content based on platform growth

## Accessibility

- All badges have proper ARIA labels
- Tooltips are keyboard accessible
- Modal can be dismissed with ESC key
- Color contrast meets WCAG AA standards
- Screen reader friendly descriptions

## Mobile Responsiveness

- Badges scale appropriately on mobile
- Modals are touch-friendly
- Stats component stacks on mobile
- Compact variants for small screens
