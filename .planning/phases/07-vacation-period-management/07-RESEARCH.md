# Phase 7: Vacation Period Management & Bulk Delete - Research

**Researched:** 2026-03-04
**Domain:** Date grouping algorithm, UI list with delete, VacationContext integration
**Confidence:** HIGH

## Summary

This phase requires: (1) a pure function to group vacation dates into periods, (2) UI to display periods in VacationSummary, and (3) bulk delete with confirmation. The grouping algorithm is the core complexity -- it must account for weekends and holidays between vacation days NOT breaking a period.

The existing codebase provides all necessary building blocks: date-fns for date arithmetic, VacationContext with `setVacationData` for reactive updates, `isCurrentYear` guard for read-only mode, and holiday data accessible from the page level. The main design question is how to pass holiday data to the grouping function since VacationSummary currently doesn't receive holidays as props.

**Primary recommendation:** Create a pure `groupVacationPeriods()` function in `lib/vacation/periods.ts`, pass holidays to VacationSummary as a new prop, and render period list below the progress bar with conditional X buttons gated by `isCurrentYear`.

## Standard Stack

No new libraries needed. Everything uses existing project dependencies.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | existing | parseISO, addDays, getISODay, isWeekend, format | Already mandatory per project decisions |
| React | existing | useState for confirmation dialog state | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | - | - | No new dependencies needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom grouping | date-fns `eachDayOfInterval` + `isWeekend` | Could simplify gap-filling but custom loop is clearer for this logic |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── vacation/
│   ├── periods.ts        # NEW: groupVacationPeriods() pure function
│   ├── periods.test.ts   # NEW: Unit tests for period grouping
│   ├── types.ts          # MODIFY: Add VacationPeriod interface
│   └── ...existing...
components/
├── VacationSummary.tsx   # MODIFY: Add period list UI + delete
└── ...existing...
app/
├── page.tsx              # MODIFY: Pass holidays prop to VacationSummary
```

### Pattern 1: Pure Function Period Grouping

**What:** A stateless function that takes vacation dates + holiday dates + year and returns grouped periods.
**When to use:** Every render of VacationSummary (memoizable via useMemo).

**Algorithm (HIGH confidence - derived from codebase analysis):**

```typescript
// lib/vacation/periods.ts
import { parseISO, addDays, format, getISODay } from 'date-fns';

export interface VacationPeriod {
  startDate: string;  // YYYY-MM-DD (first vacation day)
  endDate: string;    // YYYY-MM-DD (last vacation day)
  days: string[];     // All vacation dates in this period
  dayCount: number;   // Number of actual vacation days (not weekends/holidays)
}

/**
 * Group vacation dates into periods.
 *
 * Two vacation days are in the same period if every working day between them
 * is either: (a) also a vacation day, (b) a weekend, or (c) a holiday.
 *
 * Put differently: a period is broken only by a WORKING day gap (a weekday
 * that is neither a vacation day nor a holiday).
 */
export function groupVacationPeriods(
  vacationDates: string[],
  holidayDates: string[],
  year: number
): VacationPeriod[] {
  // Filter to requested year and sort chronologically
  const sorted = vacationDates
    .filter(d => d.startsWith(`${year}-`))
    .sort();

  if (sorted.length === 0) return [];

  const holidaySet = new Set(holidayDates);
  const vacationSet = new Set(sorted);
  const periods: VacationPeriod[] = [];

  let currentPeriod: string[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = sorted[i - 1];
    const currDate = sorted[i];

    // Check if gap between prev and curr is all non-working days
    if (isContiguous(prevDate, currDate, holidaySet, vacationSet)) {
      currentPeriod.push(currDate);
    } else {
      // Close current period, start new one
      periods.push(makePeriod(currentPeriod));
      currentPeriod = [currDate];
    }
  }

  // Close final period
  periods.push(makePeriod(currentPeriod));

  // Reverse chronological (most recent first)
  return periods.reverse();
}

function isContiguous(
  dateA: string,
  dateB: string,
  holidays: Set<string>,
  vacations: Set<string>
): boolean {
  // Walk from day after dateA to day before dateB
  // Every day in between must be weekend, holiday, or vacation
  let current = addDays(parseISO(dateA), 1);
  const end = parseISO(dateB);

  while (current < end) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const dayOfWeek = getISODay(current); // 1=Mon, 7=Sun
    const isWeekendDay = dayOfWeek === 6 || dayOfWeek === 7;

    if (!isWeekendDay && !holidays.has(dateStr) && !vacations.has(dateStr)) {
      return false; // Working day gap found
    }

    current = addDays(current, 1);
  }

  return true;
}

