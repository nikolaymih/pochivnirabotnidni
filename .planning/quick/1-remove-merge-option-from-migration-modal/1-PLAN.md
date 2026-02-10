---
phase: quick-1
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - components/MigrationReview.tsx
  - lib/vacation/migration.ts
  - contexts/VacationContext.tsx
autonomous: true

must_haves:
  truths:
    - "Migration modal shows only 2 options: Keep Cloud and Keep Local"
    - "User can pick cloud state (discard local)"
    - "User can pick local state (discard cloud)"
    - "Merge option is completely removed from UI and code"
  artifacts:
    - path: "components/MigrationReview.tsx"
      provides: "Two-option migration UI (cloud or local)"
      min_lines: 80
    - path: "lib/vacation/migration.ts"
      provides: "MigrationResult type without mergedDates"
      exports: ["migrateLocalStorageToSupabase", "MigrationResult"]
    - path: "contexts/VacationContext.tsx"
      provides: "Migration handler without merge support"
      contains: "handleMigrationAccept"
  key_links:
    - from: "components/MigrationReview.tsx"
      to: "onAccept prop"
      via: "handleKeepCloud or handleKeepLocal"
      pattern: "onAccept\\(.*Data\\)"
    - from: "lib/vacation/migration.ts"
      to: "MigrationResult.conflict"
      via: "return type structure"
      pattern: "status: 'conflict'"
---

<objective>
Remove broken "Обедини" (merge) option from migration conflict modal. Keep only "Запази облачните" (keep cloud) and add missing "Запази локалните" (keep local).

Purpose: The merge option combines totalDays from cloud with union of vacationDates from both sources, which creates invalid state (e.g., 25 total / 27 used = -2 remaining). Hybrid merge is fragile and confusing. Let users pick one complete, consistent state.

Output: Migration modal with 2 options (cloud or local), no merge logic in codebase.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

# Phase 4 migration logic (where this was implemented)
# No need to reference prior SUMMARYs - this is a self-contained bug fix

# Current code already read by orchestrator
@/home/nikolaymih11/webstormprojects/pochivnirabotnidni/components/MigrationReview.tsx
@/home/nikolaymih11/webstormprojects/pochivnirabotnidni/lib/vacation/migration.ts
@/home/nikolaymih11/webstormprojects/pochivnirabotnidni/contexts/VacationContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add "Keep Local" button and remove "Merge" option from MigrationReview UI</name>
  <files>components/MigrationReview.tsx</files>
  <action>
1. Remove `mergedDates` prop from MigrationReviewProps interface (line 8)
2. Add `handleKeepLocal` function after `handleKeepCloud`:
   ```typescript
   const handleKeepLocal = () => {
     onAccept(localData);
   };
   ```
3. Remove the merged dates summary card (lines 74-78, the green bg-vacation-bg section)
4. Update button section (lines 80-94):
   - Change "Запази облачните" button to use text-coffee (not white) and remove hover:bg-cream (keep border style)
   - Remove "Обедини" button entirely
   - Add new "Запази локалните" button:
     ```tsx
     <button
       onClick={handleKeepLocal}
       className="bg-caramel text-white px-4 py-2 rounded hover:bg-cinnamon"
     >
       Запази локалните
     </button>
     ```
5. Update modal heading and description for clarity:
   - Heading: "Конфликт в данните" (was "Обединяване на данни")
   - Description: "Намерени са различни данни на това устройство и в облака. Изберете кои да запазите." (was "Намерени са данни и на това устройство, и в облака.")
  </action>
  <verify>
Run TypeScript compiler to verify no type errors:
```bash
npx tsc --noEmit
```

Visual check: MigrationReview.tsx should have 2 buttons (Keep Cloud + Keep Local), no merge logic, no mergedDates prop.
  </verify>
  <done>
