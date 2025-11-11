# Truk - Comprehensive Application Audit Report
**Date:** 2025-10-07
**Audited by:** Claude Code

---

## Executive Summary

This audit reviews the Truk application to identify hardcoded data, missing backend implementations, and prioritize remaining work. The application has a solid foundation with authentication, offers, events, messaging, and analytics systems implemented. However, several frontend features lack complete backend integration or use placeholder implementations.

**Overall Status:**
- **Backend Coverage:** ~70% implemented
- **Frontend-Backend Integration:** ~65% complete
- **Critical Missing Features:** Daily Seed system, Interest tracking (proper), Profile editing

---

## 1. COUNTERS ANALYSIS

### 1.1 Community Stats (Home Page)
**Location:** `/packages/web/src/components/CommunityStats.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Pulls from: `GET /analytics/community/metrics`
- Backend: `/packages/backend/src/analytics/analytics.controller.ts:16`
- Displays: activeUsers, hoursExchanged, eurosSaved, co2Avoided
- Updates dynamically from real data

---

### 1.2 Offer Views & Interested Counters
**Location:** `/packages/web/src/pages/offers/index.tsx:142-144`

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Current State:**
- Views counter: ✅ Incremented automatically when viewing offer (offers.service.ts:47-55)
- Interested counter: ⚠️ PROBLEM - Only increments, no user tracking

**Issues:**
```typescript
// Frontend (offers/[id].tsx:59-61)
const handleInterest = () => {
  toast.success('Marcado como interesado');  // ❌ NO API CALL!
};
```

**Backend Endpoint:**
- `POST /offers/:id/interested` exists (offers.controller.ts:61-64)
- Implementation only increments counter, doesn't track which users are interested
- Missing: User-Offer interest relationship table

**What's Needed:**
1. Connect frontend button to backend endpoint
2. Create database model for user interests (many-to-many)
3. Prevent duplicate interests from same user
4. Allow users to view their interested offers

---

### 1.3 Event Attendees Counter
**Location:** `/packages/web/src/pages/events/index.tsx:107`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Data from: `GET /events` returns attendees array
- Registration: `POST /events/:id/register` (events.controller.ts:62-65)
- Cancel: `DELETE /events/:id/register` (events.controller.ts:70-73)
- Counter updates dynamically

---

### 1.4 Timebank Stats
**Location:** `/packages/web/src/pages/timebank.tsx:105-118`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- API: `GET /timebank/stats` (timebank.controller.ts:104-107)
- Shows: hoursGiven, hoursReceived, totalTransactions, pendingRequests
- All calculated from real transaction data

---

### 1.5 Feed Post Counters
**Location:** `/packages/web/src/components/Feed.tsx:38-47`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- thanksCount, commentsCount, sharesCount from API
- Social interactions tracked via: `POST /social/posts/:id/reactions`
- Comments: `POST /social/posts/:id/comments`

---

## 2. BUTTONS & INTERACTIONS ANALYSIS

### 2.1 Daily Seed "Completar" Button
**Location:** `/packages/web/src/components/DailySeed.tsx:10-12`

**Status:** ❌ NOT IMPLEMENTED (Hardcoded)

**Current Code:**
```tsx
<button className="...">
  Completar (+5 créditos)  // ❌ NO HANDLER
