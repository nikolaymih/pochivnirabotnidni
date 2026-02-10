/**
 * Vacation Rollover Utilities
 *
 * Calculate unused vacation days from previous year for authenticated users.
 * Anonymous users never see rollover functionality.
 */
import { fetchVacationData } from './sync';
import { VacationData, CarryoverBucket } from './types';
import { startOfDay, parseISO, isAfter } from 'date-fns';

export interface RolloverResult {
  buckets: CarryoverBucket[];  // All carryover buckets (newest first)
  totalRollover: number;       // Sum of non-expired buckets only
  // Keep legacy fields for backward compatibility with existing UI
  rolloverDays: number;        // Same as totalRollover
  previousYearTotal: number;   // Most recent bucket's total (for legacy UI)
  previousYearUsed: number;    // Most recent bucket's used (for legacy UI)
}

/**
 * Calculate multi-year carryover with 2-year expiration per Bulgarian labor law
 *
 * Bulgarian Кодекс на труда: Vacation expires 2 years after allocation year.
 * Example: 2024 vacation → usable until 31.12.2026
 *
 * @param userId - Supabase user ID
 * @param currentYear - Year to calculate rollover FOR (e.g., 2026)
 * @returns RolloverResult with buckets and total, or null if no carryover
 */
export async function calculateRollover(userId: string, currentYear: number): Promise<RolloverResult | null> {
  try {
    const buckets: CarryoverBucket[] = [];
    const today = startOfDay(new Date()); // Normalize to avoid timezone issues

    // Bulgarian law: 2-year limitation, so check previous 2 years only
    for (let i = 1; i <= 2; i++) {
      const allocationYear = currentYear - i;

      // Fetch vacation data for that year
      const prevData = await fetchVacationData(userId, allocationYear);
      if (!prevData) continue; // No data for this year, skip

      // Calculate unused days
      const usedDays = prevData.vacationDates.length;
      const rolloverDays = Math.max(0, prevData.totalDays - usedDays);

      if (rolloverDays === 0) continue; // No carryover from this year

      // Calculate expiry: end of (allocation year + 2)
      const expiryYear = allocationYear + 2;
      const expiresAt = `${expiryYear}-12-31`;
      const expiryDate = parseISO(expiresAt);
      const isExpired = isAfter(today, expiryDate);

      buckets.push({
        year: allocationYear,
        rolloverDays,
        expiresAt,
        isExpired
      });
    }

    // No buckets = no carryover at all
    if (buckets.length === 0) return null;

    // Sort newest to oldest (2025 before 2024)
    buckets.sort((a, b) => b.year - a.year);

    // Calculate total: only non-expired buckets count
    const totalRollover = buckets
      .filter(b => !b.isExpired)
      .reduce((sum, b) => sum + b.rolloverDays, 0);

    // Legacy fields for backward compatibility
    const mostRecentBucket = buckets[0];
    const previousYearData = await fetchVacationData(userId, mostRecentBucket.year);

    return {
      buckets,
      totalRollover,
      rolloverDays: totalRollover,
      previousYearTotal: previousYearData?.totalDays || 0,
      previousYearUsed: previousYearData?.vacationDates.length || 0,
    };
  } catch (error) {
    console.error('Rollover calculation failed:', error);
    return null;
  }
}
