# Quick Task 16: SEO — Sitemap, Robots.txt, Open Graph & Canonical URLs

**Date:** 2026-02-16
**Status:** Complete

## What Changed

### New Files
- `app/sitemap.ts` — Dynamic sitemap with main page + year variants (±2 years)
- `app/robots.ts` — Crawler guidance pointing to sitemap, allowing all pages
- `app/opengraph-image.tsx` — Edge-rendered OG image with Coffee theme branding

### Modified Files
- `app/layout.tsx` — Added `metadataBase`, Open Graph, Twitter card, viewport export (themeColor moved from deprecated metadata field)
- `app/page.tsx` — Added per-page `generateMetadata` with dynamic canonical URLs and year-specific OG title/description

## Decisions

1. **Sitemap scope:** Main page (priority 1.0) + year variants from currentYear-2 to currentYear+1 (priority 0.7-0.9). Past years use `yearly` changeFrequency, current/future use `monthly`.

2. **Canonical URL strategy:** Default year (no `?year=` param) canonicalizes to bare `https://kolkoshtepochivam.com`. Year variants get their own canonical `/?year=YYYY`. This prevents Google from treating year variants as duplicate content.

3. **OG image:** Uses Next.js `ImageResponse` (edge runtime) instead of static PNG. Dynamically includes current year in the image text. Uses Coffee theme colors (#FAF8F5 foam background, #C68E17 caramel accent, #3E2723 espresso text).

4. **themeColor migration:** Moved from deprecated `metadata.themeColor` to `viewport` export per Next.js recommendation.

5. **Page-level metadata override:** `page.tsx` exports `generateMetadata` that overrides layout-level title/description/canonical for year variants. Layout provides defaults + global OG/Twitter config.
