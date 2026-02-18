---
phase: quick
plan: 17
type: execute
wave: 1
depends_on: []
files_modified:
  - contexts/VacationContext.tsx
autonomous: true

must_haves:
  truths:
    - "Vacation days persist in Supabase after page refresh for authenticated users"
    - "Migration/sync modal does NOT appear on session restore (page refresh)"
    - "Migration modal only appears on first explicit sign-in when localStorage and Supabase differ"
  artifacts:
    - path: "contexts/VacationContext.tsx"
      provides: "Auth-aware vacation state with correct null handling and migration guard"
      contains: "getMigrationDoneKey"
  key_links:
    - from: "contexts/VacationContext.tsx"
      to: "lib/vacation/sync.ts"
      via: "fetchVacationData/upsertVacationData calls"
      pattern: "setCloudData\\(data\\)"
---

<objective>
Fix two bugs in VacationContext.tsx:
1. Vacation days not saving to DB (data disappears on refresh) — caused by `setCloudData(data || DEFAULT_VACATION_DATA)` masking null with empty default, which then overwrites migration via debounced sync.
2. Sync/migration modal appearing on slow-connection login (session restore) — migration runs on every session restore instead of only on first explicit login.

Purpose: Users lose vacation data after refresh, and see annoying conflict modal on every page load.
Output: Fixed VacationContext.tsx with correct null handling and migration-done localStorage guard.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@contexts/VacationContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix cloudData null handling and add migration-done guard</name>
  <files>contexts/VacationContext.tsx</files>
  <action>
  Two changes in `contexts/VacationContext.tsx`:

  **Change A: Fix setCloudData null handling (Bug 1)**

  Line 69: Change `setCloudData(data || DEFAULT_VACATION_DATA)` to `setCloudData(data)`.
  This keeps cloudData as null when no Supabase row exists, so activeData (line 55) correctly falls back to localStorageData instead of masking it with an empty default.

  Line 88: Change `.then(d => setCloudData(d || DEFAULT_VACATION_DATA))` to `.then(d => setCloudData(d))`.
  Same fix for the post-migration re-fetch path.

  **Change B: Add migration-done localStorage guard (Bug 2)**

  Add a helper function before the VacationProvider component:
  ```ts
  const getMigrationDoneKey = (userId: string) => `pochivni-migration-done-${userId}`;
  ```

  In the migration useEffect (starting at line 81), add an early return check BEFORE calling `migrateLocalStorageToSupabase`:
  ```ts
  if (typeof window !== 'undefined' && window.localStorage.getItem(getMigrationDoneKey(user.id)) === 'true') {
    setMigrationComplete(true);
    return;
  }
  ```

  After `setMigrationComplete(true)` on line 98 (the success path inside .then), add:
  ```ts
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getMigrationDoneKey(user.id), 'true');
  }
  ```

  Also add the same localStorage.setItem in the .catch path (after setMigrationComplete(true) on line 103) to avoid retrying failed migrations forever.

  When user signs out (line 60-64 block where cloudData is set to null), do NOT clear the migration-done flag — it should persist so session restores don't re-trigger migration. The flag naturally clears if the user clears localStorage.

  **Do NOT change:**
  - The activeData derivation (line 55) — it already handles null correctly
  - The debounced sync effect — it already guards on migrationComplete
  - Any other files
  </action>
  <verify>
  Run `npm run build` — should compile without errors.
  Grep for `DEFAULT_VACATION_DATA` in VacationContext.tsx — should only appear in the import and in the useLocalStorage default, NOT in any setCloudData call.
  Grep for `getMigrationDoneKey` — should appear in helper function and in the migration useEffect (both check and set).
  </verify>
  <done>
  - `setCloudData` never receives DEFAULT_VACATION_DATA (null propagates correctly)
  - Migration effect checks localStorage flag before running migration
  - Migration effect sets localStorage flag after completing
  - `npm run build` passes
  </done>
</task>

</tasks>

<verification>
- `npm run build` succeeds
- No `setCloudData(data || DEFAULT_VACATION_DATA)` patterns remain
- `getMigrationDoneKey` helper exists and is used in migration guard
- No changes to files other than `contexts/VacationContext.tsx`
</verification>

<success_criteria>
- Authenticated users' vacation data persists across page refresh (cloudData=null falls back to localStorage, migration saves correctly, debounce doesn't overwrite with empty default)
- Migration modal does not appear on session restore (localStorage flag prevents re-running)
- Migration modal still appears on genuine first sign-in when data differs
- Build passes with no TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/17-fix-vacation-days-not-saving-to-db-and-s/SUMMARY.md`
</output>
