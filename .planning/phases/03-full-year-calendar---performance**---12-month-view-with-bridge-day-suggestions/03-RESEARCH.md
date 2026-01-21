# Phase 3: Full-Year Calendar & Performance - Research

**Researched:** 2026-01-21
**Domain:** React calendar performance, CSS Grid layouts, bridge day detection
**Confidence:** HIGH

## Summary

Phase 3 extends the single-month calendar to display all 12 months simultaneously with bridge day suggestions and mobile-optimized performance. Research reveals that CSS Grid is the standard approach for calendar layouts, with a 7-column structure that naturally handles day positioning. For 365 day cells on mobile, Next.js Server Components combined with React Compiler auto-memoization provide optimal performance without requiring manual virtualization. Bridge day detection is a well-understood algorithm that identifies workdays between holidays and weekends.

The current codebase already has strong foundations from Phase 1 and 2: Server Components by default, date-fns for date manipulation, Tailwind CSS with mobile-first breakpoints, and pointer events for touch compatibility. The key challenge is scaling from 1 month (30-31 cells) to 12 months (365 cells) while maintaining the <3 second mobile load time requirement.

**Primary recommendation:** Use CSS Grid with Tailwind's responsive breakpoints for 12-month layout, implement bridge day detection as a pure function comparing holidays with adjacent weekdays, and rely on Next.js Server Components + React Compiler for performance rather than manual virtualization. Only add memoization if profiling reveals issues after implementation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Grid | Native | Calendar layout | Industry standard for grid-based layouts, handles 7-column calendar naturally |
| date-fns | 4.1.0 | Date manipulation | Already in use, has `isWeekend()` and date comparison utilities |
| Tailwind CSS | 4.x | Responsive styling | Already in use, mobile-first breakpoint system (sm/md/lg/xl/2xl) |
| Next.js Server Components | 16.x | Rendering strategy | Zero JavaScript for static calendar grid, better mobile performance |
| React Compiler | 1.0+ (Next.js 16+) | Auto-memoization | Automatically optimizes re-renders by 25-40% without manual memo |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-window | 1.8.x | List virtualization | Only if profiling shows performance issues with 365 cells |
| React DevTools Profiler | Built-in | Performance measurement | Before adding any manual optimization |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid | Flexbox | Flexbox requires more complex logic for 7-column wrapping |
| Server Components | Client Components | Client Components add unnecessary JavaScript for static grid |
| React Compiler | Manual memo/useMemo | Manual memoization is error-prone and usually unnecessary in 2026 |
| Custom bridge logic | External library | No mature JavaScript library exists for Bulgarian holidays |

**Installation:**
```bash
# All dependencies already installed
# Optional (only if performance testing reveals need):
npm install react-window @types/react-window
```

## Architecture Patterns

### Recommended Project Structure
```
components/
├── Calendar.tsx              # Single month (existing)
├── CalendarDay.tsx          # Day cell (existing)
├── FullYearCalendar.tsx     # New: 12-month container
└── MonthGrid.tsx            # New: Server Component for single month

lib/
├── calendar/
│   ├── grid.ts              # Existing: Month grid calculation
│   ├── dates.ts             # Existing: Date utilities
│   └── bridgeDays.ts        # New: Bridge day detection
└── holidays/
    └── types.ts             # Existing: Holiday types
```

### Pattern 1: 12-Month Grid Layout
**What:** CSS Grid container holding 12 month grids, responsive across breakpoints
**When to use:** Full-year calendar view requirement (CAL-01)
**Example:**
```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3-4 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {Array.from({ length: 12 }, (_, month) => (
    <MonthGrid key={month} year={year} month={month} holidays={holidays} />
  ))}
</div>
```

**Tailwind Breakpoint Strategy:**
- Base (mobile): `grid-cols-1` - Full width single column
- `md:` (768px+): `grid-cols-2` - Two columns for tablets
- `lg:` (1024px+): `grid-cols-3` - Three columns for desktop
- `xl:` (1280px+): `grid-cols-4` - Four columns for large screens

