# Roadmap: Pochivni Rabotni Dni

## Overview

This roadmap delivers a Bulgarian holiday calendar with personal vacation tracking in six phases. We start with bulletproof date handling and static holiday view to avoid Safari/timezone pitfalls, then layer on anonymous vacation tracking (localStorage), full-year calendar view with bridge day suggestions, Google authentication with cross-device sync, mobile UX polish, and finally comprehensive testing to hit 50% meaningful coverage. The journey prioritizes immediate user value (see holidays, track vacation) before asking for signup, with performance and quality baked in throughout.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Static Holiday View** - Establish date handling, API integration, and basic calendar
- [x] **Phase 1.1: Fix Holiday Date Timezone Bug (INSERTED)** - Critical timezone fix for date parsing
- [ ] **Phase 2: Anonymous Vacation Tracking** - Core vacation tracking with localStorage (no auth required)
- [ ] **Phase 3: Full-Year Calendar & Performance** - 12-month view with bridge day suggestions
- [ ] **Phase 4: Authentication & Cross-Device Sync** - Google auth with Supabase backend
- [x] **Phase 5: UX Polish & Mobile Optimization** - Responsive design, offline support, touch gestures
- [ ] **Phase 5.1: UX Infrastructure & Feedback Loop (INSERTED)** - Establish visual baseline, browser agent, and UX critique protocol
- [ ] **Phase 6: Testing & Quality Gates** - Comprehensive testing, Safari validation, performance budgets

## Phase Details

### Phase 1: Foundation & Static Holiday View
**Goal**: Users can view Bulgarian holidays in a mobile-responsive calendar with reliable date handling
**Depends on**: Nothing (first phase)
**Requirements**: HOL-01, HOL-02, HOL-04, HOL-05, HOL-06, CAL-02, TECH-01, TECH-05, TECH-06, TECH-07, INTL-01, INTL-02
**Success Criteria** (what must be TRUE):
  1. User can view 2026 Bulgarian holidays in a calendar (month view)
  2. Official holidays display in red color with correct dates
  3. User can hover over holidays to see details (name, date, type)
  4. Legend displays explaining holiday color meanings
  5. Calendar works correctly in Safari and Chrome browsers
  6. Calendar displays current date with visual indicator
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Holiday data layer with OpenHolidays API integration and Safari-safe date handling
- [x] 01-02-PLAN.md — Calendar UI components with month view grid and legend
- [x] 01-03-PLAN.md — Interactive tooltips and main page integration
- [x] 01-04-PLAN.md — Bulgarian/Cyrillic localization (gap closure for INTL-01, INTL-02)

### Phase 1.1: Fix Holiday Date Timezone Bug (INSERTED)
**Goal**: Fix critical timezone conversion bug causing holidays to appear on wrong dates
**Depends on**: Phase 1
**Requirements**: HOL-02 (correct holiday dates), TECH-07 (ISO date strings without time)
**Success Criteria** (what must be TRUE):
  1. January 1st holidays display on January 1st (not December 31st of previous year)
  2. No timezone conversion applied to date-only values from API
  3. Enhanced logging helps debug date processing issues
  4. December 31st no longer incorrectly shows as New Year holiday
**Plans**: 1 plan

Plans:
- [x] 01.1-PLAN.md — Remove timezone conversion from holiday date parsing and add debugging logs

### Phase 2: Anonymous Vacation Tracking
**Goal**: Users can track personal vacation days and see remaining balance without authentication
**Depends on**: Phase 1
**Requirements**: VAC-01, VAC-02, VAC-03, VAC-04, VAC-05, VAC-06, VAC-07, VAC-08, AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. User can mark specific dates as personal vacation (blue color on calendar)
  2. User can enter their total annual vacation days allowance
  3. User can see vacation summary (total days, used days, remaining days)
  4. User can update vacation balance manually (for job changes)
  5. User can remove previously marked vacation days
  6. Vacation data persists in browser localStorage across sessions
  7. User cannot mark the same date as vacation multiple times
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — localStorage hook, vacation types, and drag selection state management
- [ ] 02-02-PLAN.md — Vacation summary panel with inline editing and visual integration

