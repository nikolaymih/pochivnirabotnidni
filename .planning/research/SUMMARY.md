# Project Research Summary

**Project:** Bulgarian Holiday Calendar with Personal Vacation Tracking
**Domain:** Calendar/Vacation Tracking Web Application
**Researched:** 2026-01-18
**Confidence:** HIGH

## Executive Summary

This is a mobile-first Bulgarian holiday calendar with personal vacation tracking, built as a lightweight alternative to enterprise PTO systems. Experts in this domain build these products using server-rendered calendars with minimal JavaScript, treating the full-year view as the critical UX differentiator. The recommended approach is a Next.js App Router application with Server Components for the calendar, custom calendar UI (not libraries like FullCalendar which are 82KB and overkill), and hybrid authentication (localStorage for anonymous users, Supabase for authenticated sync).

The stack is straightforward: Next.js 16 (already configured), date-fns for date manipulation (18KB but tree-shakeable to ~5KB), custom calendar grid with react-day-picker only for date input pickers, and Supabase for backend. This minimalist approach keeps the bundle ~20-30KB vs 80KB+ if using calendar libraries. The critical architecture decision is Server Components for static calendar rendering (zero JS shipped) with Client Components only for interactive elements.

**Key risks are date handling and performance.** Safari date parsing bugs will break the calendar for 30% of mobile users if not caught early - must use date-fns from day one and test in BrowserStack Safari. The full-year view (365 days + events) will collapse performance without virtualization - must implement react-window for year view or default to month view on mobile. Vacation balance calculations at year boundaries are business-critical and must handle carryover, negative balances, and DST transitions correctly. OpenHolidays API coupling requires fallback data and aggressive caching. These pitfalls have clear prevention strategies: use date-fns, test Safari, implement virtualization, cache holidays, and thoroughly test vacation balance edge cases.

## Key Findings

### Recommended Stack

**Core:** Next.js 16 App Router (locked in) with React 19, TypeScript, and Tailwind CSS 4. For dates, use date-fns 4.1.0+ (tree-shakeable, timezone support, 39M weekly downloads). Build a custom calendar component for the 12-month grid view (~5-10KB) rather than using FullCalendar (82KB) or React-Big-Calendar (45KB) which are designed for event management, not static holiday display.

**Core technologies:**
- **date-fns 4.1.0+**: Date manipulation and formatting - modular architecture means you only ship what you use (~2-3KB vs 18KB full package), first-class timezone support in v4, works with native Date objects for best performance
- **Custom calendar + react-day-picker 9.13.0+**: Full-year grid view built custom (total control, minimal bundle), react-day-picker only for date picker inputs - MUST use v9.4.3+ for React 19 compatibility (v8 breaks)
- **Supabase (@supabase/ssr 0.8.0+)**: PostgreSQL + authentication - official Next.js App Router support, cookie-based auth (more secure than localStorage), free tier sufficient for launch (500MB storage)
- **Vitest + Playwright**: Unit tests with Vitest (30-70% faster than Jest, official Next.js recommendation), E2E tests with Playwright for async Server Components and critical flows

**What NOT to use:**
- moment.js (deprecated, 66KB)
- react-day-picker v8.x (breaks with React 19)
- @supabase/auth-helpers-* (deprecated, use @supabase/ssr)
- Redux/Redux Toolkit (overkill for this scope - use React Context or Zustand if needed)

### Expected Features

**Must have (table stakes):**
- View full year calendar (12-month grid) - users expect this from any calendar app
- Official Bulgarian holiday list (2026) - accurate and current from OpenHolidays API
- Mobile-responsive layout - most usage will be mobile, must work on phones
- Simple PTO tracking (mark days as vacation, see remaining balance)
- Today's date indicator - context for "where am I in the year"
- Manual balance adjustment - users need to set their PTO allowance

**Should have (competitive differentiators):**
- Bridge day suggestions - automatically highlight optimal days to take vacation for long weekends (HIGH value, LOW complexity)
- Vacation optimization calculator - "take these 8 days, get 16 days off" recommendations
- Historical year view - track patterns over time once users have tracked 2026
- ICS export - users want holidays in their Google/Outlook calendar
- Remaining workdays counter - "47 workdays left in 2026" insight