</button>
```

**Issues:**
- No onClick handler
- Hardcoded text "Saluda a un vecino que no conozcas"
- No backend endpoint for daily challenges
- Credits not actually granted

**What's Needed:**
1. Create DailyChallenge model in database
2. Backend endpoints:
   - `GET /challenges/daily` - Get today's challenge
   - `POST /challenges/:id/complete` - Mark complete and grant credits
3. Frontend: Connect button to API, invalidate credits query
4. Implement challenge rotation system

**Priority:** HIGH - Visible placeholder, promises credits

---

### 2.2 Offer "Me Interesa" Button
**Location:** `/packages/web/src/pages/offers/[id].tsx:179-183`

**Status:** ❌ PLACEHOLDER IMPLEMENTATION

**Current Code:**
```typescript
const handleInterest = () => {
  toast.success('Marcado como interesado');  // ❌ NO REAL ACTION
};
```

**What's Needed:**
1. Call `POST /offers/:id/interested` endpoint
2. Track user-offer interest relationship
3. Show if user already interested
4. Allow un-interest action

**Priority:** HIGH - User expects it to work

---

### 2.3 Offer "Contactar" Button
**Location:** `/packages/web/src/pages/offers/[id].tsx:42-57`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Redirects to: `/messages/${offerData.user.id}`
- Messaging system fully functional
- WebSocket support for real-time messages

---

### 2.4 Event "Registrarse" Button
**Location:** `/packages/web/src/pages/events/[id].tsx:83-103`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Calls: `POST /events/:id/register`
- Checks capacity limits
- Updates attendee count
- Shows registration status

---

### 2.5 Quick Actions Buttons
**Location:** `/packages/web/src/components/QuickActions.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**All Links Working:**
- + Crear Oferta → `/offers/new` ✅
- + Crear Evento → `/events/new` ✅
- Banco de Tiempo → `/timebank` ✅

---

### 2.6 Feed Reaction Buttons
**Location:** `/packages/web/src/components/feed/PostCard.tsx:119-141`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Add reaction: `POST /social/posts/:id/reactions`
- Remove: `DELETE /social/posts/:id/reactions`
- Comment: `POST /social/posts/:id/comments`
- All functional with backend

---

### 2.7 Profile "Ver perfil" Button (Offer Detail)
**Location:** `/packages/web/src/pages/offers/[id].tsx:197-199`

**Status:** ❌ NOT IMPLEMENTED

**Current Code:**
```tsx
<button className="...">
  Ver perfil  // ❌ NO HANDLER
</button>
```

**What's Needed:**
1. Add onClick handler
2. Navigate to `/profile/${offerData.user.id}`
3. Create public profile view page (separate from own profile)

**Priority:** MEDIUM

---

### 2.8 Navbar Notification Bell
**Location:** `/packages/web/src/components/NotificationBell.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- WebSocket connection for real-time notifications
- Shows: new messages, new offers, new events
- Toast notifications on arrival
- Clear all functionality

---

## 3. FORMS ANALYSIS

### 3.1 Create Offer Form
**Location:** `/packages/web/src/pages/offers/new.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Submits to: `POST /offers`
- Image upload: `POST /upload/image`
- Geocoding: OpenStreetMap Nominatim API
- Validation: Client and server-side
- Redirects to created offer

---

### 3.2 Create Event Form
**Location:** `/packages/web/src/pages/events/new.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Submits to: `POST /events`
- Image upload: `POST /upload/image`
- Date validation
- Geocoding support
- Capacity and credits reward

---

### 3.3 Login Form
**Location:** `/packages/web/src/pages/auth/login.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Calls: `POST /auth/login`
- JWT token storage
- User data caching
- Error handling

---

### 3.4 Register Form
**Location:** `/packages/web/src/pages/auth/register.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Calls: `POST /auth/register`
- Password confirmation
- Phone optional
- Auto-login after registration

---

### 3.5 Message Send Form
**Location:** `/packages/web/src/pages/messages/[userId].tsx:117-121`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Calls: `POST /messages/:userId`
- Real-time update via WebSocket
- Optimistic UI updates

---

### 3.6 Post Comment Form
**Location:** `/packages/web/src/components/feed/PostCard.tsx:68-75`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- Calls: `POST /social/posts/:id/comments`
- Shows immediately in UI
- Author info included

---

### 3.7 Profile Edit Form
**Location:** `/packages/web/src/pages/profile.tsx`

**Status:** ❌ NOT IMPLEMENTED

**Current State:**
- Profile page shows user data
- Logout button works
- NO edit functionality

**What's Needed:**
1. Add "Editar perfil" button
2. Create profile edit form (modal or separate page)
3. Connect to: `PUT /users/:id` (endpoint exists!)
4. Fields: name, bio, avatar upload, phone
5. Validation and error handling

**Priority:** HIGH - Common user need

---

## 4. LISTS & FEEDS ANALYSIS

### 4.1 Offers List
**Location:** `/packages/web/src/pages/offers/index.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- API: `GET /offers`
- Filters: type, category (working)
- Real data from database
- Pagination: ❌ Not implemented (but endpoint supports limit/offset)

