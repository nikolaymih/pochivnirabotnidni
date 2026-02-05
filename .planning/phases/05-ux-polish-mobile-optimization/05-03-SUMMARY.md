---
phase: 05-ux-polish-mobile-optimization
plan: 03
subsystem: pwa
tags: [service-worker, pwa, manifest, offline, caching]

# Dependency graph
requires:
  - phase: 05-01
    provides: Touch drag selection for mobile interactions
  - phase: 05-02
    provides: Network detection and retry mechanisms
provides:
  - PWA service worker with runtime caching for holidays API
  - Add-to-Home-Screen capability via manifest.json
  - Offline viewing of cached holidays and vacation data
  - CacheFirst strategy for holiday API (30-day cache)
  - StaleWhileRevalidate for static assets
affects: [Phase 6 deployment, any offline-first features]

# Tech tracking
tech-stack:
  added: [vanilla service worker, PWA manifest]
  patterns: [runtime caching strategies, production-only SW registration]

key-files:
  created:
    - public/sw.js
    - public/manifest.json
    - components/ServiceWorkerRegistration.tsx
  modified:
    - app/layout.tsx

key-decisions:
  - "Manual vanilla JS service worker instead of Serwist build plugin (Next.js 16 Turbopack compatibility)"
  - "CacheFirst for holidays API (data rarely changes)"
  - "StaleWhileRevalidate for static assets (serve cached, update background)"
  - "Service worker disabled in development (NODE_ENV check)"
  - "Supabase calls intentionally NOT cached (mutations stay online-only)"

patterns-established:
  - "Production-only SW registration pattern via useEffect NODE_ENV check"
  - "Three-cache strategy: app shell, holidays API, static assets"
  - "Network-first fallback for uncached resources"

# Metrics
duration: 4min 39sec
completed: 2026-02-05
---

# Phase 5 Plan 3: PWA Service Worker & Offline Support Summary

**Vanilla service worker with CacheFirst holidays API caching and PWA manifest for Add-to-Home-Screen**

## Performance

- **Duration:** 4 min 39 sec
- **Started:** 2026-02-05T13:21:19Z
- **Completed:** 2026-02-05T13:25:58Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Service worker caches holiday API responses for offline viewing
- PWA manifest enables mobile users to install app to home screen
- StaleWhileRevalidate caching for static assets (JS/CSS/images/fonts)
- App shell precaching for offline navigation
- Service worker automatically disabled in development mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Serwist and create service worker** - `e06cfbb` (feat)
2. **Task 2: Service worker with runtime caching** - `94af608` (chore)
3. **Task 3: PWA manifest and metadata** - `7924b17` (feat)

## Files Created/Modified
- `public/sw.js` - Vanilla JS service worker with three caching strategies (CacheFirst for holidays, StaleWhileRevalidate for assets, Network-first for API)
- `public/manifest.json` - PWA manifest with Bulgarian metadata, theme color #2563eb, standalone display mode
- `components/ServiceWorkerRegistration.tsx` - Client component registering SW in production only
- `app/layout.tsx` - Added manifest link, themeColor, appleWebApp metadata, and ServiceWorkerRegistration component
- `package.json` - Added Serwist-related packages (removed during migration to vanilla SW)

## Decisions Made

**1. Vanilla JS service worker instead of Serwist build plugin**
- **Rationale:** @serwist/next doesn't support Next.js 16 Turbopack, @serwist/turbopack is experimental and non-functional
- **Trade-off:** Manual SW means no automatic precache manifest generation, but simpler setup and full control
- **Impact:** Service worker still achieves all caching goals without build plugin complexity

**2. CacheFirst for holiday API**
- **Rationale:** Holiday data changes at most once per year, perfect for aggressive caching
- **Expiration:** 30 days max age (holidays won't change within a month)
- **Fallback:** Existing static JSON fallback from Plan 01-01 provides additional safety net

**3. StaleWhileRevalidate for static assets**
- **Rationale:** Serve cached version immediately for speed, update in background for freshness
- **Assets:** JS bundles, CSS, images (png/jpg/svg), fonts (woff/woff2)
- **Expiration:** 7 days max age with 50 entry limit

**4. Supabase calls NOT cached**
- **Rationale:** Per CONTEXT.md offline mode is view-only - mutations must stay online-only
- **Pattern:** Service worker Network-first strategy for all non-cached resources (includes Supabase)
- **Data safety:** localStorage fallback from Plan 04-03 handles offline vacation data viewing

**5. Service worker disabled in development**
- **Implementation:** `process.env.NODE_ENV !== 'production'` check in ServiceWorkerRegistration
- **Rationale:** Prevents stale asset issues during dev, SW only active in production builds
- **Safety:** Double guard (component check + SW registration check)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Migrated from Serwist build plugin to vanilla service worker**
- **Found during:** Task 2 (Next.js config with Serwist plugin)
- **Issue:** @serwist/next incompatible with Next.js 16 Turbopack, @serwist/turbopack experimental and non-functional
- **Fix:** Removed all Serwist build packages, wrote manual vanilla JS service worker with same caching strategies
- **Files modified:** next.config.ts (removed withSerwist wrapper), public/sw.js (created vanilla implementation), app/sw.ts (deleted TypeScript source)
- **Verification:** Build passes, sw.js generated at public/sw.js, caching strategies match plan requirements
- **Committed in:** 94af608 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Migration from Serwist to vanilla SW was necessary for Next.js 16 compatibility. All plan requirements met (CacheFirst for holidays, StaleWhileRevalidate for assets, PWA manifest). No scope creep.

## Issues Encountered

**Serwist + Next.js 16 Turbopack incompatibility**
- Attempted: @serwist/next (requires webpack), @serwist/turbopack (import error)
- Root cause: Next.js 16 defaults to Turbopack, Serwist plugin ecosystem not yet compatible
- Resolution: Manual vanilla JS service worker achieves same caching goals without build plugin
- Outcome: Simpler implementation, full control over caching logic, no external build dependencies

**TypeScript in service worker context**
- Initial approach used TypeScript (app/sw.ts) with Serwist type imports
- Issue: Service workers must be compiled JavaScript at public/sw.js
- Resolution: Direct vanilla JS implementation at public/sw.js, removed TypeScript source file

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 6 (Testing & Launch):**
- Service worker caches holidays API for offline viewing
- PWA manifest enables mobile installation
- App works offline with cached content (view-only per CONTEXT.md)
- Network detection (Plan 05-02) + SW caching create seamless offline experience

**Verification checklist for production:**
- [ ] Service worker registers in production build (`npm run build && npm start`)
- [ ] DevTools > Application > Service Workers shows active worker
- [ ] DevTools > Application > Manifest shows valid manifest
- [ ] Toggle offline mode: holidays still load from cache
- [ ] Mobile Chrome/Safari: "Add to Home Screen" prompt appears
- [ ] Development mode: no service worker registered (check console logs)

**No blockers.** Phase 5 complete after Plan 05-04 (Mobile Responsive Design Polish).

---
*Phase: 05-ux-polish-mobile-optimization*
*Completed: 2026-02-05*