### Phase 3: Full-Year Calendar & Performance
**Goal**: Users can view all 12 months simultaneously with bridge day suggestions and smooth performance
**Depends on**: Phase 2
**Requirements**: CAL-01, CAL-03, CAL-04, HOL-03, UX-01, UX-05
**Success Criteria** (what must be TRUE):
  1. User can view full year calendar showing all 12 months at once
  2. Bridge day opportunities display in yellow when holidays are close to weekends
  3. Calendar is responsive and works on mobile browsers
  4. Calendar renders within 3 seconds on mobile devices
  5. User sees clear visual distinction between holidays, bridge days, and personal vacation
  6. Full-year view performs smoothly with 365 days displayed
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Bridge day detection logic with tests
- [ ] 03-02-PLAN.md — MonthGrid Server Component with compact layout
- [ ] 03-03-PLAN.md — FullYearCalendar with responsive 12-month grid
- [ ] 03-04-PLAN.md — Performance measurement and optimization

### Phase 4: Authentication & Cross-Device Sync
**Goal**: Users can authenticate with Google and sync vacation data across devices
**Depends on**: Phase 3
**Requirements**: AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08
**Success Criteria** (what must be TRUE):
  1. User can sign in with Google account
  2. Authenticated user vacation data stores in Supabase and syncs across devices
  3. User session persists across browser refresh
  4. User's localStorage data migrates to Supabase automatically on first login
  5. Authenticated users' unused vacation days roll over to next year
  6. Anonymous users see nothing about rollover (invisible, not grayed out)
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — Supabase infrastructure: client utilities, middleware, OAuth callback, DB schema
- [ ] 04-02-PLAN.md — Auth UI: Google sign-in button, user avatar, sign-out dropdown
- [ ] 04-03-PLAN.md — Data sync: auth-aware VacationContext, debounced Supabase sync, localStorage migration
- [ ] 04-04-PLAN.md — Vacation rollover for authenticated users, invisible to anonymous users

### Phase 5: UX Polish & Mobile Optimization
**Goal**: Users have polished mobile experience with offline support and intuitive touch interactions
**Depends on**: Phase 4
**Requirements**: UX-02, UX-03, UX-04, UX-06
**Success Criteria** (what must be TRUE):
  1. Date selection works with touch gestures on mobile devices
  2. All interactive elements have minimum 44px touch targets
  3. Application works offline with cached holiday and vacation data
  4. User sees appropriate error messages when API is unavailable
  5. Mobile experience feels native and responsive
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Touch-optimized drag selection with 44px targets and highlight flash
- [x] 05-02-PLAN.md — Network detection, toast notifications, and retry-with-backoff
- [x] 05-03-PLAN.md — PWA service worker with Serwist and offline holiday caching

### Phase 5.1: UX Infrastructure & Feedback Loop (INSERTED)
**Goal**: Establish visual grounding, codebase awareness, and formal UX critique loop for Phase 6
**Depends on**: Phase 5
**Requirements**: None (infrastructure only)
**Success Criteria** (what must be TRUE):
  1. Coffee HTML Style Guide theme applied and documented (visual baseline only)
  2. Browser agent integrated and can render/inspect key UI states
  3. ChunkHound integrated for frontend component indexing
  4. UX critique protocol documented and ready for use
  5. No new features, no behavioral changes, no UX improvements beyond tooling
**Plans**: 4 plans

Plans:
- [ ] 05.1-01-PLAN.md — Coffee theme tokens in globals.css + Nunito font with cyrillic
- [ ] 05.1-02-PLAN.md — Coffee theme component migration (all color class replacements)
- [ ] 05.1-03-PLAN.md — agent-browser + ChunkHound installation and MCP configuration
- [ ] 05.1-04-PLAN.md — UX critique protocol documentation and token mapping reference

**Hard Constraints:**
- No new features
- No behavioral or interaction changes
- No UX improvements beyond tooling integration requirements
- Phase 6 must not begin until Phase 5.1 is complete and verified

