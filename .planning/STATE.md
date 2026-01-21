# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-18)

**Core value:** Users can see all Bulgarian holidays for the year AND track their paid vacation days in one place, with history.
**Current focus:** Phase 2 - Anonymous Vacation Tracking

## Current Position

Phase: 3 of 6 (Full-Year Calendar & Performance)
Plan: 1 of 4 complete (03-02: MonthGrid Component)
Status: In progress
Last activity: 2026-01-22 — Completed 03-02-PLAN.md (MonthGrid Server Component)

Progress: [██░░░░░░░░] 24% (6 of 25 plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 1 min 45 sec
- Total execution time: 0.18 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Static Holiday View | 4 | 5m 7s | 1m 17s |
| 2 - Anonymous Vacation Tracking | 1 | 2m 5s | 2m 5s |
| 3 - Full-Year Calendar & Performance | 1 | 2m 42s | 2m 42s |

**Recent Trend:**
- Last 5 plans: 01-03 (7s), 01-04 (manual), 02-01 (2m 5s), 03-02 (2m 42s)
- Trend: Phase 3 started, MonthGrid component foundation established

*Updated after each plan completion*

## Accumulated Context

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

**From 03-02 (MonthGrid Component):**
- MonthGrid is Server Component - receives vacationDates as prop instead of accessing context
- Compact mode by default (text-xs, gap-1, p-2) for 12-month grid scalability
- Single-letter day headers (П, В, С, Ч, П, С, Н) for compact view
- Set-based date lookups for O(1) performance at scale
- Server Component vacation data wiring pattern: props down from client wrapper

**From PROJECT.md:**
- Supabase for PostgreSQL (free tier, good DX, includes auth helpers) - Pending
- Hybrid local storage + auth (quick start OR cross-device sync) - Pending
- OpenHolidays API vs scraping (reliable structured data) - Implemented in 01-01
- Full year view in v1 (core differentiator) - Pending
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

Last session: 2026-01-22 (automated execution)
Stopped at: Completed 03-02-PLAN.md - MonthGrid Component (Phase 3 in progress: 1/4 plans)
Resume file: None
Next: Continue Phase 3 with Plan 03-01 (Bridge Day Detection) or 03-03 (Full-Year Layout)
