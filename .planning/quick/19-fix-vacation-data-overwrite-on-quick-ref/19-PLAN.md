# Quick Task 19: Fix vacation data overwrite on quick refresh

## Problem
When authenticated user marks vacation days and refreshes within 1.5s (debounce window), the changes are lost. Data IS written to localStorage immediately but Supabase still has stale data. On reload, cloudData (stale) wins over localStorageData (fresh).

## Root Cause
`useDebounce(activeData, 1500)` holds changes for 1.5s before the sync effect fires. Quick refresh = debounce never fires = Supabase has old data = cloud wins on reload.

## Fix
Replace value-based `useDebounce` with callback-based `useDebouncedCallback`:
- `leading: true` — first change saves immediately to Supabase
- `trailing: true` — final state of a burst also saves
- `beforeunload` handler flushes pending debounced save
- Remove `hasExplicitChange` ref (no longer needed — saves only triggered by user action)

## Tasks

### Task 1: Refactor debounced sync in VacationContext.tsx

**Changes:**
1. Replace `import { useDebounce }` with `import { useDebouncedCallback }`
2. Remove `const [debouncedData] = useDebounce(activeData, 1500)`
3. Remove the debounced sync `useEffect` (lines ~155-171)
4. Remove `hasExplicitChange` ref and its usage in debug logs
5. Add `debouncedSave = useDebouncedCallback(saveFn, 1500, { leading: true, trailing: true })`
6. Call `debouncedSave(data)` in `setVacationData` when authenticated
7. Add `beforeunload` effect that calls `debouncedSave.flush()`

**Verification:**
- Mark a vacation day and immediately refresh → day persists
- Drag-select multiple days → only 2 Supabase writes (leading + trailing)
- Sign out → no Supabase writes attempted
