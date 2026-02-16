---
phase: quick-12
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/MonthGrid.tsx
  - components/FullYearCalendarWrapper.tsx
  - components/Legend.tsx
autonomous: true

must_haves:
  truths:
    - "Scrolling on mobile starting from calendar area does NOT mark vacation days"
    - "Tapping a calendar day still toggles vacation as before"
    - "Drag selection on desktop still works as before"
    - "Legend swatches have no border except official holiday swatch"
  artifacts:
    - path: "components/MonthGrid.tsx"
      provides: "Scroll-safe pointer event handling"
    - path: "components/FullYearCalendarWrapper.tsx"
      provides: "Scroll-aware drag state management"
    - path: "components/Legend.tsx"
      provides: "Clean legend swatches without borders"
  key_links:
    - from: "components/MonthGrid.tsx"
      to: "components/FullYearCalendarWrapper.tsx"
      via: "onPointerDown/onPointerEnter/onPointerUp props"
---

<objective>
Fix two UX bugs: (1) Mobile scroll on calendar accidentally marks vacation days, (2) Legend swatches have unnecessary borders.

Purpose: Prevent frustrating accidental vacation marking on mobile and clean up legend visual styling.
Output: Patched MonthGrid.tsx, FullYearCalendarWrapper.tsx, and Legend.tsx
</objective>

<context>
@components/MonthGrid.tsx
@components/FullYearCalendarWrapper.tsx
@components/Legend.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix mobile scroll-to-mark bug</name>
  <files>components/MonthGrid.tsx, components/FullYearCalendarWrapper.tsx</files>
  <action>
The root cause: MonthGrid day cells have `touch-none` CSS AND `onPointerDown` fires immediately on touch start, toggling the vacation day before the browser can determine if the user intended to scroll or tap. On mobile, a scroll gesture starts with a touch (pointerdown) on the calendar, which immediately toggles a date.

**Fix approach — delayed commit with movement threshold:**

