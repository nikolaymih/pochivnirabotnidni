# Phase 6: Testing & Quality Gates - Research

**Researched:** 2026-02-11
**Domain:** Next.js 16 App Router Testing Strategy
**Confidence:** HIGH

## Summary

Testing Next.js 16 App Router applications with Server Components requires a multi-layered strategy combining Jest for unit/integration tests and Playwright for E2E tests. Jest currently does NOT support async Server Components, making E2E testing critical for this architecture. The established approach is: Jest + React Testing Library for synchronous components, pure functions, and hooks; Playwright for async Server Components, user flows, and cross-browser validation (Safari + Chrome).

The project already has Jest configured with ts-jest preset and one working test suite (lib/calendar/bridgeDays.test.ts), providing a foundation to build upon. Testing focus should be on Safari-critical date handling logic (parseISO patterns), vacation state management (localStorage + Supabase sync), and rollover calculations with Bulgarian labor law compliance.

**Primary recommendation:** Use Jest for testing pure functions (date utilities, bridge day logic, rollover calculations) and synchronous components. Add Playwright for E2E coverage of async Server Components, authentication flows, and Safari cross-browser validation. Configure 50% coverage threshold globally, excluding E2E and config files.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | 30.2.0 | Unit/integration test runner | Next.js built-in support via next/jest, TypeScript integration |
| @testing-library/react | Latest | Component testing | Official React team recommendation, user-focused queries |
| @testing-library/jest-dom | Latest | Custom matchers | Improves test readability (toBeInTheDocument, toHaveTextContent) |
| Playwright | Latest | E2E testing | Microsoft-backed, Safari/WebKit support, auto-waiting eliminates flakiness |
| ts-jest | 29.4.6 | TypeScript transformer | Already installed, enables Jest to understand TS without Babel |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/user-event | Latest | User interaction simulation | Testing clicks, typing, drag events in components |
| jest-environment-jsdom | Latest | DOM environment for tests | Testing components that render (not pure functions) |
| @testing-library/dom | Latest | DOM queries | Peer dependency for React Testing Library |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Playwright | Cypress | Cypress has better DX (time-travel debugging, UI), but Playwright wins on Safari support and parallelization |
| Jest | Vitest | Vitest is faster (ESM-native), but Jest has better Next.js integration via next/jest |
| RTL | Enzyme | Enzyme is deprecated, RTL is official React recommendation |

**Installation:**
```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test
```

**Note:** Jest, ts-jest, and @jest/globals are already installed. Playwright needs to be added.

## Architecture Patterns

### Recommended Project Structure
```
__tests__/
├── unit/                    # Pure function tests
│   ├── calendar/
│   │   ├── dates.test.ts
│   │   ├── bridgeDays.test.ts (EXISTS)
│   │   └── grid.test.ts
│   ├── vacation/
│   │   ├── rollover.test.ts
│   │   └── storage.test.ts
│   └── avatar/
│       └── initials.test.ts
├── integration/             # Component + context tests
│   ├── contexts/
│   │   ├── VacationContext.test.tsx
│   │   └── AuthContext.test.tsx
│   └── components/
│       ├── VacationSummary.test.tsx
│       └── MonthGrid.test.tsx
└── e2e/                     # Playwright E2E tests
    ├── calendar.spec.ts     # Full-year calendar rendering
    ├── vacation.spec.ts     # Vacation marking and persistence
    ├── auth.spec.ts         # Google auth flow
    └── safari.spec.ts       # Safari-specific date edge cases
```

### Pattern 1: Testing Pure Functions (Unit Tests)
**What:** Test date utilities, bridge day logic, rollover calculations without rendering components
**When to use:** Functions in lib/ directory that don't depend on React or DOM
**Example:**
```typescript
// Source: lib/calendar/dates.test.ts
import { describe, test, expect } from '@jest/globals';
import { parseDate, serializeDate, getCurrentDate } from '@/lib/calendar/dates';

describe('parseDate', () => {
  test('parses ISO date string to Date object', () => {
    const result = parseDate('2026-03-15');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2); // March (0-indexed)
    expect(result.getDate()).toBe(15);
  });

  test('handles leap year dates correctly', () => {
    const result = parseDate('2024-02-29');
    expect(result.getDate()).toBe(29);
  });
});

describe('serializeDate', () => {
  test('formats Date to YYYY-MM-DD string', () => {
    const date = new Date(2026, 2, 15); // March 15, 2026
    const result = serializeDate(date);
    expect(result).toBe('2026-03-15');
  });
});
```

