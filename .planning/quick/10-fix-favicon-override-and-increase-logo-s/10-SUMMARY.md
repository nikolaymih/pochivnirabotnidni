# Quick Task 10 Summary: Fix favicon override and increase logo size

## What Changed

1. **Favicon fix**: Deleted `app/favicon.ico` (the default Next.js convention file). It was overriding the `icons: { icon: '/klogo.png' }` metadata set in layout.tsx. Now klogo.png serves as the browser tab icon.

2. **Logo size increase** (`app/page.tsx`):
   - Desktop: h-10 (40px) → h-16 (64px)
   - Mobile: h-8 (32px) → h-14 (56px)

## Root Cause
Next.js App Router gives `app/favicon.ico` convention files higher priority than `metadata.icons`. The default favicon had to be deleted for the metadata config to take effect.

## Files Modified
- `app/favicon.ico` - Deleted
- `app/page.tsx` - Logo height increased
