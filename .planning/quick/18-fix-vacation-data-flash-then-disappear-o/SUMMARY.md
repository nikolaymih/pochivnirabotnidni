---
phase: quick-18
plan: 01
subsystem: auth
tags: [react, useref, debounce, supabase, vacation-context]

# Dependency graph
requires:
  - phase: quick-17
    provides: vacation data sync to Supabase with debounced writes
provides:
  - VacationContext with hasExplicitChange ref guard preventing page-load overwrites
affects: [future sync/auth changes to VacationContext]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useRef guard for debounced effects: hasExplicitChange.current prevents side-effectful syncs until user explicitly acts"

key-files:
  created: []
  modified:
    - contexts/VacationContext.tsx

key-decisions:
  - "Use useRef (not useState) for hasExplicitChange so the guard check in the debounced effect does NOT add a reactive dependency that would create infinite loops or re-run on every render"
  - "Set hasExplicitChange.current BEFORE the isAuthenticated branch in setVacationData so both authenticated and anonymous writes are guarded identically"
  - "handleMigrationAccept is intentionally NOT guarded — it calls upsertVacationData directly, bypassing the debounced sync path entirely"

patterns-established:
  - "Explicit-change guard pattern: use useRef(false) to track whether a user action has occurred in this session, check ref.current in debounced effects to prevent page-load side effects"

# Metrics
duration: 5min
completed: 2026-02-18
---

# Quick Task 18: Fix Vacation Data Flash-Then-Disappear Summary

**useRef guard in VacationContext prevents page-load from overwriting Supabase vacation data with DEFAULT_VACATION_DATA via debounced sync**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-18
- **Completed:** 2026-02-18
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Authenticated users' vacation data now persists across page refreshes without flashing and disappearing
- Debounced sync only fires after a user has explicitly called `setVacationData` in the session
- Migration flow is unaffected — `handleMigrationAccept` uses direct `upsertVacationData`, not the debounced path
- Build passes cleanly with no TypeScript errors

## Root Cause

On page load, when `migrationComplete` becomes true, the debounced sync effect fires. At this point, `debouncedData` is still stale — it reflects `DEFAULT_VACATION_DATA` from SSR initialization, not the user's actual Supabase data. This overwrote the user's real vacation data in Supabase with empty defaults, causing the flash-then-disappear behavior.

## Task Commits

1. **Task 1: Guard sync effect with hasExplicitChange ref** - `0241b7a` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `contexts/VacationContext.tsx` - Added `useRef` import, `hasExplicitChange` ref, guard in sync effect, and ref mutation in `setVacationData`

## Decisions Made

- Used `useRef` (not `useState`) so `hasExplicitChange` is NOT a reactive dependency — adding it to a dependency array would create loops or unintended re-runs.
- `hasExplicitChange.current = true` is set as the FIRST line in `setVacationData`, before any auth-branching, ensuring both authenticated and anonymous explicit changes are tracked identically.
- `handleMigrationAccept` was intentionally left unmodified — it calls `upsertVacationData` directly without going through the debounced sync path, so the guard is irrelevant there.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Vacation data persistence for authenticated users is now stable across page refreshes
- The `hasExplicitChange` pattern is available for any future effects that need similar "only after user action" guards

---
*Phase: quick-18*
*Completed: 2026-02-18*
