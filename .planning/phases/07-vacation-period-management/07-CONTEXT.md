# Phase 7: Vacation Period Management & Bulk Delete - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Display vacation periods (groups of consecutive vacation days) in VacationSummary with bulk delete capability. Users can see all their vacation periods listed and delete entire periods at once for the current year. Historical years show periods read-only.

</domain>

<decisions>
## Implementation Decisions

### Period display format
- Short numeric Bulgarian format: 01.01 – 05.01 (5 дни)
- Position: below the "% използвани" progress bar
- Section header: "Използвани периоди:" as a small label above the list
- Empty state: nothing shown — section is invisible until user adds vacation days

### Delete interaction
- Confirmation dialog before deleting a period (user must confirm)
- X button: Claude's discretion on exact style, consistent with Coffee theme
- Calendar updates instantly when period is deleted (reactive via VacationContext)

### Edge cases & grouping
- Consecutive vacation days form a period — only a working day gap breaks into separate periods
- Non-working days (weekends, holidays) between vacation days do NOT break the period (Mon-Tue off + Thu-Fri off with Wed as holiday = 1 period)
- Single vacation days show as 1-day periods with their own X button
- Holidays inside a vacation range don't break the period (Mon-Fri with holiday Wed stays as 1 period, only vacation days counted in total)
- Periods ordered most recent first (reverse chronological)

### Historical year display
- Same layout as current year but without the X delete button
- Claude's discretion on whether to dim the text for read-only state

### Claude's Discretion
- Exact X button styling (text × vs icon button)
- Visual dimming for historical year periods
- Spacing and typography details within Coffee theme constraints
- Animation on period removal (if any)

</decisions>

<specifics>
## Specific Ideas

- Period list lives in VacationSummary component (right sidebar)
- Each period on its own line: "DD.MM – DD.MM (N дни) ×"
- Must respect existing isCurrentYear guard from Phase 05.3 for read-only mode
- Period grouping is a pure function over vacationDates array — good candidate for lib/ utility

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-vacation-period-management*
*Context gathered: 2026-03-04*