---

### 4.2 Events List
**Location:** `/packages/web/src/pages/events/index.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- API: `GET /events`
- Shows all event data
- Real-time attendee counts
- Pagination: ❌ Not implemented

---

### 4.3 Social Feed
**Location:** `/packages/web/src/components/Feed.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- API: `GET /social/feed`
- Shows posts with reactions and comments
- Infinite scroll: ⚠️ Not implemented (endpoint supports cursor-based)

---

### 4.4 Messages/Conversations List
**Location:** `/packages/web/src/pages/messages/index.tsx`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- API: `GET /messages/conversations`
- Shows last message, unread count
- Real-time updates via WebSocket
- Sorting by latest message

---

### 4.5 Timebank Offers
**Location:** `/packages/web/src/pages/timebank.tsx:164-212`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- API: `GET /timebank/offers`
- Shows available skills
- Experience level filtering
- Category support

---

### 4.6 Timebank Transactions
**Location:** `/packages/web/src/pages/timebank.tsx:229-286`

**Status:** ✅ FULLY IMPLEMENTED

**Implementation:**
- API: `GET /timebank/transactions`
- Shows status (PENDING, CONFIRMED, COMPLETED)
- Provider and requester info
- Hours and credits tracking

---

## 5. NAVIGATION & LINKS

### 5.1 Main Navigation
**Location:** `/packages/web/src/components/Navbar.tsx`

**Status:** ✅ ALL WORKING

**Links:**
- Inicio (/) ✅
- Ofertas (/offers) ✅
- Eventos (/events) ✅
- Perfil (/profile) ✅
- Login/Register ✅

---

### 5.2 Map View Toggle
**Location:** `/packages/web/src/pages/index.tsx:88-111`

**Status:** ✅ WORKING

**Implementation:**
- Toggle between map and feed views
- Map shows offers and events with coordinates
- Pin counter display

---

### 5.3 Offer/Event Detail Links
**Status:** ✅ ALL WORKING

**Routes:**
- `/offers/:id` ✅
- `/events/:id` ✅
- `/messages/:userId` ✅

---

## 6. BACKEND ENDPOINTS COVERAGE

### ✅ Fully Implemented Controllers

1. **Authentication** (`/auth`)
   - POST /auth/register ✅
   - POST /auth/login ✅
   - POST /auth/logout ✅

2. **Offers** (`/offers`)
   - GET /offers ✅
   - GET /offers/:id ✅
   - POST /offers ✅
   - PUT /offers/:id ✅
   - DELETE /offers/:id ✅
   - POST /offers/:id/interested ⚠️ (needs user tracking)

3. **Events** (`/events`)
   - GET /events ✅
   - GET /events/:id ✅
   - POST /events ✅
   - PUT /events/:id ✅
   - DELETE /events/:id ✅
   - POST /events/:id/register ✅
   - DELETE /events/:id/register ✅
   - GET /events/:id/qr ✅
   - POST /events/checkin ✅
   - GET /events/:id/attendees ✅

4. **Messages** (`/messages`)
   - GET /messages/conversations ✅
   - GET /messages/:userId ✅
   - POST /messages/:userId ✅
   - PATCH /messages/:messageId/read ✅

5. **Social/Feed** (`/social`)
   - GET /social/feed ✅
   - POST /social/posts ✅
   - GET /social/posts/:id ✅
   - PUT /social/posts/:id ✅
   - DELETE /social/posts/:id ✅
   - POST /social/posts/:id/comments ✅
   - POST /social/posts/:id/reactions ✅
   - DELETE /social/posts/:id/reactions ✅

6. **Timebank** (`/timebank`)
   - GET /timebank/offers ✅
   - POST /timebank/requests ✅
   - GET /timebank/transactions ✅
   - GET /timebank/transactions/:id ✅
   - PUT /timebank/transactions/:id/confirm ✅
   - PUT /timebank/transactions/:id/complete ✅
   - PUT /timebank/transactions/:id/cancel ✅
   - GET /timebank/stats ✅

