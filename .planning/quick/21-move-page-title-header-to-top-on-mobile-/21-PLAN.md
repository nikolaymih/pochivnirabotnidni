---
phase: quick-21
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [app/page.tsx]
autonomous: true

must_haves:
  truths:
    - "On mobile, the page title h1 appears immediately after the header (logo + auth), before Legend and VacationSummary"
    - "On desktop, the layout is completely unchanged"
    - "Description paragraphs stay in their current position (before YearSelector)"
  artifacts:
    - path: "app/page.tsx"
      provides: "Mobile layout with h1 moved to top"
      contains: "PAGE_TITLE"
  key_links:
    - from: "app/page.tsx mobile section (lg:hidden)"
      to: "PAGE_TITLE constant"
      via: "h1 element rendered after header div"
      pattern: "AuthHeader.*\\n.*\\n.*PAGE_TITLE"
---

<objective>
Move the page title h1 ("Празнични и неработни дни през 2026 година") from its current position (after LeftSidebar) to immediately after the mobile header (logo + auth button), so it's the first content users see on mobile.

Purpose: Better mobile UX — the page title should be prominent and visible immediately, not buried below legend/sidebar content.
Output: Modified app/page.tsx with reordered mobile layout.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move h1 title to top of mobile layout</name>
  <files>app/page.tsx</files>
  <action>
In the mobile layout section (`lg:hidden`, lines 65-97 of app/page.tsx):

**Current mobile order (inside the `max-w-[650px] mx-auto px-4` container, lines 73-96):**
1. Legend (line 75)
2. VacationSummary (line 76)
3. LeftSidebar (lines 78-81)
4. Title div containing: h1, descriptions, YearSelector, Calendar (lines 83-95)

**Target mobile order:**
1. h1 title (extracted from the Title div)
2. Legend
3. VacationSummary
4. LeftSidebar
5. Remaining title div: descriptions, YearSelector, Calendar

**Specific changes:**
1. Extract the h1 line from inside the "Title + Year selector + Calendar" div (line 85):
   ```
   <h1 className="text-xl font-bold text-espresso max-w-[650px]">{PAGE_TITLE(currentYear)}</h1>
   ```
2. Place it as the FIRST element inside the `max-w-[650px] mx-auto px-4` container (before Legend), adding `mb-4` for spacing below it.
3. The description paragraphs (PAGE_DESCRIPTION, PAGE_DESCRIPTION_EXTENDED, PAGE_DESCRIPTION_HISTORY) stay inside the existing "mt-4" div where they currently are — do NOT move them.
4. Do NOT touch the desktop layout section (`hidden lg:block`, lines 99-138) at all.

**Result — the mobile content container should look like:**
```jsx
<div className="max-w-[650px] mx-auto px-4">
  {/* Page title first on mobile */}
  <h1 className="text-xl font-bold text-espresso max-w-[650px] mb-4">{PAGE_TITLE(currentYear)}</h1>

  {/* Right sidebar content first on mobile */}
  <Legend />
  <VacationSummary year={currentYear} />

  {/* Left sidebar content */}
  <div className="mt-4">
    <LeftSidebar holidays={holidays} schoolHolidays={schoolHolidays} year={currentYear} />
  </div>

  {/* Description + Year selector + Calendar */}
  <div className="mt-4">
    <p className="text-espresso text-sm mt-1 max-w-[650px]">{PAGE_DESCRIPTION}</p>
    <p className="text-espresso text-sm mt-2 max-w-[650px]">{PAGE_DESCRIPTION_EXTENDED}</p>
    <p className="text-espresso text-sm mt-2 mb-5 max-w-[650px]">{PAGE_DESCRIPTION_HISTORY}</p>
    <YearSelector year={currentYear} />
    <FullYearCalendarWrapper
      year={currentYear}
      holidays={holidays}
      schoolHolidayDates={schoolHolidayDates}
    />
  </div>
</div>
```
  </action>
  <verify>
1. `npx next build` completes without errors
2. Visual check: on mobile viewport, h1 title appears right after the header logo/auth row, before legend
3. Visual check: on desktop viewport, layout is unchanged (h1 remains in center column)
  </verify>
  <done>
- Mobile: h1 title renders immediately after header, before Legend/VacationSummary/LeftSidebar
- Desktop: layout completely unchanged
- Description paragraphs remain in their original position before YearSelector
- No build errors
  </done>
</task>

</tasks>

<verification>
- Mobile layout shows: Header -> h1 Title -> Legend -> VacationSummary -> LeftSidebar -> Descriptions -> YearSelector -> Calendar
- Desktop layout unchanged: three-column with h1 in center column
- Build passes without errors
</verification>

<success_criteria>
The h1 page title is the first content element visible on mobile after the header, giving users immediate context about what page they're on.
</success_criteria>

<output>
After completion, create `.planning/quick/21-move-page-title-header-to-top-on-mobile-/21-SUMMARY.md`
</output>
