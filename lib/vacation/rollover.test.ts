import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { calculateRollover } from './rollover';
import type { VacationData } from './types';

// Mock the sync module which contains fetchVacationData
jest.mock('./sync', () => ({
  fetchVacationData: jest.fn(),
}));

import { fetchVacationData } from './sync';

const mockFetchVacationData = fetchVacationData as jest.MockedFunction<typeof fetchVacationData>;

describe('calculateRollover', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Use fake timers to control "today" for expiry checks
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns null when no previous year data exists', async () => {
    // Viewing 2026, no data for 2025 or 2024
    mockFetchVacationData.mockResolvedValue(null);

    const result = await calculateRollover(testUserId, 2026);

    expect(result).toBeNull();
    expect(mockFetchVacationData).toHaveBeenCalledTimes(2);
    expect(mockFetchVacationData).toHaveBeenCalledWith(testUserId, 2025);
    expect(mockFetchVacationData).toHaveBeenCalledWith(testUserId, 2024);
  });

  test('returns null when previous year has zero unused days', async () => {
    // 2025 had 20 days, all used
    mockFetchVacationData.mockResolvedValue({
      year: 2025,
      totalDays: 20,
      vacationDates: Array.from({ length: 20 }, (_, i) => `2025-03-${String(i + 1).padStart(2, '0')}`),
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).toBeNull();
  });

  test('calculates unused days correctly (totalDays - vacationDates.length)', async () => {
    jest.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-03-15', '2025-03-16', '2025-03-17'], // 3 used
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(1);
    expect(result!.buckets[0].rolloverDays).toBe(17); // 20 - 3 = 17
    expect(result!.buckets[0].year).toBe(2025);
    expect(result!.totalRollover).toBe(17);
  });

  test('fetches up to 2 previous years (2024 and 2025 when viewing 2026)', async () => {
    jest.setSystemTime(new Date(2026, 5, 15));

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-03-15'], // 1 used, 19 unused
        };
      }
      if (year === 2024) {
        return {
          year: 2024,
          totalDays: 20,
          vacationDates: ['2024-04-10', '2024-04-11'], // 2 used, 18 unused
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(2);
    expect(mockFetchVacationData).toHaveBeenCalledWith(testUserId, 2025);
    expect(mockFetchVacationData).toHaveBeenCalledWith(testUserId, 2024);

    // Buckets should be sorted newest first
    expect(result!.buckets[0].year).toBe(2025);
    expect(result!.buckets[1].year).toBe(2024);
  });

  test('handles missing data for one of the two previous years', async () => {
    jest.setSystemTime(new Date(2026, 5, 15));

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-06-10'], // 1 used, 19 unused
        };
      }
      // 2024 has no data
      return null;
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(1);
    expect(result!.buckets[0].year).toBe(2025);
    expect(result!.totalRollover).toBe(19);
  });

  test('bucket from 2024 is NOT expired when viewing 2026', async () => {
    // 2024 vacation expires 2026-12-31, we're checking June 2026 (before expiry)
    jest.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2024) {
        return {
          year: 2024,
          totalDays: 20,
          vacationDates: ['2024-07-10'], // 1 used, 19 unused
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(1);
    expect(result!.buckets[0].year).toBe(2024);
    expect(result!.buckets[0].expiresAt).toBe('2026-12-31');
    expect(result!.buckets[0].isExpired).toBe(false);
    expect(result!.totalRollover).toBe(19);
  });

  test('bucket from 2024 IS expired when viewing 2027', async () => {
    // When viewing 2027, we fetch 2026 and 2025 (2 years back)
    // 2025 vacation expires 2027-12-31 (not expired on Jan 2027)
    // 2026 vacation expires 2028-12-31 (not expired)
    jest.setSystemTime(new Date(2027, 0, 15)); // January 15, 2027

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2026) {
        return {
          year: 2026,
          totalDays: 20,
          vacationDates: ['2026-06-10'], // 1 used, 19 unused, expires 2028-12-31
        };
      }
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-07-15', '2025-07-16'], // 2 used, 18 unused, expires 2027-12-31
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2027);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(2);

    // 2026 bucket not expired (expires 2028-12-31)
    expect(result!.buckets[0].year).toBe(2026);
    expect(result!.buckets[0].isExpired).toBe(false);

    // 2025 bucket not expired on Jan 15, 2027 (expires 2027-12-31)
    expect(result!.buckets[1].year).toBe(2025);
    expect(result!.buckets[1].expiresAt).toBe('2027-12-31');
    expect(result!.buckets[1].isExpired).toBe(false);

    // Total rollover includes both buckets
    expect(result!.totalRollover).toBe(37); // 19 + 18
  });

  test('bucket expires after 2 years (2025 bucket expires end of 2027)', async () => {
    // 2025 vacation expires 2027-12-31
    // Check on Jan 1, 2028 (after expiry)
    jest.setSystemTime(new Date(2028, 0, 1)); // January 1, 2028

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2027) {
        return {
          year: 2027,
          totalDays: 20,
          vacationDates: ['2027-08-01'], // 1 used, 19 unused
        };
      }
      if (year === 2026) {
        return {
          year: 2026,
          totalDays: 20,
          vacationDates: ['2026-08-01', '2026-08-02'], // 2 used, 18 unused
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2028);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(2);

    // 2027 bucket not expired (expires 2029-12-31)
    expect(result!.buckets[0].year).toBe(2027);
    expect(result!.buckets[0].isExpired).toBe(false);

    // 2026 bucket not expired (expires 2028-12-31, we're on Jan 1, 2028, before Dec 31)
    expect(result!.buckets[1].year).toBe(2026);
    expect(result!.buckets[1].expiresAt).toBe('2028-12-31');
    expect(result!.buckets[1].isExpired).toBe(false);

    // Total includes both
    expect(result!.totalRollover).toBe(37); // 19 + 18
  });

  test('bucket IS expired after expiry date passes', async () => {
    // 2024 bucket expires 2026-12-31
    // Check on Jan 2, 2027 (after expiry)
    jest.setSystemTime(new Date(2027, 0, 2)); // January 2, 2027

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2026) {
        return {
          year: 2026,
          totalDays: 20,
          vacationDates: ['2026-05-10'], // 1 used, 19 unused
        };
      }
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-06-15', '2025-06-16'], // 2 used, 18 unused
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2027);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(2);

    // 2026 bucket not expired (expires 2028-12-31)
    expect(result!.buckets[0].year).toBe(2026);
    expect(result!.buckets[0].isExpired).toBe(false);

    // 2025 bucket not expired (expires 2027-12-31, we're on Jan 2, 2027)
    expect(result!.buckets[1].year).toBe(2025);
    expect(result!.buckets[1].expiresAt).toBe('2027-12-31');
    expect(result!.buckets[1].isExpired).toBe(false);

    // Both included in total
    expect(result!.totalRollover).toBe(37); // 19 + 18
  });

  test('totalRollover sums only non-expired buckets', async () => {
    jest.setSystemTime(new Date(2027, 5, 15)); // June 15, 2027

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2026) {
        return {
          year: 2026,
          totalDays: 20,
          vacationDates: ['2026-03-10'], // 1 used, 19 unused, expires 2028-12-31 (NOT expired)
        };
      }
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-04-05', '2025-04-06'], // 2 used, 18 unused, expires 2027-12-31 (NOT expired yet on June 15)
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2027);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(2);

    // Both buckets not expired
    expect(result!.buckets[0].isExpired).toBe(false);
    expect(result!.buckets[1].isExpired).toBe(false);

    // Total includes both
    expect(result!.totalRollover).toBe(37); // 19 + 18 = 37
  });

  test('totalRollover excludes expired buckets from total', async () => {
    // Set time to Jan 1, 2028 - 2025 bucket expires Dec 31, 2027 (so expired)
    jest.setSystemTime(new Date(2028, 0, 1)); // January 1, 2028

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2027) {
        return {
          year: 2027,
          totalDays: 20,
          vacationDates: ['2027-05-10'], // 1 used, 19 unused, expires 2029-12-31 (NOT expired)
        };
      }
      if (year === 2026) {
        return {
          year: 2026,
          totalDays: 20,
          vacationDates: ['2026-06-15', '2026-06-16'], // 2 used, 18 unused, expires 2028-12-31 (NOT expired yet, expires end of 2028)
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2028);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(2);

    // 2027 bucket not expired
    expect(result!.buckets[0].isExpired).toBe(false);
    // 2026 bucket not expired (we're on Jan 1, 2028, expires Dec 31, 2028)
    expect(result!.buckets[1].isExpired).toBe(false);

    // Both included
    expect(result!.totalRollover).toBe(37); // 19 + 18
  });

  test('multiple buckets: some expired, some active', async () => {
    // Set to Jan 1, 2029 - 2026 expires Dec 31, 2028 (expired), 2027 expires Dec 31, 2029 (active)
    jest.setSystemTime(new Date(2029, 0, 1)); // January 1, 2029

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2028) {
        return {
          year: 2028,
          totalDays: 20,
          vacationDates: [], // 0 used, 20 unused, expires 2030-12-31 (active)
        };
      }
      if (year === 2027) {
        return {
          year: 2027,
          totalDays: 15,
          vacationDates: [], // 0 used, 15 unused, expires 2029-12-31 (active)
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2029);

    expect(result).not.toBeNull();
    expect(result!.buckets).toHaveLength(2);

    // Both buckets active
    expect(result!.buckets.filter(b => !b.isExpired)).toHaveLength(2);
    expect(result!.buckets[0].isExpired).toBe(false);
    expect(result!.buckets[1].isExpired).toBe(false);

    expect(result!.totalRollover).toBe(35); // 20 + 15
  });

  test('sequential year fetch handles errors gracefully', async () => {
    jest.setSystemTime(new Date(2026, 5, 15));

    // First call succeeds, second throws error
    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-07-01'],
        };
      }
      throw new Error('Database error');
    });

    const result = await calculateRollover(testUserId, 2026);

    // Should return null on error (caught and logged)
    expect(result).toBeNull();
  });

  test('empty vacation dates array (all days unused)', async () => {
    jest.setSystemTime(new Date(2026, 5, 15));

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: [], // No vacation taken
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).not.toBeNull();
    expect(result!.buckets[0].rolloverDays).toBe(20); // All 20 days unused
    expect(result!.totalRollover).toBe(20);
  });

  test('partial year data (user started mid-year)', async () => {
    jest.setSystemTime(new Date(2026, 5, 15));

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 10, // Started July, got 10 days
          vacationDates: ['2025-08-15'], // 1 used, 9 unused
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).not.toBeNull();
    expect(result!.buckets[0].rolloverDays).toBe(9);
    expect(result!.totalRollover).toBe(9);
  });

  test('legacy fields maintained for backward compatibility', async () => {
    jest.setSystemTime(new Date(2026, 5, 15));

    mockFetchVacationData.mockImplementation(async (userId, year) => {
      if (year === 2025) {
        return {
          year: 2025,
          totalDays: 20,
          vacationDates: ['2025-05-10', '2025-05-11'], // 2 used, 18 unused
        };
      }
      return null;
    });

    const result = await calculateRollover(testUserId, 2026);

    expect(result).not.toBeNull();

    // Legacy fields
    expect(result!.rolloverDays).toBe(18); // Same as totalRollover
    expect(result!.previousYearTotal).toBe(20);
    expect(result!.previousYearUsed).toBe(2);
  });
});
