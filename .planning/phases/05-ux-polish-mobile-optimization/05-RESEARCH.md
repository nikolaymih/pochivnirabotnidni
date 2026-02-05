# Phase 5: UX Polish & Mobile Optimization - Research

**Researched:** 2026-02-05
**Domain:** Mobile UX, Offline PWA, Touch Interactions
**Confidence:** MEDIUM

## Summary

Phase 5 enhances the existing Next.js calendar app with mobile-optimized touch interactions, offline PWA capabilities, and polished UX patterns. The standard approach combines native browser APIs (Pointer Events, navigator.onLine) with a lightweight PWA solution (Serwist for Next.js) and minimal UI libraries (react-hot-toast or sonner for notifications). Since the codebase already uses Pointer Events API (from Phase 2), touch interactions require only CSS refinements (`touch-action: none`) and accessibility improvements (44px touch targets). Offline support follows Next.js's recommended Serwist pattern with runtime caching for view-only mode, while network detection uses navigator.onLine with exponential backoff for retry logic.

The critical insight: PWA implementation in Next.js 15+ requires careful service worker lifecycle management, and navigator.onLine has false positive issues requiring additional verification with actual network requests. User context decisions lock in view-only offline mode, simple tap-and-drag gestures, and silent failure patterns where fallback mechanisms exist.

**Primary recommendation:** Use Serwist for Next.js service worker generation, react-hot-toast for toast notifications (5KB bundle size), CSS touch-action for touch optimization, and build-in exponential backoff using existing fetch-retry dependency (already in package.json).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Serwist | 9.5.4+ | Service worker generation for Next.js | Official Next.js docs recommendation, fork of Workbox with active Next.js support |
| fetch-retry | 6.0.0+ | Exponential backoff for network requests | Already in dependencies, built-in retry with backoff |
| navigator.onLine | Native API | Network state detection | Zero dependencies, broad support, standard browser API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hot-toast | Latest | Toast notifications | <5KB, promise-based API, minimal configuration |
| sonner | Latest | Toast notifications (alternative) | shadcn/ui ecosystem, modern DX, lightweight |
| IndexedDB | Native API | Offline data caching | For caching holiday data (current year only) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hot-toast | react-toastify | 16KB vs 5KB - unnecessary weight for simple toasts |
| Serwist | Manual service worker | Lose precaching, lifecycle management, and Next.js integration |
| fetch-retry | exponential-backoff npm package | fetch-retry already in deps, less code churn |

**Installation:**
```bash
npm install -D serwist @serwist/next
npm install react-hot-toast  # or sonner
# fetch-retry already installed in package.json
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── sw.ts                       # Service worker entry (Serwist generates to public/)
public/
├── sw.js                       # Generated service worker (Serwist output)
└── offline.html                # Offline fallback page
lib/
├── offline/
│   ├── cache.ts                # IndexedDB holiday cache logic
│   └── network.ts              # Network state detection hook
components/
├── ToastProvider.tsx           # Toast notification provider (app-wide)
└── OfflineIndicator.tsx        # Offline mode banner
```

### Pattern 1: Touch-Optimized Drag Selection
**What:** Extend existing Pointer Events with CSS touch-action and visual feedback
**When to use:** For calendar day selection (already uses onPointerDown/onPointerUp)
**Example:**
```typescript
// Source: Project codebase (MonthGrid.tsx already has pointer events)
// Add CSS touch-action to prevent scroll during drag
<div
  className="day-cell"
  style={{ touchAction: 'none' }}  // Prevents scroll, allows pointer events
  onPointerDown={(e) => {
    e.currentTarget.classList.add('highlight-flash');
    setTimeout(() => e.currentTarget.classList.remove('highlight-flash'), 150);
    handleDayPointerDown(dateStr);
  }}
  onPointerEnter={handleDayPointerEnter}
  onPointerUp={handleDayPointerUp}
>
  {day}
</div>
```

### Pattern 2: Network State Detection with Verification
**What:** Use navigator.onLine with actual network request verification
**When to use:** For offline detection and toast notification triggers
**Example:**
```typescript
// Source: Combining MDN recommendations with community patterns
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
// https://dev.to/maxmonteil/is-your-app-online-here-s-how-to-reliably-know-in-just-10-lines-of-js-guide-3in7

function useNetworkState() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = async () => {
      // navigator.onLine can give false positives (LAN without internet)
      // Verify with actual request to known endpoint
      try {
        await fetch('/api/health', { method: 'HEAD' });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false); // false is reliable, true is not
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Pattern 3: View-Only Offline Mode with Service Worker
**What:** Serwist-based PWA with runtime caching for holidays and vacation data
**When to use:** For offline capability without allowing mutations
**Example:**
```typescript
// Source: Serwist official docs + Next.js PWA guide
// app/sw.ts
import { Serwist } from "serwist";
import { CacheFirst, NetworkFirst } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/openholidaysapi\.org\/.*$/,
      handler: new CacheFirst({
        cacheName: 'holidays-cache',
        plugins: [
          {
            cacheableResponse: { statuses: [0, 200] },
            expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } // 1 year for current year
          }
        ]
      })
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
      handler: new NetworkFirst({
        cacheName: 'vacation-data',
        plugins: [
          {
            cacheableResponse: { statuses: [0, 200] }
          }
        ]
      })
    }
  ]
});