### Pattern 2: Single Month Grid (7-Column Calendar)
**What:** CSS Grid with 7 columns, `grid-column-start` for first day positioning
**When to use:** Each individual month display
**Example:**
```tsx
// Source: Existing Calendar.tsx implementation + CSS Grid calendar pattern
<div className="grid grid-cols-7 gap-1">
  {/* Day headers */}
  {['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'].map(day => (
    <div key={day} className="text-center font-medium text-sm py-2">{day}</div>
  ))}

  {/* Day cells */}
  {days.map((day, index) => (
    <CalendarDay
      key={day}
      day={day}
      gridColumnStart={index === 0 ? firstDayOfWeek + 1 : undefined}
      // ... other props
    />
  ))}
</div>
```

### Pattern 3: Bridge Day Detection Algorithm
**What:** Pure function that identifies workdays between holidays and weekends
**When to use:** Display yellow bridge day suggestions (HOL-03)
**Example:**
```typescript
// Bridge day = workday between (holiday and weekend) OR (weekend and holiday)
interface BridgeDay {
  date: string; // ISO format
  holidayBefore?: string; // Holiday date that creates the bridge
  holidayAfter?: string; // Holiday date that creates the bridge
  daysOff: number; // Total consecutive days off if bridge is taken
}

function detectBridgeDays(holidays: Holiday[], year: number): BridgeDay[] {
  const bridges: BridgeDay[] = [];

  holidays.forEach(holiday => {
    const holidayDate = parseISO(holiday.date);
    const dayOfWeek = getISODay(holidayDate); // 1=Mon, 7=Sun

    // Holiday on Tuesday (gap between Monday and weekend)
    if (dayOfWeek === 2) {
      const monday = subDays(holidayDate, 1);
      if (!isHoliday(monday, holidays)) {
        bridges.push({
          date: format(monday, 'yyyy-MM-dd'),
          holidayAfter: holiday.date,
          daysOff: 4 // Sat, Sun, Mon, Tue
        });
      }
    }

    // Holiday on Thursday (gap between Friday and weekend)
    if (dayOfWeek === 4) {
      const friday = addDays(holidayDate, 1);
      if (!isHoliday(friday, holidays)) {
        bridges.push({
          date: format(friday, 'yyyy-MM-dd'),
          holidayBefore: holiday.date,
          daysOff: 4 // Thu, Fri, Sat, Sun
        });
      }
    }
  });

  return bridges;
}
```

**Key insight:** Bridge days only occur when holidays are on Tuesday or Thursday. Monday after a Tuesday holiday or Friday after a Thursday holiday creates a 4-day weekend.

### Pattern 4: Server Component Optimization
**What:** Keep calendar grid as Server Component, only vacation interaction is Client Component
**When to use:** Maximize mobile performance (UX-01, CAL-04)
**Example:**
```tsx
// MonthGrid.tsx - Server Component (no 'use client')
export default function MonthGrid({ year, month, holidays }: Props) {
  const { days, firstDayOfWeek } = getCalendarGrid(year, month);
  const bridgeDays = detectBridgeDays(holidays, year); // Server-side calculation

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">
        {formatMonthYear(year, month)}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {/* Static grid - no client-side JavaScript */}
      </div>
    </div>
  );
}

// Only vacation interaction needs client boundary
// Existing pattern: VacationContext provider at app level
```

### Anti-Patterns to Avoid
- **Pre-rendering all 365 day components upfront:** React Compiler won't save you from rendering too many components. Only render what's needed.
- **Client Components for static calendar grid:** Adds unnecessary JavaScript bundle. Keep Server Components by default.
- **Manual memoization without profiling:** React Compiler handles this automatically in Next.js 16+. Profile first.
- **Spread operators in frequent renders:** Creates new object references, breaks memoization even with React Compiler.
- **CSS animations on 365+ elements:** Reduces rendering performance on mobile. Use static styling.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Weekend detection | `date.getDay() === 0 \|\| date.getDay() === 6` | `isWeekend(date)` from date-fns | Handles edge cases, already in dependencies |
| Date range generation | Custom loop with date math | `eachDayOfInterval({ start, end })` from date-fns | Handles DST, leap years, already used in Calendar.tsx |
| ISO week day conversion | Manual `getDay()` conversion | `getISODay(date)` from date-fns | Monday-first (1-7) vs Sunday-first (0-6), less error-prone |
| Mobile-first responsive grid | Custom media queries | Tailwind breakpoints (`md:`, `lg:`, `xl:`) | Already in use, consistent across codebase |
| Calendar virtualization | Custom scroll-based rendering | react-window (only if needed) | Complex edge cases: scroll position, layout shift, focus management |

