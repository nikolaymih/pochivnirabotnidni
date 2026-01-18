# Architecture Research

**Domain:** Calendar/Vacation Tracking Application
**Researched:** 2026-01-18
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Next.js App Router - Server & Client Components)          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Calendar │  │ Vacation │  │   Auth   │  │ Settings │    │
│  │   View   │  │ Tracking │  │   Flow   │  │   Page   │    │
│  │  (RSC)   │  │  (RSC)   │  │  (RSC)   │  │  (RSC)   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │  ┌──────────┴────┐        │              │          │
│       │  │ Interactive   │        │              │          │
│       │  │  Components   │        │              │          │
│       │  │   (Client)    │        │              │          │
│       │  └───────────────┘        │              │          │
├───────┴────────────┴──────────────┴──────────────┴──────────┤
│                    Business Logic Layer                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Server Actions (create/update/delete vacations)     │    │
│  │ Data Fetchers (cached queries for holidays/events)  │    │
│  │ Balance Calculators (vacation accrual logic)        │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Supabase    │  │ OpenHolidays │  │ Local Storage│      │
│  │  PostgreSQL  │  │  API Client  │  │  (Anonymous) │      │
│  │  (Auth+Data) │  │  (Cached)    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Calendar View (RSC)** | Fetch and render 12-month calendar with holidays + user vacations | Server Component fetching data, passing to virtualized client grid |
| **Vacation Form (Client)** | Handle user input for vacation creation/editing | Client Component with React Hook Form + Server Action submission |
| **Auth Flow (RSC)** | Handle authentication routing and session management | Server Component checking auth state, Client Components for forms |
| **Holiday API Client** | Fetch holidays from OpenHolidays API with caching | Server-side cached function using `use cache` directive |
| **Balance Calculator** | Calculate vacation balances, accruals, and rollover | Pure function called from Server Components/Actions |
| **Vacation Manager** | CRUD operations for user vacations | Server Actions with Supabase client and cache invalidation |

## Recommended Project Structure

```
app/
├── (auth)/                     # Auth route group
│   ├── login/
│   │   └── page.tsx           # Login page (RSC)
│   ├── signup/
│   │   └── page.tsx           # Signup page (RSC)
│   └── auth/
│       └── confirm/
│           └── route.ts       # Email confirmation callback
├── (dashboard)/               # Protected routes
│   ├── calendar/
│   │   └── page.tsx           # Main calendar view (RSC)
│   ├── vacations/
│   │   ├── page.tsx           # Vacation list/history (RSC)
│   │   └── [id]/
│   │       └── page.tsx       # Vacation detail/edit (RSC)
│   └── settings/
│       └── page.tsx           # User settings (RSC)
├── holidays/
│   └── [year]/
│       └── page.tsx           # SEO-friendly holiday pages (RSC)
├── layout.tsx                 # Root layout
├── middleware.ts              # Supabase auth middleware
└── api/
    └── webhooks/
        └── route.ts           # External webhook handlers

lib/
├── supabase/
│   ├── client.ts              # Browser client (Client Components)
│   ├── server.ts              # Server client (Server Components)
│   └── middleware.ts          # Cookie/session handling
├── holidays/
│   ├── api.ts                 # OpenHolidays API client
│   ├── cache.ts               # Holiday caching logic
│   └── types.ts               # Holiday type definitions
├── vacations/
│   ├── actions.ts             # Server Actions (create/update/delete)
│   ├── queries.ts             # Data fetching functions (cached)
│   └── balance.ts             # Balance calculation logic
├── auth/
│   ├── session.ts             # Session utilities
│   └── anonymous.ts           # Anonymous user local storage handling
└── utils/
    ├── date.ts                # Date manipulation utilities
    └── validation.ts          # Zod schemas for forms

components/
├── calendar/
│   ├── calendar-grid.tsx      # Virtualized calendar grid (Client)
│   ├── calendar-day.tsx       # Day cell component (Client)
│   ├── calendar-header.tsx    # Month/year navigation (Client)
│   └── event-popover.tsx      # Event detail popover (Client)
├── vacations/
│   ├── vacation-form.tsx      # Create/edit form (Client)
│   ├── vacation-list.tsx      # List component (Server/Client hybrid)
│   └── balance-display.tsx    # Balance visualization (Server)
├── ui/                        # Shadcn/UI components (Client)
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
└── providers/
    └── theme-provider.tsx     # Theme context provider (Client)

types/
├── database.ts                # Supabase generated types
├── calendar.ts                # Calendar domain types
└── vacation.ts                # Vacation domain types
```

