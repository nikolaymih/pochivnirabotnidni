# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-18)

**Core value:** Users can see all Bulgarian holidays for the year AND track their paid vacation days in one place, with history.
**Current focus:** Phase 2 - Anonymous Vacation Tracking

## Current Position

Phase: 1.1 of 6 (Fix Holiday Date Timezone Bug)
Plan: 1 of 1 complete (01.1: Timezone Bug Fix)
Status: ✅ Complete
Last activity: 2026-01-25 — Completed Phase 1.1 (urgent timezone bug fix inserted after Phase 1)

Progress: [███░░░░░░░] 35% (9 of 26 plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 1 min 59 sec
- Total execution time: 0.26 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Static Holiday View | 4 | 5m 7s | 1m 17s |
| 1.1 - Fix Holiday Date Timezone Bug | 1 | 15m (manual) | 15m |
| 2 - Anonymous Vacation Tracking | 1 | 2m 5s | 2m 5s |
| 3 - Full-Year Calendar & Performance | 3 | 10m 17s | 3m 26s |

**Recent Trend:**
- Last 5 plans: 02-01 (2m 5s), 03-01 (3m 49s), 03-02 (manual), 03-03 (2m 39s), 01.1 (15m manual)
- Trend: Critical timezone bug fixed in inserted phase 1.1, ready to resume Phase 2 or 3

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

Last session: 2026-01-25 (manual bug fix)
Stopped at: Completed Phase 1.1 (urgent timezone bug fix)
Resume file: None
Next: Resume Phase 2 (Anonymous Vacation Tracking) or Phase 3 (Full-Year Calendar & Performance - 3/4 plans complete)
