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

# Research-Locked Constraints (Mandatory)

## Library & Architecture Locks
- **Do NOT use full calendar libraries** (e.g. FullCalendar, React Big Calendar).
- Calendar UI must be **custom-built** as described in research.
- **date-fns is mandatory** for all date parsing, formatting, and calculations.
- Do NOT use moment.js, dayjs, or native Date math for differences.
- React Server Components are default; Client Components only for interactivity.

## Phase Discipline
- Implementation must follow the defined phases in PROJECT.md / research summary.
- Do NOT implement features from later phases early.
- If a task belongs to a future phase, stop and ask before proceeding.

## Risk-Aware Execution
- Any date-related change MUST consider:
  - Safari compatibility
  - DST boundaries
  - Timezone handling (EET/EEST)
- Date logic changes require tests covering edge cases.
- Performance-sensitive features (year view) must not be implemented without explicit planning and benchmarks.

## Decision Freezing
- Stack and architectural decisions documented in research are **locked**.
- Reconsidering them requires explicit user approval.

## Language & Localization
- **All user-facing text MUST be in Bulgarian language with Cyrillic alphabet**.
- This includes: day names, month names, labels, tooltips, buttons, error messages, page titles, metadata.
- Code comments and variable names may remain in English.
- Apply to all phases - existing English text must be updated.

---

# Change & Execution Constraints (Mandatory)

### Scope Control
- Prefer the **smallest possible diff** that achieves the goal.
- **Do not refactor existing code** unless explicitly instructed.
- Touch **only files required** for the current phase or task.
- Preserve existing patterns, naming, and folder structure.
- If unsure whether a change is needed, **ask before editing**.

### Dependency Rules
- **Do not add new dependencies** without explicit approval.
- Avoid premature abstractions and over-engineering.
- Reuse existing utilities and patterns before introducing new ones.

### Planning Requirements (GSD-aligned)
- **Always plan before coding**.
- Plans must list the **exact files** to be modified.
- Large or risky plans must be reviewed before execution.
- If requirements are unclear, ask clarifying questions first.

### Testing & Verification
- Tests must pass before work is considered done.
- If no tests exist, add **minimal meaningful tests** (no coverage theater).
- Use `/gsd:verify-work` after execution.
- If verification fails, fix and re-verify.

### Behavioral Expectations
- Do not invent features, APIs, or behavior not specified.
- Avoid unnecessary rewrites or formatting-only changes.
- Assume all changes will be human-reviewed; keep diffs auditable.

---

*Convention analysis: 2026-01-17*
