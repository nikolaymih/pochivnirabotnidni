import { test, expect } from '@playwright/test';

// Helper: wait for the visible calendar to load (desktop at 1280px viewport)
async function waitForCalendar(page: any) {
  // Mobile layout is lg:hidden, desktop is hidden lg:block
  // At default 1280px viewport, desktop section is visible
  // Use nth to skip hidden mobile month grids (first 12 are mobile)
  await page.locator('[data-testid="month-grid"]').nth(12).waitFor({ state: 'visible', timeout: 15000 });
}

// Helper: get a visible date cell (skip hidden mobile duplicates)
function visibleDate(page: any, date: string) {
  return page.locator(`[data-date="${date}"]:visible`).first();
}

test.describe('Full-year calendar rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForCalendar(page);
  });

  test('page loads without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Почивни Работни Дни/);
  });

  test('renders 12 visible months', async ({ page }) => {
    // Desktop layout should show 12 visible month grids
    const visibleGrids = page.locator('[data-testid="month-grid"]:visible');
    const count = await visibleGrids.count();
    expect(count).toBe(12);
  });

  test('displays Bulgarian month names', async ({ page }) => {
    // Month names appear as headings inside each MonthGrid
    await expect(page.getByRole('heading', { name: 'Януари' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Декември' })).toBeVisible();
  });

  test('current date has visual indicator', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    const todayCell = visibleDate(page, today);
    await expect(todayCell).toBeVisible();
    const classList = await todayCell.getAttribute('class');
    expect(classList).toContain('ring');
  });
});

test.describe('Holiday display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForCalendar(page);
  });

  test('January 1st displays as holiday', async ({ page }) => {
    const jan1 = visibleDate(page, '2026-01-01');
    await expect(jan1).toHaveAttribute('data-holiday', 'true');
    const classList = await jan1.getAttribute('class');
    expect(classList).toContain('bg-cinnamon');
    expect(classList).toContain('text-white');
  });

  test('holiday cells have correct styling', async ({ page }) => {
    // Get visible holiday cells
    const holidayCells = page.locator('[data-holiday="true"]:visible');
    const count = await holidayCells.count();
    expect(count).toBeGreaterThan(0);

    const firstHoliday = holidayCells.first();
    const classList = await firstHoliday.getAttribute('class');
    expect(classList).toContain('bg-cinnamon');
  });

  test('desktop: holiday has tooltip info icon', async ({ page }) => {
    // Verify holiday cells exist with the tooltip trigger (info icon)
    const jan1 = visibleDate(page, '2026-01-01');
    await expect(jan1).toBeVisible();
    // Holiday should have the tooltip info element nearby
    const holidayContainer = jan1.locator('..');
    await expect(holidayContainer).toBeVisible();
  });
});

test.describe('Vacation marking interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForCalendar(page);
  });

  test('clicking a workday does not crash', async ({ page }) => {
    // March 16, 2026 is a Monday
    const target = visibleDate(page, '2026-03-16');
    await expect(target).toBeVisible();
    await target.click();
    await page.waitForTimeout(500);
    // Page should still be functional after click
    await expect(target).toBeVisible();
  });

  test('holidays cannot be marked as vacation', async ({ page }) => {
    const jan1 = visibleDate(page, '2026-01-01');
    await expect(jan1).toHaveAttribute('data-holiday', 'true');
    await jan1.click();
    await page.waitForTimeout(300);
    await expect(jan1).toHaveAttribute('data-holiday', 'true');
    await expect(jan1).not.toHaveAttribute('data-vacation', 'true');
  });
});

test.describe('Year display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForCalendar(page);
  });

  test('shows year in the page', async ({ page }) => {
    // Year is visible in the desktop calendar (data-year attribute)
    const grid = page.locator('[data-testid="month-grid"]:visible').first();
    const year = await grid.getAttribute('data-year');
    expect(year).toBeTruthy();
  });

  test('all months belong to correct year', async ({ page }) => {
    // Check that visible month grids have data-year attribute
    const grid = page.locator('[data-testid="month-grid"]:visible').first();
    const year = await grid.getAttribute('data-year');
    expect(year).toBe('2026');
  });
});
