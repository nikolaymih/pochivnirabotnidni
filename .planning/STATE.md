# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-18)

**Core value:** Users can see all Bulgarian holidays for the year AND track their paid vacation days in one place, with history.
**Current focus:** Phase 4 - Authentication & Cross-Device Sync

## Current Position

Phase: 5 of 6 (UX Polish & Mobile Optimization)
Plan: 2 of 4 complete (05-01: Mobile Touch Gestures, 05-02: Network Offline Support)
Status: In progress
Last activity: 2026-02-05 — Completed 05-02-PLAN.md (Network offline support with retry and toast notifications)

Progress: [█████░░░░░] 54% (14 of 26 plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 2 min 4 sec
- Total execution time: 0.54 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Static Holiday View | 4 | 5m 7s | 1m 17s |
| 1.1 - Fix Holiday Date Timezone Bug | 1 | 15m (manual) | 15m |
| 2 - Anonymous Vacation Tracking | 1 | 2m 5s | 2m 5s |
| 3 - Full-Year Calendar & Performance | 3 | 10m 17s | 3m 26s |
| 4 - Authentication & Cross-Device Sync | 4 | 9m 3s | 2m 16s |
| 5 - UX Polish & Mobile Optimization | 2 | 3m 24s | 1m 42s |

**Recent Trend:**
- Last 5 plans: 04-02 (2m 14s), 04-03 (2m 10s), 04-04 (2m 24s), 05-01 (1m 42s), 05-02 (1m 42s)
- Trend: Phase 5 maintaining exceptional velocity (avg 1m 42s per plan so far)

*Updated after each plan completion*

## Accumulated Context

### Roadmap Evolution

- **2026-01-25:** Phase 1.1 inserted after Phase 1 (URGENT) - Fix Holiday Date Timezone Bug
  - User reported December 31st showing as "Нова година" when it shouldn't be
  - Root cause: timezone conversion bug in date parsing (toISOString shifted dates)
  - Fix: Use API dates directly, don't convert to UTC for date-only values
  - Impact: Critical - ensures holidays display on correct dates

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**From 01-01 (Holiday Data Layer):**
- Use parseISO() for all date parsing to prevent Safari incompatibility
- Store dates as ISO strings (YYYY-MM-DD) without time component per TECH-07
- 24-hour cache for OpenHolidays API to reduce external dependency
- Static JSON fallback ensures calendar never breaks from API downtime

**From 01-02 (Calendar UI):**
- Use getCurrentDate() with startOfDay() for Safari-safe today calculation
- Convert getDay() Sunday-first to Monday-first (ISO 8601 Bulgarian standard)
- Server Components by default - no interactivity needed yet
- CSS Grid with gridColumnStart for correct first day positioning

**From 01-03 (Interactive Tooltips & Integration):**
- Dual interaction pattern: onMouseEnter (desktop hover) + onClick (mobile tap) for tooltip visibility
- Client Component boundary: Only DayTooltip is Client Component, rest remain Server Components
- Bulgarian/Cyrillic localization completed in 01-04
- UI polish and styling improvements deferred to future phase per user note

**From 01-04 (Bulgarian/Cyrillic Localization):**
- Use date-fns bg locale for month and date formatting
- Hard-code Bulgarian UI labels (no i18n library needed for single-language app)
- Capitalize month names using charAt(0).toUpperCase() for proper Bulgarian formatting
- Make year dynamic instead of hardcoded 2026 for future-proof calendar

**From 02-01 (localStorage Foundation & Vacation State):**
- Use typeof window === 'undefined' guard (not window === undefined) per Next.js best practices
- Pointer Events API instead of mouse events for touch device compatibility
- Set-based toggle logic to prevent duplicate vacation dates (VAC-08 compliance)
- Toggle on pointer down for immediate feedback, extend range on pointer up for drag selection
- ISO date strings (yyyy-MM-dd) for vacation dates matching Phase 1 TECH-07 decision
- Default 20 vacation days (Bulgarian standard)

**From 03-01 (Bridge Day Detection):**
- Bridge days only for Tuesday→Monday and Thursday→Friday (4-day weekends)
- Added Monday→Friday and Friday→Monday for 3-day weekend bridges
- Holiday cluster detection suggests connecting workdays between holidays within 3 days
- Jest testing framework with ts-jest preset for TypeScript calendar logic
- Set-based duplicate prevention for bridge day suggestions
- Prevent suggesting bridges on dates that are already holidays

**From 03-02 (MonthGrid Component):**
- MonthGrid is Server Component - receives vacationDates as prop instead of accessing context
- Compact mode by default (text-xs, gap-1, p-2) for 12-month grid scalability
- Single-letter day headers (П, В, С, Ч, П, С, Н) for compact view
- Set-based date lookups for O(1) performance at scale
- Server Component vacation data wiring pattern: props down from client wrapper

**From 03-03 (Full-Year Layout Integration):**
- FullYearCalendar as async Server Component fetches holidays server-side for performance
- Client wrapper (FullYearCalendarWrapper) bridges VacationContext state to Server Component props
- Single-column vertical scroll layout (not responsive grid) for better mobile experience
- Vacation dates take priority over bridge suggestions (blue overrides yellow)
- Bridge days calculated once for all 12 months (performance optimization)
- Desktop: sticky sidebar on right, scrollable calendar on left
- Mobile: summary at top (not sticky), scrollable calendar below
- Server/Client boundary pattern: VacationContext → Client wrapper → Server Component props

**From 01.1 (Timezone Bug Fix - INSERTED):**
- NEVER use toISOString() for date-only values - timezone conversion is inappropriate for calendar dates
- Use API date strings directly when already in correct YYYY-MM-DD format
- Enhanced logging in fetch.ts: raw API response, processed holidays, Dec 31st check
- Removed parseISO import - unnecessary when using dates directly from API
- Pattern established: Don't over-process correctly formatted data from external APIs

**From 04-02 (Auth UI):**
- AuthProvider wraps entire app in layout.tsx (app-wide scope)
- VacationProvider stays in page.tsx (component-level scope) to prevent re-initialization on auth changes
- Context nesting: AuthProvider (layout) > VacationProvider (page) > components
- Avatar display: photo URL if exists, else initials with colored background
- Hash-based color generation uses 7 accessible colors (red, amber, emerald, blue, violet, pink, cyan)
- Initials follow Google pattern: first + last name letters, fallback to email
- Loading skeleton shows 32px gray circle during auth initialization
- Click outside dropdown to close (useEffect with document listener)

**From 04-03 (Data Sync):**
- VacationContext is auth-aware: anonymous users use localStorage, authenticated users use Supabase
- Debounced sync to Supabase (1.5s) prevents excessive database writes during rapid interactions
- Auth-aware data layer pattern: `isAuthenticated ? cloudData : localStorageData`
- Dual write pattern: always update localStorage (fallback) + Supabase (if authenticated)
- Automatic localStorage → Supabase migration on first sign-in with conflict detection
- Migration state machine: loading → migrating → (conflict | complete)
- Conflict resolution: Supabase totalDays is authoritative, vacation dates merged via Set union
- MigrationReview is blocking modal overlay (z-50, bg-black/50) until user resolves conflict
- Silent failure mode: sync errors logged to console.error, never shown to user (per CONTEXT.md)
- VacationContextType interface unchanged (backward compatible with existing components)

**From 04-04 (Vacation Rollover):**
- Rollover calculation fetches previous year data from Supabase, calculates unused days
- Rollover returns null if no previous year data or zero unused days
- VacationContext extended with `rollover` and `isAuthenticated` fields (backward compatible additive interface)
- Rollover calculation runs once after cloud data loads (not on every render)
- VacationSummary shows rollover breakdown for authenticated users: "20 + 5 = 25"
- New rollover row: "Прехвърлени от {year}: X дни" with purple text
- Remaining days and percentage calculations use effectiveTotal (totalDays + rolloverDays)
- Anonymous users see ZERO rollover UI - not grayed out, completely invisible per CONTEXT.md
- All rollover UI gated by triple check: `isAuthenticated && rollover && rolloverDays > 0`
- Additive interface extension pattern: existing consumers ignore new optional fields via destructuring

**From 05-02 (Network Offline Support):**
- fetchWithRetry retries 3 times with exponential backoff (1s, 2s, 4s) for retryable HTTP errors (503, 504, 429)
- Manual retry implementation (NOT fetch-retry npm package) avoids CommonJS/ESM compatibility issues with Next.js
- Network detection uses navigator.onLine for offline (reliable) + verification fetch for online (prevents false positives)
- useNetworkState hook verifies connectivity with HEAD request to /api/health endpoint (5s timeout)
- Toast notifications positioned bottom-center with 80px marginBottom to avoid Safari mobile bottom UI
- NetworkStatus is side-effect-only component (renders null, only runs toast effects)
- Toast only on state transitions (offline→online, online→offline), not on initial page load (useRef tracking)
- Supabase sync intentionally NOT using fetchWithRetry (has own error handling, debounced pattern would conflict)
- Retry chain for holiday fetch: fetchWithRetry (3 attempts) → static JSON fallback

**From PROJECT.md:**
- Supabase for PostgreSQL (free tier, good DX, includes auth helpers) - Pending
- Hybrid local storage + auth (quick start OR cross-device sync) - Pending
- OpenHolidays API vs scraping (reliable structured data) - Implemented in 01-01
- Full year view in v1 (core differentiator) - ✓ IMPLEMENTED in 03-03 (12-month view with bridge days)
- 50% test coverage threshold (meaningful tests only) - Pending

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 1 Critical Pitfalls to Address:**
- ✓ Safari date parsing incompatibility — RESOLVED in 01-01 (parseISO pattern established)
- ✓ Timezone assumptions EET/EEST vs UTC — RESOLVED in 01-01 (ISO date strings without time)
- Supabase free tier inactivity pausing (implement health check cron) - Deferred to Phase 4
- ✓ OpenHolidays API coupling — RESOLVED in 01-01 (24hr cache + static fallback)

## Session Continuity

Last session: 2026-02-05
Stopped at: Completed 05-02-PLAN.md (Network Offline Support)
Resume file: None
Next: Phase 5 in progress - 05-03 and 05-04 remaining
