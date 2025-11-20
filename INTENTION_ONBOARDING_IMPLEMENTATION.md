# Intention-Based Onboarding System - Implementation Summary

## Overview
Complete implementation of an intention-based onboarding system that replaces the traditional profile selector with a user-centric flow that captures immediate user intent.

## Files Created/Modified

### New Files
1. `/packages/web/src/components/IntentionOnboarding.tsx` - Main component
2. `/packages/web/src/components/IntentionOnboarding.md` - Component documentation
3. `/packages/web/src/components/__tests__/IntentionOnboarding.test.tsx` - Test suite

### Modified Files
1. `/packages/web/src/pages/index.tsx`
   - Added IntentionOnboarding import
   - Added state management for intention onboarding
   - Updated useEffect to show intention onboarding before profile selector
   - Added IntentionOnboarding modal with proper handlers

2. `/packages/web/src/components/Navbar.tsx`
   - Added IntentionOnboarding import
   - Added QuestionMarkCircleIcon import
   - Added state for showIntentionOnboarding
   - Added "¿Qué puedo hacer?" button in user menu
   - Added IntentionOnboarding modal

3. `/packages/web/src/lib/analytics.ts`
   - Added 4 new analytics events:
     * INTENTION_ONBOARDING_OPENED
     * INTENTION_SELECTED
     * INTENTION_COMPLETED
     * INTENTION_ABANDONED

4. `/packages/web/src/pages/offers/new.tsx`
   - Added useEffect import
   - Added draft loading functionality from localStorage
   - Pre-fills form with data from intention onboarding

## Features Implemented

### 1. Search Flow (🔍 Buscar algo)
- **Screen 1**: Large search button with icon and description
- **Screen 2**:
  - Large search input with auto-focus
  - Placeholder: "ej: clases de guitarra, bicicleta, fontanero..."
  - "Buscar" button (disabled when empty)
  - "Volver" button to go back
  - Help text: "No necesitas registrarte para buscar"
- **Action**: Redirects to `/offers?search={query}`
- **No registration required**

### 2. Offer Flow (⚡ Ofrecer algo)
- **Screen 1**: Large offer button with icon and description
- **Screen 2**:
  - Title input (required, auto-focused)
  - Category dropdown (Producto/Servicio/Otro)
  - Price input (optional, with € icon)
  - "Continuar" button (disabled when title empty)
  - "Volver" button
  - Help text: "Necesitarás crear una cuenta para publicar"
- **Action**:
  - Saves draft to localStorage
  - Redirects to `/offers/new`
  - Pre-fills form with saved data
  - Shows success toast
- **Registration required to publish**

### 3. Community Flow (👥 Unirme a comunidad)
- **Screen 1**: Large community button with icon and description
- **Screen 2**:
  - Location input with map pin icon
  - Interest tags (clickable chips):
    * Huerto urbano
    * Intercambio
    * Sostenibilidad
    * Vecindario
    * Artesanía
  - "Buscar comunidades" button
  - "Volver" button
  - Help text: "Puedes explorar comunidades sin registrarte"
- **Action**: Redirects to `/communities?location={location}&interests={tags}`
- **Registration required to join**

### 4. Explore Flow (🗺️ Solo explorar)
- **Screen 1**: Large explore button with icon and description
- **Action**:
  - Immediate redirect to `/`
  - Shows homepage with public content
  - PublicViewBanner displays "Regístrate cuando quieras hacer algo"
- **No registration required**

## Design Specifications

### Desktop
- Centered modal (max-width: 2xl = 672px)
- 2x2 grid layout for intention cards
- Card dimensions: min-height 140px
- Smooth animations with Framer Motion
- Backdrop blur effect

### Mobile
- Full-screen modal on mobile
- Stacked cards (1 column)
- Touch-optimized buttons (min 120px height)
- Responsive text sizing
- Bottom sheet style on small screens

### Styling
- **Search**: Blue gradient (from-blue-500 to-blue-600)
- **Offer**: Green gradient (from-green-500 to-emerald-600)
- **Community**: Purple gradient (from-purple-500 to-pink-600)
- **Explore**: Gray gradient (from-gray-500 to-gray-600)
- Large icons (h-10 w-10 = 40px)
- Bold titles (text-xl)
- Descriptive text (text-sm, opacity-90)
- Arrow icon on hover

## LocalStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `user_intention` | 'search' \| 'offer' \| 'community' \| 'explore' | Stores selected intention |
| `intention_onboarding_completed` | 'true' | Prevents showing onboarding again |
| `offer_draft` | JSON object | Stores offer draft data |

### Offer Draft Structure
```typescript
{
  title: string;
  category: 'product' | 'service' | 'other';
  price: string; // numeric string
}
```

## Analytics Events

All events are tracked with:
- Event name
- Timestamp
- User ID (if available)
- Custom properties

### Event Details

1. **INTENTION_ONBOARDING_OPENED**
   - Triggered when modal opens
   - No custom properties

2. **INTENTION_SELECTED**
   - Triggered when user clicks an intention option
   - Properties: `{ intention: UserIntention }`

