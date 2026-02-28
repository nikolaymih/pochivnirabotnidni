---
phase: quick-22
plan: 01
subsystem: ui-layout
tags: [mobile, layout, content-hierarchy]
completed: 2026-03-01
duration: ~1 min

dependency_graph:
  requires: [quick-21]
  provides: [mobile-description-before-legend]
  affects: []

tech_stack:
  added: []
  patterns: []

key_files:
  created: []
  modified: [app/page.tsx]

decisions:
  - id: Q22-01
    decision: "Move description paragraphs to between h1 and Legend on mobile"
    reason: "Better content hierarchy — users see description context before interactive components"

metrics:
  tasks_completed: 1
  tasks_total: 1
  deviations: 0
  commits: 1
---

# Quick Task 22: Move Description Paragraphs to Top on Mobile

**One-liner:** Reorder mobile layout so PAGE_DESCRIPTION/EXTENDED/HISTORY appear between h1 title and Legend instead of below LeftSidebar.

## What Changed

In `app/page.tsx`, within the mobile layout section (`lg:hidden`):

- Moved 3 description paragraphs (PAGE_DESCRIPTION, PAGE_DESCRIPTION_EXTENDED, PAGE_DESCRIPTION_HISTORY) from the "Description + Year selector + Calendar" div to directly after the h1 title
- Changed last paragraph bottom margin from `mb-5` to `mb-4` for consistent spacing before Legend
- Updated comment from "Description + Year selector + Calendar" to "Year selector + Calendar"

### Mobile content order (after):
1. h1 title
2. PAGE_DESCRIPTION
3. PAGE_DESCRIPTION_EXTENDED
4. PAGE_DESCRIPTION_HISTORY
5. Legend
6. VacationSummary
7. LeftSidebar
8. YearSelector + Calendar

Desktop layout was not touched.

## Commits

| Hash | Message |
|------|---------|
| 4780618 | fix(quick-22): move description paragraphs above Legend on mobile layout |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- Build passes without errors
- Mobile section shows paragraphs between h1 and Legend
- Desktop section unchanged (lines 101-140 identical)