7. **Analytics** (`/analytics`)
   - GET /analytics/community/metrics ✅
   - GET /analytics/user/metrics ✅
   - GET /analytics/timeseries ✅
   - GET /analytics/export/csv ✅
   - GET /analytics/user/stats ✅

8. **Users** (`/users`)
   - GET /users/:id ✅
   - PUT /users/:id ✅ (NOT USED IN FRONTEND!)

9. **Credits** (`/credits`)
   - GET /credits/balance ✅
   - GET /credits/stats ✅
   - GET /credits/transactions ✅
   - GET /credits/opportunities ✅
   - GET /credits/leaderboard ✅
   - POST /credits/grant ✅
   - POST /credits/spend ✅

10. **Reviews** (`/reviews`)
    - POST /reviews ✅
    - GET /reviews ✅
    - GET /reviews/entity/:type/:id ✅
    - GET /reviews/entity/:type/:id/average ✅
    - PATCH /reviews/:id ✅
    - DELETE /reviews/:id ✅

11. **Notifications** (`/notifications`)
    - GET /notifications ✅
    - PUT /notifications/:id/read ✅
    - PUT /notifications/read-all ✅

12. **Group Buys** (`/groupbuys`)
    - GET /groupbuys ✅
    - GET /groupbuys/:id ✅
    - POST /groupbuys ✅
    - POST /groupbuys/:id/join ✅
    - PUT /groupbuys/:id/participation ✅
    - DELETE /groupbuys/:id/participation ✅
    - POST /groupbuys/:id/close ✅

### ❌ Missing Backend Features

1. **Daily Challenges/Seeds**
   - No controller exists
   - No database models
   - Frontend shows hardcoded challenge

2. **User Skills Management**
   - Backend models exist (UserSkill table)
   - No CRUD endpoints for adding/removing skills
   - Profile shows skills but can't edit

3. **Public Profile View**
   - GET /users/:id exists
   - But no distinction between own profile and viewing others
   - Need privacy settings

---

## 7. DETAILED FINDINGS BY PRIORITY

### 🔴 HIGH PRIORITY - Critical Missing Features

#### 1. Daily Seed System
**Impact:** High visibility, promises credits but doesn't deliver

**File:** `/packages/web/src/components/DailySeed.tsx`

**Current State:**
```tsx
export default function DailySeed() {
  return (
    <div className="...">
      <div>
        <h3>🌱 Semilla del Día</h3>
        <p>Saluda a un vecino que no conozcas</p> // ❌ HARDCODED
      </div>
      <button className="...">
        Completar (+5 créditos)  // ❌ NO ACTION
      </button>
    </div>
  );
}
```

**Required Implementation:**

**Backend:**
1. Create table: `DailyChallenge`
   ```prisma
   model DailyChallenge {
     id          String   @id @default(uuid())
     title       String
     description String
     credits     Int
     date        DateTime @unique
     completions UserChallengeCompletion[]
   }

   model UserChallengeCompletion {
     id          String   @id @default(uuid())
     userId      String
     challengeId String
     completedAt DateTime @default(now())
     user        User     @relation(fields: [userId], references: [id])
     challenge   DailyChallenge @relation(fields: [challengeId], references: [id])
     @@unique([userId, challengeId])
   }
   ```

2. Create controller: `challenges.controller.ts`
   ```typescript
   @Controller('challenges')
   export class ChallengesController {
     @Get('daily')
     async getDailyChallenge() {
       // Get today's challenge or create if none
     }

     @Post(':id/complete')
     @UseGuards(JwtAuthGuard)
     async completeChallenge(@Param('id') id, @Request() req) {
       // Mark complete, grant credits, prevent duplicates
     }

     @Get('my-completions')
     @UseGuards(JwtAuthGuard)
     async getMyCompletions(@Request() req) {
       // Get user's completion history
     }
   }
   ```