### Structure Rationale

- **Route Groups:** `(auth)` and `(dashboard)` organize routes without affecting URL structure, enabling layout sharing
- **Server-First:** All pages default to Server Components; only interactive elements become Client Components
- **lib/ Organization:** Domain-driven folders (holidays, vacations, auth) with clear separation between actions, queries, and utilities
- **Components Colocation:** Component folders mirror domain concepts (calendar, vacations) for discoverability
- **Type Safety:** Centralized type definitions with Supabase database types as source of truth

## Architectural Patterns

### Pattern 1: Server Component Data Fetching with Client Interactivity

**What:** Server Components fetch data close to the database, passing it to minimal Client Components that handle only interactive features.

**When to use:** For pages with data fetching and selective interactivity (most calendar/vacation pages).

**Trade-offs:**
- PROS: Reduces JavaScript bundle, improves FCP, keeps secrets server-side
- CONS: Requires understanding Server/Client boundary, props must be serializable

**Example:**
```typescript
// app/(dashboard)/calendar/page.tsx (Server Component)
import { CalendarGrid } from '@/components/calendar/calendar-grid'
import { getHolidays } from '@/lib/holidays/cache'
import { getVacations } from '@/lib/vacations/queries'
import { getCurrentUser } from '@/lib/auth/session'

export default async function CalendarPage() {
  const user = await getCurrentUser()
  const year = new Date().getFullYear()

  // Fetch data server-side (parallel requests)
  const [holidays, vacations] = await Promise.all([
    getHolidays(year),
    user ? getVacations(user.id, year) : []
  ])

  // Pass data as props to Client Component
  return (
    <CalendarGrid
      holidays={holidays}
      vacations={vacations}
      isAuthenticated={!!user}
    />
  )
}

// components/calendar/calendar-grid.tsx (Client Component)
'use client'
import { useState } from 'react'
import type { Holiday, Vacation } from '@/types'

export function CalendarGrid({
  holidays,
  vacations,
  isAuthenticated
}: {
  holidays: Holiday[]
  vacations: Vacation[]
  isAuthenticated: boolean
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Interactive features only in Client Component
  return (
    <div onClick={(e) => setSelectedDate(/* ... */)}>
      {/* Render calendar with holidays + vacations */}
    </div>
  )
}
```

### Pattern 2: Hybrid Authentication (Anonymous + Authenticated)

**What:** Use localStorage for anonymous users, Supabase PostgreSQL for authenticated users, with seamless migration path.

**When to use:** When you want to provide immediate value without forcing signup, then preserve data when users authenticate.

**Trade-offs:**
- PROS: Lower barrier to entry, preserves user data across authentication
- CONS: More complex state management, migration logic required

**Example:**
```typescript
// lib/auth/anonymous.ts
const ANON_VACATIONS_KEY = 'anon_vacations'

export function getAnonymousVacations(): Vacation[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(ANON_VACATIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveAnonymousVacation(vacation: Vacation) {
  const existing = getAnonymousVacations()
  localStorage.setItem(
    ANON_VACATIONS_KEY,
    JSON.stringify([...existing, vacation])
  )
}

// lib/auth/migration.ts
export async function migrateAnonymousData(userId: string) {
  const anonVacations = getAnonymousVacations()

  if (anonVacations.length > 0) {
    // Bulk insert to Supabase
    const { error } = await supabase
      .from('vacations')
      .insert(anonVacations.map(v => ({ ...v, user_id: userId })))

    if (!error) {
      localStorage.removeItem(ANON_VACATIONS_KEY)
    }
  }
}
```

### Pattern 3: Cache Components with Tag-Based Revalidation

**What:** Use Next.js 15+ `use cache` directive for data fetching with fine-grained invalidation via tags.

