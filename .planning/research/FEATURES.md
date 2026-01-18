# Feature Research

**Domain:** Holiday Calendar + Personal Vacation Tracking
**Researched:** 2026-01-18
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| View full year calendar | Every holiday/calendar app has this | LOW | Month-by-month view with visual indicators for holidays |
| Official holiday list | Core purpose - users trust apps for accuracy | LOW | Bulgarian public holidays, accurate and current |
| Mobile-responsive view | Most calendar access is mobile (2026) | LOW | Must work on mobile browsers, not just desktop |
| Holiday details | Users want to know what they're celebrating | LOW | Holiday name, date, type (public/observance) |
| Current year balance display | Users need to see "how much PTO do I have left" | LOW | Single number, prominently displayed |
| Simple PTO tracking | Mark days as taken, see remaining balance | MEDIUM | Click day to mark as vacation, auto-deduct from balance |
| Today's date indicator | Users need context for "where am I in the year" | LOW | Visual highlight of current date |
| Offline capability | Calendar apps often accessed without connectivity | MEDIUM | Service worker caching for viewed data |
| Personal calendar export | Users want holidays in their Google/Outlook calendar | MEDIUM | ICS export or calendar integration |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Bridge day suggestions | Users can turn 30 vacation days into 62 days off with smart planning | MEDIUM | Automatically highlight optimal days to take vacation for long weekends |
| Vacation optimization calculator | "Take these 8 days, get 16 days off" — maximize value | MEDIUM | Algorithm to find best combination periods (Easter, Christmas, etc.) |
| Historical year view | Track patterns over time, see past vacation usage | LOW-MEDIUM | Archive previous years' data, allow switching between years |
| Balance adjustment with reason | Job changes mean balance resets mid-year | LOW | Manual override with timestamp and reason logged |
| Unauthenticated mode | Use app without account, data stays local | MEDIUM | localStorage-based tracking, no server sync |
| Authenticated sync | Create account, sync across devices | HIGH | Authentication + backend sync infrastructure |
| Visual vacation planning | See vacation + holidays together on same view | LOW | Different visual treatment for holidays vs personal vacation |
| Remaining workdays counter | "47 workdays left in 2026" accounting for holidays + vacation | MEDIUM | Smart calculation excluding weekends, holidays, and planned vacation |
| National vs regional holidays | Some holidays are region-specific in Bulgaria | LOW-MEDIUM | Filter or display region-specific observances |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Team/group vacation tracking | "See when coworkers are off" | Scope explosion into enterprise leave management - requires user management, permissions, approval workflows, HR integration | Keep focused on PERSONAL tracking. User can export calendar to share with team manually |
| Approval workflows | "Manager should approve my vacation" | Transforms simple tracker into full leave management system - adds complexity, different user types, notifications, etc. | This is personal tracking tool, not enterprise HR system |
| Automatic PTO accrual | "Add 2 days per month automatically" | Complex rules vary by contract type, tenure, regulations - error-prone and requires legal accuracy | Manual balance entry when it changes (job start, yearly refresh) |
| Multi-country support | "I work across countries" | Each country has different holidays, rules, accrual policies - multiplies complexity | Focus on Bulgarian holidays. Clean architecture makes forking for other countries easy later |
| Push notifications | "Remind me before holiday" | Requires device permissions, notification infrastructure, opt-in flows, and users often already have calendar apps for this | Calendar export (ICS) - users get notifications from their preferred calendar app |
| Social features | "Share my vacation plans" | Turns utility into social network - moderation, privacy concerns, scope creep | Export to share manually if needed |
| PTO request submission | "Submit request to HR from app" | Requires integration with company HR systems, each different - enterprise feature | This is tracking tool, not request system |
| Multiple leave types | "Track sick days, personal days, etc." | Adds complexity for minimal value in personal tracker | Focus on paid vacation tracking. User can note reason in calendar if needed |

## Feature Dependencies