function makePeriod(days: string[]): VacationPeriod {
  return {
    startDate: days[0],
    endDate: days[days.length - 1],
    days: [...days],
    dayCount: days.length,
  };
}
```

### Pattern 2: Holiday Data Prop Threading

**What:** VacationSummary needs holiday dates to compute periods. Currently it has no holiday prop.
**How:** Add `holidayDates: string[]` prop to VacationSummary. Page.tsx already has holidays -- just extract dates and pass down.

```typescript
// In app/page.tsx, where VacationSummary is rendered:
const holidayDates = holidays.map(h => h.date);

<VacationSummary year={currentYear} holidayDates={holidayDates} />
```

This follows the existing pattern of passing server-fetched data as props to client components (same as FullYearCalendarWrapper receives holidays).

### Pattern 3: Bulk Delete via VacationContext

**What:** Deleting a period removes all its vacation dates at once.
**How:** Filter out the period's dates from `vacationData.vacationDates` and call `setVacationData`.

```typescript
const handleDeletePeriod = (period: VacationPeriod) => {
  const datesToRemove = new Set(period.days);
  setVacationData({
    ...vacationData,
    vacationDates: vacationData.vacationDates.filter(d => !datesToRemove.has(d))
  });
};
```

This is straightforward because:
- `setVacationData` already handles both localStorage and Supabase sync
- The debounced save with leading+trailing ensures immediate persistence
- VacationContext reactivity means calendar and summary update instantly

### Pattern 4: Confirmation Dialog (Inline)

**What:** Simple confirm/cancel dialog before deleting.
**How:** Local state in VacationSummary tracking which period is pending deletion.

```typescript
const [pendingDelete, setPendingDelete] = useState<VacationPeriod | null>(null);
```

When X is clicked, set `pendingDelete`. Show inline confirmation with "Изтрий" / "Отказ" buttons. On confirm, call `handleDeletePeriod(pendingDelete)` and clear state.

An inline confirmation (expanding the period row) is preferred over a modal overlay because:
- Less disruptive for a simple action
- Consistent with the edit pattern already in VacationSummary (inline number editing)
- No need for z-index management

### Anti-Patterns to Avoid
- **Storing periods in state/context:** Periods are derived data -- compute from vacationDates + holidays, don't persist separately
- **Modifying VacationContext interface:** No changes needed to context; `setVacationData` already supports the pattern
- **Using window.confirm():** Breaks mobile UX and doesn't match Coffee theme

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date iteration | Manual day counting | date-fns `addDays` + `getISODay` | Handles DST, leap years correctly |
| Weekend detection | `getDay() === 0 \|\| getDay() === 6` | `getISODay()` returning 6 or 7 | Consistent with existing codebase pattern (ISO 8601, Mon=1) |
| Date formatting | String manipulation | `format(date, 'dd.MM')` from date-fns | Bulgarian format DD.MM as specified in CONTEXT.md |
| Date comparison | String comparison for sorting | String sort works for YYYY-MM-DD | ISO date strings sort correctly lexicographically |

**Key insight:** The vacation dates are already stored as YYYY-MM-DD strings, which sort lexicographically in chronological order. No need to parse to Date objects for sorting -- only for gap-checking arithmetic.

## Common Pitfalls

### Pitfall 1: Transferred Weekend Holidays
**What goes wrong:** A holiday that falls on Saturday/Sunday gets "transferred" to Monday in the calendar display (Phase 05.2-04 decision). The grouping algorithm must use the ORIGINAL holiday dates from the API, not transferred display dates.
**Why it happens:** MonthGrid has weekend transfer logic, but holiday dates in the data layer are the original dates.
**How to avoid:** Use `holidays.map(h => h.date)` directly. The transfer is display-only and doesn't affect grouping. If Mon-Tue are vacation and Sunday is a holiday, the gap (Monday is a vacation day) is already covered.
**Warning signs:** Periods incorrectly splitting around transferred holidays.

### Pitfall 2: Cross-Year Vacation Dates
**What goes wrong:** `vacationDates` array might contain dates from multiple years (the context loads per-year, but edge cases exist).
**Why it happens:** VacationContext loads data for `displayYear`, but vacationDates array is flat strings.
**How to avoid:** Filter vacationDates by year before grouping: `d.startsWith(\`${year}-\`)`.
**Warning signs:** Periods showing dates from wrong year.

### Pitfall 3: Holiday Data Availability
**What goes wrong:** VacationSummary currently doesn't receive holiday data. Without it, periods will split at every weekend-adjacent holiday.
**Why it happens:** VacationSummary was designed for simple counting, not date analysis.
**How to avoid:** Thread `holidayDates: string[]` prop from page.tsx. The data is already fetched server-side.
**Warning signs:** Mon+Tue vacation with Wed holiday + Thu+Fri vacation showing as 2 periods instead of 1.

### Pitfall 4: Empty State Rendering
**What goes wrong:** Showing "Използвани периоди:" label with empty list when no vacation days exist.
**Why it happens:** Rendering the section header unconditionally.
**How to avoid:** Per CONTEXT.md decision: section is invisible until user adds vacation days. Gate entire section on `periods.length > 0`.

### Pitfall 5: Performance on Re-render
**What goes wrong:** Grouping function recalculates on every render (VacationSummary is a client component).
**Why it happens:** No memoization of derived data.
**How to avoid:** Wrap in `useMemo` with `[vacationData.vacationDates, holidayDates, year]` dependencies. The function is O(n*m) where n=vacation dates and m=max gap between consecutive dates (typically small).
**Warning signs:** Noticeable lag when toggling vacation days with many periods.

## Code Examples

### Period Display Format (DD.MM -- DD.MM)
```typescript
// Source: date-fns format + CONTEXT.md decision
import { parseISO, format } from 'date-fns';

function formatPeriod(period: VacationPeriod): string {
  const start = format(parseISO(period.startDate), 'dd.MM');
  const end = format(parseISO(period.endDate), 'dd.MM');

  if (period.dayCount === 1) {
    return `${start} (1 ден)`;
  }
  return `${start} – ${end} (${period.dayCount} дни)`;
}
```

Note: Bulgarian uses "ден" (singular) for 1 day, "дни" (plural) for 2+ days.

### Period List Rendering
```typescript
// Inside VacationSummary, below the progress bar section
{periods.length > 0 && (
  <div className="border-t border-latte pt-2 mt-2">
    <span className="text-xs text-cappuccino font-semibold">
      Използвани периоди:
    </span>
    <div className="mt-1 space-y-1">
      {periods.map(period => (
        <div key={period.startDate} className="flex items-center justify-between">
          <span className="text-xs text-coffee">
            {formatPeriod(period)}
          </span>
          {isCurrentYear && (
            <button
              onClick={() => setPendingDelete(period)}
              className="text-cappuccino hover:text-error text-sm px-1"
              aria-label={`Изтрий период ${formatPeriod(period)}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

### Confirmation Dialog (Inline)
```typescript
{pendingDelete && (
  <div className="mt-1 p-2 bg-foam rounded border border-latte text-xs">
    <p className="text-coffee mb-2">
      Изтриване на {formatPeriod(pendingDelete)}?
    </p>
    <div className="flex gap-2">
      <button
        onClick={() => { handleDeletePeriod(pendingDelete); setPendingDelete(null); }}
        className="px-2 py-1 bg-error text-white rounded text-xs hover:bg-error/90"
      >
        Изтрий
      </button>
      <button
        onClick={() => setPendingDelete(null)}
        className="px-2 py-1 bg-cappuccino text-white rounded text-xs hover:bg-coffee"
      >
        Отказ
      </button>
    </div>
  </div>
)}
```

### Delete Handler
```typescript
const handleDeletePeriod = (period: VacationPeriod) => {
  const datesToRemove = new Set(period.days);
  setVacationData({
    ...vacationData,
    vacationDates: vacationData.vacationDates.filter(d => !datesToRemove.has(d))
  });
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A - new feature | Pure function grouping with prop threading | Phase 7 | First derived-data display in VacationSummary |

**No deprecated patterns apply.** This is a new feature built on established patterns.

## Open Questions

1. **School holidays in period grouping?**
   - What we know: CONTEXT.md says "Non-working days (weekends, holidays) between vacation days do NOT break the period"
   - What's unclear: Does "holidays" include school holidays? School holidays are not non-working days for most adults.
   - Recommendation: Only use official public holidays (from OpenHolidays API) for gap-bridging, NOT school holidays. School holidays are informational only.

2. **Historical year holiday data availability?**
   - What we know: page.tsx fetches holidays for `currentYear-1`, `currentYear`, and `currentYear+1`. When viewing historical year via `?year=2024`, it fetches 2023, 2024, 2025.
   - What's unclear: Nothing -- this works correctly for period grouping.
   - Recommendation: No issue here. holidayDates from page.tsx will contain the correct year's holidays.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: VacationSummary.tsx, VacationContext.tsx, page.tsx, types.ts, dates.ts, bridgeDays.ts
- CONTEXT.md decisions for Phase 7 (user-locked decisions)
- STATE.md accumulated decisions (date handling, Coffee theme, isCurrentYear guard)

### Secondary (MEDIUM confidence)
- date-fns documentation for `addDays`, `getISODay`, `format`, `parseISO` -- verified via existing codebase usage patterns

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, all existing deps
- Architecture: HIGH - follows established patterns (prop threading, pure functions in lib/, inline editing in VacationSummary)
- Pitfalls: HIGH - derived from codebase analysis of existing date handling and data flow
- Algorithm: HIGH - straightforward gap-checking with well-understood date-fns functions

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable -- no external dependencies or fast-moving APIs)