**Defer (v2+):**
- Authenticated sync across devices - complex, only add if users explicitly request multi-device
- Multi-year data retention - only add if users heavily use historical view
- Team/group vacation tracking - scope explosion into enterprise leave management
- Approval workflows - transforms simple tracker into HR system
- Multi-country support - focus on Bulgarian holidays, clean architecture makes forking easy later

**Anti-features to avoid:**
- Team/group vacation tracking, approval workflows, automatic PTO accrual, multi-country support, push notifications, social features - these transform a simple personal tracker into complex enterprise software

### Architecture Approach

**Pattern:** Server Component data fetching with Client Component interactivity. Server Components fetch holidays and vacation data close to the database, passing minimal serialized props to Client Components that handle only interactive features (date selection, form inputs). This reduces JavaScript bundle, improves First Contentful Paint, and keeps secrets server-side.

**Major components:**
1. **Calendar View (Server Component)** - Fetches holidays from OpenHolidays API and user vacations from Supabase, renders 12-month grid server-side, passes data as props to virtualized client grid
2. **Vacation Manager (Server Actions)** - CRUD operations for user vacations with Supabase client, RLS enforcement, and cache invalidation via revalidateTag
3. **Holiday API Client (Server-side cached function)** - Fetch holidays from OpenHolidays API with 30-day database cache using `use cache` directive, fallback to static JSON on API failure
4. **Balance Calculator (Pure function)** - Calculate vacation balances, accruals, and rollover - called from Server Components/Actions, handles year boundaries and negative balances
5. **Hybrid Auth (localStorage + Supabase)** - Anonymous users use localStorage, authenticated users sync to Supabase PostgreSQL with migration function on login

**Data flow:**
- Holiday data: OpenHolidays API → Database cache (30-day TTL) → Server Component → Client Component props
- Vacation data (auth): User input → Server Action → Supabase (RLS) → Cache invalidation → Rerender
- Vacation data (anon): User input → Client state → localStorage → Component state update

**Database schema:**
- `vacations` table with RLS policies (user_id, start_date, end_date, days_count, status)
- `vacation_balances` table (user_id, year, total_days, used_days, rollover_days)
- `cached_holidays` table (year, country_code, data JSONB, cached_at)
- `user_settings` table (default_vacation_days, theme, etc.)

### Critical Pitfalls

1. **Safari Date Parsing Incompatibility** - Date strings parsed correctly in Chrome/Firefox fail silently in Safari, returning Invalid Date. Calendar renders blank for 30% of mobile users. **Prevention:** Always use ISO 8601 format with explicit time (`2025-01-15T00:00:00Z`), use date-fns for all date parsing/formatting, test in BrowserStack Safari before deploying. Address in Phase 1 (Foundation) before building calendar UI.

2. **Timezone Assumption (EET/EEST vs UTC)** - Holiday dates shift by 1 day for users, vacation balances calculated incorrectly. Bulgaria is EET (UTC+2) / EEST (UTC+3), so midnight in Bulgaria is 22:00 or 21:00 UTC the previous day. **Prevention:** Store ALL dates as ISO date strings WITHOUT time (`2025-03-01`), use date-fns parseISO() + startOfDay() for display, document timezone handling. Address in Phase 1 (Foundation).

3. **Daylight Saving Time Calculation Bugs** - Vacation balance calculations produce different results when DST transitions occur. Time-based calculations like `(endDate - startDate) / MS_PER_DAY` give 23-hour or 25-hour "days" during DST transitions. **Prevention:** Use date-fns differenceInCalendarDays() not timestamp math, test with DST boundary dates (March 30/31, October 26/27 2025). Address in Phase 2 (Vacation Tracking Core).

4. **Full Year Calendar Performance Collapse** - Rendering 365 day cells + holidays + vacation events = 500+ DOM nodes. Calendar freezes browser for 3-5 seconds on year view. **Prevention:** Implement virtual scrolling for year view (react-window), memoize month components, lazy load months as user scrolls, debounce vacation state updates. Address in Phase 3 (Full Year Calendar).

