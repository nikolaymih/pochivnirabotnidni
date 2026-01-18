# Phase 01: Foundation & Static Holiday View - Research

**Researched:** 2026-01-18
**Domain:** Custom calendar components with external API integration in Next.js
**Confidence:** MEDIUM

## Summary

Phase 01 requires building a custom calendar component (no libraries) with Bulgarian holiday data from OpenHolidays API, using Next.js 16 Server Components and date-fns for date operations. The critical challenges are Safari date parsing compatibility (30% of users), proper server/client component boundaries, and establishing a caching strategy that prevents API coupling.

The standard approach is: Server Component fetches holiday data (with database cache and static fallback), CSS Grid for calendar layout (7 columns), date-fns with ISO string parsing for Safari safety, and Client Components only for tooltip interactivity. The calendar grid uses `grid-column-start` positioning for the first day, Monday-first week layout, and responsive mobile-first design.

**Primary recommendation:** Build calendar as Server Component with CSS Grid layout, fetch holidays server-side with multi-layer caching (database + static JSON fallback), use date-fns parseISO exclusively (never native Date constructor with strings), and isolate tooltip hover interactions in minimal Client Components.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.3 | Framework with Server Components | App Router with Server Components is production standard, built-in caching mechanisms |
| React | 19.2.3 | UI framework | React 19 with Server Components architecture, stable and widely adopted |
| date-fns | 4.x | Date manipulation | v4 has first-class timezone support, Safari-safe when used correctly, tree-shakeable |
| Tailwind CSS | 4.x | Styling framework | v4 has improved hover behavior for mobile (media query based), utility-first for responsive design |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @date-fns/tz | 4.x | Timezone handling | If you need explicit timezone conversions (Bulgaria uses Europe/Sofia timezone) |
| Supabase Client | Latest | Database queries | For caching holiday data in PostgreSQL, Server Component compatible |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | Day.js | Day.js is smaller but date-fns v4 has better TypeScript support and official timezone package |
| Custom calendar | FullCalendar/React Big Calendar | Explicitly forbidden by CONVENTIONS.md - custom component required for control and simplicity |
| Tailwind v4 | Tailwind v3 | v3 has old hover behavior (works on touch), v4 requires explicit mobile handling but is more correct |

**Installation:**
```bash
npm install date-fns @supabase/supabase-js
# Optional: npm install @date-fns/tz
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Server Component - main calendar page
│   └── api/
│       └── holidays/
│           └── route.ts            # API Route for holiday fetching
├── components/
│   ├── Calendar.tsx                # Server Component - calendar grid
│   ├── CalendarDay.tsx             # Server Component - individual day cell
│   ├── DayTooltip.tsx              # Client Component - interactive tooltip
│   └── Legend.tsx                  # Server Component - color legend
├── lib/
│   ├── holidays/
│   │   ├── fetch.ts                # Fetch from OpenHolidays API
│   │   ├── cache.ts                # Database caching logic
│   │   └── types.ts                # Holiday data types
│   └── calendar/
│       ├── grid.ts                 # Calendar grid calculation utilities
│       └── dates.ts                # date-fns wrapper functions
└── data/
    └── holidays-2026-fallback.json # Static fallback data
```

### Pattern 1: Server Component Data Fetching with Multi-Layer Cache

**What:** Fetch holiday data in Server Component with database cache, then static JSON fallback if API/DB fails.

**When to use:** For external API data that changes infrequently (holidays are static for a year).

**Example:**
```typescript
// lib/holidays/fetch.ts
import { parseISO } from 'date-fns';

export async function getHolidays(year: number) {
  // Layer 1: Try database cache
  const cached = await getCachedHolidays(year);
  if (cached) return cached;

  // Layer 2: Try API
  try {
    const response = await fetch(
      `https://openholidaysapi.org/PublicHolidays?countryIsoCode=BG&validFrom=${year}-01-01&validTo=${year}-12-31`,
      { next: { revalidate: 86400 } } // 24hr cache
    );
    const data = await response.json();

    // Parse dates safely for Safari
    const holidays = data.map(h => ({
      ...h,
      date: parseISO(h.startDate) // Never use new Date(string)!
    }));

    await cacheHolidays(year, holidays);
    return holidays;
  } catch (error) {
    // Layer 3: Static fallback
    const fallback = await import(`@/data/holidays-${year}-fallback.json`);
    return fallback.default;
  }
}
```

### Pattern 2: CSS Grid Calendar with First Day Positioning

**What:** Use CSS Grid with 7 columns and `grid-column-start` to position first day correctly.

**When to use:** For calendar month view with proper Monday-first week alignment.

**Example:**
```typescript
// lib/calendar/grid.ts
import { startOfMonth, getDay, getDaysInMonth } from 'date-fns';

