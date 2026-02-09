# GSD Workflow: How Claude Executes Work

This document describes the complete workflow from idea to verified feature, what happens at each step, which files are read, which agents are spawned, and where things can go wrong.

## Overview

```
/gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work
     (WHY)              (HOW)              (DO)                (CHECK)
```

Each command is a separate conversation turn (usually after `/clear` for fresh context). The output of each step feeds into the next via files on disk.

---

## Step 1: `/gsd:discuss-phase {N}`

**Purpose:** Extract implementation decisions from the user. Clarify gray areas so downstream agents (researcher, planner) can act without guessing.

### What I Read
| File | Why |
|------|-----|
| `.planning/STATE.md` | Current project position, accumulated decisions |
| `.planning/ROADMAP.md` | Phase goal, dependencies, success criteria |

### What Happens
1. I analyze the phase goal from ROADMAP.md
2. I identify 3-4 gray areas specific to the phase (not generic categories)
3. I present them as a multi-select — you choose which to discuss
4. For each area: 4 questions, then "more or move on?"
5. I capture every decision you make

### What I Write
- `.planning/phases/{phase}/{phase}-CONTEXT.md` — All decisions, clear enough that agents can act on them without asking the user again

### What Can Go Wrong
- Not much. This is conversation between me and you. The risk is scope creep — if you suggest features outside the phase, I should redirect: "That's its own phase."

### Output → Input
CONTEXT.md is consumed by the researcher and planner in the next step.

---

## Step 2: `/gsd:plan-phase {N}`

**Purpose:** Create executable plan files (PLAN.md) with tasks, file lists, verification criteria, and wave assignments for parallel execution.

### What I Read (as orchestrator)
| File | Why |
|------|-----|
| `.planning/STATE.md` | Accumulated decisions, current position |
| `.planning/ROADMAP.md` | Phase goal, success criteria, dependencies |
| `.planning/REQUIREMENTS.md` | Original requirements being addressed |
| `.planning/phases/{phase}/{phase}-CONTEXT.md` | User decisions from discuss step |
| `.planning/config.json` | Model profile (quality/balanced/budget) |
| `.planning/codebase/CONVENTIONS.md` | Naming patterns, code style, project conventions |
| `.planning/codebase/ARCHITECTURE.md` | Layers, component patterns, data flow |
| `.planning/codebase/CONCERNS.md` | Known tech debt, risks, stale patterns |
| `.planning/codebase/STRUCTURE.md` | Folder layout, file organization |
| `.planning/codebase/INTEGRATIONS.md` | External services, APIs, dependencies |
| `.planning/codebase/TESTING.md` | Test setup, coverage, test patterns |
| `.planning/codebase/STACK.md` | Tech stack, versions, frameworks |

**Note:** The `.planning/codebase/` files are created by `/gsd:map-codebase` and provide grounded understanding of the actual codebase. They must be passed to researcher and planner agents alongside the project context files. Without them, agents plan based on assumptions instead of reality.

### What Happens

#### Stage 1: Research (gsd-phase-researcher agent)
1. I spawn a **researcher agent** with:
   - Phase description from ROADMAP
   - Requirements from REQUIREMENTS.md
   - Decisions from CONTEXT.md
   - Prior decisions from STATE.md
   - Codebase analysis from `.planning/codebase/` (CONVENTIONS, ARCHITECTURE, CONCERNS)
2. The researcher does web searches, reads docs, explores the codebase
3. It writes RESEARCH.md with findings

**What the researcher reads:** Whatever I pass in its prompt + whatever it discovers via web search and codebase exploration.

**Risk:** If I forget to pass important context (like a critical STATE.md decision), the researcher won't know about it.

#### Stage 2: Planning (gsd-planner agent)
1. I read all context files and inline their content into the planner prompt
2. I spawn a **planner agent** with:
   - STATE.md content (inlined)
   - ROADMAP.md content (inlined)
   - REQUIREMENTS.md content (inlined)
   - CONTEXT.md content (inlined)
   - RESEARCH.md content (inlined)
   - Codebase analysis: CONVENTIONS.md, ARCHITECTURE.md, CONCERNS.md (inlined)
