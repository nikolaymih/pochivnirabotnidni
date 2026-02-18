# Quick Task 19 Summary: Fix vacation data overwrite on quick refresh

## Problem
Authenticated users marking vacation days and refreshing within 1.5s would lose their changes. The debounced sync hadn't fired yet, so Supabase still had stale data. On reload, cloudData (stale) won over localStorageData (fresh).

## Root Cause
`useDebounce(activeData, 1500)` is a VALUE debounce — it holds all changes for 1.5 seconds before the sync effect fires. Quick refresh = debounce never fires = data lost.

## Fix
Replaced value-based `useDebounce` with callback-based `useDebouncedCallback`:

1. **`leading: true`** — First change in a burst saves to Supabase IMMEDIATELY
2. **`trailing: true`** — Final state after a burst also saves (handles drag selection end state)
3. **`maxWait: 3000`** — During continuous drag, saves at least every 3 seconds
4. **`beforeunload` flush** — Any pending debounced save is flushed when page unloads (refresh, tab close, navigation)
5. **Removed `hasExplicitChange` ref** — No longer needed since saves are only triggered from `setVacationData` (user action), not from reactive value changes

## Files Changed
- `contexts/VacationContext.tsx` — Replaced `useDebounce` with `useDebouncedCallback`, added `beforeunload` flush handler

## Behavior After Fix
- Click a vacation day → saved to Supabase immediately (leading edge)
- Drag-select 5 days rapidly → first day saved immediately, final state saved after 1.5s (trailing edge)
- Refresh at any point → `beforeunload` flushes pending save → data persists
- Anonymous users → no change (localStorage only, no Supabase sync)
