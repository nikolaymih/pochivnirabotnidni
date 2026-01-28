# Phase 4: Authentication & Cross-Device Sync - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable users to sign in with Google and sync their vacation data across devices via Supabase backend. This phase implements authentication, data migration from localStorage, and cross-device synchronization. Rollover mechanics for authenticated users are included.

</domain>

<decisions>
## Implementation Decisions

### Sign-in Flow & UI
- Sign-in button appears in **header/navbar** (always visible, traditional placement)
- Use **redirect flow** (not popup) — navigate to Google OAuth, then back to app
- Authenticated state shows **avatar + name** in header
  - If user has Google profile picture: show it
  - If no profile picture: show initials in colored circle (like Google's default avatars)
  - Format: First letter of first name + first letter of last name (e.g., "NM" for "Nikolay Mihaylov")
  - Fallback: If no name, use first letter of email address
  - **Research needed:** Check if Google OAuth provides initials/color generation or if we need to implement it
- Clicking avatar/name opens **dropdown menu** with logout option
- After sign out: user redirected to main page with login option in navbar

### Data Migration Strategy
- **Hybrid model:**
  - When authenticated → read/write to Supabase (cloud source of truth)
  - When anonymous → read/write to localStorage (local source of truth)
- On sign-in: **automatic migration** of localStorage data to Supabase
- localStorage persists even after sign-in (supports sign-out workflow)
- **Conflict resolution:** Show review screen **only when conflict exists**
  - Conflict = localStorage has data AND Supabase has different data
  - Review screen displays: "This device: X days", "Cloud: Y days", "Combined: Z days"
  - User can approve or edit the merged dataset
  - If no conflict (empty localStorage or exact match), skip review screen

### Sync Behavior
- **Debounced sync:** Wait 1-2 seconds after last change, then write to Supabase
- Drag selection handled naturally by debounce (user stops → sync all changes)
- **Optimistic UI + silent fallback:**
  - Changes reflect immediately in UI
  - If Supabase sync fails (network error, downtime), changes stay in localStorage
  - No user-facing error messages or warnings
  - Next sign-in will pick up unsynchronized changes from localStorage
- **No sync indicator** — completely invisible to users (optimistic UI means no need to show status)

### Anonymous vs Authenticated UX
- **No proactive messaging** — no banners, tooltips, or callouts about sign-in benefits
- Anonymous users see **nothing** about rollover feature (invisible, not grayed out)
- Treat all anonymous users the same (don't remember if they previously signed out)
- When authenticated user's data loads: show **loading skeleton** while fetching from Supabase

### Claude's Discretion
- Exact debounce timing (1-2 seconds is guideline, tune as needed)
- Dropdown menu styling and animation
- Loading skeleton design
- Initial avatar color generation algorithm (if not provided by Google)
- Review screen layout and presentation
- Error logging strategy for failed syncs (log to console, but no user-facing errors)

</decisions>

<specifics>
## Specific Ideas

- "Google takes the first letter of the name and the first letter of the fullname and combines them. For example my name in google is Nikolay Mihaylov. And google adds a circle avatar with random color inside we have NM. When there are no names we just take the first letter of the email address."
- User wants localStorage to continue working after authentication (hybrid model, not replacement)
- Sign out should redirect to main page where login option is available again

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-authentication-and-cross-device-sync*
*Context gathered: 2026-01-28*
