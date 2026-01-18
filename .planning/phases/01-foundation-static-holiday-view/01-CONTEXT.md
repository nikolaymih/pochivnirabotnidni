# Phase 1: Foundation & Static Holiday View - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Display Bulgarian holidays for 2026 in a mobile-responsive single month calendar view with bulletproof date handling. Users can see holidays in red, hover/tap for details, understand color meanings via legend, and rely on Safari/Chrome compatibility. This is the foundation - full-year view, vacation tracking, and bridge day suggestions come in later phases.

</domain>

<decisions>
## Implementation Decisions

### Calendar Layout & Navigation
- Week starts on Monday (ISO 8601, Bulgarian standard)
- Navigation via arrow buttons (prev/next month) only
- Do NOT show adjacent month days - leave grid cells blank before/after current month
- Single month view in Phase 1 (12-month view is Phase 3)
- Default to showing current month on first load

### Holiday Presentation
- Red background on entire day cell for holidays
- No inline holiday names on day cells - hover/tap only
- Tooltip shows holiday name AND type (e.g., "New Year's Day - National Holiday")
- Red color: Bright red (#EF4444 / Tailwind red-500)

### Legend & Color Scheme
- Legend appears in sidebar next to calendar
- Legend explains only red = official holidays (Phase 1 scope)
- Do NOT preview future categories (yellow bridge days, blue vacation) in Phase 1 legend
- Official holidays use bright red (#EF4444)

### Date Handling & Styling
- Current date indicator: border/outline on day cell (not background)
- Weekends (Sat/Sun) have subtle gray background to distinguish from weekdays
- Store dates as ISO date strings (not timestamps) per TECH-07
- Use date-fns exclusively for all date operations per TECH-01

### Claude's Discretion
- Exact tooltip positioning and styling
- Weekend gray shade (as long as subtle)
- Border style and thickness for current date indicator
- Spacing, typography, and responsive breakpoints
- Loading states and error handling for API failures

</decisions>

<specifics>
## Specific Ideas

- User wants to eventually see all 12 months simultaneously (Phase 3 goal) - Phase 1 single month view is the foundation
- Current date should be visually circled/outlined when 12-month view is implemented

</specifics>

<deferred>
## Deferred Ideas

- **12-month simultaneous view** — Phase 3: Full-Year Calendar & Performance
  - User wants all months visible at once with current date circled
  - Phase 1 builds single month foundation that Phase 3 will expand
- **Yellow bridge day suggestions** — Phase 3
- **Blue personal vacation tracking** — Phase 2

</deferred>

---

*Phase: 01-foundation-static-holiday-view*
*Context gathered: 2026-01-18*