export function getCalendarGrid(year: number, month: number) {
  const firstDay = startOfMonth(new Date(year, month, 1));
  const daysInMonth = getDaysInMonth(firstDay);

  // getDay returns 0 (Sun) - 6 (Sat), convert to Monday-first (0-6)
  let firstDayOfWeek = getDay(firstDay);
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  return {
    firstDayOfWeek, // For grid-column-start: firstDayOfWeek + 1
    daysInMonth,
    days: Array.from({ length: daysInMonth }, (_, i) => i + 1)
  };
}
```

```tsx
// components/Calendar.tsx (Server Component)
export default function Calendar({ year, month, holidays }) {
  const { firstDayOfWeek, days } = getCalendarGrid(year, month);

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
        <div key={day} className="text-center font-medium">{day}</div>
      ))}

      {/* Days */}
      {days.map((day, index) => (
        <CalendarDay
          key={day}
          day={day}
          style={index === 0 ? { gridColumnStart: firstDayOfWeek + 1 } : undefined}
          isHoliday={holidays.some(h => h.day === day)}
        />
      ))}
    </div>
  );
}
```

### Pattern 3: Client Boundary for Tooltip Interactivity

**What:** Keep calendar as Server Component, wrap only tooltip trigger/content in Client Component.

**When to use:** When you need hover/tap interactions but want server-rendered calendar data.

**Example:**
```tsx
// components/CalendarDay.tsx (Server Component)
import DayTooltip from './DayTooltip';

export default function CalendarDay({ day, isHoliday, holidayData }) {
  return (
    <div className={`p-2 ${isHoliday ? 'bg-red-500 text-white' : ''}`}>
      {day}
      {isHoliday && <DayTooltip holiday={holidayData} />}
    </div>
  );
}
```

```tsx
// components/DayTooltip.tsx (Client Component)
'use client';

import { useState } from 'react';

export default function DayTooltip({ holiday }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)} // Mobile tap
      className="relative inline-block"
    >
      <span className="cursor-help">ⓘ</span>
      {isVisible && (
        <div className="absolute z-10 p-2 bg-gray-800 text-white rounded shadow-lg">
          <div className="font-bold">{holiday.name}</div>
          <div className="text-sm">{holiday.type}</div>
        </div>
      )}
    </div>
  );
}
```

### Pattern 4: Safe Date Parsing with date-fns for Safari

**What:** Always use `parseISO()` for ISO strings, never `new Date(string)`.

**When to use:** Whenever parsing date strings from API, database, or user input.

**Example:**
```typescript
// lib/calendar/dates.ts
import { parseISO, format, startOfMonth, endOfMonth } from 'date-fns';

// ✅ SAFE: parseISO handles ISO 8601 correctly across browsers
export function parseDate(isoString: string): Date {
  return parseISO(isoString); // '2026-01-15' or '2026-01-15T12:00:00'
}

// ✅ SAFE: Constructor with numbers (not string)
export function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

// ❌ UNSAFE: Safari parses 'YYYY-MM-DD HH:mm:ss' as GMT, others as local
// export function parseDate(str: string): Date {
//   return new Date(str); // NEVER DO THIS
// }

