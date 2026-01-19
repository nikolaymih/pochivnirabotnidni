# Phase 2: Anonymous Vacation Tracking - Research

**Researched:** 2026-01-20
**Domain:** Client-side state management with localStorage persistence
**Confidence:** HIGH

## Summary

This phase adds client-side vacation tracking using React state and browser localStorage. The primary challenges are: (1) managing localStorage safely with Next.js SSR, (2) implementing drag-to-select UX for date ranges, (3) structuring localStorage data for reliability, and (4) ensuring data persistence across sessions.

The standard approach uses custom React hooks for localStorage synchronization, Next.js Client Components for browser API access, and date-fns for all date calculations (already established in Phase 1). Inline editing patterns require minimal state management with accept/cancel actions.

**Primary recommendation:** Use a custom `useLocalStorage` hook with lazy initialization and SSR guards, implement mouse event-based drag selection without external libraries, and version the localStorage schema for future migration safety.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React hooks (useState, useEffect) | 19.2.3 | State management and side effects | Built-in, required for Client Components |
| Next.js Client Components | 16.1.3 | Browser API access (localStorage, mouse events) | Required for localStorage in Next.js App Router |
| date-fns | 4.1.0 | Date calculations (differenceInDays, eachDayOfInterval) | Already established in Phase 1 (TECH-01) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| JSON.stringify/parse | Native | localStorage serialization | All non-string localStorage operations |
| Pointer Events API | Native | Drag selection (onPointerDown/Move/Up) | Better than mouse events (supports touch) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom hook | zustand with persist middleware | Adds 4KB dependency for simple use case; overkill |
| Custom hook | use-local-storage-state (npm) | Adds dependency; custom hook is 20 lines |
| Pointer Events | react-drag-to-select library | Adds dependency; custom implementation is straightforward |
| Client Component | Hydration with default values | Causes hydration mismatch warnings in Next.js |

**Installation:**
```bash
# No new dependencies required
# All functionality uses existing stack: React 19, Next.js 16, date-fns 4.1
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Calendar.tsx          # Existing - add vacation state
│   ├── CalendarDay.tsx       # Existing - add vacation styling + click handlers
│   ├── Legend.tsx            # Existing - add vacation legend item
│   └── VacationSummary.tsx   # NEW - balance display + inline editing
├── hooks/
│   └── useLocalStorage.ts    # NEW - localStorage sync hook
└── lib/
    ├── vacation/
    │   ├── types.ts           # NEW - VacationData type
    │   └── storage.ts         # NEW - localStorage key constants + schema version
    └── calendar/
        └── dates.ts           # Existing - reuse parseDate, getCurrentDate
```

### Pattern 1: Custom useLocalStorage Hook
**What:** React hook that synchronizes state with localStorage, handles SSR, and provides automatic persistence
**When to use:** Any time you need to persist state in browser storage
**Example:**
```typescript
// Source: https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
// Adapted for Next.js SSR safety
function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initialization - only runs once on mount
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR guard: localStorage only exists in browser
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
```

### Pattern 2: Drag-to-Select Date Range
**What:** Mouse/pointer-based multi-date selection using native events
**When to use:** Selecting consecutive vacation days efficiently
**Example:**
```typescript
// Source: https://www.joshuawootonn.com/react-drag-to-select
// Vector-based approach for directional drag tracking
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState<string | null>(null);
const [currentHover, setCurrentHover] = useState<string | null>(null);

const handlePointerDown = (dateStr: string) => {
  setIsDragging(true);
  setDragStart(dateStr);
  setCurrentHover(dateStr);
};

const handlePointerMove = (dateStr: string) => {
  if (!isDragging) return;
  setCurrentHover(dateStr);
};

const handlePointerUp = () => {
  if (!isDragging) return;
  // Apply selection from dragStart to currentHover
  const range = getDateRange(dragStart, currentHover);
  toggleVacationDays(range);
  setIsDragging(false);
  setDragStart(null);
  setCurrentHover(null);
};
```

### Pattern 3: Inline Editing with State
**What:** Click-to-edit pattern with explicit save/cancel actions
**When to use:** Editing vacation allowance number
**Example:**
```typescript
// Source: https://atlassian.design/components/inline-edit/
const [isEditing, setIsEditing] = useState(false);
const [editValue, setEditValue] = useState(totalDays);

const handleEdit = () => {
  setEditValue(totalDays);
  setIsEditing(true);
};

const handleSave = () => {
  if (editValue > 0) {
    setTotalDays(editValue);
    setIsEditing(false);
  }
};

const handleCancel = () => {
  setEditValue(totalDays);
  setIsEditing(false);
};
```