3. **INTENTION_COMPLETED**
   - Triggered when user completes a flow
   - Properties:
     * `intention: UserIntention`
     * `timeToCompleteMs: number`
     * Flow-specific data:
       - Search: `query: string`
       - Offer: `category: string`, `hasPrice: boolean`
       - Community: `location: string`, `interestsCount: number`

4. **INTENTION_ABANDONED**
   - Triggered when user closes without completing
   - Properties:
     * `intention: UserIntention`
     * `step: 'first_step' | 'second_step'`

## User Flows

### New User Journey

1. **User visits site for first time** (authenticated)
2. **Beginner Welcome** shows first (if not completed)
3. **Intention Onboarding** shows after beginner welcome
4. **User selects intention** (e.g., "Ofrecer algo")
5. **Fills mini-form** with basic info
6. **Redirected to full form** with pre-filled data
7. **Creates offer** (registration already completed)

### Returning User Journey

1. **User clicks "¿Qué puedo hacer?"** in navbar menu
2. **Intention modal opens** (can be used anytime)
3. **User explores different options**
4. **Selects new intention** or closes

## Integration Points

### Homepage
```typescript
// Shows on first visit
const intentionCompleted = localStorage.getItem('intention_onboarding_completed');
const userIntention = localStorage.getItem('user_intention');

if (!intentionCompleted || !userIntention) {
  setShowIntentionOnboarding(true);
}
```

### Navbar
```typescript
// Accessible from user menu
<button onClick={() => setShowIntentionOnboarding(true)}>
  <QuestionMarkCircleIcon />
  ¿Qué puedo hacer?
</button>
```

### Offer Creation
```typescript
// Loads draft on mount
useEffect(() => {
  const draft = localStorage.getItem('offer_draft');
  if (draft) {
    setValues(JSON.parse(draft));
    toast.success('Datos cargados desde tu borrador');
  }
}, []);
```

## Accessibility

- **Keyboard Navigation**: Full support with Tab/Shift+Tab
- **Focus Management**: Auto-focus on inputs when second step shows
- **ARIA Labels**:
  - Close button: `aria-label="Cerrar"`
  - All interactive elements have proper labels
- **Screen Reader**:
  - Modal announces title and description
  - Form errors are announced
  - Success messages are announced

## Performance Optimizations

- **Lazy Loading**: Component can be code-split
- **Minimal Re-renders**: Proper state management
- **LocalStorage Caching**: Saves user progress
- **Debounced Analytics**: Events batched to reduce overhead
- **Optimistic UI**: Immediate feedback on interactions

## Testing

### Test Coverage
- Rendering tests (open/closed states)
- All 4 intention flows
- Form validation
- Back navigation
- LocalStorage persistence
- Analytics tracking
- Callback invocation

### Run Tests
```bash
cd packages/web
npm run test -- IntentionOnboarding
```

## Future Enhancements

### Phase 2
- [ ] GPS auto-detection for community search
- [ ] Image upload in offer flow
- [ ] Multi-language support (es, ca, en, eu)
- [ ] Skip/dismiss tracking for UX insights
- [ ] A/B testing different copy

### Phase 3
- [ ] Personalized recommendations based on intention
- [ ] Progress saving across sessions
- [ ] Email capture before full registration
- [ ] Social proof (e.g., "1,234 people searched today")
- [ ] Gamification (badges for completing flows)

## Metrics to Track

### Success Metrics
- Completion rate by intention type
- Time to complete each flow
- Conversion rate (completed action after onboarding)
- Retention rate (users who return)

### Engagement Metrics
- Clicks on "¿Qué puedo hacer?" in navbar
- Abandonment points (which step users leave)
- Most popular intention
- Draft completion rate (for offers)

### Quality Metrics
- Error rate in forms
- Search query quality
- Location accuracy
- Interest tag selection patterns

## Deployment Checklist

- [x] Component created and integrated
- [x] Analytics events added
- [x] LocalStorage handling implemented
- [x] Draft loading in offer creation
- [x] Navbar integration
- [x] Homepage integration
- [x] Tests written
- [x] Documentation created
- [ ] Translation keys added (if needed)
- [ ] Backend endpoints ready (if any)
- [ ] Mobile testing completed
- [ ] Accessibility audit completed
- [ ] Performance testing completed
- [ ] Analytics dashboard configured

## Support & Troubleshooting

### Common Issues

**Issue**: Onboarding doesn't show
- Check localStorage: `intention_onboarding_completed` should not be set
- Check authentication: User must be logged in
- Check beginner mode: Must be completed first

**Issue**: Draft data not loading
- Check localStorage: `offer_draft` should exist
- Check console for errors
- Verify useEffect dependency array

**Issue**: Analytics not tracking
- Check console in development mode
- Verify Analytics.track() is called
- Check localStorage for `analytics_events`

**Issue**: Mobile layout broken
- Verify Tailwind classes are responsive
- Check min-height constraints
- Test on real devices, not just browser DevTools

## Contact

For questions or issues:
- Check component documentation: `IntentionOnboarding.md`
- Review test cases: `__tests__/IntentionOnboarding.test.tsx`
- Check analytics: `localStorage.getItem('analytics_events')`
