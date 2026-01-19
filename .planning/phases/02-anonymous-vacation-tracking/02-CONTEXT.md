# Phase 2: Anonymous Vacation Tracking - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can mark vacation days on the calendar, enter their annual allowance, and track their remaining balance - all stored in browser localStorage without requiring authentication. This phase delivers personal vacation tracking without login, setting the foundation for future cross-device sync in Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Vacation marking interaction
- Single click marks/unmarks vacation days (no confirmation dialog)
- Drag to select range for marking multiple consecutive days
- Allow marking public holidays as vacation (counts toward vacation balance)
- Allow marking weekends as vacation days (flexible schedules supported)
- Toggle behavior: click marked day to remove vacation

### Balance management UI
- Location: Separate panel below the existing legend on the right side
- Inline editing pattern:
  - Display current annual allowance with edit icon
  - Click edit icon to make text editable
  - Show accept/cancel buttons next to editable field
  - Accept saves to localStorage, cancel reverts
- Default value: 20 days (Bulgarian standard vacation allowance)
- Validation: Accept any positive number (no min/max limits)

### Vacation summary display
- Metrics to show:
  - Total annual days (editable via inline edit pattern)
  - Used days (auto-calculated from marked dates)
  - Remaining days (total - used)
  - Percentage used (text format, e.g., "60% използвани")
- Visual format: Text percentage only (no progress bar or circular indicator)
- No warnings: Don't show alerts if user exceeds allowance (just display the numbers)
- Label style: Mix of icons and Bulgarian text labels for clarity

### Visual design & colors
- Vacation day appearance: Full light blue background (similar to how holidays have red)
- Conflicting states: If a day is both holiday AND vacation, holiday wins (stay red, still counts toward vacation balance)
- No additional icons: Just the blue color is sufficient
- Legend update: ADD vacation days to legend with "Лична почивка" label and blue color box

### Claude's Discretion
- Exact shade of light blue (ensure good contrast and accessibility)
- Icon selection for vacation summary metrics
- localStorage key naming and data structure
- Hover/focus states for drag selection
- Error handling for localStorage failures
- Animation/transition effects for marking/unmarking days

</decisions>

<specifics>
## Specific Ideas

- Inline editing pattern for annual allowance: edit icon → text becomes editable → accept/cancel buttons (clean, in-context editing)
- Bulgarian standard: Default to 20 days since that's typical Bulgarian vacation allowance
- Flexible tracking: Allow weekends and holidays to be marked (users have different work arrangements)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-anonymous-vacation-tracking*
*Context gathered: 2026-01-19*
