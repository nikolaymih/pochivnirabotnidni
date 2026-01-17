# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
pochivnirabotnidni/
├── app/                # Next.js App Router directory
├── public/             # Static assets served at root
├── node_modules/       # Dependencies (not committed)
├── .next/              # Next.js build output (generated)
├── .planning/          # Project planning and documentation
├── .claude/            # Claude AI configuration
├── .git/               # Git repository
├── .idea/              # IDE configuration
├── package.json        # Node.js dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── next.config.ts      # Next.js configuration
├── eslint.config.mjs   # ESLint configuration
├── postcss.config.mjs  # PostCSS/Tailwind configuration
├── next-env.d.ts       # Next.js TypeScript declarations
└── README.md           # Project documentation
```

## Directory Purposes

**app/**
- Purpose: Next.js App Router source code
- Contains: Pages, layouts, components, route handlers, styles
- Key files: `page.tsx` (routes), `layout.tsx` (shared layouts), `globals.css` (global styles)

**public/**
- Purpose: Static assets accessible at root URL path
- Contains: SVG images, icons, favicons
- Key files: `next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`

**node_modules/**
- Purpose: Installed npm dependencies
- Contains: Third-party packages
- Generated: Yes (via npm install)
- Committed: No

**.next/**
- Purpose: Next.js build artifacts and development cache
- Contains: Compiled JavaScript, optimized assets, server bundles
- Generated: Yes (via next dev/build)
- Committed: No

**.planning/**
- Purpose: Project planning and codebase documentation
- Contains: Architecture docs, analysis files
- Generated: No (manually created)
- Committed: No

**.claude/**
- Purpose: Claude AI agent configuration
- Contains: Hooks, commands, workflows, templates
- Generated: No
- Committed: No

## Key File Locations

**Entry Points:**
- `/app/layout.tsx`: Root layout defining HTML structure and fonts
- `/app/page.tsx`: Home page component at root route
- `/next.config.ts`: Next.js framework configuration

**Configuration:**
- `/tsconfig.json`: TypeScript compiler options and path aliases
- `/eslint.config.mjs`: ESLint rules and ignores
- `/postcss.config.mjs`: PostCSS plugins (Tailwind)
- `/package.json`: Dependencies and npm scripts

**Core Logic:**
- `/app/page.tsx`: Main page component

**Styling:**
- `/app/globals.css`: Global styles, Tailwind imports, CSS variables

**Type Definitions:**
- `/next-env.d.ts`: Generated Next.js types

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `page.tsx`, `layout.tsx`)
- Configuration: `lowercase.config.{ext}` (e.g., `next.config.ts`, `eslint.config.mjs`)
- Styles: `lowercase.css` (e.g., `globals.css`)

**Directories:**
- Routes: `lowercase` or `kebab-case` (Next.js App Router convention)
- System: `.lowercase` for hidden directories (e.g., `.next`, `.planning`)

**Special Files:**
- `page.tsx`: Route page component (Next.js convention)
- `layout.tsx`: Route layout component (Next.js convention)
- `favicon.ico`: Site favicon
- `globals.css`: Global stylesheet

## Where to Add New Code

**New Page/Route:**
- Primary code: `/app/[route-name]/page.tsx`
- Layout (if needed): `/app/[route-name]/layout.tsx`
- Tests: Not configured yet

**New Shared Component:**
- Implementation: `/app/components/[ComponentName].tsx` (directory should be created)
- Alternative: Co-locate with page using component in `/app/[route]/components/`

**New API Route:**
- Implementation: `/app/api/[endpoint]/route.ts`
- Pattern: Export named functions for HTTP methods (GET, POST, etc.)

**Utilities:**
- Shared helpers: `/lib/` or `/utils/` (directories should be created as needed)
- Pattern: Export individual functions or grouped utilities

**Styles:**
- Global styles: Add to `/app/globals.css`
- Component styles: Use Tailwind utility classes inline or create component-specific CSS modules

**Static Assets:**
- Images/icons: `/public/[filename]`
- Access via: `"/[filename]"` in src attributes

**Type Definitions:**
- Shared types: `/types/` or `/app/types/` (directory should be created)
- File pattern: `[name].ts` or `[name].d.ts`

## Special Directories

**.next/**
- Purpose: Next.js build cache and output
- Generated: Yes (during dev and build)
- Committed: No (.gitignore)

**node_modules/**
- Purpose: npm package dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignore)

**.planning/codebase/**
- Purpose: Codebase analysis and documentation
- Generated: By mapping agents
- Committed: No

**.claude/**
- Purpose: Claude agent configuration and workflows
- Generated: No (user/system defined)
- Committed: No

## Path Aliases

**@/***
- Maps to: Project root (`./`)
- Usage: `import { X } from "@/app/components/X"`
- Configured in: `/tsconfig.json` paths

---

*Structure analysis: 2026-01-17*