3. The planner creates PLAN.md files with:
   - Frontmatter: wave number, dependencies, files to modify, autonomous flag
   - Tasks in XML format with action steps, verification, and done criteria
   - `must_haves` for goal-backward verification

**What the planner reads:** Only what I inline into its prompt. It does NOT independently read STATE.md or explore the codebase unless I tell it to.

**Risk:** The planner works from the research + context I provide. If the research missed something about how existing code works, the plan will have gaps.

#### Stage 3: Verification (gsd-plan-checker agent)
1. I spawn a **plan-checker agent** with all plan files + requirements
2. The checker verifies:
   - Do the plans achieve the phase goal?
   - Are dependencies correct?
   - Are tasks specific and actionable?
   - Are there gaps in coverage?
3. If issues found → back to planner for revision (max 3 iterations)

### What I Write
- `.planning/phases/{phase}/{phase}-RESEARCH.md` — Research findings
- `.planning/phases/{phase}/{phase}-NN-PLAN.md` — One per plan (01, 02, 03...)

### What Can Go Wrong
- **Planner doesn't know about existing code patterns** — It plans based on research, not deep codebase understanding. If existing code has quirks (like the pointer events + onClick interaction), the plan won't account for them.
- **Context loss** — Important STATE.md decisions get summarized or truncated when passed to agents. Nuances are lost.
- **Research gaps** — If the researcher doesn't find a critical compatibility issue, the plan won't address it.

### Output → Input
PLAN.md files are consumed by executor agents in the next step.

---

## Step 3: `/gsd:execute-phase {N}`

**Purpose:** Execute all plans in the phase, wave by wave, with parallel agents per wave.

### What I Read (as orchestrator)
| File | Why |
|------|-----|
| `.planning/STATE.md` | Current position, decisions |
| `.planning/ROADMAP.md` | Phase structure, plan count |
| All PLAN.md files in the phase | Wave assignments, dependencies, task details |
| All source files referenced in plans | Current code state to pass to executors |

### What Happens

#### Wave Discovery
1. I read all PLAN.md files and group them by wave number
2. Wave 1 plans have no dependencies (can run first)
3. Wave 2 plans depend on Wave 1 completing, etc.

#### For Each Wave

##### Before Spawning Executors (Orchestrator Pre-Check)
**If UI files are being modified:**
1. Run `chunkhound search` on components about to be modified
2. Check for consumers/dependencies the plan might have missed
3. Add any missing context to the executor prompt

##### Spawning Executors
1. I spawn one **gsd-executor agent** per plan in the wave, in parallel
2. Each executor gets:
   - The PLAN.md content (full text)
   - Current source file contents (I read them and inline them)
   - Instructions to follow the plan's tasks sequentially

##### What Each Executor Does
1. Reads the plan tasks
2. For each task:
   - Reads the files listed in `<files>`
   - Makes the changes described in `<action>`
   - Runs the verification in `<verify>` (usually `npm run build` + grep)
   - Creates an atomic git commit
3. Updates STATE.md with decisions and metrics
4. Writes SUMMARY.md
5. Creates a final metadata commit

**What executors do NOT do:**
- Run ChunkHound to understand component relationships
- Run agent-browser to visually verify changes
- Read the full STATE.md independently (they get what I pass them)
- Check how their changes affect components not listed in the plan

##### After Wave Completes (Orchestrator Post-Check)
**If UI files were modified — THIS IS MANDATORY:**
1. Run `chunkhound search` on modified components to check for missed impacts
2. Start dev server if not running: `npm run dev`
3. Run `agent-browser open http://localhost:3000`
4. Run `agent-browser snapshot` — analyze text output for issues
5. Run `agent-browser screenshot --path /tmp/wave-N-check.png` — visual inspection
6. Check for regressions: do existing features still work?
7. Check Coffee token compliance:
   ```bash
   grep -rn "bg-red-\|bg-blue-\|bg-yellow-\|bg-gray-" components/ app/page.tsx
   ```
