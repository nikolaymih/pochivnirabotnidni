---
phase: quick-22
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [app/page.tsx]
autonomous: true

must_haves:
  truths:
    - "On mobile, description paragraphs appear directly after the h1 title and before Legend"
    - "Desktop layout is completely unchanged"
    - "All three paragraphs (PAGE_DESCRIPTION, PAGE_DESCRIPTION_EXTENDED, PAGE_DESCRIPTION_HISTORY) are moved"
  artifacts:
    - path: "app/page.tsx"
      provides: "Updated mobile layout order"
      contains: "PAGE_DESCRIPTION"
  key_links: []
---

<objective>
Move the three description paragraphs (PAGE_DESCRIPTION, PAGE_DESCRIPTION_EXTENDED, PAGE_DESCRIPTION_HISTORY) from below LeftSidebar to directly after the h1 title in the mobile layout, so users see the site description immediately after the title.

Purpose: Better mobile content hierarchy — description context comes before interactive components.
Output: Updated `app/page.tsx` with reordered mobile layout.
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
  <name>Task 1: Reorder mobile layout — move description paragraphs after h1</name>
  <files>app/page.tsx</files>
  <action>
In the mobile layout section (`lg:hidden`), lines 64-99 of `app/page.tsx`:

1. Remove the three `<p>` elements from the "Description + Year selector + Calendar" div (lines 88-90):
   ```
   <p className="text-espresso text-sm mt-1 max-w-[650px]">{PAGE_DESCRIPTION}</p>
   <p className="text-espresso text-sm mt-2 max-w-[650px]">{PAGE_DESCRIPTION_EXTENDED}</p>
   <p className="text-espresso text-sm mt-2 mb-5 max-w-[650px]">{PAGE_DESCRIPTION_HISTORY}</p>
   ```

2. Insert those three paragraphs immediately after the `<h1>` (line 75), before the `<Legend />` component. Adjust spacing:
   - First paragraph: keep `mt-1` (close to title)
   - Second paragraph: keep `mt-2`
   - Third paragraph: change `mb-5` to `mb-4` to provide appropriate spacing before Legend

3. The remaining "Year selector + Calendar" div should now only contain `<YearSelector>` and `<FullYearCalendarWrapper>`. Remove the now-unnecessary `mt-4` wrapper div around them — just keep `<YearSelector>` and the calendar inline, with a `mt-4` on the YearSelector itself or keep the wrapper div with mt-4 (either is fine, just make sure spacing looks right).

4. DO NOT touch the desktop layout section (`hidden lg:block`, lines 101-140) at all.

The resulting mobile content order should be:
```
h1 title
PAGE_DESCRIPTION paragraph
PAGE_DESCRIPTION_EXTENDED paragraph
PAGE_DESCRIPTION_HISTORY paragraph
Legend
VacationSummary
LeftSidebar
YearSelector + Calendar
```
  </action>
  <verify>
1. Run `npm run build` — no TypeScript or build errors
2. Visually confirm in the mobile `lg:hidden` section: paragraphs appear between h1 and Legend
3. Confirm desktop `hidden lg:block` section is unchanged
  </verify>
  <done>
Mobile layout shows description paragraphs immediately after title and before Legend. Desktop layout unchanged. Build passes.
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes without errors
- In mobile section: h1 -> 3 paragraphs -> Legend -> VacationSummary -> LeftSidebar -> YearSelector + Calendar
- Desktop section is byte-for-byte identical to before
</verification>

<success_criteria>
- Description paragraphs appear directly after h1 title on mobile
- Legend and VacationSummary follow the description paragraphs
- Desktop layout completely unchanged
- No build errors
</success_criteria>

<output>
After completion, create `.planning/quick/22-move-description-paragraphs-to-top-on-mo/22-SUMMARY.md`
</output>