**When to use:** For external API calls (OpenHolidays) and database queries that need controlled caching.

**Trade-offs:**
- PROS: Reduces API calls, improves performance, supports background revalidation
- CONS: Cache invalidation complexity, potential stale data if tags not managed properly

**Example:**
```typescript
// lib/holidays/cache.ts
import { cacheTag } from 'next/cache'

export async function getHolidays(year: number) {
  'use cache'
  cacheTag('holidays', `holidays-${year}`)

  // Check database cache first
  const cached = await db.query(
    'SELECT * FROM cached_holidays WHERE year = $1 AND cached_at > NOW() - INTERVAL \'30 days\'',
    [year]
  )

  if (cached.rows.length > 0) {
    return cached.rows[0].data
  }

  // Fetch from OpenHolidays API
  const response = await fetch(
    `https://openholidaysapi.org/PublicHolidays?countryIsoCode=BG&validFrom=${year}-01-01&validTo=${year}-12-31`,
    { next: { revalidate: 86400 } } // 24h cache
  )

  const holidays = await response.json()

  // Cache in database
  await db.query(
    'INSERT INTO cached_holidays (year, data, cached_at) VALUES ($1, $2, NOW())',
    [year, JSON.stringify(holidays)]
  )

  return holidays
}

// lib/vacations/actions.ts (invalidation)
import { revalidateTag } from 'next/cache'

export async function createVacation(formData: FormData) {
  'use server'

  const vacation = await db.vacation.create({ /* ... */ })

  // Invalidate calendar cache with stale-while-revalidate
  revalidateTag('vacations', 'max')
  revalidateTag(`vacations-${vacation.year}`, 'max')

  return vacation
}
```

### Pattern 4: Virtualized Calendar Rendering

**What:** Use windowing (react-window) to render only visible calendar cells for 12-month view.

**When to use:** When rendering large datasets (365+ days * events per day) that would cause performance issues.

**Trade-offs:**
- PROS: Maintains 60fps even with thousands of events, reduces initial DOM size
- CONS: More complex implementation, scrolling behavior differs from native

**Example:**
```typescript
// components/calendar/virtualized-year-view.tsx
'use client'
import { FixedSizeGrid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

export function VirtualizedYearView({
  months,
  events
}: {
  months: Month[]
  events: Event[]
}) {
  const COLUMN_COUNT = 3 // 3 months per row
  const ROW_COUNT = Math.ceil(months.length / COLUMN_COUNT)
  const CELL_HEIGHT = 300
  const CELL_WIDTH = 400

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const monthIndex = rowIndex * COLUMN_COUNT + columnIndex
    const month = months[monthIndex]

    if (!month) return null

    return (
      <div style={style}>
        <MonthGrid month={month} events={events.filter(/* ... */)} />
      </div>
    )
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeGrid
          columnCount={COLUMN_COUNT}
          columnWidth={CELL_WIDTH}
          height={height}
          rowCount={ROW_COUNT}
          rowHeight={CELL_HEIGHT}
          width={width}
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </AutoSizer>
  )
}
```

### Pattern 5: Supabase Multi-Client Pattern

**What:** Separate Supabase clients for browser and server contexts with shared session management.

**When to use:** All Next.js App Router apps using Supabase authentication.

**Trade-offs:**
- PROS: Prevents session desync, follows Supabase SSR best practices
- CONS: Requires middleware setup, two client instances to maintain

**Example:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

// middleware.ts (cookie refresh proxy)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getClaims()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Data Flow

### Request Flow: Viewing Calendar

```
User visits /calendar
    ↓
Server Component (page.tsx)
    ↓ (parallel fetches)
┌───┴────────────────────┐
│                         │
getHolidays(year)    getVacations(user, year)
    ↓                     ↓
Holiday Cache        Supabase Query
(use cache)          (RLS enforced)
    ↓                     ↓
└───┬────────────────────┘
    ↓
Serialize as props
    ↓
Client Component (calendar-grid.tsx)
    ↓
Render virtualized grid
    ↓
User sees calendar
```

### Request Flow: Creating Vacation

```
User fills form (Client Component)
    ↓
Form submission
    ↓
