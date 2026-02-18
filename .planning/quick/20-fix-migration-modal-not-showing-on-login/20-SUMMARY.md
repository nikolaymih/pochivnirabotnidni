# Quick Task 20 Summary: Fix migration modal not showing on login

## Problem
Migration conflict modal never appeared when signing in with different data in localStorage vs Supabase. The `pochivni-migration-done-{userId}` flag from Quick Task 17 was never cleared, permanently blocking migration checks after first sign-in.

## Root Cause
Task 17 set the flag to persist across sign-out to prevent false modal triggers on session restore (page refresh). But this also blocked legitimate migration checks on new sign-ins.

## Fix
Clear the migration-done flag on sign-out using a `prevUserIdRef` to track the previous user ID:

- `prevUserIdRef.current` is set to `user.id` when authenticated
- On sign-out (`!user`), if `prevUserIdRef.current` exists, remove the flag from localStorage
- On cold page load, `prevUserIdRef.current` is null (fresh mount) → flag NOT cleared → refresh-safe

## Edge Case: Cold Page Load
1. First render: `user = null`, `prevUserIdRef.current = null` → flag NOT cleared (correct)
2. Auth restores: `user` set → `prevUserIdRef.current = user.id` → migration flag checked → still set → skip migration (correct for refresh)
3. Only actual sign-out clears the flag (user was previously set in ref)

## Files Changed
- `contexts/VacationContext.tsx` — Added `prevUserIdRef`, clear migration flag on sign-out
