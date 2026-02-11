import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { parseDate, serializeDate, getCurrentDate } from '@/lib/calendar/dates';

describe('parseDate', () => {
  test('parses valid ISO string (YYYY-MM-DD format)', () => {
    const date = parseDate('2026-03-15');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // March is month 2 (0-indexed)
    expect(date.getDate()).toBe(15);
  });

  test('parses leap year date (2024-02-29)', () => {
    const date = parseDate('2024-02-29');

    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(1); // February
    expect(date.getDate()).toBe(29);
  });

  test('parses non-leap year Feb 28 (2026-02-28)', () => {
    const date = parseDate('2026-02-28');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(28);
  });

  test('parses DST spring forward boundary date for Bulgaria (2026-03-30)', () => {
    // Last Sunday in March, clocks move forward 3:00 AM -> 4:00 AM
    const date = parseDate('2026-03-30');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // March
    expect(date.getDate()).toBe(30);
  });

  test('parses DST fall back boundary date for Bulgaria (2026-10-25)', () => {
    // Last Sunday in October, clocks move back 4:00 AM -> 3:00 AM
    const date = parseDate('2026-10-25');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9); // October
    expect(date.getDate()).toBe(25);
  });

  test('parses year boundary start date (2026-01-01)', () => {
    const date = parseDate('2026-01-01');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0); // January
    expect(date.getDate()).toBe(1);
  });

  test('parses year boundary end date (2026-12-31)', () => {
    const date = parseDate('2026-12-31');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(11); // December
    expect(date.getDate()).toBe(31);
  });

  test('handles invalid date string gracefully', () => {
    // parseISO from date-fns returns Invalid Date for invalid strings
    const date = parseDate('not-a-date');

    expect(isNaN(date.getTime())).toBe(true);
  });

  test('handles empty string gracefully', () => {
    const date = parseDate('');

    expect(isNaN(date.getTime())).toBe(true);
  });
});

describe('serializeDate', () => {
  test('serializes standard date to YYYY-MM-DD format', () => {
    const date = new Date(2026, 2, 15); // March 15, 2026
    const serialized = serializeDate(date);

    expect(serialized).toBe('2026-03-15');
  });

  test('serializes date during DST spring forward (no timezone shift)', () => {
    const date = new Date(2026, 2, 30); // March 30, 2026 (DST boundary)
    const serialized = serializeDate(date);

    expect(serialized).toBe('2026-03-30');
  });

  test('serializes date during DST fall back (no timezone shift)', () => {
    const date = new Date(2026, 9, 25); // October 25, 2026 (DST boundary)
    const serialized = serializeDate(date);

    expect(serialized).toBe('2026-10-25');
  });

  test('output format is always YYYY-MM-DD', () => {
    const date = new Date(2026, 0, 5); // January 5, 2026
    const serialized = serializeDate(date);

    expect(serialized).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('serialization is inverse of parsing (round-trip)', () => {
    const original = '2026-06-15';
    const date = parseDate(original);
    const serialized = serializeDate(date);

    expect(serialized).toBe(original);
  });

  test('handles year boundary dates correctly', () => {
    const startDate = new Date(2026, 0, 1); // Jan 1
    const endDate = new Date(2026, 11, 31); // Dec 31

    expect(serializeDate(startDate)).toBe('2026-01-01');
    expect(serializeDate(endDate)).toBe('2026-12-31');
  });

  test('handles single-digit months and days with zero padding', () => {
    const date = new Date(2026, 0, 5); // January 5
    const serialized = serializeDate(date);

    expect(serialized).toBe('2026-01-05');
  });
});

describe('getCurrentDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns date with time set to 00:00:00', () => {
    // Set system time to mid-day
    jest.setSystemTime(new Date(2026, 2, 15, 14, 30, 45));

    const currentDate = getCurrentDate();

    expect(currentDate.getHours()).toBe(0);
    expect(currentDate.getMinutes()).toBe(0);
    expect(currentDate.getSeconds()).toBe(0);
    expect(currentDate.getMilliseconds()).toBe(0);
  });

  test('consistent across timezone contexts', () => {
    jest.setSystemTime(new Date(2026, 2, 15, 23, 59, 59));

    const currentDate = getCurrentDate();

    // Should be start of March 15, not affected by being near midnight
    expect(currentDate.getFullYear()).toBe(2026);
    expect(currentDate.getMonth()).toBe(2);
    expect(currentDate.getDate()).toBe(15);
    expect(currentDate.getHours()).toBe(0);
  });

  test('handles DST spring forward date', () => {
    // DST transition day: March 30, 2026
    jest.setSystemTime(new Date(2026, 2, 30, 10, 0, 0));

    const currentDate = getCurrentDate();

    expect(currentDate.getFullYear()).toBe(2026);
    expect(currentDate.getMonth()).toBe(2);
    expect(currentDate.getDate()).toBe(30);
    expect(currentDate.getHours()).toBe(0);
  });

  test('handles DST fall back date', () => {
    // DST transition day: October 25, 2026
    jest.setSystemTime(new Date(2026, 9, 25, 10, 0, 0));

    const currentDate = getCurrentDate();

    expect(currentDate.getFullYear()).toBe(2026);
    expect(currentDate.getMonth()).toBe(9);
    expect(currentDate.getDate()).toBe(25);
    expect(currentDate.getHours()).toBe(0);
  });

  test('handles year boundary dates', () => {
    // Test start of year
    jest.setSystemTime(new Date(2026, 0, 1, 6, 0, 0));
    expect(getCurrentDate().getDate()).toBe(1);

    // Test end of year
    jest.setSystemTime(new Date(2026, 11, 31, 18, 0, 0));
    expect(getCurrentDate().getDate()).toBe(31);
  });

  test('multiple calls on same day return same date', () => {
    jest.setSystemTime(new Date(2026, 5, 10, 12, 0, 0));

    const call1 = getCurrentDate();
    const call2 = getCurrentDate();

    expect(call1.getTime()).toBe(call2.getTime());
  });
});