Server Action (createVacation)
    ↓
Validate input (Zod schema)
    ↓
Check authentication
    ├─ Authenticated → Insert to Supabase
    └─ Anonymous → Save to localStorage
    ↓
Invalidate cache tags
    ├─ revalidateTag('vacations')
    └─ revalidateTag('vacations-2026')
    ↓
Return success/error
    ↓
Client Component updates UI
```

### State Management Flow

```
┌────────────────────────────────────────┐
│         Server State (Source of Truth) │
│  - Supabase PostgreSQL (authenticated) │
│  - localStorage (anonymous)            │
│  - Cached holidays                     │
└────────────────┬───────────────────────┘
                 ↓
         Server Components
         (fetch on demand)
                 ↓
         Props to Client
                 ↓
┌────────────────┴───────────────────────┐
│         Client State (UI only)         │
│  - useState for form inputs            │
│  - useState for modal open/closed      │
│  - useState for selected date          │
└────────────────────────────────────────┘
```

### Key Data Flows

1. **Holiday Data Flow:** OpenHolidays API → Database cache (30-day TTL) → Server Component → Client Component props
2. **Vacation Data Flow (Auth):** User input → Server Action → Supabase (RLS) → Cache invalidation → Rerender
3. **Vacation Data Flow (Anon):** User input → Client state → localStorage → Component state update
4. **Balance Calculation Flow:** Vacations from DB → Balance calculator (pure function) → Server Component → Display

## Database Schema Design

### Core Tables

```sql
-- Users (managed by Supabase Auth)
-- Reference via auth.users table

-- Vacations
CREATE TABLE vacations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT positive_days CHECK (days_count > 0)
);

CREATE INDEX idx_vacations_user_id ON vacations(user_id);
CREATE INDEX idx_vacations_dates ON vacations(start_date, end_date);

-- Vacation Balances (yearly accruals)
CREATE TABLE vacation_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 20,
  used_days INTEGER NOT NULL DEFAULT 0,
  rollover_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_year UNIQUE(user_id, year),
  CONSTRAINT positive_total CHECK (total_days >= 0),
  CONSTRAINT valid_used CHECK (used_days >= 0),
  CONSTRAINT valid_rollover CHECK (rollover_days >= 0)
);

CREATE INDEX idx_balances_user_year ON vacation_balances(user_id, year);

-- Cached Holidays (reduce API calls)
CREATE TABLE cached_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  country_code VARCHAR(2) NOT NULL DEFAULT 'BG',
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_year_country UNIQUE(year, country_code)
);

CREATE INDEX idx_cached_holidays_year ON cached_holidays(year);
CREATE INDEX idx_cached_holidays_cached_at ON cached_holidays(cached_at);

-- User Settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_vacation_days INTEGER DEFAULT 20,
  enable_notifications BOOLEAN DEFAULT true,
  theme VARCHAR(10) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Vacations policies
CREATE POLICY "Users can view their own vacations"
  ON vacations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vacations"
  ON vacations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacations"
  ON vacations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacations"
  ON vacations FOR DELETE
  USING (auth.uid() = user_id);

-- Balances policies (similar pattern)
CREATE POLICY "Users can view their own balances"
  ON vacation_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own balances"
  ON vacation_balances FOR ALL
  USING (auth.uid() = user_id);

-- Cached holidays are public (read-only)
CREATE POLICY "Anyone can view cached holidays"
  ON cached_holidays FOR SELECT
  TO anon, authenticated
  USING (true);
```

### Vacation Balance Calculation Logic

```typescript
// lib/vacations/balance.ts
export function calculateBalance(
  year: number,
  totalDays: number,
  vacations: Vacation[],
  rolloverDays: number = 0
): VacationBalance {
  const usedDays = vacations
    .filter(v => v.status === 'confirmed')
    .reduce((sum, v) => sum + v.days_count, 0)

  const availableDays = totalDays + rolloverDays - usedDays

  return {
    year,
    totalDays,
    usedDays,
    rolloverDays,
    availableDays,
    percentageUsed: (usedDays / (totalDays + rolloverDays)) * 100
  }
}

