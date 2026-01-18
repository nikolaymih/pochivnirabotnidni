# Stack Research

**Domain:** Calendar/Vacation Tracking Web Application
**Researched:** 2026-01-18
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.3 | Framework (locked) | Already configured. App Router with Server Components for optimal performance and SEO |
| React | 19.2.3 | UI library (locked) | Already configured. Latest stable with improved Server Components |
| TypeScript | 5.x | Type safety (locked) | Already configured. Essential for maintaining code quality at scale |
| Tailwind CSS | 4.x | Styling (locked) | Already configured. Minimal bundle impact with JIT compilation |

### Date & Time Handling

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| date-fns | 4.1.0+ | Date manipulation | **RECOMMENDED.** Modular (tree-shakeable), only 18.6 kB minified+gzipped for full package, but you import only what you need. Version 4.0+ includes first-class timezone support. Works directly with native Date objects (fastest performance). 39M+ weekly downloads. Perfect for calendar calculations and date formatting. | HIGH |

**Alternatives considered:**
- **Day.js** (6 kB): Smaller but less comprehensive. Choose if bundle size is absolutely critical over features.
- **Luxon** (slower): Built on Intl API. Only choose if you need advanced timezone features beyond what date-fns v4 provides.

### Calendar UI

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **Custom calendar** | N/A | Full-year 12-month grid view | **RECOMMENDED for this project.** None of the popular libraries are optimized for full-year grid views. Building custom gives you: (1) 12-month layout control, (2) minimal bundle size (~5-10 kB vs 15-82 kB), (3) Server Components compatibility, (4) exact mobile responsive behavior needed. Use date-fns for date logic. | HIGH |
| react-day-picker | 9.13.0+ | Fallback/date picker inputs | Use for any date picker inputs (vacation start/end dates). Lightweight (12 kB), accessible, compatible with React 19. IMPORTANT: Must use v9.4.3+ for React 19 compatibility (v8.x breaks with React 19). | HIGH |

**Why NOT use popular calendar libraries:**
- **FullCalendar** (82 kB): Designed for event scheduling with drag-and-drop. Overkill for static holiday display. Large bundle.
- **React-Big-Calendar** (45 kB): Google Calendar-like weekly/monthly views. Not optimized for full-year grid. Large bundle for mobile users.
- **React-Calendar** (15 kB): Single-month view only. Would need custom wrapper for 12-month display anyway.

### Database & Backend

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Supabase | Latest | PostgreSQL database + Auth | **LOCKED IN.** Official Next.js App Router support via @supabase/ssr. Cookie-based auth (better security than localStorage). Free tier: 500MB storage, sufficient for vacation tracking data. | HIGH |
| @supabase/ssr | 0.8.0+ | Supabase SSR client | **REQUIRED for App Router.** Replaces deprecated @supabase/auth-helpers. Handles cookies across Server/Client Components. Framework-agnostic design. Still v0.x (beta) but actively maintained, moving to v1.0 soon. | MEDIUM |
| @supabase/supabase-js | Latest | Supabase JavaScript client | Core Supabase client library. Works with @supabase/ssr for Next.js integration. | HIGH |

**Setup approach:** Use official Supabase Next.js template as reference (`create-next-app -e with-supabase`) but integrate into existing project.

### State Management

| Technology | Version | Purpose | When to Use | Confidence |
|------------|---------|---------|-------------|------------|
| React Context | Built-in | Simple client state | **RECOMMENDED for this project.** User vacation data, selected year, UI state. Lightweight, no dependencies, sufficient for this scope. | HIGH |
| Zustand | 5.x+ | Global state (if needed) | **Use if Context causes performance issues.** Only add if profiling shows re-render problems. Extremely lightweight (<1 kB). Better performance than Context for frequently-updated global state. | HIGH |

**Recommendation:** Start with React Context. The app scope is limited (vacation tracking, calendar display). Only graduate to Zustand if you observe performance issues during development. For 90% of apps like this, Context is sufficient.

**What NOT to use:**
- **Redux/Redux Toolkit:** Massive overkill for this project size. Adds complexity and bundle size without benefit.
- **Recoil/Jotai:** Experimental/niche. Stick to proven solutions (Context or Zustand).

