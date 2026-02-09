---
status: diagnosed
trigger: "UAT Round 2 issues T11 (tooltip icon), T12 (mobile padding), T13 (year-gated editing + missing edit icon)"
created: 2026-02-08T00:00:00Z
updated: 2026-02-08T00:00:00Z
---

## Current Focus

hypothesis: All three issues confirmed via code reading
test: N/A - read-only diagnosis
expecting: N/A
next_action: Return structured diagnosis

## Symptoms

expected: T11: Mobile tooltip uses "i" icon with bg-foam/80 styling. T12: Consistent padding across mobile sections. T13: Vacation editing disabled for non-current years; edit icon visible for vacation total.
actual: T11: Mobile shows "!" with bg-cinnamon/70 styling. T12: Mixed padding values. T13: No year-gating exists; edit icon uses emoji that may not render.
errors: None - cosmetic and functional gaps
reproduction: T11: View holiday on mobile. T12: View mobile layout. T13: Navigate to /?year=2025 and drag dates.
started: Since implementation

## Eliminated

(none)

## Evidence

- timestamp: 2026-02-08
  checked: DayTooltip.tsx lines 48-65 (mobile section)
  found: Mobile button uses "!" text (line 62) with class "bg-cinnamon/70 text-white" (line 58). Desktop uses "i" text (line 42) with "bg-foam/80 text-espresso" (line 38).
  implication: T11 confirmed - icon text and styling mismatch between mobile and desktop.

- timestamp: 2026-02-08
  checked: page.tsx mobile layout (lines 36-62), Legend.tsx, LeftSidebar.tsx, VacationSummary.tsx, MonthGrid.tsx, FullYearCalendar.tsx
  found: Mobile wrapper has px-4 (line 43). MonthGrid has p-3 internal (line 71). FullYearCalendar adds px-4 py-6 container (line 32). Legend has p-4 (line 3). VacationSummary has p-4 (line 50). LeftSidebar cards have p-4 (lines 26, 53).
  implication: T12 confirmed - the calendar gets double-padded (px-4 from mobile wrapper + px-4 from FullYearCalendar container), while sidebar cards get px-4 + p-4. Not consistent.

- timestamp: 2026-02-08
  checked: FullYearCalendarWrapper.tsx, VacationContext.tsx, VacationSummary.tsx, page.tsx
  found: No year comparison exists anywhere. FullYearCalendarWrapper always enables drag (lines 69-108). VacationSummary always shows edit button (lines 106-112). VacationContext uses getYear(new Date()) hardcoded (line 33), not the page's currentYear prop. The page passes currentYear to FullYearCalendarWrapper and LeftSidebar, but NOT to VacationSummary.
  implication: T13a confirmed - zero year-gating logic exists. T13b - edit icon uses emoji "pencil" which renders on most platforms, but the real issue is that currentYear is never compared.

- timestamp: 2026-02-08
  checked: VacationSummary.tsx line 108 - edit button styling
  found: Edit button class is "text-mocha hover:text-dark-roast text-sm". It uses emoji "pencil" (line 111). The button itself has no background, no border, no padding - just text color and hover. On some displays, the mocha color on white bg with a small emoji may be hard to see.
  implication: T13b sub-issue - the edit icon IS there in the code but may have low visibility due to: (1) text-mocha color being subtle, (2) emoji rendering varying by device, (3) no background/border to make it stand out.

## Resolution

root_cause: See per-issue breakdown below
fix: Not applied (read-only diagnosis)
verification: Not applicable
files_changed: []
