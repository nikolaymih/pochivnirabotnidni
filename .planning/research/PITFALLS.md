# Pitfalls Research

**Domain:** Bulgarian Holiday Calendar with Personal Vacation Tracking
**Researched:** 2026-01-18
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Safari Date Parsing Incompatibility

**What goes wrong:**
Date strings parsed correctly in Chrome/Firefox fail silently in Safari (mobile and desktop), returning `Invalid Date`. The calendar renders blank or shows incorrect dates, making the app unusable for ~30% of mobile users.

**Why it happens:**
Safari is much stricter than Chrome when parsing date strings. Non-ISO formats like "2025-01-15" (without time component) or formats with spaces instead of "T" separator are implementation-dependent per ECMAScript spec. Safari fails where Chrome succeeds.

**How to avoid:**
- Always use ISO 8601 format with explicit time: `"2025-01-15T00:00:00Z"`
- NEVER use `new Date("2025-01-15")` - Safari may fail
- NEVER use `new Date("2025/01/15 10:30")` - space separator fails in Safari
- Use date-fns for all date parsing/formatting (tree-shakeable, Safari-tested)
- Test date operations in BrowserStack Safari before deploying

**Warning signs:**
- Tests pass in Chrome but users report blank calendar
- iOS users report "Invalid Date" or missing holidays
- Date operations work locally but fail in production on mobile

**Phase to address:**
Phase 1 (Foundation) - Set up date library and Safari testing BEFORE building calendar UI

---

### Pitfall 2: Timezone Assumption (EET/EEST vs UTC)

**What goes wrong:**
Holiday dates shift by 1 day for users, vacation balances calculated incorrectly, all-day events appear to span 2 days or start at wrong time. Bulgarian holidays on March 1 might display as Feb 28 or March 2.

**Why it happens:**
Developers assume "dates don't have timezones" and use `new Date()` or `.toISOString()` which defaults to UTC. Bulgaria is EET (UTC+2) / EEST (UTC+3), so midnight in Bulgaria is 22:00 or 21:00 UTC the previous day. OpenHolidays API returns dates in different timezone than local storage expects.

**How to avoid:**
- Store ALL dates as ISO date strings WITHOUT time: `"2025-03-01"` (not timestamps)
- For display: parse date string to local midnight using date-fns `parseISO()` + `startOfDay()`
- For vacation calculations: use date-only arithmetic (no timestamps)
- Document timezone handling in `DATE_HANDLING.md` with examples
- Test with Sofia timezone (`Europe/Sofia`) and UTC to verify

**Warning signs:**
- Dates off by 1 day when viewing calendar
- DST transitions cause vacation balance discrepancies
- Tests pass but production users see wrong dates

**Phase to address:**
Phase 1 (Foundation) - Establish date storage format and timezone handling BEFORE any date-dependent features

---

### Pitfall 3: Daylight Saving Time Calculation Bugs

**What goes wrong:**
Vacation balance calculations produce different results when DST transitions occur. User takes 5 days vacation spanning DST change, system calculates 4.96 days or 5.04 days. Duration between dates varies by 1 hour causing rounding errors.

**Why it happens:**
Bulgaria transitions between EET (UTC+2) and EEST (UTC+3) in March and October. Time-based calculations like `(endDate - startDate) / MS_PER_DAY` give 23-hour or 25-hour "days" during DST transitions. OpenHolidays API or vacation logic may not account for this.

**How to avoid:**
- Use date-fns `differenceInCalendarDays()` not timestamp math
- NEVER calculate vacation days as `(end - start) / 86400000`
- Store vacation requests as start/end DATE strings, not timestamps
- Test vacation calculations with DST boundary dates (March 30/31, October 26/27 2025)
- Add integration tests for "vacation spanning DST transition"

**Warning signs:**
- Vacation balance shows decimals (5.04 days instead of 5)
- Unit tests fail only in March/October
- Duration calculations inconsistent across users

**Phase to address:**
Phase 2 (Vacation Tracking Core) - Before implementing vacation balance calculations

---

### Pitfall 4: Full Year Calendar Performance Collapse