1. In `FullYearCalendarWrapper.tsx`:
   - Add a `pendingDate` ref (useRef<string | null>) to store the date from pointerdown WITHOUT immediately toggling it.
   - Add a `pointerStartPos` ref (useRef<{x: number, y: number} | null>) to track the initial pointer position.
   - Modify `handlePointerDown`: Do NOT call `toggleVacationDate(dateStr)` immediately. Instead, store `dateStr` in `pendingDate` ref and store the pointer coordinates from the event (pass them through from MonthGrid).
   - Add a NEW `handlePointerMove` callback: If `pendingDate` is set and pointer has moved more than 10px (Manhattan distance) from start position, this is a scroll — clear `pendingDate`, set `isDragging` to false, and return. If still within threshold, ignore (wait for more movement or pointerup).
   - Modify `handlePointerUp`: If `pendingDate` is still set (pointer didn't move much), NOW commit the toggle — call `toggleVacationDate(pendingDate.current)`, set drag state, etc. Then clear `pendingDate`. If `pendingDate` is null (was cleared by movement), just clean up drag state as before.
   - For drag selection to still work on desktop: after the initial tap is committed in pointerup (or after a very short delay), subsequent pointerenter events during drag should still work. The key insight: on desktop, pointerdown + pointermove with button pressed = drag. On mobile, pointerdown + pointermove without intent = scroll. The movement threshold distinguishes them.

2. In `MonthGrid.tsx`:
   - Update `onPointerDown` prop type to accept `(dateStr: string, x: number, y: number) => void` so it passes pointer coordinates.
   - In `handlePointerDownCell`, pass `event.clientX` and `event.clientY` to the parent handler.
   - Add `onPointerMove` prop (optional): `(x: number, y: number) => void`.
   - On the day cell div, add `onPointerMove` handler that calls the parent with `event.clientX, event.clientY`.
   - REMOVE `touch-none` CSS class from day cells. This was preventing page scroll entirely on mobile. Without it, the browser can scroll normally. The movement threshold approach above replaces this.

3. IMPORTANT — Preserve existing desktop drag behavior:
   - Desktop drag (click and hold + move across cells) must still work. The pointerenter handler already checks `isDragging`. The change is: `isDragging` is only set to true AFTER the first pointerup confirms a tap (not a scroll). For drag across multiple cells on desktop, we need a different approach: if pointermove stays within the SAME cell or moves to adjacent cells horizontally (not vertical scroll), treat as drag intent.
   - Simpler alternative: Use `pointerType` from the PointerEvent. If `event.pointerType === 'touch'`, use the delayed-commit approach. If `event.pointerType === 'mouse'`, use the existing immediate-commit approach (no change needed for mouse).

4. **Recommended final approach (simplest, most reliable):**
   - In `handlePointerDownCell` in MonthGrid.tsx, pass `event.pointerType` to the parent.
   - In `FullYearCalendarWrapper.tsx`, update `handlePointerDown` signature to accept `(dateStr: string, pointerType: string)`.
   - If `pointerType === 'mouse'`: existing behavior (immediate toggle, set isDragging).
   - If `pointerType === 'touch'`: store in `pendingDate` ref, do NOT toggle yet, do NOT set isDragging.
   - Add document-level `pointermove` listener (only when pendingDate is set): if movement > 10px, cancel pending (user is scrolling).
   - Add document-level `pointerup` listener update: if `pendingDate` is set, commit the toggle now (user tapped without moving).
   - This cleanly separates mouse (desktop, immediate) from touch (mobile, delayed).

  **What to avoid and WHY:**
  - Do NOT use `touch-action: none` on cells — it blocks page scrolling on mobile (this IS the bug).
  - Do NOT use `setTimeout` for debouncing — unreliable, causes perceived lag.
  - Do NOT change the pointer event model entirely — preserve the existing onPointerDown/Enter/Up prop interface shape, just add pointerType parameter.
  </action>
  <verify>
  1. `npm run build` passes (no TypeScript errors)
  2. On mobile (or Chrome DevTools mobile simulation with touch enabled): scrolling the page starting from the calendar area does NOT accidentally mark vacation days
  3. On mobile: tapping a calendar day cell still toggles vacation correctly
  4. On desktop: clicking a day still toggles vacation, drag selection across multiple days still works
  </verify>
  <done>Mobile scroll on calendar does not mark days. Tap to toggle and desktop drag selection both work correctly.</done>
</task>

<task type="auto">
  <name>Task 2: Remove legend swatch borders except holiday</name>
  <files>components/Legend.tsx</files>
  <action>
In `Legend.tsx`, remove border classes from all legend color swatches EXCEPT the official holiday swatch:

1. Line 8 (Official Holiday swatch): `bg-cinnamon rounded` — ADD `border border-cinnamon` to give it a defined border (matches its background, looks intentional).
2. Line 13 (Vacation swatch): Remove `border border-latte` — change to just `bg-vacation-bg rounded`.
3. Line 19 (Bridge swatch): Remove `border border-latte` — change to just `bg-bridge-bg rounded`.
4. Line 23 (School Holiday swatch): Remove `border border-teal` — change to just `bg-school-bg rounded`.
5. Line 29 (Weekend swatch): Remove `border border-latte` — change to just `bg-cream rounded`.

This makes the holiday swatch visually distinct (has a border) while all other swatches are clean color blocks.
  </action>
  <verify>
  1. Visual check: Legend swatches have no visible border except official holiday
  2. No TypeScript/build errors: `npm run build`
  </verify>
  <done>Legend swatches are borderless color blocks, only official holiday swatch retains a border.</done>
</task>

</tasks>

<verification>
- `npm run build` passes
- Mobile: scroll starting from calendar does not toggle vacation days
- Mobile: tap on day cell toggles vacation correctly
- Desktop: click and drag selection works as before
- Legend: only holiday swatch has border, all others are plain color blocks
</verification>

<success_criteria>
Both bugs are fixed. No regressions to existing tap, drag, or desktop interaction behavior.
</success_criteria>

<output>
After completion, create `.planning/quick/12-fix-mobile-scroll-to-mark-bug-and-remove/12-SUMMARY.md`
</output>
