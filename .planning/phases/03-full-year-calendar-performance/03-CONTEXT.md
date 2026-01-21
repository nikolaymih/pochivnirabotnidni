# Phase 3: Full-Year Calendar & Performance - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Display all 12 months of Bulgarian holidays simultaneously in a scrollable calendar view with bridge day suggestions (workdays that create long weekends). Optimize performance to ensure smooth rendering on mobile devices. Scope includes bridge day detection algorithm, 12-month layout, and performance measurement/optimization.

</domain>

<decisions>
## Implementation Decisions

### Bridge Day Visual Presentation
- **Subtle prominence** - Softer yellow, less prominent than holidays (bridge days are suggestions, holidays are facts)
- **Tooltips on hover** - Show specific information when hovering over a bridge day cell
- **Tooltip content** - Display which holiday creates this opportunity + the date range (e.g., "Bridge day: New Year (Jan 1) → 4 days off (Sat Jan 4 - Tue Jan 7)")
- **Legend inclusion** - Bridge days must be explained in the legend with description

### 12-Month Layout Density
- **Full detail per month** - Day numbers, colors, and holiday names all visible (not heat map, not minimal)
- **Month sizing** - Each month slightly smaller than current single-month calendar
- **Vertical scroll** - Single column, months stack vertically, scroll down to see later months
- **Sticky sidebar** - Right sidebar stays fixed while months scroll (current vacation summary + legend + year selector)
- **Desktop layout** - Single column of months, no responsive grid that changes column count

### Mobile Experience Priority
- **Vacation summary placement** - At top of page, NOT sticky (scrolls away with months)
- **Touch interaction** - Tap + drag for range selection (same as desktop behavior)
- **Navigation** - No month picker or quick jump - just natural scrolling through months
- **Mobile tooltips** - None - just colors + legend (no tap-to-reveal tooltips)

### Bridge Day Intelligence
- **Weekend types** - Suggest both 4-day weekends (Tue/Thu holidays) AND 3-day weekends (Mon/Fri holidays)
- **Holiday clusters** - Suggest bridge days that connect multiple nearby holidays to create mega-vacations
- **Scope** - Only national public holidays (no regional/religious holidays in v1)
- **Overlap handling** - If user already marked a bridge day as vacation, show vacation color (blue) - user data takes priority, hide bridge suggestion

### Claude's Discretion
- Exact yellow shade for bridge days (subtle but visible)
- Loading states and skeleton screens
- Error handling for API failures
- Specific responsive breakpoints for edge cases
- Performance optimization approach (virtualization, lazy loading) - only if measurements show it's needed

</decisions>

<specifics>
## Specific Ideas

- Bridge day tooltip example format: "Bridge day: New Year (Jan 1) → 4 days off (Sat Jan 4 - Tue Jan 7)"
- Each month should be "a bit smaller than the current calendar month" in size
- Sidebar content: "Nothing new what is currently on the right side legend + days off"

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 03-full-year-calendar-performance*
*Context gathered: 2026-01-22*