**Frontend:**
```tsx
export default function DailySeed() {
  const { data: challenge } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: () => api.get('/challenges/daily'),
  });

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/challenges/${challenge?.data.id}/complete`),
    onSuccess: () => {
      toast.success(`+${challenge?.data.credits} créditos ganados!`);
      queryClient.invalidateQueries(['daily-challenge']);
      queryClient.invalidateQueries(['credits-balance']);
    }
  });

  if (!challenge?.data) return null;

  const isCompleted = challenge.data.isCompletedToday;

  return (
    <div>
      <h3>🌱 Semilla del Día</h3>
      <p>{challenge.data.description}</p>
      <button
        onClick={() => completeMutation.mutate()}
        disabled={isCompleted}
      >
        {isCompleted ? 'Completado ✓' : `Completar (+${challenge.data.credits} créditos)`}
      </button>
    </div>
  );
}
```

**Complexity:** MEDIUM (3-4 hours)

---

#### 2. Offer Interest Tracking (Proper Implementation)
**Impact:** Users expect it to work when they click

**File:** `/packages/web/src/pages/offers/[id].tsx:59-61`

**Current State:**
```typescript
const handleInterest = () => {
  toast.success('Marcado como interesado'); // ❌ FAKE
};
```

**Backend Issue:**
```typescript
// offers.service.ts:75-84
async markAsInterested(offerId: string) {
  return this.prisma.offer.update({
    where: { id: offerId },
    data: {
      interested: { increment: 1 } // ❌ Only increments, no user tracking!
    },
  });
}
```

**Required Implementation:**

**Backend:**
1. Update database model:
   ```prisma
   model OfferInterest {
     id        String   @id @default(uuid())
     offerId   String
     userId    String
     createdAt DateTime @default(now())
     offer     Offer    @relation(fields: [offerId], references: [id])
     user      User     @relation(fields: [userId], references: [id])
     @@unique([offerId, userId])
   }
   ```

2. Update service:
   ```typescript
   async markAsInterested(offerId: string, userId: string) {
     const existing = await this.prisma.offerInterest.findUnique({
       where: { offerId_userId: { offerId, userId } }
     });

     if (existing) {
       throw new BadRequestException('Ya marcado como interesado');
     }

     return this.prisma.offerInterest.create({
       data: { offerId, userId }
     });
   }

   async unmarkInterest(offerId: string, userId: string) {
     return this.prisma.offerInterest.delete({
       where: { offerId_userId: { offerId, userId } }
     });
   }

   async isUserInterested(offerId: string, userId: string) {
     const interest = await this.prisma.offerInterest.findUnique({
       where: { offerId_userId: { offerId, userId } }
     });
     return !!interest;
   }

   async getInterestedCount(offerId: string) {
     return this.prisma.offerInterest.count({
       where: { offerId }
     });
   }
   ```

3. Update controller:
   ```typescript
   @Post(':id/interested')
   @UseGuards(JwtAuthGuard)
   async markAsInterested(@Param('id') id: string, @Request() req) {
     return this.offersService.markAsInterested(id, req.user.userId);
   }

   @Delete(':id/interested')
   @UseGuards(JwtAuthGuard)
   async unmarkInterest(@Param('id') id: string, @Request() req) {
     return this.offersService.unmarkInterest(id, req.user.userId);
   }
   ```

**Frontend:**
```typescript
const { data: offer } = useQuery({
  queryKey: ['offer', id],
  queryFn: async () => {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },
});

const interestMutation = useMutation({
  mutationFn: () => api.post(`/offers/${id}/interested`),
  onSuccess: () => {
    toast.success('Marcado como interesado');
    queryClient.invalidateQueries(['offer', id]);
  }
});

const uninterestMutation = useMutation({
  mutationFn: () => api.delete(`/offers/${id}/interested`),
  onSuccess: () => {
    toast.success('Interés eliminado');
    queryClient.invalidateQueries(['offer', id]);
  }
});

const handleInterest = () => {
  if (offer.isInterested) {
    uninterestMutation.mutate();
  } else {
    interestMutation.mutate();
  }
};

