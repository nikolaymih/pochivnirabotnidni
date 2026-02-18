---
phase: quick-18
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - contexts/VacationContext.tsx
autonomous: true

must_haves:
  truths:
    - "Vacation data persists across page refresh for authenticated users"
    - "User-initiated vacation changes still sync to Supabase after 1.5s debounce"
    - "Page load never overwrites Supabase with DEFAULT_VACATION_DATA"
  artifacts:
    - path: "contexts/VacationContext.tsx"
      provides: "VacationProvider with guarded sync effect"
      contains: "hasExplicitChange"
  key_links:
    - from: "setVacationData callback"
      to: "hasExplicitChange ref"
      via: "ref mutation before state updates"
      pattern: "hasExplicitChange\\.current = true"
    - from: "debounced sync effect"
      to: "hasExplicitChange ref"
      via: "guard condition"
      pattern: "!hasExplicitChange\\.current"
---

<objective>
Fix critical bug where vacation data flashes then disappears on page refresh for authenticated users.

Purpose: The debounced sync effect fires on page load when `migrationComplete` becomes true, but `debouncedData` is still stale (`DEFAULT_VACATION_DATA` from SSR initialization). This overwrites Supabase with empty defaults. Adding a `useRef` guard ensures the sync only fires after explicit user changes.

Output: Fixed `VacationContext.tsx` where page load no longer triggers Supabase overwrite.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@contexts/VacationContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Guard sync effect with hasExplicitChange ref</name>
  <files>contexts/VacationContext.tsx</files>
  <action>
    Make exactly 4 changes to `contexts/VacationContext.tsx`:

    1. **Line 3 - Add `useRef` to React import:**
       Change: `import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';`
       To: `import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';`

    2. **After line 53 (after rollover state declaration) - Add ref:**
       ```ts
       // Track whether user has explicitly set vacation data in this session
       const hasExplicitChange = useRef(false);
       ```

    3. **Line 137 (inside setVacationData callback) - Set ref on explicit changes:**
       Add `hasExplicitChange.current = true;` as the FIRST line inside the useCallback, before the `if (isAuthenticated)` check.

    4. **Line 131 (sync effect guard) - Add ref check:**
       Change: `if (!user || !migrationComplete || !isCurrentYear) return;`
       To: `if (!user || !migrationComplete || !isCurrentYear || !hasExplicitChange.current) return;`

    IMPORTANT:
    - Do NOT add `hasExplicitChange` to the useEffect dependency array (it's a ref, not state)
    - Do NOT modify any other effects or callbacks
    - Do NOT change `handleMigrationAccept` - migration has its own direct `upsertVacationData` call
  </action>
  <verify>
    1. `npm run build` passes with no errors
    2. Verify `useRef` is in the React import
    3. Verify the sync effect (around line 130) has `!hasExplicitChange.current` in its guard
    4. Verify `setVacationData` callback sets `hasExplicitChange.current = true`
    5. Verify `hasExplicitChange` is NOT in any dependency array
  </verify>
  <done>
    - Sync effect only fires when user has explicitly called setVacationData
    - Page load/refresh never triggers Supabase overwrite with DEFAULT_VACATION_DATA
    - User-initiated changes still sync correctly after 1.5s debounce
    - Build passes clean
  </done>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors
2. Code review: sync effect has 4 guard conditions: `!user`, `!migrationComplete`, `!isCurrentYear`, `!hasExplicitChange.current`
3. Code review: `setVacationData` sets `hasExplicitChange.current = true` before any state updates
4. Code review: `handleMigrationAccept` is unchanged (migration uses direct upsert, not debounced sync)
</verification>

<success_criteria>
- Authenticated users see their vacation data persist across page refreshes
- New vacation selections still sync to Supabase after 1.5s debounce
- Migration flow is unaffected (uses direct upsert, not debounced sync)
- No TypeScript or build errors
</success_criteria>

<output>
After completion, create `.planning/quick/18-fix-vacation-data-flash-then-disappear-o/SUMMARY.md`
</output>
