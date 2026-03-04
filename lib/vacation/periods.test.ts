import { describe, test, expect } from '@jest/globals';
import { groupVacationPeriods } from './periods';

describe('groupVacationPeriods', () => {
  test('empty input returns empty array', () => {
    expect(groupVacationPeriods([], [], 2026)).toEqual([]);
  });

  test('single vacation day forms a 1-day period', () => {
    const result = groupVacationPeriods(['2026-03-02'], [], 2026);
    expect(result).toEqual([
      {
        startDate: '2026-03-02',
        endDate: '2026-03-02',
        days: ['2026-03-02'],
        dayCount: 1,
      },
    ]);
  });

  test('Mon-Fri consecutive days form 1 period', () => {
    // 2026-03-02 is Monday, 2026-03-06 is Friday
    const dates = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06'];
    const result = groupVacationPeriods(dates, [], 2026);
    expect(result).toHaveLength(1);
    expect(result[0].dayCount).toBe(5);
    expect(result[0].startDate).toBe('2026-03-02');
    expect(result[0].endDate).toBe('2026-03-06');
  });

  test('Fri + Mon bridges over weekend (1 period)', () => {
    // 2026-03-06 is Friday, 2026-03-09 is Monday
    const result = groupVacationPeriods(['2026-03-06', '2026-03-09'], [], 2026);
    expect(result).toHaveLength(1);
    expect(result[0].dayCount).toBe(2);
    expect(result[0].days).toEqual(['2026-03-06', '2026-03-09']);
  });

  test('Mon + Wed with Tue as working day -> 2 separate periods', () => {
    // 2026-03-02 is Monday, 2026-03-04 is Wednesday
    // Tuesday 2026-03-03 is a working day (no holiday)
    const result = groupVacationPeriods(['2026-03-02', '2026-03-04'], [], 2026);
    expect(result).toHaveLength(2);
    // Reverse chronological: Wed first, Mon second
    expect(result[0].startDate).toBe('2026-03-04');
    expect(result[1].startDate).toBe('2026-03-02');
  });

  test('Mon + Wed with Tue as holiday -> 1 period (holiday bridges)', () => {
    // 2026-03-02 Mon, 2026-03-03 Tue (holiday), 2026-03-04 Wed
    const result = groupVacationPeriods(
      ['2026-03-02', '2026-03-04'],
      ['2026-03-03'],
      2026
    );
    expect(result).toHaveLength(1);
    expect(result[0].dayCount).toBe(2);
    expect(result[0].days).toEqual(['2026-03-02', '2026-03-04']);
  });

  test('Mon-Tue + Thu-Fri with Wed as holiday -> 1 period', () => {
    // Wed 2026-03-04 is a holiday bridging the gap
    const result = groupVacationPeriods(
      ['2026-03-02', '2026-03-03', '2026-03-05', '2026-03-06'],
      ['2026-03-04'],
      2026
    );
    expect(result).toHaveLength(1);
    expect(result[0].dayCount).toBe(4);
  });

  test('Mon-Tue + Thu-Fri with Wed as working day -> 2 periods', () => {
    const result = groupVacationPeriods(
      ['2026-03-02', '2026-03-03', '2026-03-05', '2026-03-06'],
      [],
      2026
    );
    expect(result).toHaveLength(2);
    // Reverse chronological: Thu-Fri first, Mon-Tue second
    expect(result[0].startDate).toBe('2026-03-05');
    expect(result[0].endDate).toBe('2026-03-06');
    expect(result[1].startDate).toBe('2026-03-02');
    expect(result[1].endDate).toBe('2026-03-03');
  });

  test('cross-week: Fri + next Mon -> 1 period (weekend bridges)', () => {
    // 2026-03-13 Fri, 2026-03-16 Mon
    const result = groupVacationPeriods(['2026-03-13', '2026-03-16'], [], 2026);
    expect(result).toHaveLength(1);
    expect(result[0].dayCount).toBe(2);
  });

  test('cross-week: Thu + next Tue with Fri/Mon as working days -> 2 periods', () => {
    // 2026-03-12 Thu, 2026-03-17 Tue
    // Fri 2026-03-13 is a working day, Mon 2026-03-16 is a working day
    const result = groupVacationPeriods(['2026-03-12', '2026-03-17'], [], 2026);
    expect(result).toHaveLength(2);
  });

  test('filters to requested year only', () => {
    // 2026-01-02 is Friday, 2026-01-05 is Monday (weekend bridges them)
    // 2026-01-07 is Wednesday (working day gap from Monday)
    const dates = ['2025-12-30', '2025-12-31', '2026-01-02', '2026-01-05', '2026-01-07'];
    const result = groupVacationPeriods(dates, [], 2026);
    // Only 2026 dates should be included; Jan 2+5 bridge over weekend = 1 period, Jan 7 = separate
    expect(result).toHaveLength(2);
    const allDays = result.flatMap((p) => p.days);
    expect(allDays.every((d) => d.startsWith('2026'))).toBe(true);
  });

  test('returns periods in reverse chronological order', () => {
    // January period and March period
    const dates = ['2026-01-05', '2026-03-02'];
    const result = groupVacationPeriods(dates, [], 2026);
    expect(result).toHaveLength(2);
    // March (most recent) first, January second
    expect(result[0].startDate).toBe('2026-03-02');
    expect(result[1].startDate).toBe('2026-01-05');
  });

  test('1-day period has dayCount 1', () => {
    const result = groupVacationPeriods(['2026-06-15'], [], 2026);
    expect(result[0].dayCount).toBe(1);
  });

  test('unsorted input dates are handled correctly', () => {
    // Pass dates in random order
    const dates = ['2026-03-06', '2026-03-02', '2026-03-04', '2026-03-03', '2026-03-05'];
    const result = groupVacationPeriods(dates, [], 2026);
    expect(result).toHaveLength(1);
    expect(result[0].dayCount).toBe(5);
    expect(result[0].days).toEqual([
      '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06',
    ]);
  });
});