**What goes wrong:**
Calendar loads instantly for single month, but switching to year view freezes browser for 3-5 seconds. Mobile Safari becomes unresponsive. Users abandon feature or think app is broken.

**Why it happens:**
Rendering 365 day cells + holidays + vacation events = 500+ DOM nodes. No virtualization. Re-rendering entire calendar on every state change (React re-renders all months when one vacation changes). Browser struggles with layout/paint for large DOM trees.

**How to avoid:**
- Implement virtual scrolling for year view (render only visible months)
- Memoize month components with `React.memo()` to prevent unnecessary re-renders
- Lazy load months as user scrolls (IntersectionObserver)
- Debounce vacation state updates (don't re-render on every keystroke)
- Test performance with Chrome DevTools Performance tab (target: <100ms render time)
- Consider month view as default, year view as opt-in progressive enhancement

**Warning signs:**
- Year view takes >500ms to render (measure with Performance API)
- Lighthouse performance score <60 on year view
- Mobile devices show "Page Unresponsive" warnings
- Input lag when typing vacation dates

**Phase to address:**
Phase 3 (Full Year Calendar) - Build performance monitoring BEFORE adding year view

---

### Pitfall 5: Supabase Free Tier Surprise Pausing

**What goes wrong:**
App works perfectly for weeks, then suddenly vacation data disappears. Users report "can't log in" or "all my vacations are gone." Project was paused due to 7-day inactivity rule on free tier.

**Why it happens:**
Supabase pauses free tier projects after 7 days of no database activity. During development lulls or post-launch low usage, project auto-pauses. Data persists but is inaccessible until manually reactivated. No email warning before pausing.

**How to avoid:**
- Implement health check endpoint that pings Supabase every 6 days (cron job or GitHub Action)
- Add activity monitoring dashboard (last query timestamp)
- Document free tier limitations in `DEPLOYMENT.md`
- Set up alerts for >5 days since last activity
- Plan upgrade to Pro tier before launch ($25/month) or use paid tier from start
- Keep 2-project limit in mind (applies across all organizations)

**Warning signs:**
- Dashboard shows "Project Paused" with resume button
- API calls return 503 or connection errors
- No database activity for 5+ days in Supabase logs

**Phase to address:**
Phase 1 (Foundation) - Set up health check endpoint AND monitoring before building features

---

### Pitfall 6: Vacation Balance Year Boundary Logic

**What goes wrong:**
User has 10 days vacation remaining on Dec 31. On Jan 1, balance shows 0, 10, or 30 days depending on buggy logic. Carryover rules not implemented, year-end payouts miscalculated, negative balances after job change.

**Why it happens:**
Vacation accrual resets at year boundary but logic doesn't handle: (1) carryover limits (e.g., max 5 days), (2) use-it-or-lose-it policies, (3) mid-year job changes affecting accrual rate, (4) prorated accrual for new employees, (5) negative balances from advanced vacation.

**How to avoid:**
- Store vacation balance as transaction ledger (accruals + usage), NOT single balance field
- Implement explicit year-end rollover logic with carryover cap
- Add `accrual_rate` and `hire_date` to user profile for prorated calculations
- Test edge cases:
  - User hired Dec 15, takes vacation Jan 2
  - User takes 20 days in Dec when they have 15 (negative balance)
  - Year boundary crossing (Dec 30 - Jan 3 vacation)
- Document business rules in `VACATION_RULES.md` BEFORE coding
- Allow negative balances with clear UI warning ("You've used 2 days more than accrued")

**Warning signs:**
- Balance calculation queries are complex (>20 lines SQL)
- No tests for year boundary scenarios
- Business rules undocumented ("we'll figure it out later")
- Users report "balance is wrong" after January 1

**Phase to address:**
Phase 2 (Vacation Tracking Core) - Define business rules in planning, implement as first feature

---

### Pitfall 7: OpenHolidays API Coupling Without Fallback

**What goes wrong:**
OpenHolidays API goes down, rate limits kick in, or Bulgaria holiday data changes format. App shows blank calendar with no holidays. Users can't distinguish workdays from holidays.

**Why it happens:**
App fetches holidays on every page load with no caching. No fallback data. API has no SLA (free service). Bulgaria data could be updated/restructured. Network failures not handled gracefully.

**How to avoid:**
- Cache holidays in Supabase on first fetch (invalidate yearly)
- Ship static fallback JSON with 2025-2027 Bulgaria holidays in `/public/holidays.json`
- Implement stale-while-revalidate pattern (show cached, fetch in background)
- Add API health check with exponential backoff retry logic
- Display clear error state: "Holidays unavailable, showing cached data from [date]"
- Monitor API response times and error rates
- Document migration path to alternative API if OpenHolidays discontinues

**Warning signs:**
- No integration tests for API failure scenarios
- No fallback UI design in mockups
- Calendar empty when offline or API down
- `fetch()` calls have no timeout or error handling

**Phase to address:**
Phase 1 (Foundation) - Implement caching + fallback BEFORE building calendar UI

---

### Pitfall 8: Local Storage Sync Conflicts (Offline Edits)

**What goes wrong:**
User edits vacation on phone (offline), edits same vacation on desktop (online). When phone reconnects, one edit is lost or vacation duplicates. User reports "my changes disappeared" or "I have two vacations for the same dates."

**Why it happens:**
No conflict resolution strategy. Last-write-wins overwrites user data. Optimistic updates not reconciled with server state. No transaction log to detect conflicts.

**How to avoid:**
- Implement optimistic UI updates with rollback on server conflict
- Add `version` or `updated_at` timestamp to vacation records
- Detect conflicts: if local `updated_at` < server `updated_at`, show conflict UI
- Provide conflict resolution UX: "Server has newer version. Keep local changes or discard?"
- Use Supabase Realtime subscriptions to detect concurrent edits
- Add `sync_status` field: `synced | pending | conflict`
- Test with network throttling and offline mode

**Warning signs:**
- No `updated_at` or version field in schema
- No offline/online state indicator in UI
- Supabase Realtime not configured
- "Optimistic update" mentioned but no rollback logic

**Phase to address:**
Phase 2 (Vacation Tracking Core) - Implement before multi-device usage expected

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using native `Date()` without library | No dependencies, faster setup | Safari bugs, timezone issues, DST bugs, unmaintainable | Never - date-fns adds 5KB gzipped |
| Storing dates as timestamps | Easy sorting, simple schema | Timezone bugs, DST edge cases, unclear semantics | Never for calendar dates (only for events with time) |
| Skipping Safari testing | Faster dev cycle, use own device | 30% of mobile users see broken calendar | Never - use BrowserStack free tier |
| Hard-coding 2025 holidays | Faster than API integration | Manual updates every year, forgotten updates | Only for initial prototype (<2 weeks) |
| localStorage instead of Supabase | Simpler architecture, no backend | No multi-device sync, data loss on clear cache | Only for MVP if solo user assumption holds |
| No performance monitoring | Faster initial development | Can't diagnose year view slowness in production | Acceptable for Phase 1, required by Phase 3 |
| Skipping vacation balance tests | Faster feature delivery | Production bugs with money implications (paid vacation) | Never - balance bugs are business-critical |
| Client-side only SEO | Simpler deployment, no SSR | Google doesn't index calendar, no social previews | Acceptable if SEO not a launch requirement |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenHolidays API | Fetching on every render, no error handling | Cache in Supabase, fetch once per year, fallback to static JSON |
| Supabase Auth | Assuming user always logged in, no session refresh | Check session on mount, handle expired tokens, refresh before API calls |
| Supabase Realtime | Subscribing to all changes, memory leaks | Subscribe only to user's data, unsubscribe on unmount, filter server-side |
| Local Storage | Storing large objects, no quota checks | Use IndexedDB for >5MB data, handle QuotaExceededError, compress if needed |
| Browser APIs (Intl) | Assuming all browsers support same features | Polyfill for Safari <14, test in BrowserStack, fallback to date-fns |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering entire calendar on state change | Input lag, slow interactions | React.memo month components, useMemo for calculations | >50 vacation entries or year view |
| Fetching all vacations on page load | Slow initial load, high Supabase bandwidth | Paginate or lazy load (fetch per month), index by date range | >100 vacation records |
| No database indexes on date queries | Slow vacation balance calculations | Add index on `user_id, start_date, end_date` | >500 total vacations in DB |
| Inline date formatting in render | 200ms+ render time for year view | Memoize formatted dates, format on server if possible | Year view with >200 days |
| Uncompressed static holiday JSON | 50KB+ bundle size for multi-year data | gzip JSON, only load current+next year | >3 years of holidays |
| Supabase connection per component | Hit connection limit (200 concurrent), slow queries | Singleton client, connection pooling | >50 concurrent users |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing other users' vacation data in API | Privacy violation, GDPR breach | Row-level security in Supabase filtering by user_id, test with multiple users |
| Client-side vacation balance calculation | User can manipulate balance in browser console | Calculate on server with stored procedures, validate on backend |
| No rate limiting on vacation creation | User can spam 1000s of vacation entries (DOS) | Supabase rate limiting or Cloudflare, limit to 50 vacations/user/year |
| Storing API keys in client code | OpenHolidays key exposed in bundle | Use Next.js API routes to proxy, environment variables server-side only |
| No CSRF protection on vacation mutations | Attacker can create/delete vacations via XSS | Supabase RLS provides protection, but verify tokens on mutations |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual distinction between holiday types | User confused if Easter is public holiday or just cultural | Color code: public holidays (red), religious holidays (purple), national holidays (blue) |
| Vacation balance shown without context | "12 days" - user unsure if used or remaining | "12 days remaining of 25 days total (13 used)" |
| No confirmation on vacation deletion | Accidental deletions, user frustration | Confirmation modal + undo toast for 5 seconds |
| Calendar starts on Sunday (US convention) | Bulgarian users expect Monday start | Configurable first day of week, default to Monday for Bulgaria |
| No indication of overlapping vacations | User books conflicting dates, discovers later | Visual warning on calendar + validation error |
| All-day events unclear if inclusive | "Jan 1-3" could mean 2 or 3 days | Show day count: "Jan 1-3 (3 days)" + highlight range |
| No mobile-optimized year view | Pinch-zoom required, unusable on phone | Switch to list view on mobile, month view as default |
| Vacation balance doesn't explain negatives | "-2 days" with no explanation, user alarmed | "You've used 2 days more than accrued. This will be deducted from next year." |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Date handling:** Often missing Safari testing — verify in BrowserStack iOS Safari 15+
- [ ] **Vacation balance:** Often missing negative balance handling — verify user can go negative and sees clear explanation
- [ ] **Year view:** Often missing performance optimization — verify renders in <200ms with 50+ vacations (Chrome DevTools Performance)
- [ ] **OpenHolidays integration:** Often missing fallback data — verify app works when API returns 500 error
- [ ] **DST transitions:** Often missing test coverage — verify vacation spanning March 30/October 27 calculates correctly
- [ ] **Multi-device sync:** Often missing conflict resolution — verify editing same vacation on 2 devices shows conflict UI
- [ ] **Supabase free tier:** Often missing inactivity monitoring — verify health check pings DB every 6 days
- [ ] **Vacation year rollover:** Often missing Jan 1 logic — verify balances on Dec 31 vs Jan 1 follow business rules
- [ ] **Mobile calendar:** Often missing touch gestures — verify swipe between months works on iOS/Android
- [ ] **Timezone display:** Often missing EET/EEST indicator — verify UI shows "All times in EET (UTC+2)" or similar
- [ ] **SEO metadata:** Often missing og:image for calendar — verify social preview shows calendar snapshot
- [ ] **Accessibility:** Often missing keyboard navigation — verify calendar navigable with Tab/Arrow keys, screen reader tested

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Safari date parsing breaks production | MEDIUM | 1. Deploy date-fns hotfix (2 hours), 2. Add Safari to CI pipeline, 3. Announce fix to users |
| Timezone bugs cause wrong holiday dates | MEDIUM | 1. Audit all date operations (4 hours), 2. Add timezone tests, 3. Document date storage format, 4. Announce data fix if user vacations affected |
| Year view performance unusable | HIGH | 1. Add "loading" state and skeleton UI (2 hours), 2. Implement virtualization (8 hours), 3. Provide month view fallback |
| Supabase project paused from inactivity | LOW | 1. Resume project in dashboard (1 min), 2. Deploy health check cron (1 hour), 3. Monitor logs |
| Vacation balance bugs discovered | HIGH | 1. Freeze vacation features (30 min), 2. Audit calculation logic with test cases (4 hours), 3. Write migration to fix existing data (4 hours), 4. Notify affected users |
| OpenHolidays API deprecated | MEDIUM | 1. Activate static fallback (immediate), 2. Find alternative API (research 2 hours), 3. Migrate integration (4 hours) |
| Local storage sync conflicts deleting data | HIGH | 1. Implement version field (1 hour), 2. Add conflict detection (2 hours), 3. Build conflict UI (4 hours), 4. Can't recover lost data from past |
| DST calculation producing decimal days | MEDIUM | 1. Replace timestamp math with date-fns (2 hours), 2. Add DST test cases (1 hour), 3. Audit affected records (2 hours) |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Safari date parsing | Phase 1: Foundation | BrowserStack Safari test in CI, date operations use date-fns |
| Timezone assumptions | Phase 1: Foundation | Document date storage format, timezone tests pass |
| DST calculation bugs | Phase 2: Vacation Core | Vacation spanning DST dates calculates correctly in tests |
| Calendar performance | Phase 3: Full Year View | Performance budget: year view renders <200ms with 50 vacations |
| Supabase pausing | Phase 1: Foundation | Health check cron deployed, monitoring dashboard shows last activity |
| Year boundary balance | Phase 2: Vacation Core | Business rules documented, year rollover tests pass |
| API coupling | Phase 1: Foundation | Fallback data exists, API failure shows cached holidays |
| Sync conflicts | Phase 2: Vacation Core | Conflict detection implemented, multi-device test scenario passes |
| No SEO | Phase 4: SEO (if needed) | Google Search Console shows indexed pages, social previews render |
| Accessibility gaps | Phase 2+: Every feature | Keyboard navigation works, screen reader tested, WCAG 2.1 AA |
| Insufficient testing | All phases | 50%+ meaningful test coverage, tests pass before merging |
| Negative balance confusion | Phase 2: Vacation Core | UI shows clear explanation, user testing confirms understanding |

## Testing Implications

How pitfalls inform test strategy and coverage requirements.

**Critical Test Categories (required for 50% meaningful coverage):**

1. **Date Parsing Tests (Safari-focused)**
   - Parse ISO strings in various formats
   - Parse dates in Safari vs Chrome comparison
   - Parse dates at DST boundaries
   - Parse leap year dates (Feb 29)

2. **Vacation Balance Calculation Tests**
   - Calculate balance at year boundary (Dec 31 vs Jan 1)
   - Calculate with negative balance
   - Calculate with carryover limits
   - Calculate mid-year hire prorated accrual
   - Calculate vacation spanning DST transition

3. **Performance Regression Tests**
   - Year view renders <200ms with 50 vacations
   - Month view renders <50ms
   - Vacation update re-renders only affected month

4. **Integration Failure Tests**
   - OpenHolidays API returns 500 error → show cached
   - Supabase connection timeout → show offline state
   - Network offline → queue mutations for later sync

5. **Sync Conflict Tests**
   - Edit same vacation on 2 devices → detect conflict
   - Offline edit + server edit → show conflict UI
   - Rapid updates → debounced, eventual consistency

6. **Edge Case Tests**
   - Leap year February 29 vacation
   - Year boundary vacation (Dec 30 - Jan 3)
   - All-day event spanning DST change
   - Vacation longer than remaining balance (negative)
   - User with 0 accrued days takes vacation (future accrual)

**Testing Approach by Phase:**

- **Phase 1:** Integration tests for API failures, date parsing unit tests (Safari), Supabase connection tests
- **Phase 2:** Vacation balance calculation tests (100% coverage of edge cases), sync conflict tests, year boundary tests
- **Phase 3:** Performance tests with Lighthouse CI, visual regression tests for year view, mobile gesture tests
- **Phase 4+:** SEO tests (meta tags, sitemap), accessibility tests (keyboard, screen reader), cross-browser E2E tests

**Required Test Infrastructure:**

- BrowserStack for Safari testing (free tier sufficient)
- Lighthouse CI for performance budgets
- Mock Service Worker for API failure simulation
- Supabase local dev environment for offline tests
- Time-mocking library (MockDate or date-fns/set) for DST/year boundary tests

## Sources

**Date and Timezone:**
- [Understand Calendar App Time Zone Support to Avoid Scheduling Mishaps - TidBITS](https://tidbits.com/2025/03/19/understand-calendar-app-time-zone-support-to-avoid-scheduling-mishaps/)
- [How a Simple Date Broke My App in Safari but Worked Fine in Chrome | Medium](https://medium.com/@ranuranjan25/how-a-simple-date-broke-my-app-in-safari-but-worked-fine-in-chrome-6b51f023e650)
- [JavaScript Date Parsing Differences: Chrome vs Safari](https://www.javaspring.net/blog/date-parsing-in-javascript-is-different-between-safari-and-chrome/)
- [It's About Time: An Empirical Study of Date and Time Bugs in Open-Source Python Software (MSR 2025)](https://2025.msrconf.org/details/msr-2025-technical-papers/35/It-s-About-Time-An-Empirical-Study-of-Date-and-Time-Bugs-in-Open-Source-Python-Softw)

**Vacation Tracking:**
- [Vacation Tracker Reviews 2025 - Capterra](https://www.capterra.com/p/189276/Vacation-Tracker/reviews/)
- [Vacation Accruals: How They Work & How to Accurately Calculate PTO](https://buddypunch.com/blog/vacation-accrual/)
- [Vacation Accrual Journal Entry & Accounting Guide 2025](https://www.finoptimal.com/resources/accrued-vacation-journal-entry-guide)

**Performance:**
- [Improve resource timeline performance with virtual rendering - FullCalendar](https://github.com/fullcalendar/fullcalendar/issues/5673)
- [Performance - Page Not Responding for huge number of events - FullCalendar](https://github.com/fullcalendar/fullcalendar/issues/4395)
- [React 19.2 Further Advances INP Optimization - Web Performance Calendar](https://calendar.perfplanet.com/2025/react-19-2-further-advances-inp-optimization/)

**Offline/Sync:**
- [Offline-first frontend apps in 2025: IndexedDB and SQLite - LogRocket](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Cool frontend arts of local-first: storage, sync, conflicts](https://evilmartians.com/chronicles/cool-front-end-arts-of-local-first-storage-sync-and-conflicts)

**API Integration:**
- [API Rate Limits Explained: Best Practices for 2025](https://orq.ai/blog/api-rate-limit)
- [10 Best Practices for API Rate Limiting in 2025 - Zuplo](https://zuplo.com/learning-center/10-best-practices-for-api-rate-limiting-in-2025)

**Supabase:**
- [Supabase Pricing 2026: Free Tier Limits, Pro Costs & Hidden Fees](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Supabase Free Tier - Pricing & Limits (2025)](https://www.freetiers.com/directory/supabase)

**SEO & Testing:**
- [Single Page Application SEO: Challenges and Best Practices](https://www.macrometa.com/seo-dynamic-content/single-page-application-seo)
- [Testing Next.js Applications: A Complete Guide - Medium](https://trillionclues.medium.com/testing-next-js-applications-a-complete-guide-to-catching-bugs-before-qa-does-a1db8d1a0a3b)

**Date Libraries:**
- [Moment.js Alternatives for Date Handling in JavaScript - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/momentjs-alternatives/)
- [date-fns vs moment vs luxon - npm-compare](https://npm-compare.com/date-fns,luxon,moment,rome)

**Edge Cases:**
- [Handling Leap Years and Edge Cases in JavaScript Date Calculations](https://www.slingacademy.com/article/handling-leap-years-and-edge-cases-in-javascript-date-calculations/)
- [Leap Year Pitfalls and Solutions in Salesforce](https://www.salesforceben.com/leap-year-pitfalls-and-solutions-in-salesforce/)

---
*Pitfalls research for: Bulgarian Holiday Calendar with Personal Vacation Tracking*
*Researched: 2026-01-18*
*Confidence: HIGH - Verified with 20+ authoritative sources including technical documentation, real-world bug reports, and 2025/2026 best practices*