**Key insight:** date-fns already provides all date manipulation utilities needed for bridge day detection (`isWeekend`, `getISODay`, `addDays`, `subDays`, `isSameDay`). Don't reimplement date logic.

## Common Pitfalls

### Pitfall 1: Mounting 365 Components Upfront Without Virtualization
**What goes wrong:** All 365 day cells mount immediately, causing slow initial render on mobile
**Why it happens:** React renders all children of a container by default, no lazy loading
**How to avoid:**
1. Start with simple 12-month grid without virtualization
2. Profile with React DevTools on actual mobile device
3. Only add virtualization (react-window) if initial render exceeds 200ms (CAL-04)
**Warning signs:** Mobile load time >3 seconds (UX-01), browser freezing during initial render

### Pitfall 2: Breaking Referential Equality with Spread Operators
**What goes wrong:** Components re-render unnecessarily despite React Compiler auto-memoization
**Why it happens:** `{ ...vacationData }` creates new object reference every render
**How to avoid:** Pass primitive values or stable object references
```tsx
// Bad: Creates new object every render
const data = { ...vacationData, newField: value };

// Good: Pass primitives separately
const { totalDays, vacationDates } = vacationData;
```
**Warning signs:** Calendar re-renders on every state change, profiler shows unchanged components updating

### Pitfall 3: Safari Date Parsing Issues (Already Resolved in Phase 1)
**What goes wrong:** `new Date('2026-01-15')` fails in Safari
**Why it happens:** Safari doesn't support ISO string parsing in Date constructor
**How to avoid:** Use `parseISO()` from date-fns for all date parsing (already established pattern)
**Warning signs:** Works in Chrome/Firefox, breaks in Safari, "Invalid Date" errors

### Pitfall 4: Assuming `sm:` Means "Small Screens"
**What goes wrong:** Mobile layout broken because styles only apply at 640px+
**Why it happens:** Tailwind is mobile-first, `sm:` means "at small breakpoint AND ABOVE"
**How to avoid:** Unprefixed utilities target mobile, prefixed target larger screens
```tsx
// Bad: No styles on mobile (<640px)
<div className="sm:grid sm:grid-cols-1 md:grid-cols-2">

// Good: Grid on all screens, columns scale up
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```
**Warning signs:** Layout works on desktop, broken on mobile preview

### Pitfall 5: Client Component for Static Calendar Grid
**What goes wrong:** Unnecessary JavaScript shipped to mobile browsers, slower load times
**Why it happens:** Adding `'use client'` to components that don't need interactivity
**How to avoid:** Only vacation interaction needs client boundary (already solved via VacationContext)
```tsx
// Bad: Full year grid as Client Component
'use client';
export default function FullYearCalendar() { /* ... */ }

// Good: Server Component, VacationContext at app level handles client state
export default function FullYearCalendar() { /* ... */ }
```
**Warning signs:** Large JavaScript bundle, `'use client'` on components without event handlers

### Pitfall 6: Incorrect Bridge Day Logic for Bulgarian Holidays
**What goes wrong:** Showing bridge days when holiday already extends weekend naturally
**Why it happens:** Not checking if holiday already creates 3-day weekend
**How to avoid:** Only suggest bridges for Tuesday/Thursday holidays that create gaps
```tsx
// Holiday on Monday/Friday = already 3-day weekend, not a bridge day
// Holiday on Tuesday = Monday is bridge day (creates 4-day weekend)
// Holiday on Thursday = Friday is bridge day (creates 4-day weekend)
// Holiday on Wednesday = no bridge day opportunity
```
**Warning signs:** Yellow bridge days showing on Mondays when holiday is Friday, or vice versa

## Code Examples

Verified patterns from official sources and existing codebase:

