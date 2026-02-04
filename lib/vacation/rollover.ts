/**
 * Vacation Rollover Utilities
 *
 * Calculate unused vacation days from previous year for authenticated users.
 * Anonymous users never see rollover functionality.
 */
import { fetchVacationData } from './sync';
import { VacationData } from './types';

export interface RolloverResult {
  rolloverDays: number;       // Unused days from previous year
  previousYearTotal: number;  // Previous year's total allowance
  previousYearUsed: number;   // Previous year's used days
}

/**
 * Calculate rollover from previous year for an authenticated user
 *
 * @param userId - Supabase user ID
 * @param currentYear - Current calendar year (e.g., 2026)
 * @returns RolloverResult if rollover exists, null if no previous data or zero rollover
 */
export async function calculateRollover(userId: string, currentYear: number): Promise<RolloverResult | null> {
  try {
    // Fetch previous year's data from Supabase
    const prevData = await fetchVacationData(userId, currentYear - 1);

    // No previous year data = no rollover available
    if (!prevData) {
      return null;
    }

    // Calculate usage
    const previousYearUsed = prevData.vacationDates.length;
    const rolloverDays = Math.max(0, prevData.totalDays - previousYearUsed);

    // If no unused days, return null (nothing to roll over)
    if (rolloverDays === 0) {
      return null;
    }

    return {
      rolloverDays,
      previousYearTotal: prevData.totalDays,
      previousYearUsed,
    };
  } catch (error) {
    console.error('Rollover calculation failed:', error);
    return null;
  }
}