**Deliverables:**
1. Coffee theme enforcement (https://ggprompts.github.io/htmlstyleguides/styles/coffee.html)
   - Document inherited tokens
   - Document overridden tokens
   - No component behavior changes

2. Browser agent integration
   - Define renderable application views
   - Use only for visual verification and UX critique

3. ChunkHound integration
   - Frontend codebase indexing
   - Component discovery
   - Refactor safety checks
   - No refactoring unless required for integration

4. UX critique loop protocol
   - No code changes during critique
   - Output: observations, questions, design system violations only
   - No solutions or implementation proposals
   - Mandatory before any Phase 6 UX/UI changes

### Phase 5.2: SEO Improvements & Layout Restructuring (INSERTED)
**Goal**: Improve SEO metadata, extract reusable text constants, restructure layout with left sidebar for holiday info and school vacation data
**Depends on**: Phase 5.1
**Requirements**: None (content and layout improvements)
**Success Criteria** (what must be TRUE):
  1. Page title and meta description updated with SEO-optimized Bulgarian text
  2. Repeated text in page.tsx extracted to reusable constants file
  3. Tests reference same constants to prevent breakage on text changes
  4. VacationSummary component moved from header to calendar top
  5. Header contains only Google authentication UI
  6. Left sidebar displays list of official holidays from API
  7. Left sidebar displays school vacation periods (if available from API)
  8. Left sidebar behaves responsively: below right sidebar on mobile
  9. Calendar dimensions reduced to max-width 650px, max-height 320px per month
  10. Calendar scales down appropriately on smaller screens
**Plans**: 6 plans

Plans:
- [ ] 05.2-01-PLAN.md — Text constants file and dynamic SEO metadata
- [ ] 05.2-02-PLAN.md — School holidays data layer (types, fetch, fallback)
- [ ] 05.2-03-PLAN.md — Teal color tokens and Legend update (6 entries)
- [ ] 05.2-04-PLAN.md — MonthGrid enhancements (colors, priority, school holidays, weekend transfer, tooltips, dimensions)
- [ ] 05.2-05-PLAN.md — Left sidebar component (official holidays + school vacations)
- [ ] 05.2-06-PLAN.md — Layout restructuring (three-column desktop, year selector, page.tsx rewrite)

### Phase 6: Testing & Quality Gates
**Goal**: Application meets quality standards with 50% test coverage and cross-browser validation
**Depends on**: Phase 5
**Requirements**: TECH-02, TECH-03, TECH-04
**Success Criteria** (what must be TRUE):
  1. Unit test coverage is at least 50% with meaningful tests (no coverage theater)
  2. All tests pass before features are considered complete
  3. Calendar functionality validated in Safari and Chrome browsers
  4. Date operations tested with DST boundary dates and edge cases
  5. Performance budgets met (year view <200ms, month view <50ms render)
  6. Critical user flows covered by end-to-end tests
**Plans**: TBD

Plans:
- [ ] TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 1.1 -> 2 -> 3 -> 4 -> 5 -> 5.1 -> 5.2 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Static Holiday View | 4/4 | ✅ Complete | 2026-01-19 |
| 1.1. Fix Holiday Date Timezone Bug (INSERTED) | 1/1 | ✅ Complete | 2026-01-25 |
| 2. Anonymous Vacation Tracking | 0/2 | Ready to execute | - |
| 3. Full-Year Calendar & Performance | 0/4 | Planned | - |
| 4. Authentication & Cross-Device Sync | 0/4 | Planned | - |
| 5. UX Polish & Mobile Optimization | 3/3 | ✅ Complete | 2026-02-06 |
| 5.1. UX Infrastructure & Feedback Loop (INSERTED) | 4/4 | ✅ Complete | 2026-02-06 |
| 5.2. SEO Improvements & Layout Restructuring (INSERTED) | 0/TBD | Not planned | - |
| 6. Testing & Quality Gates | 0/TBD | Not started | - |