### API Integration

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Native fetch | Built-in | OpenHolidays API calls | Use Next.js Server Actions or Route Handlers with native fetch. No library needed. Cache responses with Next.js caching (`revalidate`). | HIGH |

### Testing Stack

| Tool | Version | Purpose | Why Recommended | Confidence |
|------|---------|---------|-----------------|------------|
| Vitest | Latest | Unit/component testing | **STRONGLY RECOMMENDED.** Official Next.js docs recommend Vitest for App Router. 30-70% faster than Jest. Native ESM support. Minimal config with Vite. HMR for tests (only reruns related tests). Compatible with React Testing Library. | HIGH |
| @vitejs/plugin-react | Latest | React support for Vitest | Required for JSX/React component testing in Vitest. | HIGH |
| @testing-library/react | Latest | Component testing | Industry standard for React testing. Encourages accessibility-focused tests. Use semantic selectors (getByRole, getByLabelText). | HIGH |
| @testing-library/dom | Latest | DOM testing utilities | Required peer dependency for @testing-library/react. | HIGH |
| jsdom | Latest | DOM environment for tests | Simulates browser environment for Vitest tests. | HIGH |
| Playwright | Latest | E2E testing | **RECOMMENDED for E2E.** Official Next.js recommendation. Tests across Chromium, Firefox, WebKit. Zero dependencies for E2E tooling. Required for testing async Server Components (Vitest doesn't support async RSC). Built-in dev server integration. | HIGH |

**Why Vitest over Jest:**
- Faster: Benchmarks show 3.8s vs 15.5s for 100 tests
- Better Next.js App Router support (Jest has issues with Server Components)
- Less configuration needed
- Active development aligned with modern React ecosystem

**IMPORTANT limitation:** Vitest does NOT support async Server Components. Use Playwright for E2E tests of any async RSC.

### Development Tools

| Tool | Purpose | Notes | Confidence |
|------|---------|-------|------------|
| ESLint | Linting (locked) | Already configured with eslint-config-next. Add project-specific rules as needed. | HIGH |
| Prettier | Code formatting | **RECOMMENDED.** Add for consistent formatting across team. Integrates with ESLint via eslint-config-prettier. | HIGH |
| TypeScript | Type checking (locked) | Already configured. Enable strict mode for better type safety. | HIGH |
| vite-tsconfig-paths | Path resolution for Vitest | Allows Vitest to resolve TypeScript path aliases from tsconfig.json. | HIGH |

## Installation

```bash
# Date handling
npm install date-fns

# Calendar UI (for date pickers only - main calendar is custom)
npm install react-day-picker

# Supabase (if not using template)
npm install @supabase/supabase-js @supabase/ssr

# State management (start with Context - add Zustand only if needed)
# npm install zustand  # Only add if Context has performance issues

# Testing - Unit/Component
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths

# Testing - E2E
npm install -D @playwright/test

# Development
npm install -D prettier eslint-config-prettier
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative | When Alternative Makes Sense |
|----------|-------------|-------------|---------------------|------------------------------|
| Date library | date-fns | Day.js | Day.js is smaller (6 kB) but less feature-complete. date-fns v4 has timezone support that Day.js lacks. | If bundle size is more critical than functionality |
| Date library | date-fns | Luxon | Luxon is slower (Intl API overhead) and larger unless you need 50+ locales | If you need extensive internationalization with many locales |
| Calendar UI | Custom + react-day-picker | FullCalendar | 82 kB bundle, designed for event scheduling with drag-drop. Massive overkill for static holiday display | If you pivot to event management features later |
| Calendar UI | Custom + react-day-picker | React-Big-Calendar | 45 kB bundle, weekly/monthly views like Google Calendar. Not optimized for full-year grid | If you switch to week/month navigation instead of full year |
| Testing | Vitest | Jest | Jest is slower (15.5s vs 3.8s for 100 tests), requires more config for Next.js App Router, aging ecosystem | If you have existing Jest config to migrate or React Native components |
| E2E Testing | Playwright | Cypress | Cypress has higher overhead, fewer browser options, and less Next.js integration | If team has existing Cypress expertise |
| State | React Context | Zustand | Only add Zustand if Context causes performance issues. Keep it simple first. | If profiling shows re-render performance problems |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| moment.js | Deprecated, unmaintained, huge bundle (66 kB). Project is in maintenance mode. | date-fns |
| react-day-picker v8.x | NOT compatible with React 19. Causes "cannot be used as a JSX component" errors. | react-day-picker v9.4.3+ |
| @supabase/auth-helpers-* | Deprecated. Replaced by @supabase/ssr. No future updates. | @supabase/ssr |
| Redux/Redux Toolkit | Massive overkill for this project. Adds ~50 kB and unnecessary complexity. | React Context or Zustand |
| localStorage for auth | XSS vulnerability. No SSR support. Bad for SEO. | Supabase cookie-based auth via @supabase/ssr |
| Custom date math | Error-prone (timezones, leap years, DST). Reinventing the wheel. | date-fns |

## Stack Patterns by Variant

### If building custom calendar component (RECOMMENDED):

```typescript
// Use date-fns for all date logic
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

// Server Component for static calendar display
export default function CalendarGrid({ year }: { year: number }) {
  const months = generateMonthsData(year); // Using date-fns
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {months.map(month => (
        <MonthGrid key={month.name} days={month.days} holidays={month.holidays} />
      ))}
    </div>
  );
}
```

**Benefits:**
- Minimal bundle (~5-10 kB with date-fns tree-shaking)
- Full control over 12-month layout
- Server Component compatible (no hydration)
- Mobile-optimized responsive grid
- Performance: Only rendering static data, no library overhead

### If using Supabase with Next.js App Router:

```typescript
// app/lib/supabase/server.ts - For Server Components
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// app/lib/supabase/client.ts - For Client Components
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Critical:** Use separate client creation for Server vs Client Components. Never share instances.