```
[View full year calendar]
    └──requires──> [Official holiday list]
    └──enhances──> [Today's date indicator]

[Simple PTO tracking]
    └──requires──> [Current year balance display]
    └──enhances──> [Visual vacation planning]

[Bridge day suggestions]
    └──requires──> [Official holiday list]
    └──requires──> [View full year calendar]
    └──enhances──> [Vacation optimization calculator]

[Historical year view]
    └──requires──> [Simple PTO tracking]
    └──requires──> [Data persistence]

[Authenticated sync]
    └──requires──> [Unauthenticated mode] (build local-first)
    └──conflicts──> [Pure privacy/no backend] (architectural decision)

[Personal calendar export]
    └──requires──> [Official holiday list]
    └──can-include──> [Simple PTO tracking] (export vacation too)

[Vacation optimization calculator]
    └──requires──> [Bridge day suggestions]
    └──requires──> [Current year balance display]
```

### Dependency Notes

- **Bridge day suggestions require holiday list:** Can't suggest bridge days without knowing when holidays fall
- **PTO tracking requires balance display:** Users need to see impact of marking days as vacation
- **Historical view requires data persistence:** Need either localStorage (unauth) or backend (auth) to store past years
- **Authenticated sync conflicts with pure local-first:** Architectural decision - support both or choose one
- **Calendar export enhances value:** Users already have notification/reminder systems in their calendar apps

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **View full year calendar** — Core utility, users expect this from any calendar app
- [ ] **Official Bulgarian holiday list (2026)** — Without accurate holidays, app has no value
- [ ] **Mobile-responsive layout** — Most usage will be mobile, must work on phones
- [ ] **Simple PTO tracking (unauthenticated)** — Mark days as vacation, see remaining balance (localStorage)
- [ ] **Bridge day visual indicators** — Show which holidays create long weekend opportunities (LOW complexity, HIGH value)
- [ ] **Manual balance adjustment** — Let users set their PTO allowance (job changes, yearly reset)
- [ ] **Today's date indicator** — Context for where user is in the year

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Vacation optimization suggestions** — Once users track vacation, show them "take these 8 days, get 16 off" recommendations
- [ ] **Historical year view (2025 archive)** — Add after users have tracked 2026, they'll want to see 2025 patterns
- [ ] **ICS export** — Users ask "how do I get this in my calendar" - add when requested
- [ ] **Remaining workdays counter** — Nice-to-have insight, add when calendar + tracking is solid
- [ ] **Regional holiday filtering** — Start with national holidays, add regional if users request it

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Authenticated sync across devices** — Complex (backend, auth, sync), only needed if users explicitly request multi-device
- [ ] **Multi-year data retention** — Only add if users actually use historical view heavily
- [ ] **Vacation pattern analysis** — "You usually take vacation in August" - ML/analytics, defer until data exists
- [ ] **Share/export vacation plans** — Only if users request collaboration features

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| View full year calendar | HIGH | LOW | P1 |
| Official holiday list 2026 | HIGH | LOW | P1 |
| Mobile-responsive layout | HIGH | LOW | P1 |
| Simple PTO tracking (local) | HIGH | MEDIUM | P1 |
| Bridge day indicators | HIGH | LOW | P1 |
| Manual balance adjustment | HIGH | LOW | P1 |
| Today's date indicator | MEDIUM | LOW | P1 |
| Vacation optimization | HIGH | MEDIUM | P2 |
| Historical year view | MEDIUM | LOW | P2 |
| ICS export | MEDIUM | MEDIUM | P2 |
| Remaining workdays counter | MEDIUM | MEDIUM | P2 |
| Regional holiday filtering | LOW | LOW | P2 |
| Authenticated sync | MEDIUM | HIGH | P3 |
| Multi-year retention | LOW | MEDIUM | P3 |
| Vacation pattern analysis | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (MVP)
- P2: Should have, add when possible (post-validation)
- P3: Nice to have, future consideration (v2+)

## Competitor Feature Analysis

