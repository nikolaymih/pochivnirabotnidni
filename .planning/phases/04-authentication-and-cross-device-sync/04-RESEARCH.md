# Phase 4: Authentication & Cross-Device Sync - Research

**Researched:** 2026-01-28
**Domain:** Next.js 16 App Router + Supabase Auth + Google OAuth + PostgreSQL
**Confidence:** HIGH

## Summary

This phase implements Google OAuth authentication via Supabase with cross-device data synchronization. The standard approach uses `@supabase/ssr` for Next.js App Router SSR compatibility with cookie-based session management. The hybrid localStorage + Supabase model allows anonymous users to start immediately while authenticated users sync across devices.

**Key architecture decisions:**
- Cookie-based auth (not localStorage for tokens) prevents XSS vulnerabilities
- Separate Supabase clients for browser (Client Components) and server (Server Components, Route Handlers)
- Row Level Security (RLS) policies enforce user data isolation at database level
- Debounced optimistic UI updates with silent fallback to localStorage on network errors
- PKCE flow with callback route for secure OAuth code exchange

**Primary recommendation:** Use `@supabase/ssr` with separate browser/server clients, implement middleware for session refresh, enable RLS on all user tables, and use `auth.uid()` for ownership validation.

## Standard Stack

The established libraries/tools for Next.js + Supabase authentication:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | Latest | Core Supabase client | Official SDK, required for all Supabase operations |
| @supabase/ssr | Latest | SSR-safe cookie handling | Official Next.js integration, replaces deprecated auth-helpers |
| fetch-retry | Latest | Automatic retry logic | Official Supabase recommendation for network resilience |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-debounce | ^10.x | Debounced state hook | React hooks for debouncing sync operations |
| date-fns | ^4.1.0 (existing) | Date operations | Already in project, Safari-safe date handling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | NextAuth.js / Auth.js | NextAuth adds complexity, Supabase Auth simpler for Supabase-first apps |
| use-debounce | lodash.debounce | use-debounce React-optimized with hooks, lodash requires manual cleanup |
| Supabase Auth | Clerk / Auth0 | Third-party auth adds cost, Supabase Auth free and integrated |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr fetch-retry use-debounce
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── supabase/
│   ├── client.ts          # Browser client (Client Components)
│   ├── server.ts          # Server client (Server Components)
│   └── middleware.ts      # Session refresh utilities
app/
├── auth/
│   └── callback/
│       └── route.ts       # OAuth callback handler
middleware.ts              # Next.js middleware (session refresh)
contexts/
├── VacationContext.tsx    # Existing - enhance with Supabase sync
lib/vacation/
├── types.ts               # Existing - VacationData interface
├── storage.ts             # Existing - localStorage utilities
└── sync.ts                # New - Supabase sync logic
```

### Pattern 1: Separate Client Creation for Browser and Server
**What:** Create distinct Supabase clients for client-side and server-side operations
**When to use:** Always - required for proper cookie management in Next.js App Router
**Example:**
```typescript
// lib/supabase/client.ts (Browser Client)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts (Server Client)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - can't set cookies
          }
        },
      },
    }
  )
}
```
**Source:** [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Pattern 2: PKCE Flow with OAuth Callback Route
**What:** Redirect-based OAuth with code exchange via callback endpoint
**When to use:** Always for server-side auth - more secure than popup flow
**Example:**
```typescript
// Sign in (Client Component)
const supabase = createClient()
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/auth/callback`,
  },
})

// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error - redirect to home
  return NextResponse.redirect(`${origin}/`)
}
```
**Source:** [Supabase Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

### Pattern 3: Middleware for Session Refresh
**What:** Intercept requests to refresh tokens before Server Components execute
**When to use:** Always - prevents stale sessions in Server Components
**Example:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```
**Source:** [Supabase Next.js Middleware Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Pattern 4: Row Level Security (RLS) for User Data Isolation
**What:** Database-level access control using PostgreSQL policies
**When to use:** Always on user-specific tables - critical security layer
**Example:**
```sql
-- Enable RLS on vacation data table
ALTER TABLE vacation_data ENABLE ROW LEVEL SECURITY;

-- Users can only view their own vacation data
CREATE POLICY "Users can view own vacation data"
ON vacation_data FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only insert their own vacation data
CREATE POLICY "Users can insert own vacation data"
ON vacation_data FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own vacation data
CREATE POLICY "Users can update own vacation data"
ON vacation_data FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own vacation data
CREATE POLICY "Users can delete own vacation data"
ON vacation_data FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```
**Source:** [Supabase Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Pattern 5: Debounced Optimistic UI with Silent Fallback
**What:** Update UI immediately, sync to Supabase after debounce, fall back to localStorage on failure
**When to use:** All vacation data modifications - provides instant feedback with resilient sync
**Example:**
```typescript
import { useDebounce } from 'use-debounce'
import { useEffect } from 'react'

function useVacationSync(vacationData: VacationData, isAuthenticated: boolean) {
  // Debounce vacation data changes (1.5 seconds)
  const [debouncedData] = useDebounce(vacationData, 1500)

  useEffect(() => {
    if (!isAuthenticated) return // Skip sync for anonymous users

    // Optimistic update already reflected in UI
    syncToSupabase(debouncedData)
      .catch(error => {
        // Silent fallback - data persists in localStorage
        console.error('Sync failed, using localStorage:', error)
      })
  }, [debouncedData, isAuthenticated])
}
```
**Source:** [use-debounce documentation](https://www.npmjs.com/package/use-debounce), [Supabase optimistic UI patterns](https://medium.com/@ansh91627/building-scalable-real-time-systems-a-deep-dive-into-supabase-realtime-architecture-and-eccb01852f2b)

### Pattern 6: localStorage → Supabase Migration with Conflict Resolution
**What:** On first sign-in, detect conflicts between localStorage and Supabase, merge intelligently
**When to use:** First authenticated session after localStorage usage
**Example:**
```typescript
async function migrateLocalStorageToSupabase(userId: string) {
  const localData = getLocalStorageVacationData()
  const { data: cloudData } = await supabase
    .from('vacation_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  // No cloud data - simple migration
  if (!cloudData) {
    await supabase.from('vacation_data').insert({
      user_id: userId,
      ...localData
    })
    return
  }

  // Detect conflict
  const hasConflict = !isEqual(localData.vacationDates, cloudData.vacation_dates)

  if (hasConflict) {
    // Show review screen - let user approve/edit merge
    const merged = [...new Set([...localData.vacationDates, ...cloudData.vacation_dates])]
    return { requiresReview: true, localData, cloudData, merged }
  }

  // No conflict - data matches or localStorage empty
  return { requiresReview: false }
}
```
**Pattern:** Merge strategy uses Set-based deduplication, preserving all unique dates from both sources

### Anti-Patterns to Avoid
- **Using `getSession()` in Server Components:** Always use `getUser()` to revalidate tokens
- **Storing auth tokens in localStorage:** Use cookies managed by `@supabase/ssr` to prevent XSS
- **Forgetting RLS policies:** Without RLS, API keys expose all data to any authenticated user
- **Not implementing middleware:** Server Components will have stale sessions without refresh middleware
- **Sync indicators/spinners for optimistic UI:** UI should update immediately; no need to show "syncing..." status

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Avatar initials + color generation | Custom string hashing and color picker | Hash-based algorithm with predefined palette | Consistent colors per user, accessibility-tested palettes, proven contrast ratios |
| Session refresh logic | Manual token expiry checking and refresh | @supabase/ssr middleware pattern | Handles edge cases (concurrent refreshes, cookie chunking, server component limitations) |
| Retry with exponential backoff | setTimeout loops with manual backoff | fetch-retry package | Tested retry logic, configurable backoff strategies, error code filtering |
| Debounced sync | useEffect with setTimeout cleanup | use-debounce hook | React-optimized, handles fast updates, automatic cleanup |
| RLS policy helpers | String concatenation for auth.uid() | Supabase RLS helper functions | SQL injection prevention, caching optimization, null handling |

**Key insight:** Authentication is security-critical infrastructure - use battle-tested libraries instead of custom implementations to avoid subtle vulnerabilities.

## Common Pitfalls

### Pitfall 1: Trusting `getSession()` in Server Components
**What goes wrong:** `getSession()` reads cookies but doesn't validate tokens, allowing session spoofing
**Why it happens:** Documentation confusion - `getSession()` is safe for Client Components but not server-side
**How to avoid:** Always use `supabase.auth.getUser()` in Server Components, middleware, and Route Handlers
**Warning signs:** Auth policies not enforcing despite RLS being enabled, users seeing other users' data
**Source:** [Supabase Server-Side Auth Common Mistakes](https://medium.com/@iamqitmeeer/supabase-next-js-guide-the-real-way-01a7f2bd140c)

### Pitfall 2: RLS Not Enabled on User Tables
**What goes wrong:** All authenticated users can read/write all data when RLS is disabled
**Why it happens:** PostgreSQL tables don't have RLS by default - must be explicitly enabled
**How to avoid:** Run `ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY` on all user data tables
**Warning signs:** Anon key allows access to all data, users can query other users' vacation data
**Source:** [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Pitfall 3: Missing Middleware Matcher Configuration
**What goes wrong:** Middleware runs on static assets, slowing page loads and exhausting API quotas
**Why it happens:** Default middleware runs on all routes including `_next/static`, images, etc.
**How to avoid:** Add `config.matcher` to exclude static files: `'/((?!_next/static|_next/image|favicon.ico).*)'`
**Warning signs:** Slow page loads, 429 rate limit errors, high API usage on static assets
**Source:** [Supabase Next.js Middleware Performance](https://github.com/orgs/supabase/discussions/21656)

### Pitfall 4: Not Wrapping `auth.uid()` in SELECT for Caching
**What goes wrong:** Every row check calls `auth.uid()`, causing performance degradation at scale
**Why it happens:** PostgreSQL doesn't cache bare function calls in RLS policies
**How to avoid:** Use `(SELECT auth.uid())` instead of `auth.uid()` in USING/WITH CHECK clauses
**Warning signs:** Slow queries on tables with RLS, high database CPU on simple selects
**Source:** [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Pitfall 5: Google OAuth Returns No Avatar Initials or Colors
**What goes wrong:** Assuming Google provides generated avatars - it only provides profile picture URL or null
**Why it happens:** Google's old Sign-In SDK had generated avatars, but OAuth userinfo endpoint doesn't
**How to avoid:** Implement client-side initials extraction and hash-based color generation
**Warning signs:** Empty avatar state when user has no profile picture
**Source:** [Google OAuth Profile Data](https://developers.google.com/identity/sign-in/web/people)

### Pitfall 6: localStorage Sync Race Conditions on Multi-Tab
**What goes wrong:** User makes changes in Tab A, signs in Tab B, localStorage migration uses stale data
**Why it happens:** localStorage updates don't propagate to already-open tabs
**How to avoid:** Listen to `storage` event for cross-tab sync before migration
**Warning signs:** User reports data loss after signing in, inconsistent vacation dates across tabs
**Source:** [Supabase Multi-Tab Session Sync](https://github.com/orgs/supabase/discussions/7230)

### Pitfall 7: Forgetting to Index RLS Policy Columns
**What goes wrong:** Queries with RLS policies scan entire tables instead of using indexes
**Why it happens:** `user_id` columns in WHERE clauses (from RLS) need indexes for performance
**How to avoid:** Add index on `user_id` column: `CREATE INDEX idx_vacation_user_id ON vacation_data(user_id)`
**Warning signs:** Slow queries as user data grows, explain analyze shows sequential scans
**Source:** [Supabase RLS Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Code Examples

Verified patterns from official sources:

### Protecting Server Components with getUser()
```typescript
// app/dashboard/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // CRITICAL: Use getUser() not getSession() for server-side auth
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/') // Not authenticated
  }

  // Safe - user is validated by Supabase Auth server
  return <div>Welcome {user.email}</div>
}
```
**Source:** [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Client-Side Sign Out with Redirect
```typescript
// components/UserMenu.tsx (Client Component)
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/') // Redirect to main page
    router.refresh() // Refresh server components
  }

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  )
}
```
**Source:** [NextAuth Logout Patterns](https://medium.com/@truebillionhari/setting-up-logout-in-next-js-1019d7114414)

### Hash-Based Avatar Color Generation
```typescript
// lib/avatar/initials.ts
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