### If using State Management:

**Phase 1: React Context (Start here)**
```typescript
// app/contexts/VacationContext.tsx
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type VacationContextType = {
  vacationDays: number;
  updateVacationDays: (days: number) => void;
};

const VacationContext = createContext<VacationContextType | undefined>(undefined);

export function VacationProvider({ children }: { children: ReactNode }) {
  const [vacationDays, setVacationDays] = useState(20);

  return (
    <VacationContext.Provider value={{ vacationDays, updateVacationDays: setVacationDays }}>
      {children}
    </VacationContext.Provider>
  );
}

export const useVacation = () => {
  const context = useContext(VacationContext);
  if (!context) throw new Error('useVacation must be used within VacationProvider');
  return context;
};
```

**Phase 2: Zustand (Only if Context has performance issues)**
```typescript
// app/stores/vacationStore.ts
'use client';
import { create } from 'zustand';

type VacationStore = {
  vacationDays: number;
  updateVacationDays: (days: number) => void;
};

export const useVacationStore = create<VacationStore>((set) => ({
  vacationDays: 20,
  updateVacationDays: (days) => set({ vacationDays: days }),
}));
```

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react-day-picker@9.13.0 | React 19.2.3 | MUST use v9.4.3+. v8.x breaks with React 19 |
| @supabase/ssr@0.8.0+ | Next.js 16.1.3 | Works with App Router. Still v0.x (beta) |
| Vitest@latest | Next.js 16.1.3 | Official Next.js docs recommend for App Router |
| date-fns@4.1.0+ | All versions | Pure JavaScript, no framework dependencies |
| Zustand@5.x | React 19.2.3 | If needed. Works with Server Components via Context pattern |

## Performance Considerations

### Bundle Size Impact (Mobile Critical)

| Library | Size (min+gzip) | Impact | Mitigation |
|---------|-----------------|--------|------------|
| date-fns (full) | 18.6 kB | LOW | Tree-shake: Import only needed functions (e.g., `import { format } from 'date-fns'` brings ~2-3 kB) |
| react-day-picker | 12 kB | LOW | Only for date pickers, not main calendar UI |
| Custom calendar | ~5-10 kB | MINIMAL | With date-fns tree-shaking, total calendar code is tiny |
| Zustand | <1 kB | MINIMAL | Only add if Context has issues |
| Supabase client | ~50 kB | MEDIUM | Required. Use code splitting, lazy load on auth pages only |