### Bridge Day Detection (Core Algorithm)
```typescript
// lib/calendar/bridgeDays.ts
import { parseISO, getISODay, addDays, subDays, format } from 'date-fns';
import type { Holiday } from '@/lib/holidays/types';

export interface BridgeDay {
  date: string; // ISO format yyyy-MM-dd
  reason: 'holiday-after' | 'holiday-before'; // Which holiday creates the bridge
  relatedHoliday: string; // Holiday name
  daysOff: number; // Total consecutive days off
}

/**
 * Detect bridge day opportunities for the given year
 * Bridge day = workday between holiday and weekend that creates long weekend
 *
 * Only Tuesday and Thursday holidays create bridges:
 * - Tuesday holiday: Monday is bridge (Sat, Sun, Mon, Tue = 4 days)
 * - Thursday holiday: Friday is bridge (Thu, Fri, Sat, Sun = 4 days)
 */
export function detectBridgeDays(holidays: Holiday[], year: number): BridgeDay[] {
  const bridges: BridgeDay[] = [];

  // Only check holidays in the target year
  const yearHolidays = holidays.filter(h => {
    const date = parseISO(h.date);
    return date.getFullYear() === year;
  });

  yearHolidays.forEach(holiday => {
    const holidayDate = parseISO(holiday.date);
    const dayOfWeek = getISODay(holidayDate); // 1=Mon, 2=Tue, ..., 7=Sun

    // Tuesday holiday: Monday before is bridge day
    if (dayOfWeek === 2) {
      const monday = subDays(holidayDate, 1);
      const mondayStr = format(monday, 'yyyy-MM-dd');

      // Only suggest if Monday is not already a holiday
      if (!isHolidayDate(mondayStr, yearHolidays)) {
        bridges.push({
          date: mondayStr,
          reason: 'holiday-after',
          relatedHoliday: holiday.name,
          daysOff: 4
        });
      }
    }

    // Thursday holiday: Friday after is bridge day
    if (dayOfWeek === 4) {
      const friday = addDays(holidayDate, 1);
      const fridayStr = format(friday, 'yyyy-MM-dd');

      // Only suggest if Friday is not already a holiday
      if (!isHolidayDate(fridayStr, yearHolidays)) {
        bridges.push({
          date: fridayStr,
          reason: 'holiday-before',
          relatedHoliday: holiday.name,
          daysOff: 4
        });
      }
    }
  });

  return bridges;
}

/**
 * Check if a date is a holiday
 */
function isHolidayDate(dateStr: string, holidays: Holiday[]): boolean {
  return holidays.some(h => h.date === dateStr);
}

/**
 * Check if a date is a bridge day
 */
export function isBridgeDay(dateStr: string, bridgeDays: BridgeDay[]): boolean {
  return bridgeDays.some(b => b.date === dateStr);
}
```

### 12-Month Responsive Grid Layout
```tsx
// components/FullYearCalendar.tsx
import { getHolidaysForYear } from '@/lib/holidays/data';
import { detectBridgeDays } from '@/lib/calendar/bridgeDays';
import MonthGrid from './MonthGrid';

interface FullYearCalendarProps {
  year: number;
}

// Server Component (no 'use client')
export default async function FullYearCalendar({ year }: FullYearCalendarProps) {
  const holidays = await getHolidaysForYear(year);
  const bridgeDays = detectBridgeDays(holidays, year);

  return (
    <div className="space-y-4">
      {/* Year header */}
      <h1 className="text-3xl font-bold">{year}</h1>

      {/* 12-month grid: mobile 1 col, tablet 2 cols, desktop 3 cols, large 4 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, month) => (
          <MonthGrid
            key={month}
            year={year}
            month={month}
            holidays={holidays.filter(h => {
              const date = new Date(h.date);
              return date.getMonth() === month;
            })}
            bridgeDays={bridgeDays}
          />
        ))}
      </div>
    </div>
  );
}
```