5. **Supabase Free Tier Surprise Pausing** - Project paused due to 7-day inactivity rule on free tier. Vacation data disappears, users can't log in. **Prevention:** Implement health check endpoint that pings Supabase every 6 days (cron job), add activity monitoring dashboard, document free tier limitations. Address in Phase 1 (Foundation).

6. **Vacation Balance Year Boundary Logic** - User has 10 days vacation remaining on Dec 31, on Jan 1 balance shows 0, 10, or 30 days depending on buggy logic. Carryover rules not implemented. **Prevention:** Store vacation balance as transaction ledger, implement explicit year-end rollover logic with carryover cap, test edge cases (hired Dec 15, negative balances, year boundary crossing). Address in Phase 2 (Vacation Tracking Core).

7. **OpenHolidays API Coupling Without Fallback** - OpenHolidays API goes down, rate limits kick in, or Bulgaria holiday data changes format. App shows blank calendar. **Prevention:** Cache holidays in Supabase on first fetch (invalidate yearly), ship static fallback JSON with 2025-2027 Bulgaria holidays, implement stale-while-revalidate pattern. Address in Phase 1 (Foundation).

8. **Local Storage Sync Conflicts (Offline Edits)** - User edits vacation on phone (offline), edits same vacation on desktop (online). When phone reconnects, one edit is lost or vacation duplicates. **Prevention:** Implement optimistic UI updates with rollback on server conflict, add version or updated_at timestamp, provide conflict resolution UX. Address in Phase 2 (Vacation Tracking Core).

## Implications for Roadmap

Based on research, suggested phase structure prioritizes foundation (date handling, caching, Supabase setup) before features to avoid catastrophic pitfalls. The architecture supports incremental delivery: anonymous mode works before authentication, month view works before year view, basic tracking works before optimization suggestions.

### Phase 1: Foundation & Static Calendar (Weeks 1-2)
**Rationale:** Must establish bulletproof date handling and API caching BEFORE building features. Safari date bugs and OpenHolidays API coupling are project-killers if not addressed early. This phase delivers immediate value (view holidays) with zero authentication friction.

**Delivers:**
- Database schema with RLS policies
- Supabase client setup (browser + server) with auth middleware
- OpenHolidays API client with database caching (30-day TTL) and static fallback JSON
- Date handling utilities using date-fns (all date operations go through these)
- Basic layout/routing structure
- Server-rendered holiday calendar (month view only to start)
- SEO-friendly static holiday pages (`/holidays/2026`)

**Addresses features from FEATURES.md:**
- View full year calendar (month view initially)
- Official Bulgarian holiday list (2026)
- Mobile-responsive layout (Tailwind CSS mobile-first)

**Avoids pitfalls from PITFALLS.md:**
- Pitfall 1 (Safari date parsing) - date-fns from day one, Safari testing in CI
- Pitfall 2 (timezone assumptions) - document date storage format, store as ISO date strings
- Pitfall 5 (Supabase pausing) - health check cron deployed immediately
- Pitfall 7 (API coupling) - fallback data and caching implemented before relying on API

**Uses stack from STACK.md:**
- Next.js 16 App Router with Server Components
- date-fns for date utilities
- Supabase with @supabase/ssr for backend
- Tailwind CSS for styling

**Research flag:** SKIP RESEARCH - Standard Next.js + Supabase patterns, well-documented

### Phase 2: Anonymous Vacation Tracking (Weeks 3-4)
**Rationale:** Deliver core value (track vacation, see balance) without authentication barrier. Proves product value before asking for signup. Build local-first, then add sync later. Must nail vacation balance calculations now - these are business-critical.

**Delivers:**
- localStorage utilities for anonymous data
- Vacation form (Client Component) with date pickers using react-day-picker
- Calendar with user vacation events overlaid on holidays
- Balance display showing total/used/remaining with clear negative balance handling
- Vacation CRUD operations (localStorage-backed)
- Balance calculation logic with comprehensive edge case testing
- Manual balance adjustment with reason tracking