// Store dates as ISO strings
export function serializeDate(date: Date): string {
  return format(date, 'yyyy-MM-dd'); // '2026-01-15'
}
```

### Anti-Patterns to Avoid

- **Using new Date(string) with space-separated format**: Safari parses `'2026-01-15 12:00:00'` as GMT, Chrome as local. Always use `parseISO()` or constructor with numbers.
- **Marking entire page as Client Component**: Only tooltip needs `'use client'`, not the calendar grid. This bloats client bundle and loses Server Component benefits.
- **Not handling mobile tap for tooltips**: Tailwind v4 `hover:` only works on hover-capable devices. Always add `onClick` handler for mobile.
- **Fetching API data in Client Component**: Holiday data should be fetched server-side for performance and caching. Client Components are for interactivity, not data loading.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date arithmetic | Custom month/day calculations | date-fns: `startOfMonth`, `endOfMonth`, `getDaysInMonth`, `getDay` | Edge cases: leap years, month lengths, timezone boundaries, DST transitions |
| Timezone conversion | Manual UTC offset math | @date-fns/tz with IANA timezone `Europe/Sofia` | Bulgaria DST rules change (last Sunday in March/October), manual math breaks |
| Holiday data persistence | Manual file I/O and JSON parsing | Supabase PostgreSQL with JSON column type | Built-in caching, RLS for security, automatic JSON parsing, indexing |
| ISO date validation | Regex patterns | `parseISO()` + `isValid()` from date-fns | ISO 8601 has many valid formats (date-only, datetime, timezone), regex misses edge cases |

**Key insight:** Date/time operations are deceptively complex. Safari's different date parsing, DST transitions (Bulgaria changes UTC+2 to UTC+3), leap years, and month-end boundaries all break naive implementations. date-fns handles these; custom code will have bugs.

## Common Pitfalls

### Pitfall 1: Safari Date Parsing Incompatibility

**What goes wrong:** Using `new Date('2026-01-15 12:00:00')` works in Chrome but returns Invalid Date or wrong timezone in Safari (30% of users).

**Why it happens:** Safari requires 'T' separator for datetime (`'2026-01-15T12:00:00'`) and interprets space-separated format as GMT, while Chrome treats it as local time. This creates 2-3 hour offset for Bulgarian timezone (EET/EEST).

**How to avoid:**
- Always use `parseISO()` from date-fns for string parsing
- Use `new Date(year, month, day)` constructor with numbers for date creation
- Store dates as ISO strings (`'2026-01-15'`) without time component if only date matters
- Never rely on browser's native Date constructor with string input

**Warning signs:**
- Dates appear correct in Chrome DevTools but off by hours in Safari
- User reports "wrong day showing as holiday"
- Tests pass locally (if testing in Chrome) but fail in CI or for Safari users

**Sources:**
- [Safari ISO 8601 incompatibility issue](https://github.com/mdn/browser-compat-data/issues/15401)
- [date-fns Safari timezone issue](https://github.com/date-fns/date-fns/issues/1869)

### Pitfall 2: OpenHolidays API Coupling Without Fallback

**What goes wrong:** App breaks when OpenHolidays API is down, slow, or rate-limited. No holidays display, calendar is blank for red days.

**Why it happens:** External APIs have no uptime SLA. Direct fetch without caching means every page load depends on third-party service.

**How to avoid:**
- Implement three-layer strategy: Database cache → API fetch → Static JSON fallback
- Use Next.js `revalidate: 86400` (24 hours) for fetch caching since holidays don't change
- Store 2026 holidays in static JSON file in `src/data/holidays-2026-fallback.json`
- Database cache with Supabase: `holidays` table with `year` and `data` (JSON column)
- Set reasonable timeout on API fetch (5 seconds max)

**Warning signs:**
- Loading spinner never resolves
- Entire calendar fails to render
- Error logs show network timeouts
- API rate limit errors in production

**Sources:**
- [OpenHolidays API documentation](https://www.openholidaysapi.org/en/)
- [Next.js caching and revalidation guide](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)

### Pitfall 3: Incorrect Week Start (Sunday vs Monday)

**What goes wrong:** Calendar shows Sunday as first column, but Bulgarian standard and ISO 8601 use Monday. Days appear shifted, weekend styling is on wrong columns.

**Why it happens:** JavaScript's `getDay()` returns 0 for Sunday, 6 for Saturday (US convention). Developers use it directly without converting to Monday-first.

**How to avoid:**
- Convert `getDay()` result: `const mondayFirst = dayOfWeek === 0 ? 6 : dayOfWeek - 1`
- Use `startOfWeek(date, { weekStartsOn: 1 })` from date-fns for Monday-first
- Render day headers as `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`
- Apply weekend styling to columns 6-7 (Saturday/Sunday), not 1 and 7

**Warning signs:**
- Weekends have gray background on wrong days
- First day of month appears in wrong column
- User feedback: "Calendar layout is wrong"

**Sources:**
- [date-fns getDay function discussion](https://github.com/date-fns/date-fns/issues/1287)

### Pitfall 4: Tailwind v4 Hover States on Mobile

**What goes wrong:** Tooltip only shows on hover, doesn't work on mobile. Users tap day cells but nothing happens. Stuck hover states on iPad.

**Why it happens:** Tailwind v4 changed `hover:` to only apply when `@media (hover: hover)` is true. This prevents "sticky" hover on touch devices but breaks hover-only tooltips.

**How to avoid:**
- Always combine hover with click/tap: `onMouseEnter` + `onClick` handlers
- Use state management to toggle tooltip on tap for mobile
- Design tooltip to work without hover (show on tap, hide on second tap or outside click)
- Test on actual mobile device or Chrome DevTools mobile emulation

**Warning signs:**
- Tooltip works on desktop, not on mobile
- Hover state "sticks" after tap on iPad
- User reports "can't see holiday details on phone"

**Sources:**
- [Tailwind CSS v4 hover on touch devices](https://bordermedia.org/blog/tailwind-css-4-hover-on-touch-device)
- [Material UI tooltip mobile behavior](https://mui.com/material-ui/react-tooltip/)

### Pitfall 5: Server/Client Boundary Misplacement

**What goes wrong:** Entire calendar marked as `'use client'`, bloating client bundle and losing Server Component benefits. Or tooltip doesn't work because it's in Server Component without `'use client'`.

**Why it happens:** Confusion about where client boundary should be. Developers either mark whole page as client (safe but wasteful) or try to add interactivity to Server Components (doesn't work).

**How to avoid:**
- Keep calendar grid and data fetching as Server Components
- Mark only tooltip component with `'use client'` directive
- Pass holiday data as props to Client Component (serializable data only)
- Rule: If it uses useState, useEffect, onClick, onHover → needs `'use client'`
- Put `'use client'` as deep in component tree as possible

**Warning signs:**
- Large client bundle size (check Next.js build output)
- `useState` or `onClick` errors in Server Component
- Calendar data re-fetched on every interaction
- Hydration errors in console

**Sources:**
- [Next.js Server and Client Components guide](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React Server Components vs Client Components](https://medium.com/@123ajaybisht/react-server-components-vs-client-components-when-to-use-what-bcec46cacded)

## Code Examples

Verified patterns from official sources and community best practices:

### Example 1: Fetching Holidays with Next.js App Router

```typescript
// app/page.tsx (Server Component)
import { parseISO, getYear } from 'date-fns';
import Calendar from '@/components/Calendar';

