# Project Instructions: Pochivni Rabotni Dni

## Context-First Development Protocol

**🚨 MANDATORY: Read these files before ANY work:**

```bash
# Always read these three files first:
1. .planning/STATE.md          # Current state, accumulated decisions
2. .planning/ROADMAP.md        # Current phase, what's been built
3. .planning/PROJECT.md        # Core requirements, constraints

# Then read codebase analysis (especially before planning/executing):
4. .planning/codebase/CONVENTIONS.md  # Naming patterns, code style
5. .planning/codebase/ARCHITECTURE.md # Layers, component patterns, data flow
6. .planning/codebase/CONCERNS.md     # Tech debt, risks, known issues

# Then read relevant phase files:
7. .planning/phases/{current-phase}/{phase}-CONTEXT.md
8. .planning/phases/{current-phase}/{phase}-RESEARCH.md
9. .planning/phases/{current-phase}/{plan}-PLAN.md
```

**When spawning researcher/planner agents:** Inline the codebase analysis files (CONVENTIONS, ARCHITECTURE, CONCERNS) into their prompts. Without these, agents plan based on assumptions instead of the actual codebase.

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

## UI Feedback Loop: agent-browser + ChunkHound

**MANDATORY for ALL UI work (component changes, styling, layout, visual fixes).**

Both tools are installed globally and must be used together as a closed loop.

### Tools

**ChunkHound** — Codebase intelligence. Frontend code has many similarly named components, props, and patterns. ChunkHound grounds you in the actual codebase so you don't guess or miss related code.
```bash
chunkhound search "ComponentName"
chunkhound research "how does [component] connect to [other component]"
chunkhound search "imports ComponentName"
```
ChunkHound MCP is also configured in `.claude/settings.json` — use MCP tools when available.

**agent-browser** — Visual verification. You MUST visually verify UI changes by rendering them. Never assume CSS/layout changes look correct.
```bash
agent-browser open http://localhost:3000
agent-browser snapshot                              # text-based accessibility snapshot
agent-browser screenshot --path /tmp/ui-check.png   # visual screenshot
```

### The Closed Loop
1. **Understand** — ChunkHound: find affected components, consumers, related code
2. **Change** — Make the UI modifications
3. **Verify** — agent-browser: render and visually inspect the result
4. **Fix** — If something looks wrong, go back to step 2
5. **Confirm** — Final agent-browser snapshot to verify

### Orchestrator Responsibility During `/gsd:execute-phase`

**Executor subagents do NOT automatically use these tools.** Therefore, the orchestrator (main agent) MUST enforce the feedback loop between execution waves:

**Before spawning UI executors:**
- Run `chunkhound search` on the components about to be modified
- Check for related components/consumers the plan might have missed
- If the plan is incomplete, add the missing context to the executor prompt

**After each wave completes (if UI files were modified):**
1. Start dev server if not running: `npm run dev`
2. Run `agent-browser open http://localhost:3000`
3. Run `agent-browser snapshot` — analyze the text output for obvious issues
4. Run `agent-browser screenshot --path /tmp/wave-N-check.png` — visually inspect
5. Check for regressions: do existing features still work?
6. Check Coffee token compliance: `grep -rn "bg-red-\|bg-blue-\|bg-yellow-\|bg-gray-\|bg-green-\|bg-purple-" components/ app/page.tsx`
7. If issues found: **fix before moving to next wave**
8. Only proceed to next wave when visual output is confirmed correct

**This is non-negotiable.** The Phase 5 single-tap regression happened because executors made changes without visual verification. The orchestrator catches what executors miss.

### Coffee Theme Compliance
All UI must use Coffee theme tokens (defined in `app/globals.css`). See `.planning/ux-critique-protocol.md` for the full UX critique process and `.planning/coffee-token-mapping.md` for the complete token reference.

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