### Pattern 4: localStorage Schema Versioning
**What:** Include version field in stored data for future migrations
**When to use:** Any localStorage structure that may evolve
**Example:**
```typescript
// Source: https://dev.to/diballesteros/how-to-migrate-zustand-local-storage-store-to-a-new-version-njp
interface VacationData {
  version: number; // Schema version for migrations
  totalDays: number;
  vacationDates: string[]; // ISO date strings
}

const STORAGE_KEY = 'vacation-data-v1';
const CURRENT_VERSION = 1;

function loadVacationData(): VacationData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { version: CURRENT_VERSION, totalDays: 20, vacationDates: [] };
  }

  const data = JSON.parse(stored);

  // Future migration point
  if (data.version < CURRENT_VERSION) {
    return migrateVacationData(data);
  }

  return data;
}
```

### Anti-Patterns to Avoid
- **Reading localStorage in Server Components:** Causes "window is not defined" errors - always use Client Components
- **Hydration with localStorage values:** Server renders default, client renders stored value → mismatch warning. Use `useEffect` + `isClient` flag
- **Storing dates as timestamps:** Phase 1 decision (TECH-07) uses ISO strings; maintain consistency
- **No try-catch around localStorage:** QuotaExceededError or SecurityError can crash app - always wrap in error handling
- **Forgetting SSR guards:** Next.js pre-renders on server; `typeof window === 'undefined'` check is mandatory

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date range generation | Loop with Date objects | `eachDayOfInterval` from date-fns | Handles edge cases, DST-safe per TECH-01 |
| Days between dates | Manual date math | `differenceInDays` from date-fns | Timezone-safe, already in stack |
| Date serialization | `new Date().toISOString()` | `format(date, 'yyyy-MM-dd')` from date-fns | Consistent with Phase 1 (TECH-07), no time component |
| Cross-tab sync | Custom storage event listener | Built-in `window.addEventListener('storage', ...)` | Native browser API handles it |
| localStorage quota detection | Guess storage limits | Try-catch QuotaExceededError | Browsers vary (5MB-10MB), detection is reliable |

**Key insight:** Date operations are error-prone (timezones, DST, leap years). Phase 1 established date-fns for all date math (TECH-01) - continue this pattern.

## Common Pitfalls

### Pitfall 1: Next.js Hydration Mismatch
**What goes wrong:** Server renders default value, client renders localStorage value → React throws hydration warning
**Why it happens:** localStorage doesn't exist during SSR, so server and client produce different HTML
**How to avoid:**
```typescript
const [isClient, setIsClient] = useState(false);
const [totalDays, setTotalDays] = useLocalStorage('totalDays', 20);

useEffect(() => {
  setIsClient(true);
}, []);

// Don't render localStorage-dependent UI until client-side
return isClient ? <div>{totalDays} days</div> : <div>Loading...</div>;
```
**Warning signs:** "Warning: Text content did not match. Server: '20' Client: '15'" in console

### Pitfall 2: localStorage QuotaExceededError
**What goes wrong:** User hits storage limit (typically 5-10MB), `setItem()` throws error, app breaks
**Why it happens:** Browsers enforce per-origin quota; old data or large objects fill storage
**How to avoid:**
```typescript
try {
  localStorage.setItem(key, JSON.stringify(value));
} catch (error) {
  if (error.name === 'QuotaExceededError' || error.code === 22) {
    console.warn('localStorage quota exceeded');
    // Fallback: use in-memory state only, notify user
  }
}
```
**Warning signs:** Sudden crashes on save, "setItem failed" errors

### Pitfall 3: Date Range Selection Edge Cases
**What goes wrong:** Dragging backwards (end before start), dragging across months, including/excluding endpoints
**Why it happens:** Pointer events fire in any direction; date ranges need inclusive endpoints
**How to avoid:**
```typescript
function getDateRange(start: string, end: string): string[] {
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  // Handle backward drags
  const [rangeStart, rangeEnd] = startDate <= endDate
    ? [startDate, endDate]
    : [endDate, startDate];

  // eachDayOfInterval is inclusive on both ends
  return eachDayOfInterval({ start: rangeStart, end: rangeEnd })
    .map(date => format(date, 'yyyy-MM-dd'));
}
```
**Warning signs:** Dragging right-to-left doesn't work, off-by-one errors in selections

### Pitfall 4: Pointer Events vs Mouse Events
**What goes wrong:** Using `onMouseDown/Move/Up` breaks on touch devices; mobile users can't select dates
**Why it happens:** Mouse events don't unify pointer types; touch requires separate handling
**How to avoid:** Use Pointer Events API which abstracts mouse, touch, and pen:
```typescript
// ✅ Good - works on all devices
<div onPointerDown={...} onPointerMove={...} onPointerUp={...}>

// ❌ Bad - desktop only
<div onMouseDown={...} onMouseMove={...} onMouseUp={...}>
```
**Warning signs:** "Works on desktop but not on mobile" bug reports

