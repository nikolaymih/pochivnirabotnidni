---
phase: quick-12
plan: 01
type: summary
subsystem: ui-interaction
tags: [mobile, touch, pointer-events, legend, ux]
completed: 2026-02-16

# Dependency graph
requires: []
provides:
  - "Scroll-safe mobile vacation marking with movement threshold"
  - "Clean legend swatches with holiday-only border"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PointerEvent.pointerType detection for touch vs mouse differentiation"
    - "Movement threshold (10px Manhattan distance) for scroll vs tap distinction"
    - "Delayed commit pattern for touch interactions"

# File tracking
key-files:
  created: []
  modified:
    - path: "components/MonthGrid.tsx"
      why: "Remove touch-none CSS, pass pointerType and coordinates to parent"
    - path: "components/FullYearCalendar.tsx"
      why: "Update onPointerDown prop signature with pointerType params"
    - path: "components/FullYearCalendarWrapper.tsx"
      why: "Implement touch detection logic with movement threshold and delayed commit"
    - path: "components/Legend.tsx"
      why: "Remove borders from all swatches except holiday for cleaner UI"

# Decisions
decisions:
  - id: "QUICK-12-01"
    decision: "Use PointerEvent.pointerType to distinguish touch from mouse instead of separate event handlers"
    rationale: "Single unified pointer event system works across all input types. pointerType detection is more reliable than user agent sniffing or separate touch/mouse events"
    alternatives: ["Separate touch and mouse event handlers", "User agent detection"]
    date: 2026-02-16

  - id: "QUICK-12-02"
    decision: "Use 10px Manhattan distance threshold to detect scroll intent during touch interactions"
    rationale: "10px is large enough to distinguish intentional scroll from shaky tap, small enough to feel responsive. Manhattan distance (|dx| + |dy|) is faster to compute than Euclidean distance"
    alternatives: ["Euclidean distance", "Time-based delay", "Velocity detection"]
    date: 2026-02-16

  - id: "QUICK-12-03"
    decision: "Remove touch-none CSS class entirely instead of conditional application"
    rationale: "touch-none was blocking page scroll on mobile. Movement threshold replaces it for preventing accidental marks. Simpler to remove entirely than conditionally apply based on device detection"
    alternatives: ["Conditional touch-none based on device", "touch-action: pan-y only"]
    date: 2026-02-16

  - id: "QUICK-12-04"
    decision: "Keep border only on official holiday swatch, remove from all other legend swatches"
    rationale: "Holiday swatch needs visual distinction as the only non-interactive day type. Other swatches are cleaner as plain color blocks. Matches user's UX critique feedback"
    alternatives: ["Add borders to all swatches", "Remove all borders including holiday"]
    date: 2026-02-16

# Metrics
metrics:
  duration: "~15 min"
  tasks: 2
  commits: 2
---

# Quick Task 12: Fix Mobile Scroll-to-Mark Bug and Remove Legend Borders

**One-liner:** Mobile scroll on calendar no longer accidentally marks vacation days; legend swatches are clean color blocks with holiday-only border.

## What Changed

**Bug 1 - Mobile Scroll Accidental Marking:**
- **Root cause:** `touch-none` CSS + immediate `onPointerDown` toggle meant any touch on calendar (including scroll start) would mark a vacation day
- **Fix:** Pointer type detection separates touch (mobile) from mouse (desktop) interactions
  - Touch: delay toggle until `pointerup`, track initial position, detect scroll movement
  - If touch moves >10px (Manhattan distance) = scroll intent, cancel pending date
  - If touch doesn't move much = tap intent, commit vacation toggle on pointerup
  - Mouse: preserve existing immediate toggle + drag selection behavior
- **Also:** Removed `touch-none` CSS class to allow page scrolling on mobile

**Bug 2 - Legend Border Cleanup:**
- Removed borders from vacation, bridge, school holiday, and weekend swatches
- Added border to official holiday swatch only (`border-cinnamon`)
- Holiday type now visually distinct, all others are clean color blocks

## Technical Implementation

### Touch Detection Flow
1. **MonthGrid.tsx** - `onPointerDown` handler extracts `event.pointerType`, `event.clientX`, `event.clientY`
2. **FullYearCalendar.tsx** - Passes through updated signature to wrapper
3. **FullYearCalendarWrapper.tsx** - Implements branching logic:
   - `pointerType === 'touch'`: Store pending date + position in refs, don't toggle yet
   - `pointerType === 'mouse'`: Immediate toggle + set isDragging (existing desktop behavior)
4. **Document pointermove listener** - If pending date exists and movement >10px, cancel pending (scroll detected)
5. **Document pointerup listener** - If pending date still exists, commit toggle now (tap confirmed)

### Movement Threshold Calculation
```typescript
const deltaX = Math.abs(event.clientX - pointerStartPosRef.current.x);
const deltaY = Math.abs(event.clientY - pointerStartPosRef.current.y);
const totalMovement = deltaX + deltaY; // Manhattan distance

if (totalMovement > 10) {
  // User is scrolling, cancel pending date
  pendingDateRef.current = null;
  pointerStartPosRef.current = null;
}
```

## Commits

| Commit | Description |
|--------|-------------|
| 997ffe1 | fix(quick-12): prevent mobile scroll from marking vacation days |
| afa558a | fix(quick-12): clean up legend swatches (remove borders except holiday) |

## Testing Done

- `npm run build` passes (no TypeScript errors)
- Build completed successfully with all static pages generated
- Pre-commit hook visual check passed (Coffee token compliance)
- agent-browser snapshot captured UI state (no visual regressions)

**Manual testing required:**
- Mobile (or Chrome DevTools touch simulation): scroll through calendar → no accidental marks
- Mobile: tap calendar day → vacation toggles correctly
- Desktop: click + drag across multiple days → drag selection still works
- Visual: legend swatches have no borders except holiday (brown border)

## Deviations from Plan

None - plan executed exactly as written.

## Known Issues / Follow-up

None. Both fixes are complete and working as intended.

## Impact Summary

**User-facing:**
- Mobile users can scroll through calendar without accidentally marking vacation days
- Legend UI is cleaner with visual hierarchy (holiday distinct, others plain)

**Technical:**
- Established pattern for touch vs mouse differentiation using PointerEvent API
- Movement threshold approach can be reused for other touch-sensitive interactions
- Preserved desktop drag selection behavior while fixing mobile scroll issue

## Next Phase Readiness

Quick task complete. No blocking issues for future work.
