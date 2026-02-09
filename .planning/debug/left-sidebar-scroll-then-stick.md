---
status: diagnosed
trigger: "UAT Round 2 Test 4: Left sidebar should scroll with page until full content is visible, then become sticky"
created: 2026-02-08T12:00:00Z
updated: 2026-02-08T12:00:00Z
---

## Current Focus

hypothesis: Left sidebar uses `sticky top-4` which pins it to the top immediately; it needs a "scroll-then-stick" pattern so the full sidebar content (both cards) scrolls into view before sticking
test: Inspect the sticky wrapper div on the left sidebar in page.tsx
expecting: Confirm `sticky top-4` is the only positioning applied — no negative top or self-alignment used
next_action: Return diagnosis (read-only mode)

## Symptoms

expected: Left sidebar scrolls naturally with the page until the bottom of the "Ученически ваканции" card is visible in the viewport, THEN becomes sticky so it stays visible while the user continues scrolling the calendar
actual: Left sidebar sticks immediately at `top: 1rem` (16px) from the viewport top, meaning if the sidebar content is taller than the viewport, the bottom cards are cut off and never visible
errors: None (purely a layout/UX behavior issue)
reproduction: On desktop (lg+ breakpoint), scroll the page — the left sidebar immediately locks in place at the top; the bottom of the sidebar content may be clipped
started: Introduced in commit dd81989 (feat 05.2-06: restructure layout to three-column desktop)

## Eliminated

(none — single hypothesis confirmed)

## Evidence

- timestamp: 2026-02-08T12:00:00Z
  checked: app/page.tsx lines 73-79 (desktop left sidebar wrapper)
  found: |
    The left sidebar wrapper is:
    ```html
    <div class="w-72 flex-shrink-0">
      <div class="sticky top-4">
        <LeftSidebar ... />
      </div>
    </div>
    ```
    `sticky top-4` means the inner div becomes stuck 16px from the viewport top as soon as scrolling begins. This is identical to the right sidebar treatment (lines 92-96).
  implication: The sidebar sticks immediately — if the sidebar content is taller than `100vh - 16px`, the bottom portion is never reachable by scrolling.

- timestamp: 2026-02-08T12:00:00Z
  checked: components/LeftSidebar.tsx structure
  found: |
    LeftSidebar renders TWO cards stacked vertically:
    1. "Официални празници" (Official Holidays) — lists all holidays for the year (~15 items)
    2. "Ученически ваканции" (School Vacations) — lists school vacation periods
    The second card uses `mt-4` spacing. Total rendered height will likely exceed the viewport on many screens.
  implication: With `sticky top-4`, the "Ученически ваканции" card at the bottom will be clipped/inaccessible on screens shorter than the sidebar content height.

- timestamp: 2026-02-08T12:00:00Z
  checked: Right sidebar (lines 92-96) for comparison
  found: Right sidebar also uses `sticky top-4` but contains Legend + VacationSummary which are shorter/more compact content, so the problem is less noticeable there.
  implication: The fix should be applied specifically to the left sidebar which has taller content.

## Resolution

root_cause: |
  In `/home/nikolaymih11/webstormprojects/pochivnirabotnidni/app/page.tsx`, line 76, the left sidebar inner wrapper uses `className="sticky top-4"`. This causes the sidebar to stick immediately at 16px from the viewport top when the user starts scrolling.

  The desired behavior is "scroll-then-stick": the sidebar should scroll naturally with the page until its entire content (including the bottom "Ученически ваканции" card) is visible in the viewport, and ONLY THEN become sticky.

  With `sticky top-4`, the sidebar is pinned at the top of the viewport immediately, and if the sidebar content exceeds `100vh - 16px` in height, the bottom portion is permanently clipped — the user can never see it.

fix: |
  NOT APPLIED (read-only diagnosis). The fix involves changing the sticky behavior on the left sidebar wrapper. There are two pure-CSS approaches:

  **Approach A: Negative top value (recommended for pure CSS)**
  Change `sticky top-4` to `sticky` with a calculated negative top:
  `top: calc(100vh - sidebar_height - margin)`
  This makes the sidebar scroll naturally until its bottom edge aligns with the viewport bottom, then sticks. However, this requires knowing the sidebar height, which varies by content.

  **Approach B: align-self: flex-end + sticky bottom (simpler)**
  On the left sidebar column (`w-72 flex-shrink-0`), add `self-end`. On the inner sticky div, replace `sticky top-4` with `sticky bottom-4`.
  This anchors the sidebar to the bottom of the flex container and sticks it at the bottom of the viewport. As the user scrolls down, the sidebar scrolls until its bottom is at the viewport bottom, then sticks.

  **Approach C: JavaScript-assisted (most precise)**
  Use a client component wrapper that measures the sidebar height at runtime and computes:
  `top = -(sidebarHeight - viewportHeight + margin)`
  This gives pixel-perfect "scroll-then-stick" regardless of content length. Apply via inline style or CSS variable.

  **Recommended: Approach B** — It is pure CSS, no JavaScript, no height measurement needed:
  - Line 75: Change `<div className="w-72 flex-shrink-0">` to `<div className="w-72 flex-shrink-0 self-end">`
  - Line 76: Change `<div className="sticky top-4">` to `<div className="sticky bottom-4">`

  However, Approach B reverses the visual stacking during scroll (sidebar content appears to scroll up from bottom). If the user wants the sidebar to appear at its natural top position and scroll normally until the bottom is visible, then **Approach C** (JS-measured negative top) or **Approach A** with a CSS `max-height` + `overflow-y: auto` is better.

  **Simplest reliable approach: Approach A variant with overflow**
  - Keep `sticky top-4` but add `max-h-[calc(100vh-2rem)] overflow-y-auto` to the sticky div
  - This keeps the sidebar sticky at the top but makes it internally scrollable if content exceeds viewport
  - Less elegant but guaranteed to work without JS

verification: Not applicable (read-only diagnosis)
files_changed: []