### Pitfall 5: localStorage and Private Browsing
**What goes wrong:** Safari Private Mode, Firefox Private Browsing throw SecurityError on `setItem`
**Why it happens:** Private modes disable persistent storage; quota is 0
**How to avoid:** Same try-catch as QuotaExceededError; treat as in-memory fallback
**Warning signs:** "localStorage access denied" errors, crashes in private mode

### Pitfall 6: Marking Same Date Multiple Times
**What goes wrong:** User clicks same date repeatedly, duplicate entries in vacationDates array
**Why it happens:** Array.push() doesn't check uniqueness
**How to avoid:**
```typescript
// Use Set for uniqueness
const vacationDatesSet = new Set(vacationDates);
if (vacationDatesSet.has(dateStr)) {
  vacationDatesSet.delete(dateStr); // Toggle off
} else {
  vacationDatesSet.add(dateStr); // Toggle on
}
setVacationDates(Array.from(vacationDatesSet));
```
**Warning signs:** Duplicate dates in localStorage, incorrect used days count (VAC-08 violation)

## Code Examples

Verified patterns from official sources:

### Calculating Used Vacation Days
```typescript
// Source: date-fns documentation - https://date-fns.org/
import { parseISO } from 'date-fns';

function calculateUsedDays(vacationDates: string[]): number {
  // Each date string counts as 1 day
  // No need for differenceInDays - just array length
  return vacationDates.length;
}

function calculateRemainingDays(total: number, used: number): number {
  return total - used;
}
```

### SSR-Safe Client Component Pattern
```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
'use client'; // Required for localStorage access

import { useState, useEffect } from 'react';

export default function VacationSummary() {
  const [isClient, setIsClient] = useState(false);
  const [vacationData, setVacationData] = useLocalStorage('vacation-data', {
    version: 1,
    totalDays: 20,
    vacationDates: []
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Зареждане...</div>; // Avoid hydration mismatch
  }

  return (
    <div>
      <p>Общо: {vacationData.totalDays} дни</p>
      <p>Използвани: {vacationData.vacationDates.length} дни</p>
      <p>Остават: {vacationData.totalDays - vacationData.vacationDates.length} дни</p>
    </div>
  );
}
```

### Toggle Vacation Date (VAC-08 Compliance)
```typescript
// Prevent duplicate dates using Set
function toggleVacationDate(dateStr: string, currentDates: string[]): string[] {
  const datesSet = new Set(currentDates);

  if (datesSet.has(dateStr)) {
    datesSet.delete(dateStr); // Remove if already marked
  } else {
    datesSet.add(dateStr); // Add if not marked
  }

  return Array.from(datesSet);
}
```

### Error-Safe localStorage Operations
```typescript
// Source: https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/
function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // QuotaExceededError (code 22) or SecurityError (private mode)
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
       error.code === 22 ||
       error.code === 1014) // Firefox NS_ERROR_DOM_QUOTA_REACHED
    ) {
      console.warn('localStorage unavailable - using in-memory fallback');
      return false;
    }
    throw error; // Re-throw unexpected errors
  }
}
```

