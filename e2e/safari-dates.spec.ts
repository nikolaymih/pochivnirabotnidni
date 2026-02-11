import { test, expect } from '@playwright/test';

// Helper: wait for calendar to render (skip hidden mobile month grids)
async function waitForCalendar(page: any) {
  await page.locator('[data-testid="month-grid"]').nth(12).waitFor({ state: 'visible', timeout: 15000 });
}

function visibleDate(page: any, date: string) {
  return page.locator(`[data-date="${date}"]:visible`).first();
}

test.describe('Safari date validation', () => {
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific tests');
    await page.goto('/');
    await waitForCalendar(page);
  });

  test('Jan 1 holiday displays on correct date (not Dec 31)', async ({ page }) => {
    const jan1 = visibleDate(page, '2026-01-01');
    await expect(jan1).toHaveAttribute('data-holiday', 'true');
    const classList = await jan1.getAttribute('class');
    expect(classList).toContain('bg-cinnamon');
  });

  test('Dec 31 does NOT show as Jan 1 holiday', async ({ page }) => {
    const dec31 = visibleDate(page, '2026-12-31');
    await expect(dec31).toBeVisible();
    await expect(dec31).not.toHaveAttribute('data-holiday', 'true');
  });

  test('DST spring forward: March 29, 2026 displays correctly', async ({ page }) => {
    const march29 = visibleDate(page, '2026-03-29');
    await expect(march29).toBeVisible();

    // Verify it's in March grid (0-indexed: March = 2)
    const marchGrid = page.locator('[data-testid="month-grid"][data-month="2"]:visible');
    await expect(marchGrid.locator('[data-date="2026-03-29"]')).toBeVisible();
  });

  test('DST fall back: October 25, 2026 displays correctly', async ({ page }) => {
    const oct25 = visibleDate(page, '2026-10-25');
    await expect(oct25).toBeVisible();

    // Verify it's in October grid (0-indexed: October = 9)
    const octGrid = page.locator('[data-testid="month-grid"][data-month="9"]:visible');
    await expect(octGrid.locator('[data-date="2026-10-25"]')).toBeVisible();
  });

  test('year boundary: last week of December renders', async ({ page }) => {
    for (const day of ['28', '29', '30', '31']) {
      const cell = visibleDate(page, `2026-12-${day}`);
      await expect(cell).toBeVisible();
    }
  });

  test('Liberation Day (March 3) on correct date', async ({ page }) => {
    const march3 = visibleDate(page, '2026-03-03');
    await expect(march3).toHaveAttribute('data-holiday', 'true');
  });

  test('Bulgarian Education Day (May 24) on correct date', async ({ page }) => {
    const may24 = visibleDate(page, '2026-05-24');
    await expect(may24).toHaveAttribute('data-holiday', 'true');
  });
});

test.describe('Cross-browser date consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForCalendar(page);
  });

  test('all 12 months render with correct month numbers', async ({ page }) => {
    // data-month is 0-indexed (0=January, 11=December)
    for (let month = 0; month < 12; month++) {
      const grid = page.locator(`[data-testid="month-grid"][data-month="${month}"]:visible`);
      await expect(grid).toBeVisible();
    }
  });

  test('holidays appear on expected dates', async ({ page }) => {
    const holidays = [
      '2026-01-01', // Нова година
      '2026-03-03', // Ден на Освобождението
      '2026-05-01', // Ден на труда
      '2026-05-06', // Гергьовден
      '2026-05-24', // Ден на българската просвета
      '2026-09-06', // Ден на Съединението
      '2026-09-22', // Ден на Независимостта
      '2026-12-24', // Бъдни вечер
      '2026-12-25', // Коледа
      '2026-12-26', // Коледа (втори ден)
    ];

    for (const date of holidays) {
      const cell = visibleDate(page, date);
      await expect(cell).toHaveAttribute('data-holiday', 'true');
    }
  });
});