**Addresses features from FEATURES.md:**
- Simple PTO tracking (mark days as vacation, see remaining balance)
- Manual balance adjustment (job changes, yearly reset)
- Visual vacation planning (vacation + holidays together)
- Today's date indicator

**Avoids pitfalls from PITFALLS.md:**
- Pitfall 3 (DST calculation bugs) - use date-fns differenceInCalendarDays(), test DST boundaries
- Pitfall 6 (year boundary logic) - implement transaction ledger, test carryover, negative balances
- Pitfall 8 (sync conflicts) - build version/timestamp foundation for later conflict resolution

**Implements architecture component:**
- Vacation Manager (localStorage version)
- Balance Calculator (pure function with comprehensive tests)

**Research flag:** SKIP RESEARCH - Well-understood domain, patterns documented in vacation tracking app research

### Phase 3: Full-Year View & Bridge Days (Week 5)
**Rationale:** This is the differentiator - full-year overview lets users plan strategically. Bridge day suggestions are HIGH value, LOW complexity. Must address performance proactively since 365 days + events = potential performance cliff.

**Delivers:**
- Custom 12-month calendar grid (Client Component)
- Virtualized rendering with react-window (render only visible months)
- Bridge day visual indicators (highlight days between holidays and weekends)
- Year navigation (2025, 2026, 2027)
- Performance monitoring with Lighthouse CI
- Mobile-optimized year view (switch to list view if needed)

**Addresses features from FEATURES.md:**
- Bridge day indicators (automatically highlight opportunities)
- Visual vacation planning (full year at a glance)

**Avoids pitfalls from PITFALLS.md:**
- Pitfall 4 (calendar performance collapse) - virtualization, memoization, lazy loading from start

**Uses stack from STACK.md:**
- react-window for virtualization
- React.memo and useMemo for optimization
- Custom calendar component (no libraries)

**Research flag:** RESEARCH NEEDED - Virtualized 12-month calendar layout is custom, may need performance tuning research during implementation

### Phase 4: Authentication & Sync (Weeks 6-7)
**Rationale:** Once users see value (Phase 2-3), they'll want multi-device sync. Migration from localStorage to Supabase must be seamless - user doesn't lose vacation data when signing up.

**Delivers:**
- Supabase Auth flow (Google OAuth per requirements)
- Login/signup pages with Server Components
- Migration logic (localStorage → Supabase on first auth)
- Protected routes with middleware
- Server Actions for vacation CRUD (Supabase-backed)
- Conflict detection foundation (updated_at timestamps)
- Realtime sync setup (optional - only if needed for UX)

**Addresses features from FEATURES.md:**
- Authenticated sync across devices
- Historical year view foundation (multi-device means data retention matters)

**Avoids pitfalls from PITFALLS.md:**
- Pitfall 8 (sync conflicts) - version field, conflict detection, conflict resolution UX

**Implements architecture component:**
- Hybrid Auth (localStorage + Supabase)
- Vacation Manager (Supabase version with Server Actions)

**Research flag:** SKIP RESEARCH - Standard Supabase Auth patterns, official docs comprehensive

### Phase 5: Optimization Features (Week 8)
**Rationale:** Users now have data tracked. Deliver "maximize your days off" suggestions - this is the killer feature that transforms utility into value multiplier.

**Delivers:**
- Vacation optimization calculator (suggest best days to take for long weekends)
- Remaining workdays counter (excluding weekends, holidays, planned vacation)
- Historical year view (archive 2025, switch between years)
- ICS export for calendar integration

**Addresses features from FEATURES.md:**
- Vacation optimization calculator ("take these 8 days, get 16 off")
- Remaining workdays counter
- Historical year view (2025 archive)
- ICS export (personal calendar export)

**Research flag:** RESEARCH NEEDED - Vacation optimization algorithm may need research on best practices for bridge day detection and multi-week planning

### Phase 6: Polish & Testing (Week 9-10)
**Rationale:** Ensure all pitfalls addressed, mobile experience polished, 50% meaningful test coverage achieved per requirements.