const AVATAR_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
]

export function getAvatarColor(userId: string): string {
  const hash = hashString(userId)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function getInitials(fullName: string, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  // Fallback to email
  return email[0].toUpperCase()
}
```
**Source:** [Avatar Color Generation Algorithms](https://medium.com/@pppped/compute-an-arbitrary-color-for-user-avatar-starting-from-his-username-with-javascript-cd0675943b66)

### Automatic Retry with fetch-retry
```typescript
// lib/supabase/client.ts with retry
import { createBrowserClient } from '@supabase/ssr'
import fetchRetry from 'fetch-retry'

const retryingFetch = fetchRetry(fetch, {
  retries: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  retryOn: [520, 521, 522, 503], // Cloudflare errors + service unavailable
})

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: retryingFetch,
      },
    }
  )
}
```
**Source:** [Supabase Automatic Retries](https://supabase.com/docs/guides/api/automatic-retries-in-supabase-js)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-nextjs | @supabase/ssr | Q4 2023 | Unified SSR package, cookie chunking support, better App Router integration |
| localStorage for session tokens | HTTP-only cookies via @supabase/ssr | Ongoing best practice | Prevents XSS attacks, enables SSR, automatic refresh |
| Popup OAuth flow | Redirect PKCE flow | OAuth 2.1 spec | More reliable on mobile, better security, fewer popup blockers |
| getSession() everywhere | getUser() in server, getSession() in client | 2023 security update | Prevents session spoofing, validates tokens on server |
| Manual fetch retry logic | fetch-retry package | Community pattern | Exponential backoff, configurable, error-specific retries |

**Deprecated/outdated:**
- **@supabase/auth-helpers-\***: Deprecated Q4 2023 - use @supabase/ssr for all frameworks
- **supabase.auth.api.\* methods**: Removed in v2 - use supabase.auth.\* methods directly
- **Popup-based OAuth**: Still works but redirect flow preferred for reliability and mobile UX

## Open Questions

Things that couldn't be fully resolved:

1. **localStorage cross-tab sync timing for migration**
   - What we know: `storage` event fires when localStorage changes in another tab
   - What's unclear: Best timing to check for pending localStorage changes before migration (immediate on sign-in vs. debounced check)
   - Recommendation: Listen to `storage` event during sign-in flow, debounce 500ms, then migrate - balances responsiveness with stability

2. **Conflict resolution merge strategy for vacation dates**
   - What we know: Set-based deduplication merges all unique dates from localStorage + Supabase
   - What's unclear: Should we merge totalDays (max, avg, user choice) or always use Supabase value?
   - Recommendation: Use Supabase `totalDays` as authoritative (user may have updated on another device), only merge `vacationDates` array

3. **Supabase free tier inactivity pausing impact on user experience**
   - What we know: Free tier projects pause after 7 days inactivity, wake on first request
   - What's unclear: Wake time during that first request (affects loading skeleton duration)
   - Recommendation: Implement silent fallback to localStorage - if Supabase takes >5s to respond, continue with localStorage and retry sync in background

## Sources

### Primary (HIGH confidence)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - Official setup guide, client patterns
- [Supabase Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google) - OAuth configuration, required scopes
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns, helper functions
- [Supabase Automatic Retries](https://supabase.com/docs/guides/api/automatic-retries-in-supabase-js) - fetch-retry integration, backoff strategy
- [Google OAuth Profile Data](https://developers.google.com/identity/sign-in/web/people) - Available user fields, no initials/colors provided

### Secondary (MEDIUM confidence)
- [Next.js with Supabase Google Login Guide](https://engineering.teknasyon.com/next-js-with-supabase-google-login-step-by-step-guide-088ef06e0501) - Practical setup walkthrough
- [Supabase RLS Explained with Examples](https://medium.com/@jigsz6391/supabase-row-level-security-explained-with-real-examples-6d06ce8d221c) - Real-world RLS patterns
- [use-debounce npm package](https://www.npmjs.com/package/use-debounce) - React debounce hook documentation
- [Avatar Color Generation Algorithm](https://medium.com/@pppped/compute-an-arbitrary-color-for-user-avatar-starting-from-his-username-with-javascript-cd0675943b66) - Hash-based color selection
- [Building Scalable Real-Time Systems with Supabase](https://medium.com/@ansh91627/building-scalable-real-time-systems-a-deep-dive-into-supabase-realtime-architecture-and-eccb01852f2b) - Optimistic UI patterns

### Tertiary (LOW confidence)
- [NextAuth Logout Patterns](https://medium.com/@truebillionhari/setting-up-logout-in-next-js-1019d7114414) - General Next.js auth patterns (not Supabase-specific)
- [Supabase Multi-Tab Session Sync Discussion](https://github.com/orgs/supabase/discussions/7230) - Community discussion, not official guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @supabase/ssr is official and current for Next.js App Router (verified via official docs)
- Architecture: HIGH - Patterns sourced from official Supabase documentation with code examples
- Pitfalls: HIGH - Compiled from official docs warnings + GitHub discussions with Supabase team responses
- Avatar initials: MEDIUM - Google OAuth doesn't provide initials/colors (verified), client-side generation required (community patterns)
- Conflict resolution: MEDIUM - No official Supabase guidance on localStorage→cloud migration UI patterns

**Research date:** 2026-01-28
**Valid until:** ~2026-04-28 (90 days - relatively stable auth domain, but monitor @supabase/ssr updates)
