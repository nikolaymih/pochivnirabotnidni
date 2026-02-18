---
phase: quick
plan: 17
subsystem: auth
tags: [supabase, vacation, localstorage, migration, context]

# Dependency graph
requires:
  - phase: 04-03
    provides: VacationContext auth-aware sync with Supabase and localStorage fallback
  - phase: quick-1
    provides: Simplified migration modal (cloud vs local only, no merge)
provides:
  - VacationContext with correct null propagation (cloudData stays null when no Supabase row)
  - getMigrationDoneKey helper for per-user migration tracking
  - localStorage-based migration-done flag that persists across session restores
affects:
  - VacationContext consumers (all components using useVacation)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-user localStorage flag pattern: use user-scoped key to track one-time operations across sessions"
    - "Null propagation over default masking: keep null to allow correct fallback logic"

key-files:
  created: []
  modified:
    - contexts/VacationContext.tsx

key-decisions:
  - "setCloudData(data) not setCloudData(data || DEFAULT_VACATION_DATA) — null propagates so activeData falls back to localStorage"
  - "Migration-done flag stored in localStorage as pochivni-migration-done-{userId} so session restore skips migration"
  - "Flag set in both .then and .catch paths to prevent infinite retry on migration failure"
  - "Do NOT clear migration-done flag on sign-out — persists until user clears localStorage"

patterns-established:
  - "Null propagation pattern: never mask null cloud data with defaults, let derived activeData handle fallback"
  - "Per-user operation tracking: scope localStorage keys to userId for multi-account correctness"

# Metrics
duration: 5min
completed: 2026-02-18
---

# Quick Task 17: Fix vacation data loss and migration modal on session restore

**Fixed two VacationContext bugs: null cloud data now correctly falls back to localStorage (data persists across refresh), and migration runs only once per user account via a localStorage flag (no more modal on session restore).**

## Performance

- **Duration:** ~5 min
- **Completed:** 2026-02-18
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Removed `|| DEFAULT_VACATION_DATA` fallback from both `setCloudData` calls so null propagates correctly to `activeData` derivation, which falls back to localStorage when no Supabase row exists
- Added `getMigrationDoneKey(userId)` helper that creates a per-user scoped localStorage key
- Added early return in migration `useEffect` that checks the flag before calling `migrateLocalStorageToSupabase`
- Set the flag after migration completes (both success and error paths) to prevent re-triggering on future session restores
- Build passes with no TypeScript errors

## Task Commits

1. **Task 1: Fix cloudData null handling and add migration-done guard** - `38db71f` (fix)

**Plan metadata:** (this summary commit)

## Files Created/Modified

- `contexts/VacationContext.tsx` - Removed DEFAULT_VACATION_DATA masking, added getMigrationDoneKey helper and migration-done localStorage guard

## Decisions Made

- `setCloudData(data)` not `setCloudData(data || DEFAULT_VACATION_DATA)`: The original code was masking null with an empty default, causing `activeData` to use the empty default instead of falling back to `localStorageData`. This meant authenticated users with no Supabase row got empty data instead of their localStorage data, and the debounced sync then wrote the empty default back to Supabase, permanently overwriting their real data.

- Migration-done flag in localStorage (not in-memory state): The `migrationComplete` state is in-memory only. After a page refresh (session restore), React reinitializes with `migrationComplete = false`, so the migration useEffect ran again and showed the conflict modal. A localStorage flag persists across page refreshes, correctly distinguishing between first-ever sign-in (flag absent) and session restore (flag present).

- Flag set in `.catch` too: If migration errors, setting the flag prevents the app from retrying migration on every page load, which could cause repeated error toasts or UI flicker.

- Do NOT clear flag on sign-out: If a user signs out and back in, they should NOT see the migration modal again — their data is already in Supabase. The flag should only be absent for genuinely new sign-ins (or after the user clears localStorage).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Both bugs fixed. Authenticated users' vacation data will now persist across page refreshes, and the conflict migration modal will not appear on session restore. The next issue to watch: if a user clears localStorage manually, the migration flag is gone and migration will run again on next sign-in (this is acceptable behavior — it's the same as a fresh first-time sign-in).

---
*Phase: quick-17*
*Completed: 2026-02-18*