// In render:
<button onClick={handleInterest}>
  {offer.isInterested ? 'Ya no me interesa' : 'Me interesa'}
</button>
```

**Complexity:** EASY (1-2 hours)

---

#### 3. Profile Edit Functionality
**Impact:** Users can't update their info

**File:** `/packages/web/src/pages/profile.tsx`

**Current State:**
- Shows profile data ✅
- Backend endpoint EXISTS: `PUT /users/:id` ✅
- Frontend form: ❌ MISSING

**Required Implementation:**

**Frontend - Add Edit Modal:**
```tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio || '',
    phone: '',
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/users/${userId}`, data),
    onSuccess: () => {
      toast.success('Perfil actualizado');
      setIsEditing(false);
      queryClient.invalidateQueries(['profile', userId]);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(editForm);
  };

  return (
    <>
      {/* Existing profile display */}
      <button onClick={() => setIsEditing(true)}>
        Editar perfil
      </button>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2>Editar Perfil</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Nombre"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Biografía"
              />
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Teléfono"
              />
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
```

**Avatar Upload:**
- Use existing `/upload/image` endpoint
- Add avatar field to form
- Preview before upload

**Complexity:** EASY (2 hours)

---

### 🟡 MEDIUM PRIORITY - Important Improvements

#### 4. Pagination for Lists
**Impact:** Performance issue with many items

**Files:**
- `/packages/web/src/pages/offers/index.tsx`
- `/packages/web/src/pages/events/index.tsx`

**Current State:**
- Backend supports `limit` and `offset` parameters ✅
- Frontend: Loads all at once ❌

**Implementation:**
```tsx
import { useState } from 'react';

export default function OffersPage() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['offers', filters, page],
    queryFn: async () => {
      const response = await api.get('/offers', {
        params: {
          ...filters,
          limit,
          offset: (page - 1) * limit
        }
      });
      return response.data;
    },
  });

  return (
    <>
      {/* Existing grid */}

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button
          disabled={offers.length < limit}
          onClick={() => setPage(p => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </>
  );
}
```

**Complexity:** EASY (1 hour per page)

---

#### 5. Public Profile View
**Impact:** Can't view other users' profiles

**Current State:**
- "Ver perfil" button in offers has no handler
- Need separate page from own profile
- Backend endpoint ready: `GET /users/:id`

**Implementation:**

**New Route:** `/packages/web/src/pages/users/[id].tsx`
```tsx
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Redirect to own profile if viewing self
  if (id === currentUser.id) {
    router.push('/profile');
    return null;
  }

  const { data: profile } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`),
    enabled: !!id,
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Show profile info */}
        {/* Show user's active offers */}
        {/* Show user's public stats */}
        {/* Show reviews/ratings */}
        <button onClick={() => router.push(`/messages/${id}`)}>
          Enviar mensaje
        </button>
      </div>
    </Layout>
  );
}
```

**Update Offer Detail:**
```tsx
<button
  onClick={() => router.push(`/users/${offerData.user.id}`)}
  className="..."
>
  Ver perfil
</button>
```

**Complexity:** MEDIUM (2-3 hours)

---

#### 6. Infinite Scroll for Feed
**Impact:** Better UX for social feed

**File:** `/packages/web/src/components/Feed.tsx`

**Current State:**
- Backend supports cursor-based pagination ✅
- Frontend: Loads fixed amount ❌

**Implementation:**
```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

