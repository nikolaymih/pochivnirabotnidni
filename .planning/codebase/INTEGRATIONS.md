# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**Fonts:**
- Google Fonts API - Used for Geist and Geist Mono font families
  - SDK/Client: `next/font/google` (built-in Next.js integration)
  - Auth: None required (public API)
  - Implementation: `app/layout.tsx` lines 2, 5-13

## Data Storage

**Databases:**
- None detected

**File Storage:**
- Local filesystem only (static assets in `public/` directory)

**Caching:**
- Next.js built-in caching (automatic)
- No external cache service configured

## Authentication & Identity

**Auth Provider:**
- None detected

**Implementation:**
- No authentication implemented in current codebase

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Default Next.js logging (console-based)
- No external logging service configured

## CI/CD & Deployment

**Hosting:**
- Not configured (default template references Vercel deployment)

**CI Pipeline:**
- None configured

**Build Commands:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Environment Configuration

**Required env vars:**
- None currently required (no external services integrated)

**Secrets location:**
- No .env files present
- No secrets management configured

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Development Tools

**Code Quality:**
- ESLint with Next.js configuration
  - Presets: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
  - Config: `eslint.config.mjs`

**Styling:**
- Tailwind CSS 4.x
  - PostCSS integration via `@tailwindcss/postcss`
  - Config: `postcss.config.mjs`
  - Global styles: `app/globals.css`

## Static Assets

**Image Optimization:**
- Next.js Image component (`next/image`)
  - Used in: `app/page.tsx` for logo and icon rendering
  - Serves optimized images from `public/` directory

**Public Assets:**
- SVG files in `public/`:
  - `next.svg` - Next.js logo
  - `vercel.svg` - Vercel logo
  - `file.svg`, `globe.svg`, `window.svg` - UI icons

---

*Integration audit: 2026-01-17*
