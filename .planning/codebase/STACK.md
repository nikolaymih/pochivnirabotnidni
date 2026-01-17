# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript 5.x - All application code (app directory, configuration)
- JavaScript (JSX/TSX) - React components via TypeScript

**Secondary:**
- CSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js v22.21.1

**Package Manager:**
- npm (inferred from package-lock.json presence)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.1.3 - React framework with App Router
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript 5.x - Type checking and compilation
- ESLint 9.x - Code linting with Next.js config
- PostCSS - CSS processing via `@tailwindcss/postcss`
- Tailwind CSS 4.x - Utility-first CSS framework

## Key Dependencies

**Critical:**
- next@16.1.3 - Framework core, handles routing, SSR, bundling
- react@19.2.3 - Component library
- react-dom@19.2.3 - DOM rendering

**Infrastructure:**
- @tailwindcss/postcss@4.x - PostCSS integration for Tailwind
- tailwindcss@4.x - Utility CSS framework

**Development:**
- @types/node@20.x - Node.js type definitions
- @types/react@19.x - React type definitions
- @types/react-dom@19.x - React DOM type definitions
- eslint-config-next@16.1.3 - Next.js ESLint configuration

## Configuration

**Environment:**
- No .env files detected in repository
- Environment variables likely required for production deployment
- Next.js uses `next.config.ts` for configuration

**Build:**
- `tsconfig.json` - TypeScript configuration with ES2017 target, strict mode enabled
- `next.config.ts` - Next.js configuration (currently default/empty)
- `eslint.config.mjs` - ESLint configuration using Next.js core web vitals and TypeScript presets
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS processing

## Platform Requirements

**Development:**
- Node.js 22.x (current environment)
- npm for dependency management
- TypeScript compiler (installed as dev dependency)

**Production:**
- Likely targeting Vercel (referenced in default Next.js template code)
- No specific deployment configuration detected
- Standard Next.js deployment requirements apply

---

*Stack analysis: 2026-01-17*
