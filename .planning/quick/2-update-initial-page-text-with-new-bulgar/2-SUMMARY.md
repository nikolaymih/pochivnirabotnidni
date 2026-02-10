# Quick Task 2: Update Initial Page Text with New Bulgarian Copy

## What Changed

### lib/constants.ts
- **PAGE_DESCRIPTION**: Replaced with new copy about finding holidays and planning vacation directly on dates
- **PAGE_DESCRIPTION_EXTENDED**: Replaced with copy about bridge day suggestions for workers and parents
- **PAGE_DESCRIPTION_HISTORY** (NEW): Added third paragraph about year navigation, vacation history, and 2-year carryover per Bulgarian labor law

### app/page.tsx
- Added `PAGE_DESCRIPTION_HISTORY` to imports
- Added third `<p>` paragraph in mobile layout (line 60)
- Added third `<p>` paragraph in desktop layout (line 92)
- Adjusted margin: middle paragraph lost `mb-5`/`mb-6` (moved to third paragraph)

## Not Changed
- `PAGE_TITLE` — already matched desired text
- `META_DESCRIPTION` — SEO meta tag kept separate
- `layout.tsx` — no changes needed
