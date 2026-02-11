# Quick Task 8 Summary: Fix modal text and profile dropdown hover overflow

## What Changed

1. **Modal text** (`components/FullYearCalendarWrapper.tsx`): Changed "За да запазите" to "За да не загубите" in the anonymous user login prompt modal.

2. **Dropdown hover overflow** (`components/UserMenu.tsx`): Added `overflow-hidden` to the dropdown container and removed `py-1`. The `rounded-lg` on the container now clips the button's `hover:bg-cream` background, preventing it from bleeding past the rounded corners.

## Files Modified
- `components/FullYearCalendarWrapper.tsx` - Modal text update
- `components/UserMenu.tsx` - Dropdown overflow fix