### Month Grid with Bridge Day Styling
```tsx
// components/MonthGrid.tsx
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { getCalendarGrid } from '@/lib/calendar/grid';
import { isBridgeDay } from '@/lib/calendar/bridgeDays';
import type { Holiday } from '@/lib/holidays/types';
import type { BridgeDay } from '@/lib/calendar/bridgeDays';

interface MonthGridProps {
  year: number;
  month: number; // 0-11
  holidays: Holiday[];
  bridgeDays: BridgeDay[];
}

// Server Component
export default function MonthGrid({ year, month, holidays, bridgeDays }: MonthGridProps) {
  const { firstDayOfWeek, days } = getCalendarGrid(year, month);
  const firstDay = new Date(year, month, 1);

  return (
    <div className="border rounded-lg p-3">
      {/* Month name */}
      <h3 className="text-lg font-semibold mb-2 capitalize">
        {format(firstDay, 'MMMM', { locale: bg })}
      </h3>

      {/* 7-column grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Day headers */}
        {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map(day => (
          <div key={day} className="text-center font-medium text-gray-600 py-1">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          const date = new Date(year, month, day);
          const dateStr = format(date, 'yyyy-MM-dd');
          const holiday = holidays.find(h => h.date === dateStr);
          const bridge = isBridgeDay(dateStr, bridgeDays);
          const isWeekend = (firstDayOfWeek + index) % 7 >= 5; // Sat or Sun

          return (
            <div
              key={day}
              style={index === 0 ? { gridColumnStart: firstDayOfWeek + 1 } : undefined}
              className={`
                p-2 text-center rounded
                ${holiday ? 'bg-red-100 text-red-900' : ''}
                ${bridge ? 'bg-yellow-100 text-yellow-900' : ''}
                ${isWeekend && !holiday && !bridge ? 'bg-gray-100' : ''}
                ${!holiday && !bridge && !isWeekend ? 'hover:bg-blue-50' : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Using date-fns for Weekend Detection
```typescript
// Source: date-fns documentation
import { isWeekend, getISODay } from 'date-fns';

// Check if date is weekend (Saturday or Sunday)
const date = new Date(2026, 0, 17); // January 17, 2026 (Saturday)
isWeekend(date); // true

// Get ISO day of week (Monday = 1, Sunday = 7)
getISODay(date); // 6 (Saturday in ISO standard)

// Already in use pattern from Calendar.tsx:
// const dayOfWeek = (firstDayOfWeek + index) % 7;
// const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
```

### Tailwind Mobile-First Responsive Grid
```tsx
// Source: Tailwind CSS documentation
// Mobile (default): 1 column
// Tablet (768px+): 2 columns
// Desktop (1024px+): 3 columns
// Large (1280px+): 4 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Content */}
</div>

// Common mistake to avoid:
// Don't use sm: for mobile, use unprefixed utilities
// Bad:  <div className="sm:grid sm:grid-cols-1">
// Good: <div className="grid grid-cols-1 md:grid-cols-2">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual React.memo/useMemo | React Compiler auto-memoization | Late 2025 (React 19/Next.js 16) | 25-40% fewer re-renders without manual code |
| Always use virtualization for large lists | Profile first, virtualize only if needed | 2025-2026 | Simpler code, React Compiler handles many cases |
| Client-side rendering for calendars | Server Components by default | Next.js 13+ (2023) | 60-80% smaller bundle, faster mobile load |
| Custom media queries | Tailwind breakpoints with container queries | Tailwind 4 (2026) | Component-responsive, not just viewport-responsive |
| px breakpoints | rem breakpoints | Tailwind v3+ | Better accessibility, respects user font size |

**Deprecated/outdated:**
- **react-virtualized**: Still works but react-window is smaller (2KB vs 33KB) and recommended for new projects
- **Manual memoization as default practice**: React Compiler makes this unnecessary in most cases
- **Pages Router**: App Router with Server Components is the recommended approach in Next.js 16

## Open Questions

Things that couldn't be fully resolved:

1. **Do 365 calendar cells actually need virtualization on 2026 mobile devices?**
   - What we know: Modern devices handle 365 DOM nodes well, React Compiler reduces re-renders
   - What's unclear: Actual measured performance on target devices (Bulgarian users, typical mobile hardware)
   - Recommendation: Profile with React DevTools on real device before adding react-window complexity

2. **Should bridge days be editable (user can dismiss/ignore)?**
   - What we know: Phase requirements only specify "display in yellow" (HOL-03)
   - What's unclear: User preferences - some may not want bridge day suggestions
   - Recommendation: Start with static display, add preferences in future phase if requested

3. **Do Bulgarian users follow different bridge day conventions?**
   - What we know: Tuesday/Thursday algorithm is European standard (Germany, France, Italy)
   - What's unclear: Bulgarian cultural norms, government policies on bridge days
   - Recommendation: Implement standard algorithm, gather user feedback, adjust if needed

4. **What's the actual React Compiler configuration in Next.js 16?**
   - What we know: React Compiler is stable in Next.js 16, auto-enabled for new projects
   - What's unclear: Whether existing project has it enabled, configuration options
   - Recommendation: Check `next.config.js` and Next.js version (16+), enable if not active

## Sources

### Primary (HIGH confidence)
- [React.memo Official Documentation](https://react.dev/reference/react/memo) - Current memoization recommendations
- [Tailwind CSS Responsive Design Documentation](https://tailwindcss.com/docs/responsive-design) - Mobile-first breakpoint system
- [date-fns isWeekend Documentation](https://date-fns.org/v1.9.0/docs/isWeekend) - Weekend detection utility
- [Bridge Days Calculator (bridgedays.github.io)](https://bridgedays.github.io/) - Algorithm explanation via WebFetch
- [CSS-Tricks: Calendar in Three Lines of CSS](https://css-tricks.com/a-calendar-in-three-lines-of-css/) - CSS Grid calendar pattern

### Secondary (MEDIUM confidence)
- [React Performance Optimization 2026 (Medium)](https://medium.com/@muhammadshakir4152/react-js-optimization-every-react-developer-must-know-2026-edition-e1c098f55ee9) - React Compiler benefits
- [Next.js 16 Release Blog (LogRocket)](https://blog.logrocket.com/next-js-16-whats-new/) - Turbopack, React Compiler, performance features
- [React vs Next.js 2026 (SaM Solutions)](https://sam-solutions.com/blog/react-vs-nextjs/) - Server Components mobile benefits
- [Container Queries in 2026 (LogRocket)](https://blog.logrocket.com/container-queries-2026/) - Component-responsive design
- [Bridge Days Concept (iamexpat.de)](https://www.iamexpat.de/lifestyle/lifestyle-news/how-use-germanys-2026-feiertage-wisely-longer-holidays) - European bridge day conventions
- [Long Weekend Definition (Wikipedia)](https://en.wikipedia.org/wiki/Long_weekend) - Bridge day cultural context

### Tertiary (LOW confidence)
- [React Calendar Performance Mistake (Medium Jan 2026)](https://medium.com/@domwozniak/react-compiler-wont-save-you-from-this-performance-mistake-a257541fe533) - Architectural issues React Compiler can't fix
- [react-window vs react-virtualized (LogRocket)](https://blog.logrocket.com/react-virtualized-vs-react-window/) - Virtualization comparison
- [Mobile Performance 3 Second Load (NitroPack)](https://nitropack.io/blog/post/speed-up-mobile-website) - General mobile optimization
- WebSearch results for Tailwind calendar components, CSS Grid calendars - Multiple sources agreeing on patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use (date-fns, Tailwind, Next.js), official documentation verified
- Architecture patterns: HIGH - CSS Grid for calendars is industry standard, bridge day algorithm verified from multiple European sources
- Performance approach: MEDIUM - React Compiler benefits verified, but need actual profiling to confirm 365 cells don't need virtualization
- Bridge day logic: MEDIUM - Algorithm verified for European countries, but Bulgarian-specific conventions not confirmed
- Pitfalls: HIGH - Based on official React documentation, recent 2026 articles, and existing codebase patterns

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable domain with yearly update cycle)

**Note:** Phase 3 builds directly on Phase 1 and 2 patterns. The codebase already has the right foundations: Server Components, date-fns utilities, Tailwind responsive design, and pointer events for mobile. The key tasks are scaling the layout to 12 months and adding bridge day detection logic.