### Pattern 2: Testing React Context (Integration Tests)
**What:** Test VacationContext and AuthContext with mocked providers
**When to use:** Testing components that consume context values
**Example:**
```typescript
// Source: https://testing-library.com/docs/example-react-context/
import { render, screen } from '@testing-library/react';
import { VacationProvider } from '@/contexts/VacationContext';
import VacationSummary from '@/components/VacationSummary';

test('displays vacation summary with rollover for authenticated users', () => {
  const mockUser = { id: 'test-user', email: 'test@example.com' };

  render(
    <VacationProvider year={2026}>
      <VacationSummary user={mockUser} />
    </VacationProvider>
  );

  expect(screen.getByText(/Общо:/)).toBeInTheDocument();
  expect(screen.getByText(/Използвани:/)).toBeInTheDocument();
});
```

### Pattern 3: Testing with localStorage Mock
**What:** Mock localStorage for testing vacation persistence
**When to use:** Testing hooks/context that use localStorage (useLocalStorage, VacationContext)
**Example:**
```typescript
// Source: https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/
beforeEach(() => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = localStorageMock as any;
});

afterEach(() => {
  global.localStorage.clear();
});

test('persists vacation dates to localStorage', () => {
  const { result } = renderHook(() => useLocalStorage('vacationDates', []));

  act(() => {
    result.current[1](['2026-03-15']);
  });

  expect(localStorage.setItem).toHaveBeenCalledWith(
    'vacationDates',
    JSON.stringify(['2026-03-15'])
  );
});
```

### Pattern 4: Testing Async Server Components (E2E Only)
**What:** Use Playwright to test async Server Components like FullYearCalendar
**When to use:** ANY component that uses async/await in Server Component context
**Example:**
```typescript
// Source: https://playwright.dev/docs/intro
import { test, expect } from '@playwright/test';

test('renders 12 months in full-year calendar', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for calendar to load
  await page.waitForSelector('[data-testid="month-grid"]');

  // Count month grids (should be 12)
  const monthGrids = await page.locator('[data-testid="month-grid"]').count();
  expect(monthGrids).toBe(12);
});

test('Safari: dates display correctly without timezone shift', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'Safari-specific test');

  await page.goto('http://localhost:3000');

  // Verify January 1st holiday displays on correct date
  const jan1Cell = await page.locator('[data-date="2026-01-01"]');
  await expect(jan1Cell).toHaveAttribute('data-holiday', 'true');
});
```

### Pattern 5: Mocking Supabase in Tests
**What:** Mock Supabase client to avoid real database calls
**When to use:** Testing VacationContext sync logic, auth flows, rollover calculations
**Example:**
```typescript
// Source: https://blog.stackademic.com/mocking-supabase-auth-in-react-app-ea2ba2c78c94
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }
      })
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { totalDays: 20, vacationDates: ['2026-03-15'] }
      })
    }))
  })
}));
```

### Anti-Patterns to Avoid
- **Testing implementation details:** Don't test internal state or private methods. Test behavior users see.
- **Snapshot testing everywhere:** Snapshots are brittle. Use sparingly for static UI, not logic.
- **100% coverage goal:** Coverage theater wastes time. Focus on critical paths, edge cases, and Safari-specific logic.
- **Mocking date-fns functions:** Test your utilities, not library internals. Mock Date constructor if needed, not parseISO.
- **Testing Server Components with Jest:** Jest doesn't support async components. Use Playwright instead.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date mocking in tests | Custom Date wrapper | jest.useFakeTimers() + setSystemTime() | Handles Date.now(), setTimeout, edge cases |
| Component query selectors | querySelector chains | @testing-library/react queries | Accessible, user-focused, auto-waits |
| Browser automation | Custom Puppeteer scripts | Playwright Test | Built-in assertions, parallelization, trace viewer |
| Coverage reporting | Custom coverage parser | Jest --coverage with HTML reporter | Generates coverage/index.html, per-file metrics |
| localStorage mocking | Global variable mutation | jest.spyOn(Storage.prototype) | Proper cleanup, no global pollution |
| Cross-browser CI | Custom VM setup | Playwright GitHub Actions | Official support, browser binaries included |

**Key insight:** Testing infrastructure has well-established patterns. The edge cases (DST transitions, timezone shifts, localStorage quotas, authentication state) have been solved. Use proven tools.

## Common Pitfalls

### Pitfall 1: Not Testing DST Boundary Dates
**What goes wrong:** Date calculations break during daylight saving time transitions (March/October in Bulgaria)
**Why it happens:** Tests use fixed dates without covering DST transition days
**How to avoid:** Test specific DST boundary dates for Bulgaria (last Sunday in March, last Sunday in October)
**Warning signs:** Bug reports in March/November about incorrect date displays
**Example:**
```typescript
// Test DST spring forward (last Sunday in March)
test('handles DST spring forward correctly', () => {
  // March 30, 2026 - 3:00 AM becomes 4:00 AM in Bulgaria
  const dstDate = parseDate('2026-03-30');
  expect(serializeDate(dstDate)).toBe('2026-03-30'); // No shift
});

// Test DST fall back (last Sunday in October)
test('handles DST fall back correctly', () => {
  // October 25, 2026 - 4:00 AM becomes 3:00 AM in Bulgaria
  const dstDate = parseDate('2026-10-25');
  expect(serializeDate(dstDate)).toBe('2026-10-25'); // No shift
});
```

