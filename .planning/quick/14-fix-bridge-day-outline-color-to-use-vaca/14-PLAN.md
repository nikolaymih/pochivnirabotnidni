---
phase: quick-14
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/Legend.tsx
  - components/MonthGrid.tsx
autonomous: true

must_haves:
  truths:
    - "Bridge day outline color matches the filled vacation day background color (light teal #BDD7DE)"
    - "Legend bridge swatch matches calendar bridge day cell outline"
  artifacts:
    - path: "components/Legend.tsx"
      provides: "Bridge day legend swatch with vacation-bg border"
      contains: "border-vacation-bg"
    - path: "components/MonthGrid.tsx"
      provides: "Bridge day cells with vacation-bg border"
      contains: "border-vacation-bg"
  key_links:
    - from: "components/Legend.tsx"
      to: "app/globals.css"
      via: "CSS variable --color-vacation-bg"
      pattern: "border-vacation-bg"
    - from: "components/MonthGrid.tsx"
      to: "app/globals.css"
      via: "CSS variable --color-vacation-bg"
      pattern: "border-vacation-bg"
---

<objective>
Fix bridge day outline color from vacation text color (#2E8B57 green) to vacation background color (#BDD7DE light teal).

Purpose: Bridge day outlines should visually match the filled vacation day color for consistency. Currently they use `border-vacation` (green text color) but should use `border-vacation-bg` (light teal background color).
Output: Updated Legend.tsx and MonthGrid.tsx with correct border color token.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/globals.css (line 37: --color-vacation-bg: #BDD7DE)
@components/Legend.tsx
@components/MonthGrid.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace border-vacation with border-vacation-bg in Legend and MonthGrid</name>
  <files>components/Legend.tsx, components/MonthGrid.tsx</files>
  <action>
    In `components/Legend.tsx` line 18:
    - Change `border-2 border-vacation bg-transparent` to `border-2 border-vacation-bg bg-transparent`

    In `components/MonthGrid.tsx` line 160 (bridge day, no school overlap):
    - Change `border-2 border-vacation bg-transparent text-espresso` to `border-2 border-vacation-bg bg-transparent text-espresso`

    In `components/MonthGrid.tsx` line 161 (bridge+school overlap):
    - Change `border-2 border-vacation text-espresso` to `border-2 border-vacation-bg text-espresso`

    The `border-vacation-bg` utility maps to `--color-vacation-bg: #BDD7DE` (light teal) via Tailwind v4 auto-generation, same as `bg-vacation-bg` already works throughout the codebase.
  </action>
  <verify>
    Run: `grep -n "border-vacation" components/Legend.tsx components/MonthGrid.tsx`
    Expected: All instances show `border-vacation-bg`, none show bare `border-vacation` (without -bg suffix).
  </verify>
  <done>Bridge day outlines in both legend swatch and calendar cells use the light teal vacation background color (#BDD7DE) instead of the green vacation text color (#2E8B57).</done>
</task>

</tasks>

<verification>
1. `grep -n "border-vacation-bg" components/Legend.tsx components/MonthGrid.tsx` shows 3 matches
2. `grep -n "border-vacation[^-]" components/Legend.tsx components/MonthGrid.tsx` shows 0 matches
3. Visual: Bridge day cells have light teal outline matching filled vacation day background
</verification>

<success_criteria>
- All bridge day borders use `border-vacation-bg` token (light teal #BDD7DE)
- Legend swatch matches calendar cell styling
- No remaining references to bare `border-vacation` in these files
</success_criteria>

<output>
After completion, create `.planning/quick/14-fix-bridge-day-outline-color-to-use-vaca/14-SUMMARY.md`
</output>
