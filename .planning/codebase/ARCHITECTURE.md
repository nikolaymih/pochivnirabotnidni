# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Next.js App Router Architecture (Server-First React)

**Key Characteristics:**
- File-system based routing via app directory
- React Server Components by default
- Server-side rendering with client-side hydration
- Component-based UI architecture with Tailwind CSS styling
- TypeScript-first development

## Layers

**Presentation Layer:**
- Purpose: User interface components and page layouts
- Location: `/app`
- Contains: React components (.tsx), layouts, pages, styles
- Depends on: React, Next.js framework, Tailwind CSS
- Used by: Browser clients

**Routing Layer:**
- Purpose: File-system based routing and navigation
- Location: `/app` (Next.js convention)
- Contains: Route handlers defined by directory structure and special files (page.tsx, layout.tsx)
- Depends on: Next.js App Router
- Used by: Next.js framework for request routing

**Static Assets Layer:**
- Purpose: Public static files served directly
- Location: `/public`
- Contains: SVG images, icons, static media
- Depends on: Nothing
- Used by: Presentation layer for images and assets

## Data Flow

**Page Rendering Flow:**

1. Client requests route (e.g., `/`)
2. Next.js matches route to `/app/page.tsx`
3. Server renders React components (RootLayout wraps Home page)
4. HTML sent to client with minimal JavaScript for hydration
5. Client hydrates interactive components

**State Management:**
- Currently using React's built-in state (no external state management detected)
- Server Components render on server, Client Components hydrate on client

## Key Abstractions

**Layout Components:**
- Purpose: Define shared UI structure across routes
- Examples: `/app/layout.tsx`
- Pattern: Special Next.js file that wraps all child pages and layouts

**Page Components:**
- Purpose: Define route-specific UI
- Examples: `/app/page.tsx`
- Pattern: Default export of React functional component

**Metadata Management:**
- Purpose: SEO and document head configuration
- Examples: `metadata` export in `/app/layout.tsx`
- Pattern: Next.js Metadata API for type-safe meta tags

## Entry Points

**Root Layout:**
- Location: `/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Define HTML structure, load fonts (Geist Sans, Geist Mono), apply global styles, set metadata

**Home Page:**
- Location: `/app/page.tsx`
- Triggers: Root route `/` request
- Responsibilities: Render landing page content with Next.js branding and getting started information

**Global Styles:**
- Location: `/app/globals.css`
- Triggers: Imported by root layout
- Responsibilities: Define CSS custom properties, Tailwind imports, theme configuration

**Next.js Config:**
- Location: `/next.config.ts`
- Triggers: Build and development server startup
- Responsibilities: Configure Next.js framework behavior (currently default config)

## Error Handling

**Strategy:** Next.js default error handling (no custom error boundaries detected)

**Patterns:**
- Framework-level error boundaries for React errors
- Next.js automatic error pages for 404 and 500 errors

## Cross-Cutting Concerns

**Logging:** Browser console (no server-side logging configured)
**Validation:** TypeScript type checking at compile time
**Authentication:** Not implemented

---

*Architecture analysis: 2026-01-17*