async function getHolidays() {
  try {
    const response = await fetch(
      'https://openholidaysapi.org/PublicHolidays?countryIsoCode=BG&validFrom=2026-01-01&validTo=2026-12-31',
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) throw new Error('API failed');

    const data = await response.json();

    // Parse dates safely
    return data.map(holiday => ({
      name: holiday.name[0].text, // First language variant
      date: parseISO(holiday.startDate), // Safe for Safari
      type: holiday.type
    }));
  } catch (error) {
    // Fallback to static data
    const fallback = await import('@/data/holidays-2026-fallback.json');
    return fallback.default;
  }
}

export default async function HomePage() {
  const holidays = await getHolidays();
  const currentDate = new Date();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bulgarian Holidays 2026</h1>
      <Calendar
        year={getYear(currentDate)}
        month={currentDate.getMonth()}
        holidays={holidays}
      />
    </main>
  );
}
```

### Example 2: Calendar Grid with CSS Grid

```tsx
// components/Calendar.tsx (Server Component)
import { startOfMonth, endOfMonth, getDay, getDaysInMonth, format, isSameDay } from 'date-fns';
import CalendarDay from './CalendarDay';

interface CalendarProps {
  year: number;
  month: number; // 0-11
  holidays: Array<{ date: Date; name: string; type: string }>;
}

