# Roadmap: Pochivni Rabotni Dni

## Overview

This roadmap delivers a Bulgarian holiday calendar with personal vacation tracking in six phases. We start with bulletproof date handling and static holiday view to avoid Safari/timezone pitfalls, then layer on anonymous vacation tracking (localStorage), full-year calendar view with bridge day suggestions, Google authentication with cross-device sync, mobile UX polish, and finally comprehensive testing to hit 50% meaningful coverage. The journey prioritizes immediate user value (see holidays, track vacation) before asking for signup, with performance and quality baked in throughout.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Static Holiday View** - Establish date handling, API integration, and basic calendar
- [ ] **Phase 2: Anonymous Vacation Tracking** - Core vacation tracking with localStorage (no auth required)
- [ ] **Phase 3: Full-Year Calendar & Performance** - 12-month view with bridge day suggestions
- [ ] **Phase 4: Authentication & Cross-Device Sync** - Google auth with Supabase backend
- [ ] **Phase 5: UX Polish & Mobile Optimization** - Responsive design, offline support, touch gestures
- [ ] **Phase 6: Testing & Quality Gates** - Comprehensive testing, Safari validation, performance budgets

## Phase Details

### Phase 1: Foundation & Static Holiday View
**Goal**: Users can view Bulgarian holidays in a mobile-responsive calendar with reliable date handling
**Depends on**: Nothing (first phase)
**Requirements**: HOL-01, HOL-02, HOL-04, HOL-05, HOL-06, CAL-02, TECH-01, TECH-05, TECH-06, TECH-07
**Success Criteria** (what must be TRUE):
  1. User can view 2026 Bulgarian holidays in a calendar (month view)
  2. Official holidays display in red color with correct dates
  3. User can hover over holidays to see details (name, date, type)
  4. Legend displays explaining holiday color meanings
  5. Calendar works correctly in Safari and Chrome browsers
  6. Calendar displays current date with visual indicator
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
  6. Anonymous users see clear message that vacation rollover requires authentication
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Static Holiday View | 0/TBD | Not started | - |
| 2. Anonymous Vacation Tracking | 0/TBD | Not started | - |
| 3. Full-Year Calendar & Performance | 0/TBD | Not started | - |
| 4. Authentication & Cross-Device Sync | 0/TBD | Not started | - |
| 5. UX Polish & Mobile Optimization | 0/TBD | Not started | - |
| 6. Testing & Quality Gates | 0/TBD | Not started | - |
