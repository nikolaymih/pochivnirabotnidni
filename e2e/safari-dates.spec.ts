import { test, expect } from '@playwright/test';

test.describe('Safari date validation', () => {
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific tests');
    await page.goto('/');
    await page.waitForSelector('[data-testid="month-grid"]', { timeout: 15000 });
  });

  test('Jan 1 holiday displays on correct date (not Dec 31)', async ({ page }) => {
    // Phase 1.1 regression: timezone shift caused Jan 1 holiday to appear on Dec 31
    const jan1 = page.locator('[data-date="2026-01-01"]');
    await expect(jan1).toHaveAttribute('data-holiday', 'true');

    // Verify holiday styling
    const classList = await jan1.getAttribute('class');
    expect(classList).toContain('bg-cinnamon');
  });

  test('Dec 31 does NOT show as Jan 1 holiday', async ({ page }) => {
    // Phase 1.1 regression prevention
    const dec31 = page.locator('[data-date="2026-12-31"]');
    await expect(dec31).toBeVisible();

    // Dec 31 should NOT have holiday attribute (it's not a Bulgarian holiday)
    await expect(dec31).not.toHaveAttribute('data-holiday', 'true');
  });

  test('DST spring forward: March 29, 2026 displays correctly', async ({ page }) => {
    // Last Sunday in March 2026 = March 29 (spring forward in Bulgaria)
    const march29 = page.locator('[data-date="2026-03-29"]');
    await expect(march29).toBeVisible();

    // Verify it's within the March month grid (index 2, 0-based)
    const marchGrid = page.locator('[data-testid="month-grid"][data-month="3"]');
    await expect(marchGrid.locator('[data-date="2026-03-29"]')).toBeVisible();
  });

  test('DST fall back: October 25, 2026 displays correctly', async ({ page }) => {
    // Last Sunday in October 2026 = October 25 (fall back in Bulgaria)
    const oct25 = page.locator('[data-date="2026-10-25"]');
    await expect(oct25).toBeVisible();

    // Verify it's within the October month grid
    const octGrid = page.locator('[data-testid="month-grid"][data-month="10"]');
    await expect(octGrid.locator('[data-date="2026-10-25"]')).toBeVisible();
  });

  test('year boundary: last week of December renders correctly', async ({ page }) => {
    // Verify Dec 28-31 all display in December
    for (const day of ['28', '29', '30', '31']) {
      const cell = page.locator(`[data-date="2026-12-${day}"]`);
      await expect(cell).toBeVisible();
    }
  });

  test('Liberation Day (March 3) displays on correct date', async ({ page }) => {
    // March 3 = Ден на Освобождението
    const march3 = page.locator('[data-date="2026-03-03"]');
    await expect(march3).toHaveAttribute('data-holiday', 'true');
  });

  test('Bulgarian Education Day (May 24) displays on correct date', async ({ page }) => {
    // May 24 = Ден на българската просвета и култура
    const may24 = page.locator('[data-date="2026-05-24"]');
    await expect(may24).toHaveAttribute('data-holiday', 'true');
  });
});

test.describe('Cross-browser date consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="month-grid"]', { timeout: 15000 });
  });

  test('all 12 months render with correct month numbers', async ({ page }) => {
    for (let month = 1; month <= 12; month++) {
      const grid = page.locator(`[data-testid="month-grid"][data-month="${month}"]`);
      await expect(grid).toBeVisible();
    }
  });

  test('holidays appear on expected dates regardless of browser', async ({ page }) => {
    // Key Bulgarian holidays that must not shift due to timezone issues
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
      const cell = page.locator(`[data-date="${date}"]`);
      await expect(cell).toHaveAttribute('data-holiday', 'true');
    }
  });
});