8. **If issues found → fix before moving to next wave**
9. Only proceed to next wave when visual output is confirmed correct

**This gate exists because of the Phase 5 single-tap regression.** Executors changed pointer event handling without understanding the existing onClick interaction. The build passed, grep passed, but the feature was broken. Visual verification would have caught it.

##### Between Waves
- I verify Wave N is fully complete (all executors returned success)
- I run the orchestrator post-check above
- I read any SUMMARY.md files from Wave N to understand what changed
- I then spawn Wave N+1 executors

### What I Write (via executor agents)
- `.planning/phases/{phase}/{phase}-NN-SUMMARY.md` — One per plan
- Atomic git commits per task
- STATE.md updates (metrics, decisions, session continuity)

### What Can Go Wrong
- **Executor breaks existing functionality** — The plan says "add X" but doesn't account for how X interacts with existing Y. The executor follows the plan literally.
- **Parallel executors conflict** — Two Wave 1 executors edit the same file. This is prevented by good planning (each plan lists its files, no overlap within a wave).
- **Build passes but feature is broken** — `npm run build` only checks for TypeScript/compilation errors. It doesn't check if the UI actually works correctly. This is why the orchestrator visual check exists.
- **Context drift** — Executor agents each get a snapshot of the code. If Executor A modifies a file that Executor B also reads, B might be working with stale content. This is why plans in the same wave should NOT modify the same files.

---

## Step 4: `/gsd:verify-work`

**Purpose:** User Acceptance Testing. The user tests the built features against the phase's success criteria.

### What I Read
| File | Why |
|------|-----|
| `.planning/ROADMAP.md` | Phase success criteria |
| `.planning/phases/{phase}/{phase}-CONTEXT.md` | User's original decisions |
| All SUMMARY.md files for the phase | What was actually built |