export function calculateRollover(
  currentYearBalance: VacationBalance,
  maxRollover: number = 5
): number {
  // Calculate days eligible for rollover (unused days)
  const eligibleDays = currentYearBalance.availableDays

  // Cap at maximum rollover amount
  return Math.min(eligibleDays, maxRollover)
}
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Monolith Next.js app on Vercel, Supabase free tier is sufficient, localStorage for anonymous users works fine |
| **1k-10k users** | Add Redis for session caching, move holiday cache to Redis with longer TTL, consider CDN for static holiday pages, optimize database indexes |
| **10k-100k users** | Upgrade Supabase tier, implement connection pooling (PgBouncer), add read replicas for reporting queries, consider separate worker for balance calculations |
| **100k+ users** | Microservices split (auth service, vacation service, calendar service), separate PostgreSQL instances, implement event-driven architecture with queues, add Elasticsearch for search |

### Scaling Priorities

1. **First bottleneck:** Database connections (Supabase free tier = 50 connections)
   - **Fix:** Enable PgBouncer, upgrade to paid tier, optimize query caching with `use cache`

2. **Second bottleneck:** OpenHolidays API rate limits
   - **Fix:** Aggressive caching (30-day TTL in PostgreSQL), background refresh job, consider mirroring holiday data

3. **Third bottleneck:** Calendar rendering performance (large datasets)
   - **Fix:** Implement virtualization with react-window, lazy load months as user scrolls, paginate vacation history

## Anti-Patterns

### Anti-Pattern 1: Storing Each Recurring Holiday as Separate Row

**What people do:** Create 365+ database rows for annual recurring holidays (e.g., Christmas every year).

**Why it's wrong:** Wastes storage, makes updates difficult (change one holiday = update 100+ rows), slow queries.

**Do this instead:** Store holidays with recurrence rules in JSONB field, generate instances at runtime:

```typescript
// GOOD: Store once with recurrence rule
{
  name: "Christmas",
  base_date: "12-25",
  recurrence_rule: "FREQ=YEARLY",
  country_code: "BG"
}

// Generate instances for display year
function generateHolidays(year: number, baseHolidays: HolidayTemplate[]) {
  return baseHolidays.map(h => ({
    ...h,
    date: `${year}-${h.base_date}`
  }))
}
```

### Anti-Pattern 2: Client-Side Authentication State

**What people do:** Store `isAuthenticated` in useState, check localStorage for auth token in Client Components.

**Why it's wrong:** Creates security vulnerabilities (token exposed to XSS), state desyncs between tabs, SEO issues (content flickers).

**Do this instead:** Always validate authentication server-side, use Server Components for auth checks:

```typescript
// BAD
'use client'
function ProtectedPage() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setUser(decodeToken(token))
  }, [])

  if (!user) return <LoginForm />
  return <Dashboard />
}

// GOOD
async function ProtectedPage() {
  const user = await getCurrentUser() // Server-side check
  if (!user) redirect('/login')

  return <Dashboard user={user} />
}
```

### Anti-Pattern 3: Over-Fetching Data for Client Components

**What people do:** Pass entire database tables as props to Client Components that only need a few fields.

**Why it's wrong:** Large serialization overhead, slow page loads, wasted network bandwidth, potential PII leaks.

**Do this instead:** Select only needed fields, transform data server-side before passing to client:

```typescript
// BAD
const vacations = await supabase.from('vacations').select('*')
return <VacationList vacations={vacations} />

// GOOD
const vacations = await supabase
  .from('vacations')
  .select('id, start_date, end_date, days_count')
  .gte('end_date', new Date().toISOString())
  .limit(50)

const displayData = vacations.map(v => ({
  id: v.id,
  dateRange: `${formatDate(v.start_date)} - ${formatDate(v.end_date)}`,
  duration: v.days_count
}))

return <VacationList vacations={displayData} />
```

### Anti-Pattern 4: No Caching Strategy for External APIs

**What people do:** Call OpenHolidays API on every page load without caching.

**Why it's wrong:** Slow page loads, API rate limit hits, unnecessary costs, poor UX.

**Do this instead:** Multi-layer caching with appropriate TTLs:

