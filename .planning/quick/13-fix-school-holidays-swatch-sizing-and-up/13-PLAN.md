---
phase: quick
plan: 13
type: execute
wave: 1
depends_on: []
files_modified:
  - components/Legend.tsx
  - components/MonthGrid.tsx
  - app/globals.css
autonomous: true

must_haves:
  truths:
    - "All legend swatches render at identical height regardless of text length"
    - "Bridge day legend swatch shows as outline-only in vacation color with no fill"
    - "Bridge day calendar cells show as outline-only in vacation color (suggestion state)"
    - "Clicking a bridge day still toggles it to filled vacation style"
  artifacts:
    - path: "components/Legend.tsx"
      provides: "Fixed swatch sizing and bridge outline style"
    - path: "components/MonthGrid.tsx"
      provides: "Bridge day outline styling in calendar grid"
  key_links:
    - from: "components/Legend.tsx"
      to: "app/globals.css"
      via: "CSS theme tokens"
      pattern: "border-vacation|bg-transparent"
---

<objective>
Fix two legend UX issues: (1) school holidays swatch shrinking due to text wrap, and (2) change bridge day styling from solid fill to outline-only in vacation color, creating a visual suggestion-to-selection progression.

Purpose: Improve visual consistency of legend and communicate that bridge days are suggestions (outline) that become selections (filled) when clicked.
Output: Updated Legend.tsx with fixed swatch sizing and outline bridge style, updated MonthGrid.tsx with outline bridge day cells.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@components/Legend.tsx
@components/MonthGrid.tsx
@app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix legend swatch sizing and bridge day outline style</name>
  <files>components/Legend.tsx</files>
  <action>
  Two changes in Legend.tsx:

  1. **Fix swatch sizing:** Add `shrink-0` (flex-shrink: 0) to ALL swatch divs (the `w-6 h-6` colored boxes) so they maintain size when adjacent text wraps. All five swatches get this. Also add `min-w-6 min-h-6` as belt-and-suspenders.

  2. **Bridge day swatch to outline:** Change the bridge day swatch (comment "3. Bridge Day Suggestion") from:
     ```
     <div className="w-6 h-6 bg-bridge-bg rounded"></div>
     ```
     To an outline-only box using vacation color:
     ```
     <div className="w-6 h-6 border-2 border-vacation bg-transparent rounded shrink-0 min-w-6 min-h-6"></div>
     ```
     This uses `border-vacation` (maps to --color-vacation: #2E8B57) with no fill, communicating "suggestion" visually.
  </action>
  <verify>Run `npx next build` or check dev server renders Legend with all swatches at equal height. Bridge swatch should show green outline with no fill. School holidays text can wrap but swatch stays 24x24.</verify>
  <done>All five legend swatches render at consistent 24x24 size. Bridge day swatch displays as a green (#2E8B57) outline with transparent interior.</done>
</task>

<task type="auto">
  <name>Task 2: Update bridge day calendar cell styling to outline-only</name>
  <files>components/MonthGrid.tsx, app/globals.css</files>
  <action>
  Update bridge day styling in the calendar grid to match the new legend (outline = suggestion, filled = selected).

  In **MonthGrid.tsx**, change the bridge day styling logic (line ~160):

  **Current** (solid fill):
  ```
  !isHighlighted && !displayAsHoliday && !isVacation && !isSchoolHoliday && isBridge && !isBridgeSchoolOverlap && 'bg-bridge-bg text-black',
  ```

  **New** (outline only in vacation color):
  ```
  !isHighlighted && !displayAsHoliday && !isVacation && !isSchoolHoliday && isBridge && !isBridgeSchoolOverlap && 'border-2 border-vacation bg-transparent text-espresso',
  ```

  This creates the visual progression:
  - Bridge day (unselected): green outline, no fill = "suggestion"
  - Bridge day (selected as vacation): filled with `bg-vacation-bg` = "confirmed vacation"

  **Also update the bridge+school overlap style** (line ~161 and the inline gradient style ~207-209):
  For `isBridgeSchoolOverlap`, change the gradient to use vacation border + school-bg:
  ```
  !isHighlighted && !displayAsHoliday && !isVacation && isBridgeSchoolOverlap && 'border-2 border-vacation text-espresso',
  ```
  And update the inline gradient style for overlap to:
  ```
  background: 'linear-gradient(135deg, transparent 50%, var(--color-school-bg) 50%)'
  ```
  This shows the bridge half as transparent (outline only) and school half as filled.

  **Note:** The `border-vacation` utility class should already work via Tailwind v4's automatic CSS variable mapping (`--color-vacation: #2E8B57`). If it doesn't resolve, add it as a theme extension in globals.css under the `@theme` block.
  </action>
  <verify>
  1. Run dev server (`npm run dev`)
  2. Check bridge day cells in calendar show green outline with no fill
  3. Click a bridge day - it should fill with vacation color (bg-vacation-bg)
  4. Check bridge+school overlap days render correctly with split styling
  5. Verify no visual regressions on holidays, weekends, or vacation days
  </verify>
  <done>Bridge day cells in calendar grid display as vacation-color (#2E8B57) outline with transparent fill. Clicking toggles to filled vacation style. Bridge+school overlap renders correctly. No regressions on other day types.</done>
</task>

</tasks>

<verification>
1. All legend swatches render at equal height (24x24) regardless of text length
2. Bridge day legend swatch shows green outline, no fill
3. Bridge day calendar cells show green outline, no fill (unselected state)
4. Clicking a bridge day fills it with vacation color (selected state)
5. Bridge+school overlap days render correctly
6. No visual regressions on other day types (holidays, weekends, vacation)
</verification>

<success_criteria>
- Legend swatches are visually consistent across all five items
- Bridge days communicate "suggestion" via outline-only styling
- Visual progression: outline (suggestion) -> filled (selected vacation) works on click
- All existing day type styling preserved
</success_criteria>

<output>
After completion, create `.planning/quick/13-fix-school-holidays-swatch-sizing-and-up/13-SUMMARY.md`
</output>
