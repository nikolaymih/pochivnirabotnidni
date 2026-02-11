---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [app/page.tsx]
autonomous: true

must_haves:
  truths:
    - "Description paragraphs below page title render in dark (espresso) color, not muted coffee"
  artifacts:
    - path: "app/page.tsx"
      provides: "Page layout with dark description text"
      contains: "text-espresso text-sm"
  key_links: []
---

<objective>
Change description paragraph text color from `text-coffee` to `text-espresso` in both mobile and desktop layouts.

Purpose: Make the SEO description text more readable by using the darkest Coffee theme token instead of the muted mid-tone.
Output: Updated `app/page.tsx` with `text-espresso` on all 6 description `<p>` elements.
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
  <name>Task 1: Change description paragraph text color to espresso</name>
  <files>app/page.tsx</files>
  <action>
    In `app/page.tsx`, replace `text-coffee` with `text-espresso` on the following 6 lines:

    Mobile layout (lines 58-60):
    - Line 58: `<p className="text-coffee text-sm mt-1 max-w-[650px]">` -> `<p className="text-espresso text-sm mt-1 max-w-[650px]">`
    - Line 59: `<p className="text-coffee text-sm mt-2 max-w-[650px]">` -> `<p className="text-espresso text-sm mt-2 max-w-[650px]">`
    - Line 60: `<p className="text-coffee text-sm mt-2 mb-5 max-w-[650px]">` -> `<p className="text-espresso text-sm mt-2 mb-5 max-w-[650px]">`

    Desktop layout (lines 90-92):
    - Line 90: `<p className="text-coffee text-sm mt-1 max-w-[650px]">` -> `<p className="text-espresso text-sm mt-1 max-w-[650px]">`
    - Line 91: `<p className="text-coffee text-sm mt-2 max-w-[650px]">` -> `<p className="text-espresso text-sm mt-2 max-w-[650px]">`
    - Line 92: `<p className="text-coffee text-sm mt-2 mb-6 max-w-[650px]">` -> `<p className="text-espresso text-sm mt-2 mb-6 max-w-[650px]">`

    Do NOT change `text-coffee` on any other elements. Only these 6 description paragraphs (the ones containing PAGE_DESCRIPTION, PAGE_DESCRIPTION_EXTENDED, PAGE_DESCRIPTION_HISTORY).
    Do NOT use `text-black` -- that breaks Coffee theme compliance. `text-espresso` is the correct dark token.
  </action>
  <verify>
    Run: `grep -n "text-coffee" app/page.tsx` -- the 6 description paragraphs should no longer appear.
    Run: `grep -n "text-espresso text-sm" app/page.tsx` -- should show exactly 6 matches (lines 58-60 and 90-92).
    Run: `npm run build` -- build succeeds with no errors.
  </verify>
  <done>All 6 description paragraphs use `text-espresso` instead of `text-coffee`. No other elements changed. Build passes.</done>
</task>

</tasks>

<verification>
- `grep -c "text-espresso text-sm" app/page.tsx` returns 6
- No remaining `text-coffee text-sm` on description paragraph lines
- `npm run build` passes
</verification>

<success_criteria>
Description text below the page title renders in dark espresso color in both mobile and desktop layouts, maintaining Coffee theme compliance.
</success_criteria>

<output>
After completion, create `.planning/quick/3-make-header-text-after-page-title-black-/3-SUMMARY.md`
</output>