```typescript
// Use Next.js cache + database cache + stale-while-revalidate

export async function getHolidays(year: number) {
  'use cache'
  cacheTag('holidays', `holidays-${year}`)

  // Check database cache (30-day TTL)
  const cached = await checkDatabaseCache(year)
  if (cached && !isStale(cached, 30)) return cached.data

  // Fetch from API
  const holidays = await fetchFromAPI(year)

  // Store in database
  await storeDatabaseCache(year, holidays)

  return holidays
}
```

### Anti-Pattern 5: Calculating Balances on Every Render

**What people do:** Run balance calculations (loop through all vacations) on every component render.

**Why it's wrong:** Performance degradation with many vacations, unnecessary CPU usage, React re-render storms.

**Do this instead:** Compute balances server-side, cache results, use database aggregations:

```typescript
// BAD: Client-side calculation on every render
'use client'
function BalanceDisplay({ vacations }: { vacations: Vacation[] }) {
  const balance = vacations.reduce((sum, v) => sum + v.days, 0) // Recalculates on every render!
  return <div>{balance}</div>
}

// GOOD: Server-side calculation with caching
export async function getBalance(userId: string, year: number) {
  'use cache'
  cacheTag('balance', `balance-${userId}-${year}`)

  const { data } = await supabase
    .from('vacation_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .single()

  return data
}

// Then pass as prop to client
async function BalancePage() {
  const balance = await getBalance(user.id, 2026)
  return <BalanceDisplay balance={balance} />
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **OpenHolidays API** | Server-side fetch with database caching (30-day TTL) | Rate limits unknown; cache aggressively |
| **Supabase Auth** | Multi-client pattern (browser + SSR) with middleware | Cookie-based sessions, RLS for security |
| **Supabase PostgreSQL** | Direct queries via Supabase client with RLS | All data access goes through RLS policies |
| **Vercel Analytics** | Edge middleware for performance tracking | Zero config for Next.js |
| **Vercel Cron** | Scheduled jobs for balance rollover (yearly) | Run on Dec 31 to calculate next year balances |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Server Component ↔ Client Component** | Serializable props (JSON) | Props must be JSON-serializable; no functions/classes |
| **Client Component ↔ Server Action** | Form submission or programmatic call | Server Actions return serializable data |
| **Server Action ↔ Database** | Supabase client | Always use server client, never browser client |
| **Anonymous ↔ Authenticated** | Migration function on login | Copy localStorage to Supabase on first auth |
| **Cache Layer ↔ Data Layer** | Tag-based invalidation | Use `revalidateTag()` after mutations |

## Build Order (Dependency Graph)

Recommended implementation order for roadmap planning:

```
Phase 1: Foundation
├─ Database schema + RLS policies
├─ Supabase client setup (browser + server)
├─ Auth middleware
└─ Basic layout/routing structure

Phase 2: Read-Only Calendar (No Auth Required)
├─ OpenHolidays API client
├─ Holiday caching layer
├─ Calendar view (Server Component)
├─ Basic calendar grid (Client Component)
└─ SEO-friendly holiday pages

Phase 3: Anonymous Vacation Tracking
├─ localStorage utilities
├─ Vacation form (Client Component)
├─ Calendar with user events
└─ Basic balance display

Phase 4: Authentication
├─ Supabase Auth flow
├─ Login/signup pages
├─ Migration logic (localStorage → Supabase)
└─ Protected routes

Phase 5: Full Vacation Management
├─ Server Actions (CRUD)
├─ Vacation history page
├─ Balance calculations
└─ Rollover logic

Phase 6: Performance Optimizations
├─ Virtualized calendar rendering
├─ Advanced caching strategies
└─ Mobile optimizations
```

**Key Dependencies:**
- Phase 2 can start immediately (no auth needed)
- Phase 3 requires Phase 2 (needs calendar to show vacations)
- Phase 4 can start in parallel with Phase 3
- Phase 5 requires both Phase 3 and 4 (migration logic)
- Phase 6 is iterative based on performance metrics

## Performance Considerations for 12-Month View

### Challenge: Rendering 365 Days + Events

**Problem:** Naive implementation renders 365 day cells + potentially thousands of events, causing:
- High initial DOM size (10k+ nodes)
- Slow first render (>3s on mobile)
- Janky scrolling (<30fps)

**Solution: Virtualization with React Window**

```typescript
// Use FixedSizeGrid for predictable month layout
import { FixedSizeGrid as Grid } from 'react-window'