- MigrationReview.tsx accepts only localData, cloudData, onAccept, onCancel (no mergedDates)
- UI shows 2 buttons: "Запази облачните" and "Запази локалните"
- handleKeepCloud calls onAccept(cloudData)
- handleKeepLocal calls onAccept(localData)
- No merge button or merge handler exists
- Merged dates summary card removed from UI
  </done>
</task>

<task type="auto">
  <name>Task 2: Remove mergedDates from migration.ts conflict result</name>
  <files>lib/vacation/migration.ts</files>
  <action>
1. Update MigrationResult type (line 16):
   - Remove `mergedDates: string[]` from conflict status
   - New structure:
     ```typescript
     | { status: 'conflict'; localData: VacationData; cloudData: VacationData }
     ```
2. Remove mergedDates computation (line 67):
   - Delete: `const mergedDates = [...new Set([...localData.vacationDates, ...cloudData.vacationDates])].sort();`
3. Update conflict return statement (lines 69-74):
   - Remove `mergedDates` field from return object
   - Return only: `{ status: 'conflict', localData, cloudData }`

DO NOT change migrateLocalStorageToSupabase function signature or other return statuses (no-local-data, migrated, no-conflict, error).
  </action>
  <verify>
Run TypeScript compiler:
```bash
npx tsc --noEmit
```

Grep for mergedDates in migration.ts to confirm removal:
```bash
grep -n "mergedDates" lib/vacation/migration.ts
```
Should return no matches.
  </verify>
  <done>
- MigrationResult conflict type no longer includes mergedDates field
- No mergedDates computation in migrateLocalStorageToSupabase function
- TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Task 3: Update VacationContext to remove mergedDates prop from MigrationReview</name>
  <files>contexts/VacationContext.tsx</files>
  <action>
1. Find MigrationReview component usage (around line 150-160)
2. Remove `mergedDates={migrationResult.mergedDates}` prop
3. Ensure only these props remain:
   ```tsx
   <MigrationReview
     localData={migrationResult.localData}
     cloudData={migrationResult.cloudData}
     onAccept={handleMigrationAccept}
     onCancel={handleMigrationCancel}
   />
   ```

DO NOT change handleMigrationAccept or handleMigrationCancel logic - they already accept VacationData and work correctly.
  </action>
  <verify>
Run TypeScript compiler:
```bash
npx tsc --noEmit
```

Verify MigrationReview usage no longer passes mergedDates:
```bash
grep -A 5 "MigrationReview" contexts/VacationContext.tsx
```
Should show only localData, cloudData, onAccept, onCancel props.
  </verify>
  <done>
- VacationContext passes only 4 props to MigrationReview (not 5)
- No mergedDates prop in MigrationReview usage
- TypeScript compiles without errors
- All migration handlers remain unchanged and functional
  </done>
</task>

</tasks>

<verification>
**Type Safety:**
```bash
npx tsc --noEmit
```
No TypeScript errors related to migration types or components.

**Code Cleanup:**
```bash
grep -rn "mergedDates" components/ lib/ contexts/
```
Should return zero matches (mergedDates completely removed from codebase).

**Visual Verification (if migration conflict occurs):**
When a user signs in with conflicting data:
1. Migration modal appears with heading "Конфликт в данните"
2. Shows local vs cloud vacation days count
3. Displays exactly 2 buttons: "Запази облачните" and "Запази локалните"
4. No merge option or merged dates summary visible
</verification>

<success_criteria>
- [ ] MigrationReview component has 2 buttons (Keep Cloud, Keep Local), no merge button
- [ ] MigrationReview props interface excludes mergedDates
- [ ] MigrationResult conflict type excludes mergedDates field
- [ ] VacationContext does not pass mergedDates to MigrationReview
- [ ] No "mergedDates" string found in migration-related files
- [ ] TypeScript compiles without errors
- [ ] Migration flow works: user can choose cloud OR local (not merge)
</success_criteria>

<output>
After completion, create `.planning/quick/1-remove-merge-option-from-migration-modal/1-SUMMARY.md`
</output>
