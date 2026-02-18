# Quick Task 20: Fix migration modal not showing on login

## Problem
The migration conflict modal never shows when a user signs in, even when localStorage and Supabase have different vacation data. This was caused by Quick Task 17's fix: `pochivni-migration-done-{userId}` flag was never cleared on sign-out, so subsequent sign-ins always skip migration.

## Root Cause
Task 17 intentionally did NOT clear the flag on sign-out to prevent the modal from re-appearing on session restore (page refresh). But this also prevented the modal from showing on genuine new sign-ins where data actually differs.

## Fix
Clear the migration-done flag on sign-out (when `user` transitions from non-null to null):
- Track previous user ID with `prevUserIdRef`
- On sign-out (`!user` + `prevUserIdRef.current` is set), remove the flag
- On cold page load (`!user` + `prevUserIdRef.current` is null), flag is NOT cleared (safe for refresh)

## Tasks

### Task 1: Clear migration-done flag on sign-out
- Add `prevUserIdRef = useRef<string | null>(null)` to track previous user
- Set `prevUserIdRef.current = user.id` when user is authenticated
- On sign-out branch, clear localStorage flag using stored user ID
- Reset ref to null after clearing