**Delivers:**
- Comprehensive test suite (Vitest for unit/component, Playwright for E2E)
- Mobile gesture support (swipe between months)
- Safari testing in BrowserStack (automated in CI)
- Performance budgets enforced (year view <200ms, month view <50ms)
- Accessibility audit (keyboard navigation, screen reader testing)
- SEO optimization (meta tags, Open Graph for social sharing)

**Avoids all remaining pitfalls:**
- Comprehensive Safari testing, DST edge case coverage, performance regression tests, API failure simulation

**Research flag:** SKIP RESEARCH - Standard testing practices, Vitest + Playwright setup well-documented

### Phase Ordering Rationale

**Why this order:**
1. **Foundation first (Phase 1)** prevents catastrophic pitfalls - Safari date bugs and API coupling are project-killers if not addressed before building features
2. **Anonymous mode before auth (Phase 2 before Phase 4)** maximizes early user value and proves product-market fit before asking for signup
3. **Month view before year view (Phase 1-2 before Phase 3)** delivers working calendar early, year view is enhancement that requires performance work
4. **Tracking before optimization (Phase 2 before Phase 5)** - users need data before optimization suggestions make sense
5. **Features before polish (Phase 5 before Phase 6)** - validate product value before investing in perfect UX

**Why this grouping:**
- Phase 1 (Foundation) groups all infrastructure - dates, caching, Supabase, routing - because these are co-dependent and all needed for features
- Phase 2 (Anonymous Tracking) groups localStorage-backed features as cohesive unit - form, balance, storage
- Phase 3 (Year View) isolates performance-critical feature for focused optimization
- Phase 4 (Auth) groups all authentication concerns - login, migration, sync
- Phase 5 (Optimization) groups "nice to have" features that add value once core works

**How this avoids pitfalls:**
- Phases 1-2 address 7 of 8 critical pitfalls before any user-facing features ship
- Performance work (Phase 3) happens before users expect year view to work
- Sync conflicts (Phase 4) addressed when adding multi-device, not after users report data loss
- Testing (Phase 6) validates all pitfall prevention strategies work

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Full-Year View):** Custom virtualized 12-month calendar layout - may need performance tuning research, edge cases with different screen sizes
- **Phase 5 (Optimization Features):** Vacation optimization algorithm - research optimal bridge day detection, multi-week planning strategies

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Next.js + Supabase setup is well-documented, date-fns usage patterns clear
- **Phase 2 (Anonymous Tracking):** localStorage CRUD is standard, balance calculations straightforward with tests
- **Phase 4 (Authentication):** Supabase Auth with Next.js App Router has official guides and examples
- **Phase 6 (Polish & Testing):** Vitest + Playwright setup documented in Next.js official docs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified with official docs and current sources. Next.js 16, date-fns 4, Supabase @supabase/ssr, Vitest/Playwright are current best practices as of 2026-01-18. Version compatibility confirmed. |
| Features | MEDIUM | Table stakes features well-researched from competitor analysis and user reviews. Differentiators (bridge days, optimization) validated as high-value from vacation planning sources. Anti-features identified from PTO software complaints. Some uncertainty on which features users will actually request post-launch. |
| Architecture | HIGH | Server Component + Client Component pattern is official Next.js recommendation. Supabase multi-client pattern documented in official guides. Caching strategies verified with Next.js 15+ docs. Database schema based on standard vacation tracking patterns. Performance optimizations validated with React Window docs and FullCalendar performance issues. |
| Pitfalls | HIGH | All pitfalls verified with multiple sources including real-world bug reports, technical documentation, and 2025/2026 best practices. Safari date parsing issues confirmed across multiple developer blog posts. DST calculation bugs documented in academic research. Vacation balance edge cases validated with accounting guides. |

**Overall confidence:** HIGH

Research is comprehensive and actionable. Stack choices are current and verified. Features are prioritized based on competitor analysis and user feedback. Architecture patterns are well-documented. Pitfalls have clear prevention strategies with specific phase assignments.

### Gaps to Address

