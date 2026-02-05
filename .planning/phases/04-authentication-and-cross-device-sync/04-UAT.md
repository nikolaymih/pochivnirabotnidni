---
status: complete
phase: 04-authentication-and-cross-device-sync
source:
  - 04-02-SUMMARY.md
  - 04-03-SUMMARY.md
  - 04-04-SUMMARY.md
started: 2026-02-04T13:00:00Z
updated: 2026-02-05T12:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Google sign-in button for anonymous users
expected: Open the application without being signed in. You should see a "Вход с Google" button in the header. Click it to initiate Google OAuth sign-in flow (redirects to Google login page).
result: pass

### 2. User avatar displays after sign-in
expected: After signing in with Google, the sign-in button should be replaced with your user avatar. If your Google account has a profile photo, it should display. Otherwise, it should show your initials (first letter of first name + first letter of last name) in a colored circle.
result: pass

### 3. User menu dropdown opens on avatar click
expected: Click on your avatar. A dropdown menu should appear below it with your name/email and a "Изход" (Sign out) button.
result: pass

### 4. Click outside closes dropdown
expected: With the dropdown menu open, click anywhere else on the page (outside the dropdown). The dropdown should close automatically.
result: pass

### 5. Sign out returns to anonymous state
expected: Click the "Изход" button in the dropdown. You should be signed out and see the "Вход с Google" button again instead of your avatar.
result: pass

### 6. Auth state persists across refresh
expected: Sign in with Google, then refresh the browser page. You should remain signed in (avatar still visible, no need to sign in again).
result: pass

### 7. Loading state shows skeleton
expected: On initial page load, while checking auth state, you should briefly see a gray circle skeleton (32px) in the header before either the sign-in button or your avatar appears.
result: pass

### 8. localStorage data migrates to Supabase on first sign-in
expected: Before signing in, mark several days as vacation (they save to localStorage). Sign in with Google for the first time. Your vacation data should automatically transfer to Supabase and remain visible in the calendar.
result: pass

### 9. Vacation data syncs across devices
expected: Sign in on one device/browser, mark vacation days. Sign in with the same Google account on a different device/browser. The vacation days should appear on the second device (synced from Supabase).
result: pass

### 10. Conflict resolution modal appears when local and cloud differ
expected: Have different vacation data in localStorage and Supabase (e.g., mark vacation on anonymous, sign out, mark different days, sign in with account that has different data). A modal should appear asking you to either "Merge" the data or "Keep cloud" data.
result: pass

### 11. Anonymous vacation tracking still works after auth system added
expected: Open the app without signing in. Mark vacation days by clicking/dragging. Refresh the page. Vacation days should persist via localStorage (no regression from Phase 2 functionality).
result: pass

### 12. Vacation changes save to Supabase automatically
expected: Sign in, mark a vacation day. Wait 2 seconds (debounce period). The data should be saved to Supabase in the background (no visible save button or indicator needed). Sign out and sign back in to verify persistence.
result: pass

### 13. Authenticated users see rollover from previous year
expected: Sign in with an account that has previous year vacation data in Supabase (unused days from last year). The VacationSummary should show rolled-over days with breakdown like "20 + 5 = 25" and a purple row "Прехвърлени от {previous_year}: {X} дни".
result: pass

### 14. Rollover affects remaining vacation calculations
expected: With rollover days showing, the remaining vacation days and percentage should be calculated using the effective total (totalDays + rolloverDays). For example, if you have 20 regular + 5 rollover = 25 effective, and use 10 days, remaining should show 15 (not 10).
result: pass

### 15. Anonymous users see NO rollover UI
expected: Use the app without signing in. The VacationSummary should show ONLY total days, used days, and remaining days. There should be NO mention, grayed-out text, or any hint of rollover functionality (completely invisible, not just disabled).
result: pass

## Summary

total: 15
passed: 15
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