<Grid
  columnCount={3}          // 3 months per row
  columnWidth={400}        // Fixed month width
  rowCount={4}             // 4 rows for 12 months
  rowHeight={350}          // Fixed month height
  width={1200}             // Container width
  height={1400}            // Viewport height
  overscanRowCount={1}     // Render 1 extra row for smooth scroll
>
  {MonthCell}
</Grid>
```

**Expected Performance:**
- Initial DOM: ~6 month cells (2 rows visible)
- First render: <500ms on mobile
- Scroll performance: 60fps

### Challenge: Holiday Data Loading

**Problem:** Fetching holidays for all 12 months on page load.

**Solution: Batch Fetch + Memoization**

```typescript
// Fetch all 12 months in single query
const holidays = await supabase
  .from('cached_holidays')
  .select('data')
  .eq('year', year)
  .single()

// Memoize by month for quick lookup
const holidaysByMonth = useMemo(() => {
  return groupByMonth(holidays.data)
}, [holidays])
```

### Challenge: Mobile Touch Performance

**Problem:** Touch event handlers blocking main thread.

**Solution: Passive Event Listeners + Debouncing**

```typescript
// Use passive listeners for scroll
useEffect(() => {
  const handleScroll = debounce(() => {
    // Handle scroll logic
  }, 100)

  container.current?.addEventListener('scroll', handleScroll, { passive: true })

  return () => container.current?.removeEventListener('scroll', handleScroll)
}, [])
```

## Sources

### Next.js App Router Architecture
- [Next.js App Router Advanced Patterns for 2026 - Medium](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7)
- [Next.js Architecture in 2026 - Server-First Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Getting Started: Server and Client Components - Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Modern Full Stack Application Architecture Using Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)

### Calendar Architecture Patterns
- [System Design - Calendar Application like Google Calendar/Outlook](https://wildwildtech.substack.com/p/system-design-calendar-application)
- [Google Calendar's Design Patterns - Medium](https://medium.com/@khriziakamille/design-patterns-of-google-calendar-fa2823537b4c)
- [System Design: Designing a Calendar Application - Educative](https://www.educative.io/courses/hacking-the-tpm-interview/system-design-designing-a-calendar-application)

### Supabase Authentication Integration
- [Setting up Server-Side Auth for Next.js - Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth with the Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Complete Authentication Guide for Next.js App Router in 2025](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router)

### Caching Strategies
- [Getting Started: Caching and Revalidating - Next.js](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- [Mastering Next.js 15 Caching: dynamicIO, "use cache" & More](https://strapi.io/blog/mastering-nextjs-15-caching-dynamic-io-and-the-use-cache)
- [Mastering Next.js API Caching - DEV Community](https://dev.to/melvinprince/mastering-nextjs-api-caching-improve-performance-with-middleware-and-headers-176p)

### Database Design
- [Recurring Calendar Events Database Design - Medium](https://medium.com/@aureliadotlim/recurring-calendar-events-database-design-dc872fb4f2b5)
- [Calendar Recurring Events: Best Database Storage Method](https://www.codegenes.net/blog/calendar-recurring-repeating-events-best-storage-method/)
- [Vacation Accrual Journal Entry & Accounting Guide 2025](https://www.finoptimal.com/resources/accrued-vacation-journal-entry-guide)

### Performance Optimization
- [How To Render Large Datasets In React - Syncfusion](https://www.syncfusion.com/blogs/post/render-large-datasets-in-react)
- [3 ways to render large datasets in React - LogRocket](https://blog.logrocket.com/3-ways-render-large-datasets-react/)
- [Virtualization in React - Medium](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef)
- [React Window vs React Virtualized - DhiWise](https://www.dhiwise.com/post/react-window-vs-react-virtualized-a-simple-guide)

---
*Architecture research for: Bulgarian Holiday Calendar with Vacation Tracking*
*Researched: 2026-01-18*