### Pitfall 2: Coverage Theater Instead of Meaningful Tests
**What goes wrong:** 50% coverage hit with useless tests that don't validate business logic
**Why it happens:** Developers optimize for coverage metric instead of test quality
**How to avoid:** Write tests that would fail if requirements change. Test edge cases and error paths.
**Warning signs:** Tests pass but bugs still reach production
**Example:**
```typescript
// BAD: Coverage theater
test('rollover calculation runs', () => {
  const result = calculateRollover('user', 2026);
  expect(result).toBeDefined(); // Useless assertion
});

// GOOD: Meaningful test
test('rollover excludes expired vacation from 2 years ago', async () => {
  // Mock data: 2024 vacation (expires 2026-12-31), viewing 2027
  jest.setSystemTime(new Date('2027-01-15'));

  const result = await calculateRollover('user', 2027);

  expect(result?.buckets[0].isExpired).toBe(true);
  expect(result?.totalRollover).toBe(0); // Expired doesn't count
});
```

### Pitfall 3: Not Testing Safari-Specific Date Parsing
**What goes wrong:** Tests pass in Chrome, break in Safari due to different date parsing
**Why it happens:** Jest runs in Node.js (V8 engine), not WebKit
**How to avoid:** Add Playwright tests with browserName === 'webkit' for Safari validation
**Warning signs:** User reports "holidays showing on wrong dates" only from Safari users
**Example:**
```typescript
// Playwright test for Safari
test('Safari: parseISO handles dates correctly', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'Safari-specific test');

  await page.goto('http://localhost:3000');

  // Verify Dec 31st does NOT show as Jan 1st holiday (Phase 1.1 bug)
  const dec31 = await page.locator('[data-date="2026-12-31"]');
  await expect(dec31).not.toHaveAttribute('data-holiday', 'Нова година');
});
```

### Pitfall 4: Ignoring Test Cleanup
**What goes wrong:** localStorage/session state leaks between tests, causing flaky failures
**Why it happens:** beforeEach clears state but afterEach doesn't clean up async operations
**How to avoid:** Use afterEach to clear localStorage, reset mocks, cancel pending timers
**Warning signs:** Tests pass individually but fail when run together
**Example:**
```typescript
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
  localStorage.clear();
});
```

### Pitfall 5: Not Testing Performance Budgets
**What goes wrong:** Calendar renders slow on mobile, violating performance requirements
**Why it happens:** No automated performance testing in CI
**How to avoid:** Add Lighthouse CI or Playwright performance assertions
**Warning signs:** User complaints about "slow calendar loading" after new features
**Example:**
```typescript
// Playwright performance test
test('year view renders within 200ms budget', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const metrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    return perfData.loadEventEnd - perfData.fetchStart;
  });

  expect(metrics).toBeLessThan(200); // 200ms budget
});
```

## Code Examples

Verified patterns from official sources:

### Testing Date Edge Cases
```typescript
// Source: lib/calendar/bridgeDays.test.ts (existing)
describe('Year boundary handling', () => {
  test('Holiday in early January suggests days in late December', () => {
    const holidays: Holiday[] = [
      { date: '2027-01-01', name: 'New Year 2027', type: 'Public Holiday' }
    ];

    const bridges2026 = detectBridgeDays(holidays, 2026);
    expect(bridges2026.map(b => b.date).sort()).toEqual([
      '2026-12-28', // Monday
      '2026-12-29', // Tuesday
      '2026-12-30', // Wednesday
      '2026-12-31', // Thursday
    ]);
  });
});
```

### Testing React Context with Providers
```typescript
// Source: https://testing-library.com/docs/example-react-context/
import { render, screen } from '@testing-library/react';
import { VacationProvider } from '@/contexts/VacationContext';
import userEvent from '@testing-library/user-event';

test('adding vacation date updates used count', async () => {
  const user = userEvent.setup();

  render(
    <VacationProvider year={2026}>
      <FullYearCalendarWrapper />
    </VacationProvider>
  );

  // Click a date to mark as vacation
  const dateCellMarch15 = screen.getByTestId('date-2026-03-15');
  await user.click(dateCellMarch15);

  // Verify count updates
  expect(screen.getByText(/Използвани: 1/)).toBeInTheDocument();
});
```

### Playwright Cross-Browser Test
```typescript
// Source: https://playwright.dev/docs/intro
import { test, expect, devices } from '@playwright/test';

test.describe('Safari cross-browser validation', () => {
  test.use({ ...devices['Desktop Safari'] });

  test('calendar renders all months correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for async Server Component to render
    await page.waitForSelector('[data-testid="month-grid"]');

    const monthGrids = await page.locator('[data-testid="month-grid"]').count();
    expect(monthGrids).toBe(12);
  });
});
```

