---
status: diagnosed
trigger: "UAT Round 2 Test 1: Title and description should be visible above year selector"
created: 2026-02-08T00:00:00Z
updated: 2026-02-08T00:00:00Z
---

## Current Focus

hypothesis: gap closure plan 05.2-09 removed h1 title and p subtitle from page.tsx entirely; they need to be restored above YearSelector in the center column
test: confirmed by git diff dd81989..2dde2c1
expecting: title and subtitle are missing from rendered page
next_action: return diagnosis

## Symptoms

expected: H1 title (PAGE_TITLE) and subtitle (PAGE_SUBTITLE) visible above year selector in main content area
actual: Title and subtitle completely removed from page.tsx by gap closure commit 2dde2c1
errors: None (visual omission, not crash)
reproduction: Load the app - no title or description visible anywhere
started: Commit 2dde2c1 (fix(05.2): close 7 UAT gaps)

## Eliminated

(none - root cause identified on first pass)

## Evidence

- timestamp: 2026-02-08
  checked: git diff dd81989..2dde2c1 -- app/page.tsx
  found: Commit 2dde2c1 removed PAGE_TITLE, PAGE_SUBTITLE, PAGE_DESCRIPTION import and all h1/p elements from both mobile and desktop layouts
  implication: Direct removal is the root cause

- timestamp: 2026-02-08
  checked: current app/page.tsx
  found: No h1 element anywhere in page.tsx. No import of PAGE_TITLE or PAGE_SUBTITLE from constants.
  implication: Constants exist in lib/constants.ts but are unused by page.tsx

- timestamp: 2026-02-08
  checked: lib/constants.ts
  found: PAGE_TITLE is a function (year: number) => string, PAGE_SUBTITLE is a static string constant
  implication: Both are available and ready to use

- timestamp: 2026-02-08
  checked: layout.tsx
  found: layout.tsx uses PAGE_TITLE and META_DESCRIPTION for <head> metadata only (not visible content)
  implication: SEO metadata is intact but visual page title is completely absent

- timestamp: 2026-02-08
  checked: YearSelector.tsx
  found: Uses h2 for year number (e.g., "2026"). Located at line 33.
  implication: Title should go ABOVE YearSelector, maintaining h1 > h2 heading hierarchy

## Resolution

root_cause: Commit 2dde2c1 (gap closure plan 05.2-09) deleted the h1 title and p subtitle elements from both mobile and desktop layouts in page.tsx, along with the import of PAGE_TITLE, PAGE_SUBTITLE, PAGE_DESCRIPTION from lib/constants.ts. The intent was to simplify the header area to auth-button-only, but this went too far and removed user-visible title content entirely.

fix: Re-add title and subtitle to page.tsx in both mobile and desktop layouts, positioned above YearSelector inside the center content column (not in the header area with AuthHeader).

verification: (pending fix)
files_changed: []
