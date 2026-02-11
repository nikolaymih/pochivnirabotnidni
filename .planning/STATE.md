# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-18)

**Core value:** Users can see all Bulgarian holidays for the year AND track their paid vacation days in one place, with history.
**Current focus:** Phase 5.3 complete — Multi-Year Vacation History & 2-Year Carryover

## Current Position

Phase: 5.3 of 7 (Multi-Year Vacation History & 2-Year Carryover per Bulgarian Labor Law - INSERTED)
Plan: 3 of 3 complete
Status: ✅ Complete
Last activity: 2026-02-11 — Quick task 7: Show login prompt modal when anonymous users add vacation

Progress: [████████░░] 82% (29 of 35 plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 26
- Average duration: 1 min 53 sec
- Total execution time: 0.96 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Static Holiday View | 4 | 5m 7s | 1m 17s |
| 1.1 - Fix Holiday Date Timezone Bug | 1 | 15m (manual) | 15m |
| 2 - Anonymous Vacation Tracking | 1 | 2m 5s | 2m 5s |
| 3 - Full-Year Calendar & Performance | 3 | 10m 17s | 3m 26s |
| 4 - Authentication & Cross-Device Sync | 4 | 9m 3s | 2m 16s |
| 5 - UX Polish & Mobile Optimization | 3 | 8m 3s | 2m 41s |
| 5.1 - UX Infrastructure & Feedback Loop | 4 | 9m 56s | 2m 29s |
| 5.2 - SEO Improvements & Layout Restructuring | 3 | 6m 38s | 2m 13s |
| 5.3 - Multi-Year Vacation History & 2-Year Carryover | 3 | 4m 6s | 1m 22s |

**Recent Trend:**
- Last 5 plans: 05.2-03 (51s), 05.2-04 (2m 36s), 05.3-01 (1m 53s), 05.3-02 (1m 28s), 05.3-03 (45s)
- Trend: Fast execution for focused plans (under 3 minutes)

*Updated after each plan completion*

## Accumulated Context

### Roadmap Evolution

- **2026-02-09:** Phase 05.3 inserted after Phase 5.2 (INSERTED) - Multi-year vacation history and 2-year carryover per Bulgarian labor law
  - Users need to see vacation history when navigating to previous years (calendar + Отпуска summary)
  - Unused vacation days carry over automatically to next year
  - Bulgarian Кодекс на труда: carried-over vacation expires after 2 years (e.g., 2024 vacation usable until 31.12.2026)
  - Summary must show breakdown: current year allocation + carried from each prior year with expiry status
  - Impact: Requires per-year vacation data persistence and year navigation in calendar

- **2026-02-07:** Phase 5.2 inserted after Phase 5.1 (INSERTED) - SEO Improvements & Layout Restructuring
  - User identified SEO metadata improvements needed for page title and description
  - Extract repeated text strings to reusable constants (page.tsx has duplicated content)
  - Move VacationSummary from header to calendar top - header should only contain auth UI
  - Add left sidebar with official holiday list and school vacation periods from API
  - Reduce calendar dimensions: max-width 650px, max-height 320px per month
  - Left sidebar responsive behavior: below right sidebar on mobile, above calendar
  - Impact: Content and layout improvements before Phase 6 testing

- **2026-02-06:** Phase 5.1 inserted after Phase 5 (INSERTED) - UX Infrastructure & Feedback Loop
  - User wants to improve design quality before Phase 6
  - Establish Coffee HTML Style Guide as visual baseline
  - Integrate browser agent for UI rendering and inspection
  - Integrate ChunkHound for frontend codebase indexing
  - Define formal UX critique protocol (observations only, no solutions)
  - Hard constraint: NO new features, NO behavioral changes, NO UX improvements beyond tooling
  - Impact: Phase 6 cannot begin until UX infrastructure is verified and ready

- **2026-01-25:** Phase 1.1 inserted after Phase 1 (URGENT) - Fix Holiday Date Timezone Bug
  - User reported December 31st showing as "Нова година" when it shouldn't be
  - Root cause: timezone conversion bug in date parsing (toISOString shifted dates)
  - Fix: Use API dates directly, don't convert to UTC for date-only values
  - Impact: Critical - ensures holidays display on correct dates

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**From 01-01 (Holiday Data Layer):**
- Use parseISO() for all date parsing to prevent Safari incompatibility
- Store dates as ISO strings (YYYY-MM-DD) without time component per TECH-07
- 24-hour cache for OpenHolidays API to reduce external dependency
- Static JSON fallback ensures calendar never breaks from API downtime

**From 01-02 (Calendar UI):**
- Use getCurrentDate() with startOfDay() for Safari-safe today calculation
- Convert getDay() Sunday-first to Monday-first (ISO 8601 Bulgarian standard)
- Server Components by default - no interactivity needed yet
- CSS Grid with gridColumnStart for correct first day positioning

**From 01-03 (Interactive Tooltips & Integration):**
- Dual interaction pattern: onMouseEnter (desktop hover) + onClick (mobile tap) for tooltip visibility
- Client Component boundary: Only DayTooltip is Client Component, rest remain Server Components
- Bulgarian/Cyrillic localization completed in 01-04
- UI polish and styling improvements deferred to future phase per user note

**From 01-04 (Bulgarian/Cyrillic Localization):**
- Use date-fns bg locale for month and date formatting
- Hard-code Bulgarian UI labels (no i18n library needed for single-language app)
- Capitalize month names using charAt(0).toUpperCase() for proper Bulgarian formatting
- Make year dynamic instead of hardcoded 2026 for future-proof calendar

**From 02-01 (localStorage Foundation & Vacation State):**
- Use typeof window === 'undefined' guard (not window === undefined) per Next.js best practices
- Pointer Events API instead of mouse events for touch device compatibility
- Set-based toggle logic to prevent duplicate vacation dates (VAC-08 compliance)
- Toggle on pointer down for immediate feedback, extend range on pointer up for drag selection
- ISO date strings (yyyy-MM-dd) for vacation dates matching Phase 1 TECH-07 decision
- Default 20 vacation days (Bulgarian standard)

**From 03-01 (Bridge Day Detection):**
- Bridge days only for Tuesday→Monday and Thursday→Friday (4-day weekends)
- Added Monday→Friday and Friday→Monday for 3-day weekend bridges
- Holiday cluster detection suggests connecting workdays between holidays within 3 days
- Jest testing framework with ts-jest preset for TypeScript calendar logic
- Set-based duplicate prevention for bridge day suggestions
- Prevent suggesting bridges on dates that are already holidays

**From 03-02 (MonthGrid Component):**
- MonthGrid is Server Component - receives vacationDates as prop instead of accessing context
- Compact mode by default (text-xs, gap-1, p-2) for 12-month grid scalability
- Single-letter day headers (П, В, С, Ч, П, С, Н) for compact view
- Set-based date lookups for O(1) performance at scale
- Server Component vacation data wiring pattern: props down from client wrapper

**From 03-03 (Full-Year Layout Integration):**
- FullYearCalendar as async Server Component fetches holidays server-side for performance
- Client wrapper (FullYearCalendarWrapper) bridges VacationContext state to Server Component props
- Single-column vertical scroll layout (not responsive grid) for better mobile experience
- Vacation dates take priority over bridge suggestions (blue overrides yellow)
- Bridge days calculated once for all 12 months (performance optimization)
- Desktop: sticky sidebar on right, scrollable calendar on left
- Mobile: summary at top (not sticky), scrollable calendar below
- Server/Client boundary pattern: VacationContext → Client wrapper → Server Component props

**From 01.1 (Timezone Bug Fix - INSERTED):**
- NEVER use toISOString() for date-only values - timezone conversion is inappropriate for calendar dates
- Use API date strings directly when already in correct YYYY-MM-DD format
- Enhanced logging in fetch.ts: raw API response, processed holidays, Dec 31st check
- Removed parseISO import - unnecessary when using dates directly from API
- Pattern established: Don't over-process correctly formatted data from external APIs

**From 04-02 (Auth UI):**
- AuthProvider wraps entire app in layout.tsx (app-wide scope)
- VacationProvider stays in page.tsx (component-level scope) to prevent re-initialization on auth changes
- Context nesting: AuthProvider (layout) > VacationProvider (page) > components
- Avatar display: photo URL if exists, else initials with colored background
- Hash-based color generation uses 7 accessible colors (red, amber, emerald, blue, violet, pink, cyan)
- Initials follow Google pattern: first + last name letters, fallback to email
- Loading skeleton shows 32px gray circle during auth initialization
- Click outside dropdown to close (useEffect with document listener)

**From 04-03 (Data Sync):**
- VacationContext is auth-aware: anonymous users use localStorage, authenticated users use Supabase
- Debounced sync to Supabase (1.5s) prevents excessive database writes during rapid interactions
- Auth-aware data layer pattern: `isAuthenticated ? cloudData : localStorageData`
- Dual write pattern: always update localStorage (fallback) + Supabase (if authenticated)
- Automatic localStorage → Supabase migration on first sign-in with conflict detection
- Migration state machine: loading → migrating → (conflict | complete)
- Conflict resolution: Supabase totalDays is authoritative, vacation dates merged via Set union
- MigrationReview is blocking modal overlay (z-50, bg-black/50) until user resolves conflict
- Silent failure mode: sync errors logged to console.error, never shown to user (per CONTEXT.md)
- VacationContextType interface unchanged (backward compatible with existing components)

**From 04-04 (Vacation Rollover):**
- Rollover calculation fetches previous year data from Supabase, calculates unused days
- Rollover returns null if no previous year data or zero unused days
- VacationContext extended with `rollover` and `isAuthenticated` fields (backward compatible additive interface)
- Rollover calculation runs once after cloud data loads (not on every render)
- VacationSummary shows rollover breakdown for authenticated users: "20 + 5 = 25"
- New rollover row: "Прехвърлени від {year}: X дни" with purple text
- Remaining days and percentage calculations use effectiveTotal (totalDays + rolloverDays)
- Anonymous users see ZERO rollover UI - not grayed out, completely invisible per CONTEXT.md
- All rollover UI gated by triple check: `isAuthenticated && rollover && rolloverDays > 0`
- Additive interface extension pattern: existing consumers ignore new optional fields via destructuring

**From 05-01 (Touch Drag Selection & Accessible Touch Targets):**
- MonthGrid converted from Server Component to Client Component for pointer event state support
- Drag selection state machine: isDragging (boolean), dragMode (add/remove based on first cell), dragStartDate (string | null)
- touch-action:none applied ONLY to individual clickable day cells, NOT grid container (prevents page scroll blocking)
- 44px minimum touch targets (WCAG 2.5.5) with flex centering maintains compact visual appearance
- Brief highlight flash on tap (150ms) with highlightTimerRef and useEffect cleanup prevents memory leaks
- Document-level pointerup listener catches drag-end outside calendar bounds
- Drag mode determined by first cell's current state: selected = remove mode, unselected = add mode
- Holidays remain non-clickable and non-draggable (existing isClickable logic preserved)
- Pointer event handlers flow: FullYearCalendarWrapper (state) → FullYearCalendar (props) → MonthGrid (UI)

**From 05-02 (Network Offline Support):**
- fetchWithRetry retries 3 times with exponential backoff (1s, 2s, 4s) for retryable HTTP errors (503, 504, 429)
- Manual retry implementation (NOT fetch-retry npm package) avoids CommonJS/ESM compatibility issues with Next.js
- Network detection uses navigator.onLine for offline (reliable) + verification fetch for online (prevents false positives)
- useNetworkState hook verifies connectivity with HEAD request to /api/health endpoint (5s timeout)
- Toast notifications positioned bottom-center with 80px marginBottom to avoid Safari mobile bottom UI
- NetworkStatus is side-effect-only component (renders null, only runs toast effects)
- Toast only on state transitions (offline→online, online→offline), not on initial page load (useRef tracking)
- Supabase sync intentionally NOT using fetchWithRetry (has own error handling, debounced pattern would conflict)
- Retry chain for holiday fetch: fetchWithRetry (3 attempts) → static JSON fallback

**From 05-03 (PWA Service Worker & Offline Caching):**
- Vanilla JS service worker (NOT Serwist build plugin) due to Next.js 16 Turbopack incompatibility
- CacheFirst strategy for openholidaysapi.org with 30-day max age (holidays rarely change)
- StaleWhileRevalidate for static assets (js/css/images/fonts) with 7-day max age
- Network-first for everything else (Supabase, API calls, navigation) - no caching of mutations
- Three-cache architecture: app-shell-cache (precached assets), holidays-api-cache, static-assets
- Service worker disabled in development (NODE_ENV !== 'production' check in registration component)
- PWA manifest with Bulgarian metadata, theme color #2563eb, standalone display mode
- ServiceWorkerRegistration component registers SW client-side in production only
- iOS PWA support via appleWebApp metadata (capable, statusBarStyle, title)

**From 05.1-01 (Coffee Theme Tokens & Nunito Font):**
- Use @theme (not @theme inline) for Tailwind utility class generation (bg-espresso, text-caramel, etc.)
- Nunito font with latin + cyrillic subsets and display:swap for Bulgarian Cyrillic support
- Dark mode removed entirely - Coffee theme is light-only
- Calendar color aliases: holiday (#B5651D), bridge (#EB9605), vacation (#C68E17) with matching -bg variants
- Border radius tokens: sm (8px), md (12px), lg (16px), xl (24px) for consistent rounding
- PWA theme color updated from blue (#2563eb) to caramel (#C68E17) to match Coffee theme

**From 05.1-03 (Tool Installation & Hook Configuration):**
- agent-browser v0.9.1 installed globally (command: `agent-browser`, NOT `ab`)
- ChunkHound installed globally (user installed manually after npm/pip failed). MCP config active in .claude/settings.json
- Pre-commit hook at .git/hooks/pre-commit is advisory only (always exits 0, never blocks commits)
- Color compliance check uses grep patterns, not ChunkHound dependency - works immediately
- .git/hooks/ not tracked by git - must be recreated on fresh clone (see 05.1-03-SUMMARY.md)

**From 05.1-04 (UX Critique Protocol & Token Mapping):**
- UX critique protocol documented at .planning/ux-critique-protocol.md
- Critique output strictly forbids solutions, implementations, or recommendations (observations only)
- Tool availability: agent-browser INSTALLED, ChunkHound INSTALLED (user manually installed post-plan)
- Coffee token mapping at .planning/coffee-token-mapping.md covers all 10 migrated components
- Critiques directory created at .planning/critiques/ for Phase 6 critique documents

**From 05.1-02 (Coffee Color Migration):**
- All Tailwind default color classes replaced with Coffee theme tokens across every component
- Legacy CalendarDay.tsx also migrated for consistency even though unused in current app flow
- PWA manifest updated: background=#FAF8F5 (Foam), theme=#C68E17 (Caramel)
- Color token mapping: holidays=cinnamon/holiday-bg, bridges=honey/bridge-bg, vacation=caramel/vacation-bg, weekends=cream/weekend-bg
- UI text hierarchy: espresso (headings/values), coffee (labels), cappuccino (secondary)
- Interactive elements: caramel primary, cinnamon hover, oat-milk disabled
- Error/success semantic: text-error, text-success instead of text-red-600/text-green-600

**From 05.2-01 (Shared Constants & Dynamic SEO):**
- Centralized Bulgarian text constants in lib/constants.ts for single source of truth
- Flat named exports (not nested objects) for tree-shaking optimization
- PAGE_TITLE and META_DESCRIPTION are functions accepting year parameter for dynamic content
- LEGEND_LABELS exported as const for type safety with TypeScript const assertion
- generateMetadata() function in layout.tsx replaces static metadata export
- Dynamic year calculation using date-fns getYear() eliminates hardcoded "2026" in SEO metadata
- Pattern established: function signatures for dynamic constants, const assertion for static objects

**From 05.2-03 (Teal Color Tokens and Complete Legend):**
- School holiday color tokens: --color-teal (#8B6CA7 warm purple) and --color-school-bg (#EDE0F5 light lavender) in globals.css Calendar Aliases
- Color changed from teal (#4A9B8E) to purple (#8B6CA7) because teal/blue mixed with green vacation color (#2E8B57)
- Holiday legend swatch changed from light bg-holiday-bg to solid bg-cinnamon with white "П" text
- Legend swatch now matches actual calendar cell appearance (not just color reference)
- Legend entries ordered: Официален празник > Отпуска > Предложение за почивка > Неучебни дни > Уикенд
- Legend has 5 day types: Официален празник, Отпуска, Предложение за почивка, Неучебни дни, Уикенд (Текущ ден removed)
- "Лична почивка" renamed to "Отпуска" everywhere (Legend, VacationSummary, constants)
- School holiday visual identity: light lavender background (bg-school-bg) with purple border (border-teal)

**From 05.2 R4 Polish (Post-UAT cosmetic fixes):**
- Three-column desktop layout: center column fixed at w-[650px] matching calendar, justify-center distributes extra space as equal margins
- Column gap between sidebars and center: 70px (gap-[70px])
- Desktop header margin-bottom: 35px (mb-[35px])
- Extended description paragraph added below PAGE_DESCRIPTION (PAGE_DESCRIPTION_EXTENDED in constants.ts)
- Year selector arrows: cursor-pointer on hover
- Bridge day numbers: text-black (was text-bridge)
- Vacation day numbers: text-white (was text-vacation/green)
- Cinnamon color: #6F4E37 (was #B5651D), holiday color updated to match
- Vacation color: --color-vacation stays #2E8B57 (green text), --color-vacation-bg changed to #BDD7DE (light teal bg, was #D4EDDA)
- Vacation day numbers: text-black in calendar cells
- Legend background: bg-white with border-latte and shadow-sm (matches other sidebar cards)
- Page title: removed "неучебни" → "Празнични и неработни дни през {year} година"

**From 05.2-04 (Holiday Color Fixes, School Holidays, Weekend Transfer):**
- Desktop-only tooltip pattern: hidden lg:block CSS class prevents mobile interaction, no onClick handler
- Holiday cells use solid bg-cinnamon text-white (matching legend), not light bg-holiday-bg
- Weekend holiday transfer: weekend holidays do NOT show on weekend day, transfer to Monday with "(почивен ден)" tooltip
- Day type priority reordered: Holiday > Vacation > School Holiday > Bridge > Weekend (vacation now takes priority over school)
- Vacation + school holiday overlap: vacation color wins with small teal dot indicator in corner
- Calendar dimension constraints: max-w-[650px] max-h-[320px] per month for compact 12-month layout
- Weekend transfer logic: Monday checks 2 days back (Sat) and 1 day back (Sun) for holidays to substitute
- displayAsHoliday boolean combines regular holidays and transferred holidays for unified rendering logic
- isClickable excludes both regular and transferred holidays (non-selectable for vacation marking)
- schoolHolidayDates prop is optional (?) to prevent TypeScript errors before FullYearCalendar wired

**From 05.3-01 (Multi-Year Rollover Foundation):**
- CarryoverBucket interface tracks individual year's carryover: year, rolloverDays, expiresAt, isExpired
- calculateRollover() fetches up to 2 previous years (Bulgarian labor law: 2-year carryover expiration)
- Expiry calculation: allocation year + 2 years, checked with isAfter(today, parseISO(expiresAt))
- startOfDay() normalization prevents timezone-dependent expiry status shifts
- RolloverResult.buckets array contains all carryover buckets sorted newest first
- RolloverResult.totalRollover sums only non-expired buckets for accurate available days
- Legacy fields maintained (rolloverDays = totalRollover) for backward compatibility with existing VacationSummary UI
- Sequential fetch pattern for 2 years (clearer than Promise.all for small loop)

**From 05.3-02 (Year-Aware Vacation Context with Read-Only Historical Mode):**
- VacationProvider accepts optional year prop (defaults to current calendar year)
- VacationContext derives displayYear and isCurrentYear from year prop
- fetchVacationData uses displayYear to load correct year's vacation data (not hardcoded currentYear)
- calculateRollover uses displayYear to compute rollover FOR displayed year (e.g., viewing 2024 → rollover from 2023+2022)
- Migration only runs for current year (isCurrentYear guard prevents historical year migration)
- Debounced sync only for current year (isCurrentYear guard prevents writes to historical years)
- FullYearCalendarWrapper passes vacationDates unconditionally (VacationContext now loads historical data)
- Interaction handlers (onToggleDate, onPointerDown, etc.) undefined when viewing historical years
- Year prop flow: URL param → page currentYear → VacationProvider year → VacationContext displayYear
- Pattern established: year-aware context with read-only guard (if (!isCurrentYear) return before mutations)

**From 05.3-03 (Multi-Bucket Carryover Breakdown):**
- VacationSummary uses rollover?.totalRollover instead of rollover?.rolloverDays (correct source excluding expired buckets)
- Multi-bucket breakdown section shows current year allocation separately from carryover buckets
- Breakdown displayed when rollover.buckets.length > 0 (more accurate than checking rolloverDays > 0)
- Active carryover buckets: "Прехвърлени от 2025 (важи до 2027): 5" in text-mocha
- Expired carryover buckets: "Прехвърлени от 2024 (изтекли): 3" with line-through and text-oat-milk
- Extract year from expiresAt with .slice(0, 4) for clean display: "важи до 2027" not "важи до 2027-12-31"
- Border-top separator creates clear visual separation between total line and breakdown section
- Breakdown uses Coffee theme tokens: mocha (active), oat-milk (expired), cappuccino (header), espresso (values)
- Compliance with Bulgarian labor law notification requirement (Кодекс на труда Art. 173 - employer must notify employees of carryover including expiry dates by Jan 31 each year)

**From Quick Task 1 (Remove Merge Option from Migration Modal):**
- Migration modal shows only 2 options: Keep Cloud (discard local) or Keep Local (discard cloud)
- Removed broken merge logic that combined totalDays from cloud with union of vacationDates (created invalid state)
- MigrationResult conflict type no longer includes mergedDates field
- Users must pick one complete, consistent state instead of hybrid merge
- Modal heading: "Конфликт в данните" (more accurate than "Обединяване на данни")

**From PROJECT.md:**
- Supabase for PostgreSQL (free tier, good DX, includes auth helpers) - Pending
- Hybrid local storage + auth (quick start OR cross-device sync) - Pending
- OpenHolidays API vs scraping (reliable structured data) - Implemented in 01-01
- Full year view in v1 (core differentiator) - ✓ IMPLEMENTED in 03-03 (12-month view with bridge days)
- 50% test coverage threshold (meaningful tests only) - Pending

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 1 Critical Pitfalls to Address:**
- ✓ Safari date parsing incompatibility — RESOLVED in 01-01 (parseISO pattern established)
- ✓ Timezone assumptions EET/EEST vs UTC — RESOLVED in 01-01 (ISO date strings without time)
- Supabase free tier inactivity pausing (implement health check cron) - Deferred to Phase 4
- ✓ OpenHolidays API coupling — RESOLVED in 01-01 (24hr cache + static fallback)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Remove broken merge option from migration modal — keep only Cloud vs Local | 2026-02-10 | fbd7799 | [1-remove-merge-option](./quick/1-remove-merge-option-from-migration-modal/) |
| 2 | Update initial page text with new Bulgarian copy | 2026-02-10 | 23869d2 | [2-update-initial-page-text-with-new-bulgar](./quick/2-update-initial-page-text-with-new-bulgar/) |
| 3 | Change description text color to espresso for better readability | 2026-02-11 | ebe808a | [3-make-header-text-after-page-title-black-](./quick/3-make-header-text-after-page-title-black-/) |
| 4 | Add tooltips for all legend day types (vacation, bridge, school holiday) with mobile click-away | 2026-02-11 | 1a62dce | [4-add-tooltips-for-all-legend-day-types-an](./quick/4-add-tooltips-for-all-legend-day-types-an/) |
| 5 | Show tooltip only for holidays and multi-type overlap days | 2026-02-11 | 35bd9f3 | [5-show-tooltip-only-for-holidays-and-multi](./quick/5-show-tooltip-only-for-holidays-and-multi/) |
| 6 | Update PAGE_DESCRIPTION_HISTORY with new Bulgarian copy | 2026-02-11 | 6becd85 | [6-update-page-description-history-with-new](./quick/6-update-page-description-history-with-new/) |
| 7 | Show login prompt modal when anonymous users add vacation | 2026-02-11 | 7214ddd | [7-show-login-prompt-modal-when-anonymous-u](./quick/7-show-login-prompt-modal-when-anonymous-u/) |

## Session Continuity

Last session: 2026-02-11
Stopped at: Quick task 7 complete — Show login prompt modal when anonymous users add vacation
Resume file: None
Next: Phase 5.2 gap closure (plans 05.2-07 through 05.2-09) or Phase 6 (Testing & Quality Gates)
