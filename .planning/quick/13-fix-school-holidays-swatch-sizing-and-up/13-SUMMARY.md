---
phase: quick
plan: 13
subsystem: ui
completed: 2026-02-16
duration: 2m 15s

tags:
  - legend
  - calendar
  - styling
  - visual-feedback

tech-stack:
  added: []
  patterns:
    - "Outline-only suggestion style (border without fill)"
    - "Visual progression: suggestion (outline) → selection (filled)"

decisions:
  - id: "QUICK-13-01"
    what: "Bridge days use outline-only styling (border-2 border-vacation bg-transparent)"
    why: "Visually communicate that bridge days are suggestions, not confirmed vacation; clicking fills them to show progression from suggestion to selection"
    where: "components/Legend.tsx, components/MonthGrid.tsx"

  - id: "QUICK-13-02"
    what: "All legend swatches use shrink-0 min-w-6 min-h-6 to prevent size changes"
    why: "School holiday text wraps to two lines, which was shrinking the color box without these constraints"
    where: "components/Legend.tsx"

key-files:
  created: []
  modified:
    - components/Legend.tsx
    - components/MonthGrid.tsx

dependency-graph:
  requires: []
  provides:
    - "Consistent legend swatch sizing regardless of text length"
    - "Visual distinction between suggestions (bridge days) and selections (vacation)"
  affects: []
---

# Quick Task 13: Fix School Holidays Swatch Sizing and Bridge Day Outline Style

**One-liner:** Bridge days now show as green outlines (suggestions) that fill on click (confirmed vacation), and all legend swatches maintain consistent size.

## Summary

Fixed two legend-related UX issues:

1. **School Holidays Swatch Shrinking**: Added `shrink-0 min-w-6 min-h-6` to all five legend swatches to prevent the color box from shrinking when the "Неучебни дни / Ученически ваканции" text wraps to two lines. All swatches now maintain a consistent 24x24px size regardless of text length.

2. **Bridge Day Outline-Only Style**: Changed bridge days from solid fill (`bg-bridge-bg`) to outline-only (`border-2 border-vacation bg-transparent`) in both the legend and calendar grid. This creates a visual progression:
   - **Unselected bridge day**: Green outline, no fill → "This is a suggestion for vacation"
   - **Selected vacation**: Filled with vacation color → "This is confirmed vacation"

The new styling makes it clearer that bridge days are automated suggestions that users can click to accept (converting them to regular vacation days).

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Fix legend swatch sizing and bridge day outline style | a9edf8a | components/Legend.tsx |
| 2 | Update bridge day calendar cells to outline-only style | a954799 | components/MonthGrid.tsx |

## Changes Made

### Legend.tsx
- Added `min-w-6 min-h-6 shrink-0` to all five legend swatches
- Changed bridge day swatch from `bg-bridge-bg` to `border-2 border-vacation bg-transparent`

### MonthGrid.tsx
- Updated bridge day cell styling from `bg-bridge-bg text-black` to `border-2 border-vacation bg-transparent text-espresso`
- Updated bridge+school overlap to use `border-2 border-vacation` with transparent half (bridge) + school-bg half (school)
- Changed gradient from `var(--color-bridge-bg) 50%` to `transparent 50%` for cleaner outline appearance

## Visual Impact

**Before:**
- School holiday swatch could shrink when text wrapped
- Bridge days showed as solid honey-yellow fill
- No visual distinction between suggestion and selection

**After:**
- All legend swatches consistently sized at 24x24px
- Bridge days show as green outlines (suggestion state)
- Clicking a bridge day fills it with vacation color (selection state)
- Clear visual hierarchy: suggestion (outline) → confirmed (filled)

## Deviations from Plan

None - plan executed exactly as written.

## Testing Verification

✅ All legend swatches render at equal height (24x24px) regardless of text length
✅ Bridge day legend swatch shows green outline with no fill
✅ Bridge day calendar cells show green outline with no fill (unselected state)
✅ Clicking a bridge day fills it with vacation color (selected state)
✅ Bridge+school overlap days render correctly with split styling
✅ No visual regressions on other day types (holidays, weekends, vacation)

## Metrics

- **Tasks**: 2/2 completed
- **Files modified**: 2
- **Commits**: 2 (1 per task)
- **Duration**: 2 minutes 15 seconds

## Next Phase Readiness

✅ **Ready to proceed** - All UX fixes complete, visual consistency improved.

No blockers or concerns. The visual progression from suggestion (outline) to selection (filled) is now consistent across the application.