### Jest Coverage Configuration
```typescript
// Source: https://jestjs.io/docs/configuration
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Use 'jsdom' for component tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50,
    },
  },
};

export default createJestConfig(config);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Enzyme for React testing | React Testing Library | 2020 | RTL focuses on user behavior, not implementation details |
| Cypress for all E2E | Playwright gaining adoption | 2023-2024 | Playwright has better Safari support, built-in parallelization |
| Manual browser testing | Automated cross-browser CI | 2024-2025 | Playwright GitHub Actions catch Safari bugs before production |
| jest.mock() everywhere | MSW for API mocking | 2023-2024 | MSW intercepts network requests, more realistic than mocks |
| Coverage as primary metric | Meaningful test quality focus | 2025-2026 | Avoid coverage theater, test critical paths |

**Deprecated/outdated:**
- Enzyme: Deprecated, doesn't support Server Components
- Selenium: Slow, flaky, Playwright/Cypress are better alternatives
- Istanbul CLI: Jest has built-in coverage with v8 provider
- Manual Safari testing: Playwright webkit engine automates this

## Open Questions

Things that couldn't be fully resolved:

1. **Next.js 16 + Playwright integration patterns**
   - What we know: Playwright works with Next.js, official example exists
   - What's unclear: Best practices for testing Server Actions, streaming SSR
   - Recommendation: Start with basic E2E tests, expand as patterns emerge

2. **Testing PWA service worker behavior**
   - What we know: Service worker is vanilla JS, disabled in dev
   - What's unclear: How to test offline cache behavior in Playwright
   - Recommendation: Manual testing initially, investigate Playwright service worker API later

3. **Optimal coverage threshold for this project**
   - What we know: 50% is the stated goal (PROJECT.md)
   - What's unclear: Whether 50% applies globally or per-module
   - Recommendation: Start with global 50%, adjust per-module if needed

4. **Bulgarian labor law rollover calculation validation**
   - What we know: 2-year expiration rule exists (lib/vacation/rollover.ts)
   - What's unclear: Edge cases around partial years, job changes mid-year
   - Recommendation: Test known scenarios, add tests when edge cases discovered

## Sources

### Primary (HIGH confidence)
- [Next.js Testing Docs](https://nextjs.org/docs/app/building-your-application/testing) - Official Next.js testing guide (App Router)
- [Next.js Jest Setup](https://nextjs.org/docs/pages/guides/testing/jest) - Official Jest configuration with next/jest
- [Playwright Documentation](https://playwright.dev/docs/intro) - Official Playwright setup and API
- [React Testing Library Docs](https://testing-library.com/docs/example-react-context/) - Official RTL context testing patterns
- [Jest Configuration](https://jestjs.io/docs/configuration) - Official Jest config reference

### Secondary (MEDIUM confidence)
- [Next.js App Router Testing Setup](https://shinagawa-web.com/en/blogs/nextjs-app-router-testing-setup) - Real-world Next.js testing strategy (2026)
- [Playwright vs Cypress 2026 Guide](https://devin-rosario.medium.com/playwright-vs-cypress-the-2026-enterprise-testing-guide-ade8b56d3478) - Framework comparison
- [Jest Coverage Configuration](https://www.valentinog.com/blog/jest-coverage/) - Coverage threshold best practices
- [Testing Dates with Jest](https://bengry.medium.com/testing-dates-and-timezones-using-jest-10a6a6ecf375) - DST and timezone testing patterns
- [React Context Testing](https://www.samdawson.dev/article/react-context-testing/) - Context testing best practices

### Tertiary (LOW confidence)
- [Supabase Auth Mocking](https://blog.stackademic.com/mocking-supabase-auth-in-react-app-ea2ba2c78c94) - Supabase testing patterns (not verified with official docs)
- [localStorage Testing](https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/) - localStorage mock patterns (community post)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs explicitly recommend Jest + Playwright
- Architecture: HIGH - Jest config already exists, patterns verified in bridgeDays.test.ts
- Pitfalls: MEDIUM - DST/Safari issues based on project history (Phase 1.1), coverage theater from general best practices

**Research date:** 2026-02-11
**Valid until:** 2026-04-11 (60 days - testing ecosystem is stable, Next.js 16 is current)

**Key constraints from project:**
- Jest with ts-jest already configured (jest.config.js exists)
- Safari + Chrome validation required (PROJECT.md constraint)
- 50% meaningful test coverage threshold (PROJECT.md requirement)
- Date handling is Safari-critical (Phase 1.1 timezone bug context)
- Bulgarian labor law compliance (2-year rollover expiration)