**Limited user validation:** Feature prioritization based on competitor research and reviews, not direct user interviews. During planning/execution, validate assumptions with:
- User testing of bridge day suggestions (do users understand the value?)
- User research on mobile vs desktop usage patterns (impacts year view vs month view default)
- User feedback on anonymous vs authenticated preference (impacts Phase 2/4 priority)

**OpenHolidays API reliability unknown:** No SLA, rate limits, or stability data found. During Phase 1 implementation:
- Monitor API response times and error rates for first 2 weeks
- Test API failover to static fallback data
- Document API contact/support if issues arise

**Vacation balance business rules undefined:** Research shows common patterns but project-specific rules needed. Before Phase 2:
- Define carryover limits (e.g., max 5 days roll to next year)
- Define negative balance policy (allowed? warned? blocked?)
- Define prorated accrual for mid-year hires (or defer to v2)
- Document in `VACATION_RULES.md` for reference during implementation

**Performance budget for year view uncertain:** React Window examples show virtualization works, but specific performance targets for 365 days + events not benchmarked. During Phase 3:
- Establish baseline with 50 vacation entries, 20 holidays
- Set performance budget: year view <200ms initial render, <50ms scroll frame
- Test on target devices (iPhone 13, low-end Android)

**Regional holiday complexity:** Research focused on national holidays, but Bulgaria has region-specific observances. Defer to post-launch:
- If users request regional filtering, add as v1.x feature
- Architecture supports adding `region` field to holiday data
- Not blocking for launch

## Sources

### Primary (HIGH confidence)

**Stack research:**
- Next.js Official Documentation - App Router patterns, Server Components, caching with `use cache`
- Supabase Official Documentation - Next.js App Router integration, @supabase/ssr setup
- date-fns Official Documentation - v4.0 timezone support, tree-shaking, API reference
- Bundlephobia - Bundle size analysis for date-fns, react-day-picker, calendar libraries
- npm trends - Download comparison for date-fns vs dayjs vs luxon vs moment

**Features research:**
- Vacation Tracker Reviews (Capterra 2026) - User complaints and feature requests
- PTO Tracking Software Comparison (BuddyPunch, Connecteam, PeopleManagingPeople) - Feature analysis
- Holiday calendar apps (Google Play, App Store) - User expectations and table stakes
- Bridge days and vacation optimization (motel-one.com, limehome.com, zep.de) - 2026 vacation planning guides

**Architecture research:**
- Next.js App Router Advanced Patterns (Medium 2026) - Server-first architecture
- Google Calendar System Design (WildWildTech) - Calendar application patterns
- Supabase Auth with Next.js (Supabase Docs) - Server-side auth setup
- Next.js Caching and Revalidating (Official Docs) - `use cache` directive, tag-based invalidation
- React Window vs React Virtualized (DhiWise) - Virtualization performance comparison

**Pitfalls research:**
- Safari Date Parsing Differences (Medium, javaspring.net) - Real-world bug reports
- Date and Time Bugs Research Paper (MSR 2025) - Empirical study of date bugs in OSS
- Vacation Accrual Guide (Finoptimal 2025) - Business logic patterns and edge cases
- Offline-first Frontend Apps (LogRocket 2025) - IndexedDB and sync patterns
- Supabase Free Tier Limits (freetiers.com, metacto.com) - Inactivity pausing documentation

### Secondary (MEDIUM confidence)

- Builder.io React Calendar Components (2025) - Library comparison, but biased toward their tools
- DEV: State Management 2025 - Community opinions on Context vs Zustand vs Redux
- Vitest vs Jest (Medium 2025) - Performance benchmarks, may vary by project
- FullCalendar Performance Issues (GitHub) - User reports of performance problems with large datasets

### Tertiary (LOW confidence, needs validation)

- Calendar App Market Size (Verified Market Reports) - Market trends, but generic
- 11 Best Calendar Apps (efficient.app) - Recommendation list, unclear evaluation criteria
- Single Page Application SEO - General guidance, not calendar-specific

---
*Research completed: 2026-01-18*
*Ready for roadmap: yes*
