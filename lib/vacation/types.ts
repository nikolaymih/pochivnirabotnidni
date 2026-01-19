/**
 * Vacation tracking data structure
 *
 * Stored in browser localStorage for anonymous (pre-auth) tracking.
 * Schema version enables future migrations without data loss.
 */
export interface VacationData {
  /** Schema version for future migrations */
  version: number;

  /** Annual vacation allowance (days per year) */
  totalDays: number;

  /** Array of vacation dates in ISO format (YYYY-MM-DD) */
  vacationDates: string[];
}
