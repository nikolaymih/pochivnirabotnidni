import { describe, test, expect } from '@jest/globals';
import { getCalendarGrid, formatMonthYear } from './grid';

describe('getCalendarGrid', () => {
  test('returns correct days count for January 2026', () => {
    const grid = getCalendarGrid(2026, 0);
    expect(grid.daysInMonth).toBe(31);
    expect(grid.days).toHaveLength(31);
    expect(grid.days[0]).toBe(1);
    expect(grid.days[30]).toBe(31);
  });

  test('returns correct days count for February 2026 (non-leap)', () => {
    const grid = getCalendarGrid(2026, 1);
    expect(grid.daysInMonth).toBe(28);
    expect(grid.days).toHaveLength(28);
  });

  test('returns correct days count for February 2024 (leap year)', () => {
    const grid = getCalendarGrid(2024, 1);
    expect(grid.daysInMonth).toBe(29);
    expect(grid.days).toHaveLength(29);
  });

  test('January 2026 starts on Thursday (index 3 in Monday-first)', () => {
    // Jan 1, 2026 is a Thursday
    const grid = getCalendarGrid(2026, 0);
    expect(grid.firstDayOfWeek).toBe(3); // Thursday = index 3 (Mon=0)
  });

  test('March 2026 starts on Sunday (index 6 in Monday-first)', () => {
    // Mar 1, 2026 is a Sunday
    const grid = getCalendarGrid(2026, 2);
    expect(grid.firstDayOfWeek).toBe(6); // Sunday = index 6 (Mon=0)
  });

  test('June 2026 starts on Monday (index 0)', () => {
    // Jun 1, 2026 is a Monday
    const grid = getCalendarGrid(2026, 5);
    expect(grid.firstDayOfWeek).toBe(0);
  });

  test('days array is sequential from 1 to daysInMonth', () => {
    const grid = getCalendarGrid(2026, 3); // April = 30 days
    expect(grid.daysInMonth).toBe(30);
    for (let i = 0; i < grid.days.length; i++) {
      expect(grid.days[i]).toBe(i + 1);
    }
  });
});

describe('formatMonthYear', () => {
  test('formats January 2026 in Bulgarian', () => {
    const result = formatMonthYear(2026, 0);
    expect(result).toBe('Януари 2026');
  });

  test('formats December 2026 in Bulgarian', () => {
    const result = formatMonthYear(2026, 11);
    expect(result).toBe('Декември 2026');
  });

  test('capitalizes first letter of month name', () => {
    const result = formatMonthYear(2026, 5); // June
    expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
  });

  test('formats all 12 months without error', () => {
    const expectedMonths = [
      'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
      'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
    ];
    for (let month = 0; month < 12; month++) {
      const result = formatMonthYear(2026, month);
      expect(result).toBe(`${expectedMonths[month]} 2026`);
    }
  });
});
