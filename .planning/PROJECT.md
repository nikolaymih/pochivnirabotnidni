# Pochivni Rabotni Dni (Bulgarian Holiday & Vacation Tracker)

## What This Is

A web application for Bulgarian users to view official working and rest days for the entire year, with intelligent vacation combination suggestions and personal paid leave tracking. Users can see all holidays at once in a 12-month calendar, mark their own vacation days, and track their remaining balance with historical data across years.

## Core Value

Users can see all Bulgarian holidays for the year AND track their paid vacation days in one place, with history.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Display full-year calendar showing all 12 months at once
- [ ] Fetch and display official Bulgarian holidays from OpenHolidays API (red color)
- [ ] Suggest vacation combinations when holidays are close together (yellow color)
- [ ] Allow users to mark their own paid vacation days (blue color)
- [ ] Display legend explaining all day types (national holidays, orthodox holidays, user vacation, combinations)
- [ ] Show holiday details on hover (date, name, type)
- [ ] Vacation balance tracking: user enters total annual days, system calculates remaining
- [ ] Allow manual vacation balance updates (for job changes)
- [ ] Google authentication for cross-device sync
- [ ] Local storage fallback for non-authenticated users
- [ ] Store user data server-side (PostgreSQL) as source of truth for authenticated users
- [ ] Track historical data: previous years' holidays and user's vacation history
- [ ] Year rollover: unused vacation days roll over for authenticated users only
- [ ] SEO optimization for Google indexing
- [ ] Responsive mobile support (Safari and Chrome on desktop and mobile)
- [ ] Good UX/UI design

### Out of Scope

- Google Calendar integration — deferred to v2, adds complexity
- Month-by-month navigation — possibly v2, v1 focuses on full-year view
- Automatic vacation rollover for local storage users — data persistence not guaranteed in local storage
- Custom holiday creation — v1 uses official Bulgarian holidays only
- Team/company calendar sharing — individual use case only for v1

## Context

**Market:**
- Multiple similar apps exist for Bulgaria showing official holidays
- Competition is mostly static: users can only view dates and basic suggestions
- This app differentiates with interactive vacation tracking and history

**User Behavior:**
- Many users will access from mobile browsers
- Users need to plan vacation around official holidays
- Users want to track how many vacation days they have left
- Users change jobs and need to update their vacation balance

**Technical Environment:**
- Next.js 16.1.3 with App Router already set up
- TypeScript strict mode
- Tailwind CSS v4
- React 19.2.3 Server Components

**Data Source:**
- OpenHolidays API provides reliable, structured Bulgarian holiday data
- More robust than scraping government websites
- Supports historical data queries

## Constraints

- **Tech Stack**: Next.js (existing), PostgreSQL via Supabase, Vercel deployment — locked in, cost-effective stack
- **Database**: Supabase PostgreSQL free tier (500MB) — cost constraint, sufficient for v1
- **Hosting**: Vercel free tier — budget constraint, minimal hosting costs
- **Budget**: Limited - domain costs acceptable, hosting must stay free or very cheap
- **Browser Support**: Must work on Safari and Chrome (desktop and mobile) — primary user browsers
- **Mobile**: Must work well on mobile browsers — many users access via mobile
- **Performance**: Must efficiently render 12-month calendar view — core UX requirement
- **SEO**: Critical for discoverability — competitive market in Bulgaria
- **API**: OpenHolidays API for Bulgarian holidays — reliability over scraping
- **Code Quality**: Be explicit, use strong language, ask before coding if unsure — prevent ambiguity
- **Testing**: Minimum 50% meaningful test coverage, no coverage theater — quality over quantity
- **Testing Gate**: Tests must pass before work is considered done — non-negotiable quality bar

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for PostgreSQL | Free tier (500MB), good DX, includes auth helpers | — Pending |
| Hybrid local storage + auth | Gives users flexibility: quick start OR cross-device sync | — Pending |
| Manual vacation balance updates | Simplest for job changes, user controls their data | — Pending |
| OpenHolidays API vs scraping | Reliable structured data, won't break on website changes | — Pending |
| Full year view in v1 | Core differentiator, shows all holidays at once | — Pending |
| 50% test coverage threshold | Meaningful tests only, no theater to hit numbers | — Pending |
| Google auth only (v1) | Simple, widely used in Bulgaria, defer other providers | — Pending |

---
*Last updated: 2026-01-18 after initialization*