**Total estimated bundle (calendar + date handling + date pickers):** ~20-30 kB minified+gzipped

**For comparison:**
- FullCalendar approach: ~82 kB (2.7x larger)
- React-Big-Calendar approach: ~45 kB (1.5x larger)

### Server Components Strategy

**Use Server Components for:**
- Calendar grid rendering (static, no interaction)
- Holiday data fetching from OpenHolidays API
- Initial vacation data from Supabase

**Use Client Components for:**
- Vacation day inputs (interactive)
- Date pickers (react-day-picker requires client)
- Year navigation if interactive
- State management (Context/Zustand)

**Performance benefit:** Server Components = zero JavaScript shipped for calendar display. Only interaction components need hydration.

## Testing Strategy

### Unit/Component Tests (Vitest + React Testing Library)

**Vitest Configuration:** `vitest.config.mts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'vitest.config.mts',
        '**/*.config.{js,ts}',
      ],
    },
  },
});
```

**What to test:**
- Date utility functions (date-fns wrappers)
- Calendar grid logic (month generation, day calculations)
- Client Components (vacation inputs, date pickers)
- Synchronous Server Components (static rendering)

**What NOT to test with Vitest:**
- Async Server Components (use Playwright E2E instead)
- Full integration flows (use Playwright E2E)

**Target:** 50% meaningful coverage (per requirements)

### E2E Tests (Playwright)

**Configuration:** `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**What to test:**
- Full vacation tracking flow (add, view, history)
- Google authentication flow
- Holiday display accuracy
- Mobile responsiveness (Safari + Chrome)
- Async Server Component data fetching

**Focus:** Critical user paths on mobile Safari and Chrome (per requirements)

## Sources

### Date Libraries
- [date-fns vs dayjs vs luxon npm trends](https://npmtrends.com/date-fns-vs-dayjs-vs-luxon-vs-moment) - Download comparison
- [Phrase: Best JavaScript Date Libraries](https://phrase.com/blog/posts/best-javascript-date-time-libraries/) - Feature comparison
- [date-fns Bundlephobia](https://bundlephobia.com/package/date-fns) - Bundle size analysis
- [date-fns v4.0 Blog Post](https://blog.date-fns.org/v40-with-time-zone-support/) - Timezone support announcement

### Calendar Libraries
- [Builder.io: React Calendar Components 2025](https://www.builder.io/blog/best-react-calendar-component-ai) - Library comparison
- [DronaHQ: Top React Calendar Components](https://www.dronahq.com/top-react-calendar-components/) - Bundle sizes
- [react-day-picker Changelog](https://daypicker.dev/changelog) - React 19 compatibility
- [react-day-picker React 19 Support Discussion](https://github.com/gpbl/react-day-picker/discussions/2152) - Version 9.4.3+ confirmation

### Supabase
- [Supabase Next.js Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/nextjs) - Official setup guide
- [Supabase SSR Package on npm](https://www.npmjs.com/package/@supabase/ssr) - Current version
- [Medium: Supabase Cookie-Based Auth 2025](https://the-shubham.medium.com/next-js-supabase-cookie-based-auth-workflow-the-best-auth-solution-2025-guide-f6738b4673c1) - Best practices
- [Medium: Supabase Next.js Real Way](https://medium.com/@iamqitmeeer/supabase-next-js-guide-the-real-way-01a7f2bd140c) - Project structure

### State Management
- [DEV: State Management 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) - Comparison
- [Developer Way: React State Management 2025](https://www.developerway.com/posts/react-state-management-2025) - Best practices
- [TkDodo: Zustand and React Context](https://tkdodo.eu/blog/zustand-and-react-context) - When to use each

### Testing
- [Next.js Vitest Guide](https://nextjs.org/docs/app/guides/testing/vitest) - Official documentation
- [Jest vs Vitest 2025](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9) - Performance comparison
- [Strapi: Next.js Testing Guide](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright) - Vitest + Playwright setup
- [Next.js Playwright Guide](https://nextjs.org/docs/pages/guides/testing/playwright) - Official E2E testing

---
*Stack research for: Bulgarian Holiday Calendar with Vacation Tracking*
*Researched: 2026-01-18*
*Confidence: HIGH - All recommendations verified with official docs and current sources*