serwist.addEventListeners();
```

### Pattern 4: Exponential Backoff with fetch-retry
**What:** Use existing fetch-retry library for automatic retry with backoff
**When to use:** For all Supabase sync operations and holiday API calls
**Example:**
```typescript
// Source: fetch-retry npm package (already in dependencies)
// https://www.npmjs.com/package/fetch-retry
import fetch from 'fetch-retry';

const fetchRetry = fetch(global.fetch, {
  retries: 3,
  retryDelay: function(attempt) {
    return Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
  },
  retryOn: [503, 504, 429] // Retry only on server errors and rate limits
});

// Use in vacation sync
async function syncVacationData(userId: string, data: VacationData) {
  try {
    return await fetchRetry(`/api/vacation/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error('Sync failed after 3 retries:', err);
    // Fall back to localStorage (already implemented)
  }
}
```

### Pattern 5: Accessible Touch Targets
**What:** 44px minimum touch targets with invisible expanded hit areas
**When to use:** For all interactive calendar cells and buttons
**Example:**
```typescript
// Source: WCAG 2.5.5 + CSS-Tricks touch-action guide
// https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
// https://css-tricks.com/almanac/properties/t/touch-action/

// Option 1: Expand hit area with padding (if visual size < 44px)
<button className="p-2 min-w-[44px] min-h-[44px]">
  <Icon className="w-6 h-6" />
</button>

// Option 2: Invisible expanded hit area using pseudo-element
<style jsx>{`
  .day-cell {
    position: relative;
    padding: 0.5rem; /* Visual padding */
  }
  .day-cell::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 44px;
    min-height: 44px;
  }
`}</style>
```

### Pattern 6: Toast Notifications with react-hot-toast
**What:** Lightweight toast library for network status and error messages
**When to use:** For offline notifications and silent failure logging
**Example:**
```typescript
// Source: react-hot-toast official docs
// https://react-hot-toast.com/

// In _app.tsx or layout.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <>
      <Toaster position="bottom-center" />
      {children}
    </>
  );
}

// Usage in components
import toast from 'react-hot-toast';

function OfflineDetector() {
  const isOnline = useNetworkState();

  useEffect(() => {
    if (!isOnline) {
      toast('Няма връзка. Преглеждате данните офлайн.', {
        icon: '📡',
        duration: 3000
      });
    } else {
      toast.success('Връзката е възстановена');
    }
  }, [isOnline]);
}
```

### Anti-Patterns to Avoid
- **Custom touch gesture detection:** Don't reinvent pointer events - use native API already in codebase
- **Aggressive offline caching:** Don't cache indefinitely - user context specifies current year only
- **User-facing sync errors:** Don't show toast for every Supabase failure - localStorage fallback handles it silently
- **Blocking offline mode:** Don't prevent usage when offline - view-only is specified in user context
- **touch-action: manipulation:** Don't use manipulation value - it doesn't prevent scroll on drag, use none instead

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker precaching | Custom SW with cache API | Serwist | Handles lifecycle, cache versioning, Next.js integration, precache manifest |
| Exponential backoff | setTimeout loops with Math.pow | fetch-retry (in deps) | Already installed, battle-tested, handles edge cases |
| Toast notifications | Custom div + useState | react-hot-toast (5KB) | Accessible, promise-based, minimal config |
| Offline detection | Just navigator.onLine | navigator.onLine + verification fetch | False positives on LAN without internet |
| Touch target expansion | Manual padding calculations | min-w-[44px] + min-h-[44px] classes | Tailwind handles responsive sizing, WCAG compliant |

**Key insight:** Mobile UX has subtle cross-browser and cross-device issues that mature libraries solve. The cognitive load of "just 50 lines of code" quickly grows to hundreds when handling Safari quirks, iOS viewport behavior, Android browser variations, and accessibility edge cases. Use proven libraries for the hard parts.

## Common Pitfalls

### Pitfall 1: navigator.onLine False Positives
**What goes wrong:** App shows "online" status but API requests fail (LAN without internet)
**Why it happens:** navigator.onLine returns true when connected to any network, even without internet access
**How to avoid:** Always verify online status with actual network request to known endpoint
**Warning signs:** User reports "online" but seeing stale data or failed syncs

### Pitfall 2: Service Worker Caching During Development
**What goes wrong:** Changes don't appear during development, stale assets served
**Why it happens:** Service worker caches assets aggressively, Next.js dev server doesn't invalidate SW cache
**How to avoid:** Configure Serwist to disable in development mode, add Cache-Control: no-cache header to sw.js
**Warning signs:** Have to hard refresh or clear cache to see code changes

### Pitfall 3: Touch Scroll Prevention Breaking Page Navigation
**What goes wrong:** touch-action: none on calendar prevents ALL page scrolling
**Why it happens:** touch-action applies to entire element and descendants
**How to avoid:** Apply touch-action: none only to draggable cells, not parent container
**Warning signs:** User can't scroll page on mobile, entire app feels broken

### Pitfall 4: Supabase 503 Errors from Cold Start (Free Tier)
**What goes wrong:** First request after inactivity fails with 503, loses user action
**Why it happens:** Supabase free tier pauses after inactivity, takes 10-20s to wake
**How to avoid:** Use fetch-retry with 503 in retryOn array, first retry will likely succeed
**Warning signs:** Users report intermittent sync failures, especially morning/evening transitions

### Pitfall 5: IndexedDB Quota Exceeded on Mobile
**What goes wrong:** Caching fails silently, offline mode doesn't work
**Why it happens:** Mobile browsers have strict storage limits (often 50MB), exceed quota = failure
**How to avoid:** Cache current year holidays only (per user context), expire old years automatically
**Warning signs:** Offline mode works on desktop but not mobile, no error messages

### Pitfall 6: iOS Safari Touch Event Quirks
**What goes wrong:** Drag selection feels laggy or doesn't work on iOS
**Why it happens:** iOS Safari has 300ms tap delay and passive touch event defaults
**How to avoid:** Use Pointer Events (already in codebase), add touch-action: none CSS
**Warning signs:** Desktop works fine, iOS feels unresponsive

### Pitfall 7: PWA Install Prompt Not Showing
**What goes wrong:** Users expect install prompt, doesn't appear
**Why it happens:** iOS doesn't support automatic install prompts (manual only), Android requires engagement signals
**How to avoid:** Document manual install instructions, don't rely on prompt
**Warning signs:** User asks "how do I install this?"

## Code Examples

Verified patterns from official sources:

### Serwist Configuration for Next.js
```typescript
// Source: Serwist official docs + Next.js guide
// next.config.js
const withSerwist = require("@serwist/next").default({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Disable in dev
});

module.exports = withSerwist({
  // Your existing Next.js config
});
```

### Touch-Optimized Day Cell
```typescript
// Source: Project codebase + CSS-Tricks touch-action
// components/MonthGrid.tsx (enhancement)
<div
  className={cn(
    "day-cell p-2 text-center rounded text-xs",
    "min-w-[44px] min-h-[44px]", // WCAG touch target
    "touch-none", // CSS touch-action: none via Tailwind
    isClickable && "cursor-pointer"
  )}
  onPointerDown={handlePointerDown}
  onPointerEnter={handlePointerEnter}
  onPointerUp={handlePointerUp}
>
  {day}
</div>
```

### IndexedDB Holiday Cache
```typescript
// Source: MDN IndexedDB guide + web.dev best practices
// lib/offline/cache.ts
const CACHE_NAME = 'holidays-cache-v1';
const CURRENT_YEAR = new Date().getFullYear();

async function cacheHolidays(year: number, holidays: Holiday[]) {
  if (year !== CURRENT_YEAR) return; // Only cache current year

  const db = await openDB();
  const tx = db.transaction('holidays', 'readwrite');
  await tx.objectStore('holidays').put({
    year,
    data: holidays,
    cachedAt: Date.now()
  });
  await tx.done;
}

async function getCachedHolidays(year: number): Promise<Holiday[] | null> {
  if (year !== CURRENT_YEAR) return null;

  const db = await openDB();
  const cached = await db.get('holidays', year);

  if (!cached) return null;

  // Expire after 1 year
  const age = Date.now() - cached.cachedAt;
  if (age > 365 * 24 * 60 * 60 * 1000) {
    await db.delete('holidays', year);
    return null;
  }

  return cached.data;
}
```

### Network State Hook with Verification
```typescript
// Source: DEV Community + MDN navigator.onLine
// lib/offline/network.ts
export function useNetworkState() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyConnection = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setIsVerified(true);
        return;
      }

      try {
        // Verify with HEAD request to avoid data transfer
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch('/api/health', {
          method: 'HEAD',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      } finally {
        setIsVerified(true);
      }
    };

    const handleOnline = () => verifyConnection();
    const handleOffline = () => {
      setIsOnline(false);
      setIsVerified(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial verification
    verifyConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isVerified };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa (unmaintained) | Serwist | 2024-2025 | Serwist is active fork with Next.js 15+ support |
| Separate mouse/touch events | Pointer Events API | 2020+ | Single API for all input types, 97% browser support |
| react-toastify (16KB) | react-hot-toast (5KB) | 2022+ | 68% smaller bundle, simpler API |
| Workbox (Google) | Serwist (community) | 2024 | Workbox stagnated, Serwist continues development |
| touch-action: manipulation | touch-action: none | Ongoing | manipulation doesn't prevent scroll during drag |

**Deprecated/outdated:**
- **next-pwa (shadowwalker):** Last update 2023, doesn't support Next.js 15+ App Router patterns
- **@ducanh2912/next-pwa:** Intermediate fork, superseded by Serwist
- **TouchEvent API direct use:** Pointer Events abstracts this, handles mouse+touch+pen unified

## Open Questions

Things that couldn't be fully resolved:

1. **Serwist + Next.js 15 App Router Edge Cases**
   - What we know: Serwist works with Next.js 15, but requires webpack (not Turbopack)
   - What's unclear: How well it handles dynamic routes with route parameters
   - Recommendation: Test with actual `/vacation/[year]` routes if added in future phases

2. **iOS Safari Touch-Action Support**
   - What we know: touch-action has limited Safari support with known bugs
   - What's unclear: Whether touch-action: none works reliably on iOS 15+ with pointer events
   - Recommendation: Test on real iOS devices (iPhone 12+), add Safari-specific fallback if needed

3. **Supabase Free Tier Cold Start Timing**
   - What we know: Free tier pauses after inactivity, takes 10-20s to wake
   - What's unclear: Exact retry timing that balances UX with wakeup duration
   - Recommendation: Start with fetch-retry defaults (1s, 2s, 4s), adjust based on telemetry

4. **IndexedDB Storage Quota on Mobile**
   - What we know: Mobile browsers limit storage (often 50MB), can request more
   - What's unclear: Whether current year holidays + vacation data fits comfortably in quota
   - Recommendation: Calculate data size (holidays ~10KB/year, vacation ~1KB), monitor quota usage

## Sources

### Primary (HIGH confidence)
- Next.js PWA Guide (https://nextjs.org/docs/app/guides/progressive-web-apps) - Official Next.js documentation
- Serwist GitHub (https://github.com/serwist/serwist) - Current version 9.5.4, active development
- WCAG 2.5.5 Target Size (https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44px minimum requirement
- react-hot-toast Docs (https://react-hot-toast.com/) - <5KB bundle size, API examples
- MDN touch-action (https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) - CSS property specification
- MDN navigator.onLine (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine) - API limitations

### Secondary (MEDIUM confidence)
- LogRocket Next.js 16 PWA (https://blog.logrocket.com/nextjs-16-pwa-offline-support) - Verified with official docs
- Smashing Magazine Touch Targets (https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/) - Verified with WCAG
- Advanced Web Machinery Exponential Backoff (https://advancedweb.hu/how-to-implement-an-exponential-backoff-retry-strategy-in-javascript/) - Verified with fetch-retry docs
- Medium Pointer Events Guide (https://medium.com/@aswathyraj/how-i-built-drag-and-drop-in-react-without-libraries-using-pointer-events-a0f96843edb7) - Verified with MDN

### Tertiary (LOW confidence)
- WebSearch: "PWA common pitfalls" - Community experiences, needs validation in testing
- WebSearch: "navigator.onLine false positives" - Known issues, verify with actual devices

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Serwist is proven but Next.js 15 integration needs validation
- Architecture: MEDIUM - Patterns verified with official docs, but iOS Safari needs device testing
- Pitfalls: MEDIUM - Based on community experiences, should validate during implementation

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable technologies, but Serwist/Next.js evolving)

**Key constraints from CONTEXT.md:**
- ✅ View-only offline mode (no mutations offline)
- ✅ Simple tap and drag (no additional gestures)
- ✅ Silent failures where fallbacks exist
- ✅ Cache current year holidays only
- ✅ Toast notifications on network loss
- ✅ 44px minimum touch targets
- ✅ Keep current vertical scroll layout
