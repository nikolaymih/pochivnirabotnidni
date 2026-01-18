# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-18)

**Core value:** Users can see all Bulgarian holidays for the year AND track their paid vacation days in one place, with history.
**Current focus:** Phase 1 - Foundation & Static Holiday View

## Current Position

Phase: 1 of 6 (Foundation & Static Holiday View)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-01-18 — Roadmap created with 6 phases covering all 33 v1 requirements

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: N/A
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: None yet
- Trend: N/A

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Supabase for PostgreSQL (free tier, good DX, includes auth helpers) - Pending
- Hybrid local storage + auth (quick start OR cross-device sync) - Pending
- OpenHolidays API vs scraping (reliable structured data) - Pending
- Full year view in v1 (core differentiator) - Pending
- 50% test coverage threshold (meaningful tests only) - Pending

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 1 Critical Pitfalls to Address:**
- Safari date parsing incompatibility (use ISO 8601, date-fns, test early)
- Timezone assumptions EET/EEST vs UTC (store as ISO date strings without time)
- Supabase free tier inactivity pausing (implement health check cron)
- OpenHolidays API coupling (cache in database, static fallback JSON)

## Session Continuity

Last session: 2026-01-18 (roadmap creation)
Stopped at: Roadmap and STATE.md created, ready for Phase 1 planning
Resume file: None
