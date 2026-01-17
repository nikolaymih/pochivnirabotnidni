# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- Component files: `page.tsx`, `layout.tsx` (lowercase with extension)
- Config files: `*.config.ts`, `*.config.mjs` (lowercase with extension descriptor)
- TypeScript for source files: `.ts`, `.tsx`
- ESM modules: `.mjs` for config files

**Functions:**
- React components: PascalCase (e.g., `Home`, `RootLayout`)
- Default exports for pages/layouts in Next.js app directory

**Variables:**
- camelCase for standard variables (e.g., `geistSans`, `geistMono`)
- SCREAMING_SNAKE_CASE not observed in codebase
- Descriptive names based on purpose

**Types:**
- PascalCase for TypeScript types/interfaces (e.g., `Metadata`, `NextConfig`)
- `Readonly<>` utility type used for immutable props
- Explicit type imports: `import type { ... }`

## Code Style

**Formatting:**
- No dedicated formatter config (Prettier/Biome) detected
- Likely relies on IDE defaults or ESLint auto-fix
- Indentation: 2 spaces (observed in source files)
- Semicolons: Not enforced (absent in most TypeScript files)
- Quotes: Double quotes for JSX attributes, varies in TypeScript
- Trailing commas: Present in object literals

**Linting:**
- ESLint 9 with flat config format (`eslint.config.mjs`)
- `eslint-config-next` for Next.js best practices
- TypeScript ESLint integration via `eslint-config-next/typescript`
- Config file: `/home/nikolaymih11/webstormprojects/pochivnirabotnidni/eslint.config.mjs`
- Run command: `npm run lint` → `eslint`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Import Organization

**Order:**
1. External framework imports (e.g., `next/image`, `next/font/google`)
2. Type imports with `import type` syntax
3. Local imports (e.g., `./globals.css`)

**Path Aliases:**
- `@/*` maps to project root via `tsconfig.json`
- Example: `@/app/page.tsx` resolves to `/app/page.tsx`

**Import Style:**
- Named imports for utilities: `import { Geist } from "next/font/google"`
- Default imports for components: `import Image from "next/image"`
- Type-only imports: `import type { Metadata } from "next"`

## Error Handling

**Patterns:**
- No explicit error boundaries or try-catch blocks observed in sample code
- Relies on Next.js default error handling
- TypeScript strict mode enabled (`"strict": true`)

## Logging

**Framework:** Standard console (no dedicated logging library detected)

**Patterns:**
- No logging observed in production components
- Development logging likely via browser DevTools

## Comments

**When to Comment:**
- Config files include comment headers (e.g., "See https://help.github.com/...")
- TypeScript types provide self-documentation
- Inline comments for config placeholders: `/* config options here */`

**JSDoc/TSDoc:**
- Not observed in current codebase
- Types inferred from TypeScript definitions

## Function Design

**Size:** Functional components kept concise (single responsibility)

**Parameters:**
- React components receive typed props
- Use of `Readonly<>` for immutable props: `Readonly<{ children: React.ReactNode }>`
- Destructured parameters preferred

**Return Values:**
- React components return JSX
- Explicit return statements in function bodies
- No early returns observed in sample code

## Module Design

**Exports:**
- Default exports for pages/layouts: `export default function Home()`
- Named exports for utilities/constants: `export const metadata: Metadata = {...}`
- Config objects use default export: `export default config`

**Barrel Files:**
- Not used in current minimal codebase
- Direct imports from framework packages

## TypeScript Configuration

**Strict Mode:**
- `"strict": true` enforced
- `"noEmit": true` (type-checking only, Next.js handles compilation)
- `"skipLibCheck": true` for faster builds

**Module System:**
- `"module": "esnext"`
- `"moduleResolution": "bundler"`
- `"esModuleInterop": true`

**JSX:**
- `"jsx": "react-jsx"` (new JSX transform, no need to import React)
- React 19.2.3 with new transform support

## React Patterns

**Components:**
- Functional components only (no class components)
- Server Components by default (Next.js 13+ app directory)
- `"use client"` directive not observed (all components are server components)

**Props:**
- Inline type definitions for simple props
- Readonly utility type for immutability

**Styling:**
- Tailwind CSS v4 via PostCSS
- Utility-first approach with className strings
- CSS custom properties for theming: `--background`, `--foreground`
- Dark mode via `dark:` prefix and `prefers-color-scheme`

---

*Convention analysis: 2026-01-17*
