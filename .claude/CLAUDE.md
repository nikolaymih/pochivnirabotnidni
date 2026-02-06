# Project Instructions: Pochivni Rabotni Dni

## Context-First Development Protocol

**🚨 MANDATORY: Read these files before ANY work:**

```bash
# Always read these three files first:
1. .planning/STATE.md          # Current state, accumulated decisions
2. .planning/ROADMAP.md        # Current phase, what's been built
3. .planning/PROJECT.md        # Core requirements, constraints

# Then read relevant phase files:
4. .planning/phases/{current-phase}/01-CONTEXT.md
5. .planning/phases/{current-phase}/01-RESEARCH.md
6. .planning/phases/{current-phase}/{plan}-PLAN.md
```

**Why:** This project uses GSD (Get Shit Done) methodology. All architectural decisions, research, and reasoning are documented in `.planning/`. Making changes without reading this context WILL break existing functionality or violate carefully researched decisions.

## Critical Project Decisions (from STATE.md)

**Date Handling:**
- ✅ Use date-fns for ALL date operations (Safari compatibility)
- ✅ Store dates as ISO strings (YYYY-MM-DD) without time component
- ✅ Use `parseISO()` for date parsing (Safari-safe)
- ❌ Never use `new Date(string)` - causes Safari bugs
- ❌ Never use `.toISOString()` for date-only values - causes timezone shifts

**Component Architecture:**
- Server Components by default
- Client Components ONLY for interactivity (tooltips, clicks)
- VacationContext → Client wrapper → Server Component props pattern

**Data Flow:**
- OpenHolidays API → 24hr cache → static fallback JSON
- localStorage for anonymous users
- Supabase for authenticated users (Phase 4)

## Before Making Changes

1. **For bug fixes:**
   - Read STATE.md to see if there's an existing decision about this code
   - Read the original PLAN.md that created this code
   - Understand WHY it was built this way
   - Propose fix that respects past decisions OR explain why we should change the decision

2. **For new features:**
   - Check ROADMAP.md - is this already planned?
   - Use `/gsd:plan-phase` to create proper plan FIRST
   - Never code without planning

3. **If unsure:**
   - Read the research: `.planning/phases/{phase}/01-RESEARCH.md`
   - Ask the user before violating documented decisions
   - Propose options with trade-offs

## Red Flags (Stop and Read Context)

If you're about to:
- Remove `parseISO` calls → Read 01-01-PLAN.md (Safari compatibility)
- Change Server/Client boundaries → Read 01-02-PLAN.md and 03-03-PLAN.md
- Modify date storage format → Read STATE.md TECH-07 decision
- Change how holidays are fetched → Read 01-01-PLAN.md (multi-layer fallback)
- Alter vacation state management → Read 02-01-PLAN.md

**STOP. Read the planning docs first.**

## What Breaks Things

❌ Skipping STATE.md and making "quick fixes"
❌ Assuming you understand the codebase from conversation alone
❌ Removing code without understanding why it was added
❌ Fixing bugs reactively without reading research
❌ Working in isolation without connecting to .planning/

✅ Reading context FIRST, coding SECOND
✅ Respecting accumulated decisions
✅ Proposing changes when conflicts arise
✅ Using GSD workflows (plan → execute)
✅ Documenting decisions in STATE.md

## Testing Requirements

- 50% meaningful test coverage (no coverage theater)
- Tests must pass before work is considered complete
- Safari AND Chrome validation required
- Bridge day logic has Jest tests (see 03-01-PLAN.md)

## User Preferences

- Explicit, strong language in communication
- Ask before coding if requirements are unclear
- No over-engineering
- No unnecessary abstractions
- Bulgarian language for UI (Cyrillic)
- Mobile-first responsive design

---

**Remember:** Every "quick fix" that skips reading context creates technical debt and breaks existing functionality. The 5 minutes spent reading STATE.md saves hours of debugging broken features.
