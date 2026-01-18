# Requirements: Pochivni Rabotni Dni

**Defined:** 2026-01-18
**Core Value:** Users can see all Bulgarian holidays for the year AND track their paid vacation days in one place, with history.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Calendar Display

- [ ] **CAL-01**: User can view full year calendar showing all 12 months simultaneously
- [ ] **CAL-02**: Calendar displays current date with visual indicator
- [ ] **CAL-03**: Calendar is responsive and works on mobile browsers (Safari and Chrome)
- [ ] **CAL-04**: Calendar renders with acceptable performance on mobile devices (<200ms initial render)

### Holiday Management

- [ ] **HOL-01**: System fetches Bulgarian holidays for 2026 from OpenHolidays API
- [ ] **HOL-02**: Official holidays display in red color on calendar
- [ ] **HOL-03**: Bridge day opportunities display in yellow color on calendar
- [ ] **HOL-04**: User can view holiday details on hover (holiday name, date, type)
- [ ] **HOL-05**: System caches holiday data to reduce API calls and provide fallback
- [ ] **HOL-06**: Legend displays explaining all day types and color meanings

### Vacation Tracking

- [ ] **VAC-01**: User can mark specific dates as personal paid vacation (blue color)
- [ ] **VAC-02**: User can enter their total annual vacation days allowance
- [ ] **VAC-03**: System calculates and displays remaining vacation balance
- [ ] **VAC-04**: System displays vacation summary (total days, used days, remaining days)
- [ ] **VAC-05**: User can manually update vacation balance (for job changes)
- [ ] **VAC-06**: Vacation balance calculations use date-fns for DST-safe arithmetic
- [ ] **VAC-07**: User can remove previously marked vacation days
- [ ] **VAC-08**: System prevents marking same date as vacation multiple times

### Authentication & Sync

- [ ] **AUTH-01**: User can use application without authentication (anonymous mode)
- [ ] **AUTH-02**: Anonymous user vacation data stores in browser localStorage
- [ ] **AUTH-03**: User can authenticate with Google account
- [ ] **AUTH-04**: Authenticated user vacation data stores in Supabase PostgreSQL
- [ ] **AUTH-05**: User session persists across browser refresh
- [ ] **AUTH-06**: System migrates localStorage data to Supabase on first login
- [ ] **AUTH-07**: Authenticated users' unused vacation days roll over to next year
- [ ] **AUTH-08**: Anonymous users do not have vacation rollover (data may be lost)

### User Experience

- [ ] **UX-01**: Application loads and displays calendar within 3 seconds on mobile
- [ ] **UX-02**: Date selection works with touch gestures on mobile devices
- [ ] **UX-03**: All interactive elements have minimum 44px touch targets
- [ ] **UX-04**: Application works offline with cached data (holidays and vacations)
- [ ] **UX-05**: User sees clear visual distinction between holidays, bridge days, and personal vacation
- [ ] **UX-06**: Application displays appropriate error messages when API is unavailable

### Technical Quality

- [ ] **TECH-01**: All date operations use date-fns library (no native Date math)
- [ ] **TECH-02**: Calendar functionality tested in Safari and Chrome browsers
- [ ] **TECH-03**: Unit test coverage is at least 50% with meaningful tests
- [ ] **TECH-04**: All tests pass before features are considered complete
- [ ] **TECH-05**: Calendar uses custom-built components (no FullCalendar or React Big Calendar)
- [ ] **TECH-06**: Server Components used by default; Client Components only for interactivity
- [ ] **TECH-07**: Date storage uses ISO date strings, not timestamps

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Historical Analysis

- **HIST-01**: User can view previous years' calendars (2025, 2024, etc.)
- **HIST-02**: User can see their vacation patterns from past years
- **HIST-03**: System displays vacation history across multiple years

### Calendar Integration

- **INTG-01**: User can export calendar to ICS format
- **INTG-02**: User can import calendar into Google Calendar
- **INTG-03**: User receives ICS file with holidays and personal vacations

### Optimization Features

- **OPT-01**: System suggests optimal vacation day combinations to maximize time off
- **OPT-02**: System calculates "take X days, get Y days off" scenarios
- **OPT-03**: User can see remaining workdays counter for current year
- **OPT-04**: System highlights best periods for taking vacation based on holidays

### Regional Support

- **REG-01**: User can filter holidays by Bulgarian region
- **REG-02**: System displays region-specific observances
- **REG-03**: User can select their region for relevant holiday filtering

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Team/group vacation tracking | Transforms personal tracker into enterprise leave management system; requires user management, permissions, approval workflows |
| Approval workflows | Adds complexity of manager approval, notifications, different user types; this is personal tracking, not HR system |
| Automatic PTO accrual | Complex rules vary by contract and regulations; error-prone; manual entry on job change or yearly reset is simpler |
| Multi-country support | Each country has different holidays and rules; multiplies complexity; focus on Bulgarian market first |
| Push notifications | Requires device permissions, notification infrastructure; users already have calendar apps for reminders |
| Social features | Turns utility into social network; adds moderation, privacy concerns; manual sharing via export is sufficient |
| PTO request submission to HR | Requires integration with company HR systems; this is tracking tool, not request system |
| Multiple leave types tracking | Adds UI and logic complexity for minimal value; focus is paid vacation tracking |
| Recurring vacation patterns | Adds complexity for uncertain value; users can manually recreate patterns if needed |
| Desktop application | Web-first approach with mobile responsiveness covers all devices; no need for separate desktop app |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAL-01 | Phase 3 | Pending |
| CAL-02 | Phase 1 | Pending |
| CAL-03 | Phase 3 | Pending |
| CAL-04 | Phase 3 | Pending |
| HOL-01 | Phase 1 | Pending |
| HOL-02 | Phase 1 | Pending |
| HOL-03 | Phase 3 | Pending |
| HOL-04 | Phase 1 | Pending |
| HOL-05 | Phase 1 | Pending |
| HOL-06 | Phase 1 | Pending |
| VAC-01 | Phase 2 | Pending |
| VAC-02 | Phase 2 | Pending |
| VAC-03 | Phase 2 | Pending |
| VAC-04 | Phase 2 | Pending |
| VAC-05 | Phase 2 | Pending |
| VAC-06 | Phase 2 | Pending |
| VAC-07 | Phase 2 | Pending |
| VAC-08 | Phase 2 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 4 | Pending |
| AUTH-04 | Phase 4 | Pending |
| AUTH-05 | Phase 4 | Pending |
| AUTH-06 | Phase 4 | Pending |
| AUTH-07 | Phase 4 | Pending |
| AUTH-08 | Phase 4 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 5 | Pending |
| UX-03 | Phase 5 | Pending |
| UX-04 | Phase 5 | Pending |
| UX-05 | Phase 3 | Pending |
| UX-06 | Phase 5 | Pending |
| TECH-01 | Phase 1 | Pending |
| TECH-02 | Phase 6 | Pending |
| TECH-03 | Phase 6 | Pending |
| TECH-04 | Phase 6 | Pending |
| TECH-05 | Phase 1 | Pending |
| TECH-06 | Phase 1 | Pending |
| TECH-07 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-18*
*Last updated: 2026-01-18 after roadmap creation*