export default function Calendar({ year, month, holidays }: CalendarProps) {
  const firstDay = startOfMonth(new Date(year, month));
  const daysInMonth = getDaysInMonth(firstDay);

  // Convert to Monday-first (0 = Mon, 6 = Sun)
  let firstDayOfWeek = getDay(firstDay);
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month, day);
    const holiday = holidays.find(h => isSameDay(h.date, date));
    const isWeekend = [5, 6].includes((firstDayOfWeek + i) % 7); // Sat, Sun

    return { day, date, holiday, isWeekend };
  });

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">
        {format(firstDay, 'MMMM yyyy')}
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center font-medium text-sm py-2">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((dayData, index) => (
          <CalendarDay
            key={dayData.day}
            {...dayData}
            gridColumnStart={index === 0 ? firstDayOfWeek + 1 : undefined}
          />
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Calendar Day with Tooltip (Client Component)

```tsx
// components/CalendarDay.tsx (Server Component - wrapper)
import DayTooltip from './DayTooltip';

interface CalendarDayProps {
  day: number;
  date: Date;
  holiday?: { name: string; type: string };
  isWeekend: boolean;
  gridColumnStart?: number;
}

export default function CalendarDay({
  day,
  date,
  holiday,
  isWeekend,
  gridColumnStart
}: CalendarDayProps) {
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div
      style={gridColumnStart ? { gridColumnStart } : undefined}
      className={`
        relative p-3 text-center border rounded
        ${holiday ? 'bg-red-500 text-white' : ''}
        ${isWeekend && !holiday ? 'bg-gray-100' : ''}
        ${isToday ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <span className="font-medium">{day}</span>
      {holiday && <DayTooltip holiday={holiday} />}
    </div>
  );
}
```

```tsx
// components/DayTooltip.tsx (Client Component)
'use client';

import { useState } from 'react';

interface DayTooltipProps {
  holiday: { name: string; type: string };
}

