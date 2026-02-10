---
phase: quick-1
plan: 1
subsystem: ui
tags: [migration, modal, ui-cleanup, bug-fix]

# Dependency graph
requires:
  - phase: 04-03
    provides: Migration conflict modal with merge option
provides:
  - Two-option migration UI (Keep Cloud or Keep Local)
  - Removed broken merge logic that created invalid state
affects: [users with conflicting localStorage and cloud data]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - components/MigrationReview.tsx
    - lib/vacation/migration.ts
    - contexts/VacationContext.tsx

key-decisions:
  - "Remove merge option entirely - let users pick one complete, consistent state"
  - "Two-button UI: Keep Cloud (discard local) or Keep Local (discard cloud)"

patterns-established: []

# Metrics
duration: 1min 46sec
completed: 2026-02-10
---

# Quick Task 1: Remove Merge Option from Migration Modal Summary

**Migration modal now shows only two options (Keep Cloud or Keep Local), removing broken merge logic that created invalid vacation state**

## Performance

- **Duration:** 1 min 46 sec
- **Started:** 2026-02-10T16:49:58Z
- **Completed:** 2026-02-10T16:51:44Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Removed "Обедини" (merge) button and logic from migration modal
- Added "Запази локалните" (Keep Local) button
- Updated modal heading to "Конфликт в данните" for clarity
- Removed mergedDates computation and field from MigrationResult type
- Users now pick one complete, consistent state instead of hybrid merge

## Task Commits

Each task was committed atomically:

1. **Task 1: Add "Keep Local" button and remove "Merge" option from MigrationReview UI** - `228e6d5` (refactor)
2. **Task 2: Remove mergedDates from migration.ts conflict result** - `1082361` (refactor)
3. **Task 3: Update VacationContext to remove mergedDates prop from MigrationReview** - `af70769` (refactor)

## Files Created/Modified
- `components/MigrationReview.tsx` - Removed mergedDates prop, added handleKeepLocal, updated UI to show 2 buttons
- `lib/vacation/migration.ts` - Removed mergedDates from MigrationResult conflict type and computation
- `contexts/VacationContext.tsx` - Removed mergedDates prop from MigrationReview usage

## Decisions Made

**Why remove merge instead of fixing it:**
- Merge logic combined totalDays from cloud with union of vacationDates from both sources
- This created invalid state: e.g., 25 total days / 27 used days = -2 remaining
- Hybrid merge is fragile and confusing for users
- Letting users pick one complete, consistent state is simpler and safer

**UI changes:**
- Modal heading changed from "Обединяване на данни" to "Конфликт в данните" (more accurate)
- Description updated to clarify user must choose which dataset to keep
- "Запази облачните" button now uses text-coffee (not white text) for consistency
- "Запази локалните" button uses caramel background (primary action style)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Migration flow is now reliable and simple. Users with conflicting data will see clear two-option modal without broken merge logic. Ready for production use.

---
*Phase: quick-1*
*Completed: 2026-02-10*