### What Happens
1. I generate test cases from the phase's success criteria
2. I present each test to the user with steps to follow
3. The user tests and reports PASS/FAIL
4. For failures:
   - I investigate the root cause
   - I fix the issue (using the UI feedback loop if it's a visual bug)
   - The user re-tests
5. I record all results in a UAT document

### What I Write
- `.planning/phases/{phase}/{phase}-UAT.md` — Test results, pass/fail, notes
- Bug fix commits if issues were found

### What Can Go Wrong
- **The user finds bugs the orchestrator visual check missed** — This is expected. The visual check catches obvious regressions; UAT catches subtle interaction bugs.
- **Fixes introduce new regressions** — The Phase 5 fix attempt (`e.preventDefault()`) made things worse. Lesson: understand the existing code before fixing.

---

## File Dependency Map

```
PROJECT.md ─────────────────────────────────────────────────────────┐
REQUIREMENTS.md ────────────────────────────────────────────────────┤
                                                                    ▼
/gsd:discuss-phase                                              ROADMAP.md
    reads: STATE.md, ROADMAP.md                                     │
    writes: CONTEXT.md ─────────┐                                   │
                                ▼                                   │
/gsd:plan-phase                                                     │
    reads: STATE.md, ROADMAP.md, REQUIREMENTS.md, CONTEXT.md        │
    spawns: researcher → RESEARCH.md                                │
    spawns: planner → PLAN.md files                                 │
    spawns: checker → validates plans                               │
    writes: RESEARCH.md, PLAN.md(s) ────────┐                      │
                                            ▼                      │
/gsd:execute-phase                                                  │
    reads: STATE.md, ROADMAP.md, all PLAN.md, source files          │
    spawns: executor agents (per wave)                              │
    orchestrator: ChunkHound pre-check, agent-browser post-check    │
    writes: SUMMARY.md(s), commits, STATE.md updates ───┐          │
                                                        ▼          │
/gsd:verify-work                                                    │
    reads: ROADMAP.md, CONTEXT.md, SUMMARY.md(s)                   │
    writes: UAT.md, bug fix commits                                 │
    updates: ROADMAP.md (mark phase complete) ──────────────────────┘
```

---

## Key Files Reference

| File | Created By | Read By | Purpose |
|------|-----------|---------|---------|
| `PROJECT.md` | `/gsd:new-project` | Everything | Core requirements, constraints |
| `REQUIREMENTS.md` | `/gsd:new-project` | Planner, checker | Detailed requirements |
| `ROADMAP.md` | `/gsd:new-project` | Everything | Phase breakdown, success criteria |
| `STATE.md` | Executors (updated) | Everything | Accumulated decisions, metrics |
| `codebase/CONVENTIONS.md` | `/gsd:map-codebase` | Researcher, planner | Naming, code style, patterns |
| `codebase/ARCHITECTURE.md` | `/gsd:map-codebase` | Researcher, planner | Layers, data flow, component patterns |
| `codebase/CONCERNS.md` | `/gsd:map-codebase` | Researcher, planner | Tech debt, risks, known issues |
| `codebase/STRUCTURE.md` | `/gsd:map-codebase` | Researcher, planner | Folder layout, file organization |
| `codebase/INTEGRATIONS.md` | `/gsd:map-codebase` | Researcher, planner | External services, APIs |
| `codebase/TESTING.md` | `/gsd:map-codebase` | Researcher, planner | Test setup, coverage |
| `codebase/STACK.md` | `/gsd:map-codebase` | Researcher, planner | Tech stack, versions |
| `{phase}-CONTEXT.md` | `/gsd:discuss-phase` | Researcher, planner | User decisions |
| `{phase}-RESEARCH.md` | `/gsd:plan-phase` | Planner | Technical research findings |
| `{phase}-NN-PLAN.md` | `/gsd:plan-phase` | Executor agents | Task breakdown, actions |
| `{phase}-NN-SUMMARY.md` | `/gsd:execute-phase` | Verify, next phases | What was built, decisions |
| `{phase}-UAT.md` | `/gsd:verify-work` | Reference | Test results |
| `config.json` | `/gsd:settings` | Plan-phase orchestrator | Model profile |
| `ux-critique-protocol.md` | Phase 5.1 | UI work reference | Critique rules |
| `coffee-token-mapping.md` | Phase 5.1 | UI work reference | Color token reference |

---

## Known Weaknesses and Mitigations

| Weakness | Example | Mitigation |
|----------|---------|------------|
| Executor agents don't understand existing code deeply | Phase 5: pointer events broke onClick | Orchestrator visual check after each wave |
| Plans can miss related components | A change to MonthGrid might need Legend updates too | ChunkHound pre-check before spawning executors |
| Context loss across agent boundaries | STATE.md decisions get summarized | Orchestrator inlines full file contents, not summaries |
| Build passes but feature is broken | CSS changes compile but look wrong | agent-browser snapshot + screenshot after waves |
| Fix attempts can make things worse | `e.preventDefault()` broke more than it fixed | Read existing code + understand before fixing. Use ChunkHound. |
| Parallel executors can conflict | Two agents editing same file | Plans assign non-overlapping files per wave |

---

## Commands Quick Reference

| Command | When to Use | Requires |
|---------|-------------|----------|
| `/gsd:discuss-phase N` | Starting a new phase, need to clarify decisions | Phase exists in ROADMAP |
| `/gsd:plan-phase N` | After discussion, ready to create plans | CONTEXT.md exists |
| `/gsd:execute-phase N` | Plans are written, ready to build | PLAN.md files exist |
| `/gsd:verify-work` | Phase executed, ready for UAT | SUMMARY.md files exist |
| `/gsd:insert-phase N` | Urgent work discovered mid-milestone | Phase N exists |
| `/gsd:progress` | Check where we are | Any time |
| `/gsd:debug` | Systematic debugging of a specific issue | Bug identified |
| `/clear` | Between commands | Fresh context window |
