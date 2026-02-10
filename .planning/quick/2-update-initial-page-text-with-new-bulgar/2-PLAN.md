# Quick Task 2: Update Initial Page Text with New Bulgarian Copy

## Goal
Replace the visible page text (paragraphs above calendar) with user-provided Bulgarian copy.

## Tasks

### Task 1: Update constants and page layout
**Files:** `lib/constants.ts`, `app/page.tsx`

**Changes:**
1. **lib/constants.ts:**
   - Update `PAGE_DESCRIPTION` with new paragraph 1 text
   - Update `PAGE_DESCRIPTION_EXTENDED` with new paragraph 2 text
   - Add new `PAGE_DESCRIPTION_HISTORY` constant for paragraph 3

2. **app/page.tsx:**
   - Add `PAGE_DESCRIPTION_HISTORY` to import
   - Add third paragraph in mobile layout (after PAGE_DESCRIPTION_EXTENDED)
   - Add third paragraph in desktop layout (after PAGE_DESCRIPTION_EXTENDED)

**Not changed:**
- `PAGE_TITLE` — already matches desired text
- `META_DESCRIPTION` — SEO meta tag stays separate
- `PAGE_SUBTITLE` — unused but kept for reference