export default function Feed() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) =>
      api.get('/social/feed', {
        params: { limit: 10, cursor: pageParam }
      }),
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  const posts = data?.pages.flatMap(page => page.data.posts) || [];

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <div ref={ref}>
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
}
```

**Dependencies:** `npm install react-intersection-observer`

**Complexity:** MEDIUM (2 hours)

---

### 🟢 LOW PRIORITY - Nice to Have

#### 7. Skills Management
**Impact:** Profile shows skills but can't edit them

**Current State:**
- Database models exist ✅
- Profile displays skills ✅
- No add/remove functionality ❌

**Required:**
1. Backend endpoints:
   ```typescript
   @Controller('users/:userId/skills')
   @Post()
   async addSkill(@Param('userId') userId, @Body() data) {}

   @Delete(':skillId')
   async removeSkill(@Param('skillId') skillId) {}
   ```

2. Frontend modal in profile page

**Complexity:** MEDIUM (2-3 hours)

---

#### 8. Search Functionality
**Impact:** Hard to find specific offers/events

**Current State:**
- Backend has search controller ✅
- No search UI in frontend ❌

**Required:**
- Add search bar to offers/events pages
- Call `GET /search?q=query&type=offers`
- Show results

**Complexity:** EASY (1-2 hours)

---

#### 9. Credits Leaderboard Display
**Impact:** Gamification feature

**Current State:**
- Backend endpoint ready: `GET /credits/leaderboard` ✅
- No frontend page ❌

**Required:**
- Create `/pages/leaderboard.tsx`
- Display top users with credits
- Add link in navbar

**Complexity:** EASY (1 hour)

---

#### 10. Review System Integration
**Impact:** Trust/reputation feature

**Current State:**
- Complete backend implementation ✅
- Review components exist in `/components/reviews/` ✅
- Not integrated in offer/event detail pages ❌

**Required:**
1. Add reviews section to offer detail page
2. Add reviews section to event detail page (after attendance)
3. Show average rating
4. Allow users to leave reviews

**Complexity:** MEDIUM (3-4 hours)

---

## 8. SUMMARY CHECKLIST

### ✅ FULLY IMPLEMENTED (70% of features)

**Authentication & Users:**
- [x] Login
- [x] Register
- [x] Logout
- [x] View own profile
- [x] User stats display

**Offers:**
- [x] List offers with filters
- [x] View offer detail
- [x] Create offer with images
- [x] Update offer
- [x] Delete offer
- [x] View counter (auto-increment)
- [x] Contact offer owner

**Events:**
- [x] List events
- [x] View event detail
- [x] Create event with images
- [x] Register/unregister for event
- [x] Capacity management
- [x] Credits reward system
- [x] QR code check-in

**Messaging:**
- [x] Conversations list
- [x] Real-time chat
- [x] Send messages
- [x] Unread counters
- [x] WebSocket notifications

**Social/Feed:**
- [x] View feed posts
- [x] Create posts
- [x] React to posts (thanks, etc.)
- [x] Comment on posts
- [x] Delete own posts

**Timebank:**
- [x] View available offers
- [x] Create requests
- [x] View transactions
- [x] Confirm/complete transactions
- [x] User stats

**Analytics:**
- [x] Community metrics
- [x] User metrics
- [x] Time series data
- [x] CSV export

**Credits:**
- [x] View balance
- [x] Transaction history
- [x] Earning stats
- [x] Grant/spend credits

**Map:**
- [x] Display offers on map
- [x] Display events on map
- [x] Geocoding support

---

### ⚠️ PARTIALLY IMPLEMENTED (15% of features)

**Offers:**
- [ ] Interest button (frontend only shows toast, backend needs user tracking)
- [ ] Pagination (backend ready, frontend missing)

**Profile:**
- [ ] Edit profile (backend ready, frontend form missing)
- [ ] View other users' profiles (endpoint ready, page missing)

**Social:**
- [ ] Infinite scroll feed (backend ready, frontend uses basic loading)

---

### ❌ NOT IMPLEMENTED (15% of features)

**Challenges:**
- [ ] Daily Seed system (complete placeholder)
- [ ] Backend endpoints
- [ ] Credits reward integration

**Skills:**
- [ ] Add/remove skills (models exist, no CRUD)

**Search:**
- [ ] Frontend search UI (backend exists)

**Reviews:**
- [ ] Integration in offer/event pages (components exist)

**Leaderboard:**
- [ ] Display page (endpoint exists)

**Group Buys:**
- [ ] Frontend pages (backend complete)

---

## 9. PRIORITY IMPLEMENTATION ROADMAP

### Sprint 1: Critical Fixes (1-2 days)
**Goal:** Fix visible broken features

1. **Daily Seed Implementation** (4 hours)
   - Create database models
   - Backend controller and service
   - Frontend integration
   - Testing

2. **Offer Interest Tracking** (2 hours)
   - Add user-offer relationship
   - Update backend service
   - Connect frontend button
   - Show interest status

3. **Profile Edit Form** (2 hours)
   - Create edit modal
   - Form validation
   - API integration
   - Avatar upload

**Total: ~8 hours / 1 day**

---

### Sprint 2: UX Improvements (2-3 days)

4. **Pagination for Lists** (3 hours)
   - Offers page
   - Events page
   - Transactions page

5. **Public Profile View** (3 hours)
   - New route
   - Profile display
   - Reviews integration
   - Message button

6. **Feed Infinite Scroll** (2 hours)
   - Implement useInfiniteQuery
   - Intersection observer
   - Loading states

7. **"Ver perfil" Button Handler** (30 min)
   - Add onClick to all instances
   - Navigate to public profile

**Total: ~9 hours / 1-2 days**

---

### Sprint 3: Feature Completeness (3-5 days)

8. **Skills Management** (3 hours)
   - Backend CRUD endpoints
   - Frontend add/remove UI
   - Skill categories

9. **Review System Integration** (4 hours)
   - Add to offer detail
   - Add to event detail
   - Display average ratings
   - Review form

10. **Search UI** (2 hours)
    - Search bar component
    - Results page
    - Type filtering

11. **Leaderboard Page** (1 hour)
    - Display top users
    - Styling
    - Navigation link

**Total: ~10 hours / 2 days**

---

### Sprint 4: Advanced Features (Optional)

12. **Group Buys Frontend** (1 week)
    - List page
    - Detail page
    - Join/leave functionality
    - Progress tracking

13. **Advanced Analytics Dashboard**
    - Charts
    - Trends
    - Comparisons

14. **Mobile Optimization**
    - Responsive fixes
    - Touch gestures
    - PWA support

---

## 10. TECHNICAL DEBT & CODE QUALITY

### Code Quality Issues

1. **Type Safety:**
   - Some `any` types in API calls
   - Missing TypeScript interfaces in places

2. **Error Handling:**
   - Inconsistent error display
   - Some try-catch blocks missing

3. **State Management:**
   - No global state (Zustand/Redux)
   - Prop drilling in some components

4. **Testing:**
   - No unit tests visible
   - No E2E tests
   - No API tests

### Recommendations

1. **Add type definitions:**
   ```typescript
   // Create shared types package
   export interface Offer {
     id: string;
     title: string;
     // ... all fields
   }
   ```

2. **Centralize error handling:**
   ```typescript
   // lib/errorHandler.ts
   export function handleApiError(error: any) {
     if (error.response?.data?.message) {
       toast.error(error.response.data.message);
     } else {
       toast.error('Error inesperado');
     }
   }
   ```

3. **Add loading states wrapper:**
   ```typescript
   export function LoadingWrapper({ isLoading, error, children }) {
     if (isLoading) return <Spinner />;
     if (error) return <ErrorDisplay error={error} />;
     return children;
   }
   ```

---

## 11. ESTIMATED COMPLETION TIME

**Current State:** ~70% complete

**Remaining Work:**
- Critical fixes: 1 day
- UX improvements: 2 days
- Feature completeness: 2 days
- Testing & polish: 1 day

**Total Remaining:** ~6 working days (1.5 weeks)

**With optional features:** +1 week for Group Buys

---

## CONCLUSION

The Truk application has a solid foundation with most core features implemented and working. The main gaps are:

1. **Daily Seed** - Most visible missing feature
2. **Offer Interest Tracking** - Broken user expectation
3. **Profile Editing** - Basic user need

These three issues should be addressed first as they're user-facing and either don't work or give false feedback.

The backend is more complete than the frontend, with many existing endpoints not yet consumed by the UI. This makes frontend development faster as the API is already available.

Overall assessment: **Production-ready after Sprint 1 & 2 (3-4 days)**

---

**Report compiled by:** Claude Code
**Date:** 2025-10-07
**Contact:** For questions about this audit, please consult the development team.