### Drag Selection Visual Feedback
```typescript
// Source: Custom implementation based on pointer events pattern
function CalendarDay({ date, isVacation, onToggle, isDragSelecting, isInDragRange }) {
  return (
    <div
      onPointerDown={() => onToggle(date)}
      className={`
        p-3 text-center border rounded
        ${isVacation ? 'bg-blue-400' : ''}
        ${isInDragRange ? 'ring-2 ring-blue-300' : ''}
        cursor-pointer select-none
      `}
    >
      {/* select-none prevents text selection during drag */}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `localStorage.getItem/setItem` directly in components | Custom `useLocalStorage` hook with SSR guards | 2022-2023 with Next.js 13+ | Prevents hydration errors, centralizes logic |
| Mouse events for drag | Pointer Events API | 2019+ (unified API) | Touch/pen/mouse support in one event handler |
| Manual `window.addEventListener('storage')` | Built into custom hooks or `useSyncExternalStore` | 2022 (React 18) | Cross-tab sync automatic, concurrent-safe |
| Date.prototype methods | date-fns library | Ongoing best practice | Avoids timezone/DST bugs (Phase 1: TECH-01) |
| Storing Date objects | ISO date strings | Phase 1 decision (TECH-07) | Safari compatibility, no time component issues |

**Deprecated/outdated:**
- **Class components with componentDidMount:** Hooks are standard since React 16.8 (2019)
- **Moment.js for dates:** Deprecated; date-fns is modern alternative (established Phase 1)
- **onMouseDown/Move/Up for drag:** Replaced by onPointerDown/Move/Up for unified input support

## Open Questions

Things that couldn't be fully resolved:

1. **Accessibility for drag selection**
   - What we know: Drag selection is inherently not keyboard-accessible (source: joshuawootonn.com guide)
   - What's unclear: Best ARIA pattern for screen readers during drag operations
   - Recommendation: Implement keyboard alternative (arrow keys + Space to toggle) in Phase 5 (UX-02, UX-03)

2. **Optimal localStorage sync strategy**
   - What we know: `useEffect` updates on every state change; debouncing can reduce writes
   - What's unclear: Whether rapid clicks (toggle vacation on/off) cause performance issues at 365-day scale
   - Recommendation: Start without debouncing; add if profiling shows >50ms delays (unlikely for 365 dates)

3. **Calendar year transition behavior**
   - What we know: Phase 2 only tracks current year; vacation data is date strings
   - What's unclear: Should localStorage persist 2026 data when viewing 2027 calendar?
   - Recommendation: Phase 2 stores dates without year filtering; Phase 4 (AUTH-07) handles multi-year rollover

4. **Inline edit keyboard shortcuts**
   - What we know: Standard pattern is click to edit, Enter to save, Escape to cancel
   - What's unclear: Whether Bulgarian users expect different shortcuts
   - Recommendation: Use web-standard shortcuts (Enter/Escape); no localization needed

## Sources

### Primary (HIGH confidence)
- [Josh W. Comeau - Persisting React State in localStorage](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - Custom hook pattern
- [Joshua Wootonn - React Drag to Select](https://www.joshuawootonn.com/react-drag-to-select) - Vector-based drag implementation
- [Atlassian Design System - Inline Edit](https://atlassian.design/components/inline-edit/) - Inline editing pattern
- [Next.js Docs - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - SSR guards
- [date-fns Documentation](https://date-fns.org/) - Date calculation functions
- [MDN - Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - localStorage API reference
- [TrackJS - localStorage setItem errors](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/) - Error handling

### Secondary (MEDIUM confidence)
- [Matteo Mazzarolo - localStorage errors](https://mmazzarolo.com/blog/2022-06-25-local-storage-status/) - QuotaExceededError handling
- [RxDB - localStorage Best Practices](https://rxdb.info/articles/localstorage.html) - Storage patterns (verified with MDN)
- [DEV Community - localStorage security](https://dev.to/rigalpatel001/securing-web-storage-localstorage-and-sessionstorage-best-practices-f00) - Security guidelines
- [React Aria - Calendar Accessibility](https://react-spectrum.adobe.com/react-aria/Calendar.html) - Accessibility patterns (for Phase 5)
- [GitHub - versioned-storage](https://github.com/CatChen/versioned-storage) - Schema versioning concept

### Tertiary (LOW confidence)
- [WebSearch: React calendar vacation tracker implementations 2026] - General ecosystem survey, no specific pattern validation
- [WebSearch: react-multi-date-picker npm] - Alternative library exploration (not recommended for this project per TECH-05)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React hooks, Next.js Client Components, and date-fns are established choices; no alternatives needed
- Architecture patterns: HIGH - useLocalStorage hook pattern is well-documented; drag selection verified with joshuawootonn.com implementation; inline edit verified with Atlassian Design System
- Don't hand-roll: HIGH - date-fns usage already mandated by Phase 1 (TECH-01, TECH-07); all recommendations align with existing decisions
- Common pitfalls: HIGH - Hydration mismatch, QuotaExceededError, and pointer events are documented Next.js/browser issues with proven solutions
- Accessibility: MEDIUM - Drag selection accessibility is known limitation; keyboard alternative needed but deferred to Phase 5

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable domain, React/Next.js patterns change slowly)

**Alignment with Phase 1 decisions:**
- Uses date-fns for all date operations (TECH-01) ✓
- Stores dates as ISO strings (TECH-07) ✓
- Client Components only where needed (TECH-06) ✓
- No external calendar library (TECH-05) ✓
- Reuses parseDate, getCurrentDate from Phase 1 ✓

**Alignment with Phase 2 CONTEXT.md decisions:**
- Single click marks/unmarks vacation days ✓
- Drag to select range supported ✓
- Allow marking holidays/weekends as vacation ✓
- Toggle behavior on marked days ✓
- Inline editing with edit icon + accept/cancel ✓
- Default 20 days (Bulgarian standard) ✓
- Light blue background for vacation days ✓
- No confirmation dialogs ✓
- localStorage for anonymous persistence ✓