| Feature | Static Holiday Calendars (Competitors) | Enterprise PTO Tools | Our Approach |
|---------|----------------------------------------|----------------------|--------------|
| Holiday display | Static list view, sometimes calendar | Calendar with team view | Interactive full-year calendar with visual design |
| Bridge days | Not highlighted | Sometimes suggested | Automatically highlight opportunities visually |
| PTO tracking | No personal tracking | Full approval workflows, team visibility | Simple personal tracking, no approvals, local-first |
| Historical data | No history | Full audit trails, reporting | Simple year archive for personal patterns |
| Mobile UX | Often desktop-only or poor mobile | Mobile apps (complex) | Mobile-first web, no app install needed |
| Vacation optimization | No suggestions | Sometimes in enterprise tools | Smart "maximize your days off" calculator |
| Authentication | Usually none (static) | Required (enterprise) | Optional - work locally OR sync if desired |
| Complexity | Very simple | Very complex (HR systems) | Balanced - powerful but not overwhelming |

## Mobile UX Considerations

**Critical for mobile:**
- Touch targets minimum 44px (Apple) / 48px (Google) for date selection
- Swipe gestures for month navigation (feels natural on mobile)
- Bottom navigation if needed (thumb-friendly zone)
- No hover states (mobile has no hover)
- Fast load time on mobile networks (<3s for initial render)
- Works offline (service worker caching)

**Mobile-specific features:**
- Add to home screen capability (PWA)
- Portrait orientation optimized (primary use case)
- Landscape orientation for wider calendar view (secondary)
- No pinch-zoom needed - text readable at default size

## SEO Implications

**High-value keywords:**
- "Bulgarian holidays 2026"
- "bridge days Bulgaria 2026"
- "vacation tracker Bulgaria"
- "PTO calculator 2026"

**SEO-friendly features:**
- Server-side render holiday calendar (indexable content)
- Static pages for each year (e.g., `/2026`, `/2027`)
- Semantic HTML for holiday list (structured data)
- Meta descriptions highlighting bridge day opportunities
- Open Graph tags for social sharing

**Content opportunities:**
- Blog post: "Maximize your vacation days in Bulgaria 2026" (bridge day guide)
- FAQ page: "How many public holidays does Bulgaria have?"
- Comparison: "Bulgaria vs EU average vacation days"

## Sources

**Vacation tracking apps research:**
- [The 7 Best PTO Tracking Software (2026 Reviews)](https://buddypunch.com/blog/pto-tracking-software/)
- [5 Best Employee PTO Tracking Software of 2026](https://connecteam.com/employee-pto-tracker/)
- [25 Best Leave Management Software of 2026 for Tracking PTO](https://peoplemanagingpeople.com/tools/best-leave-management-software/)
- [Vacation Tracker Features](https://vacationtracker.io/)

**Holiday calendar apps research:**
- [US Calendar with Holidays - Google Play](https://play.google.com/store/apps/details?id=com.calendarus&hl=en_US)
- [Holiday Today Calendar - App Store](https://apps.apple.com/us/app/holiday-today-calendar/id445281146)

**Bridge days and vacation optimization:**
- [Holiday calendar 2026](https://www.motel-one.com/en/the-travel-edit/tips-tricks/holiday-calendar-2026/)
- [Double your time off: how to maximise your holidays in 2026](https://www.limehome.com/en/travel-made-simple/holiday-planning-2026/)
- [Vacation planning 2026: Make clever use of bridging days](https://www.zep.de/en/blog/vacation-planning-germany-2026)

**User complaints and problems:**
- [Vacation Tracker Reviews 2026](https://www.capterra.com/p/189276/Vacation-Tracker/reviews/)
- [Optimize Vacation Calendar with Virto's Integrated Solution](https://www.virtosoftware.com/use-cases/vacation-tracker/)

**Market differentiation:**
- [Calendar App Market Size, Trends, Industry Evaluation & Forecast 2033](https://www.verifiedmarketreports.com/product/calendar-app-market/)
- [11 Best Calendar Apps 2026](https://efficient.app/best/calendar)

**MVP and simplicity guidance:**
- [What Great Leave Management Software Should Do in 2026](https://carbonateapp.com/blogs/what-great-leave-management-software-should-do-in-2026/)
- [Minimum Viable Product (MVP): The Complete Guide for 2026](https://monday.com/blog/rnd/mvp-in-project-management/)

---
*Feature research for: Bulgarian Holiday Calendar + Vacation Tracking*
*Researched: 2026-01-18*