export default function DayTooltip({ holiday }: DayTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="absolute top-0 right-0">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="text-xs bg-white text-gray-800 rounded-full w-4 h-4 flex items-center justify-center"
        aria-label="Holiday details"
      >
        i
      </button>

      {isVisible && (
        <div className="absolute right-0 top-6 z-10 w-48 p-3 bg-gray-900 text-white text-sm rounded shadow-lg">
          <div className="font-bold mb-1">{holiday.name}</div>
          <div className="text-xs opacity-80">{holiday.type}</div>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Static Fallback Data

```json
// data/holidays-2026-fallback.json
[
  {
    "name": "New Year's Day",
    "date": "2026-01-01",
    "type": "Public Holiday"
  },
  {
    "name": "Liberation Day",
    "date": "2026-03-03",
    "type": "Public Holiday"
  },
  {
    "name": "Labour Day",
    "date": "2026-05-01",
    "type": "Public Holiday"
  },
  {
    "name": "St. George's Day",
    "date": "2026-05-06",
    "type": "Public Holiday"
  },
  {
    "name": "Education and Culture Day",
    "date": "2026-05-24",
    "type": "Public Holiday"
  },
  {
    "name": "Unification Day",
    "date": "2026-09-06",
    "type": "Public Holiday"
  },
  {
    "name": "Independence Day",
    "date": "2026-09-22",
    "type": "Public Holiday"
  },
  {
    "name": "Christmas Eve",
    "date": "2026-12-24",
    "type": "Public Holiday"
  },
  {
    "name": "Christmas Day",
    "date": "2026-12-25",
    "type": "Public Holiday"
  },
  {
    "name": "Second Day of Christmas",
    "date": "2026-12-26",
    "type": "Public Holiday"
  }
]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 hover behavior (works on touch) | Tailwind v4 `@media (hover: hover)` | Tailwind v4 (2024) | Must add onClick handlers for mobile, no more stuck hover states |
| date-fns-tz as separate package | date-fns v4 with @date-fns/tz | date-fns v4 (2024) | First-class timezone support, better TypeScript types |
| Next.js Pages Router | Next.js App Router with Server Components | Next.js 13+ (2022-present) | Server Components default, better caching, streaming |
| `getServerSideProps` for data | Direct async/await in Server Components | Next.js 13+ App Router | Simpler code, better composition, automatic caching |
| `unstable_cache` for caching | `use cache` directive | Next.js 16 (2025) | Cleaner syntax, better granular control |

**Deprecated/outdated:**
- **FullCalendar, React Big Calendar**: Custom components required per CONVENTIONS.md, libraries are overkill for single-month view
- **Native Date constructor with strings**: Safari incompatibility, use date-fns parseISO
- **Hover-only tooltips**: Tailwind v4 hover doesn't work on mobile, must support tap/click
- **getServerSideProps**: Use Server Components with async/await instead

## Open Questions

Things that couldn't be fully resolved:

1. **OpenHolidays API rate limits**
   - What we know: Documentation doesn't mention rate limits
   - What's unclear: Whether aggressive caching (24hr) is sufficient or if we'll hit undocumented limits
   - Recommendation: Implement database cache + static fallback, monitor API response headers for rate limit info

2. **Supabase free tier limits for holiday caching**
   - What we know: Supabase free tier has limits, holiday data is small (10-20 records/year)
   - What's unclear: Whether we need separate table or can store in app metadata
   - Recommendation: Create `holidays` table with `year` (integer) and `data` (JSONB) columns, should be well under free tier limits

3. **date-fns tree-shaking in Next.js**
   - What we know: date-fns v4 supports tree-shaking, Next.js has automatic tree-shaking
   - What's unclear: Whether we need explicit imports or if named imports work (`import { parseISO } from 'date-fns'`)
   - Recommendation: Use named imports, verify bundle size in build output, optimize if needed

4. **Testing Safari compatibility in CI**
   - What we know: Safari has different date parsing than Chrome
   - What's unclear: Best way to test Safari-specific behavior in CI without BrowserStack
   - Recommendation: Use Playwright with WebKit engine for Safari testing, add specific date parsing tests

## Sources

### Primary (HIGH confidence)
- [OpenHolidays API Official Documentation](https://www.openholidaysapi.org/en/) - Verified Bulgaria support, endpoints, response format
- [date-fns Safari timezone issue discussion](https://github.com/date-fns/date-fns/issues/1869) - Root cause and solution for Safari date parsing
- [date-fns v4 time zone support announcement](https://blog.date-fns.org/v40-with-time-zone-support/) - v4 features and capabilities
- [Next.js Server and Client Components documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Official composition patterns
- [Next.js Caching and Revalidating guide](https://nextjs.org/docs/app/getting-started/caching-and-revalidating) - Fetch caching strategies

### Secondary (MEDIUM confidence)
- [CSS Grid calendar layouts - CSS Tricks](https://css-tricks.com/a-calendar-in-three-lines-of-css/) - Grid positioning patterns verified
- [Tailwind v4 hover on touch devices - BorderMedia](https://bordermedia.org/blog/tailwind-css-4-hover-on-touch-device) - v4 behavior change
- [Building custom calendar with React - Medium tutorial](https://medium.com/@olliedoesdev/making-a-calendar-component-using-react-nextjs-tailwindcss-and-the-temporal-api-821ed3df4dc4) - Implementation patterns
- [React tooltip mobile implementation - Refine blog](https://refine.dev/blog/react-tooltip/) - Mobile tooltip patterns
- [Supabase schema design best practices - Leanware](https://www.leanware.co/insights/supabase-best-practices) - Caching and indexing

### Tertiary (LOW confidence - requires validation)
- [date-fns calendar helper functions discussion](https://github.com/date-fns/date-fns/issues/737) - Community patterns, not official
- [Safari ISO 8601 compatibility issue](https://github.com/mdn/browser-compat-data/issues/15401) - Browser compatibility data, needs cross-reference
- [Bulgaria timezone information - WorldData.info](https://www.worlddata.info/europe/bulgaria/timezones.php) - General reference, verify with IANA tz database

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are stable releases with official documentation
- Architecture patterns: MEDIUM - Patterns are community-verified but need testing with specific Next.js 16 + React 19 combination
- Safari compatibility: HIGH - Verified with official GitHub issues and documented solutions
- OpenHolidays API: MEDIUM - API documented but no official rate limit/SLA info
- Caching strategy: MEDIUM - Next.js patterns documented but multi-layer fallback needs implementation validation
- Tooltip implementation: MEDIUM - Tailwind v4 behavior documented, mobile patterns require testing

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - stable stack, but verify for Next.js/React updates)

**Critical validation needed before planning:**
- Test date-fns parseISO with Safari 17+ actual browser (not just WebKit)
- Verify OpenHolidays API response structure matches expected format
- Confirm Tailwind v4 hover behavior in mobile Chrome and Safari
- Validate Next.js 16.1.3 `use cache` directive syntax (new feature, may have updates)
