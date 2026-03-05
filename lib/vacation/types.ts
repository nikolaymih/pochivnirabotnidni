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

/**
 * Carryover bucket representing unused vacation days from a specific year
 *
 * Bulgarian Кодекс на труда: Vacation expires 2 years after allocation year.
 * Example: 2024 vacation → usable until 31.12.2026
 */
export interface CarryoverBucket {
  /** Allocation year (e.g., 2024) */
  year: number;

  /** Unused days from that year */
  rolloverDays: number;

  /** Expiry date in YYYY-MM-DD format (always Dec 31 of allocation year + 2) */
  expiresAt: string;

  /** Computed: today > expiresAt */
  isExpired: boolean;
}

/**
 * A vacation period groups consecutive vacation days into a single block.
 *
 * Non-working days (weekends, holidays) between vacation days do NOT split periods.
 * Only working day gaps break periods into separate groups.
 */
export interface VacationPeriod {
  /** First vacation day in the period (YYYY-MM-DD) */
  startDate: string;

  /** Last vacation day in the period (YYYY-MM-DD) */
  endDate: string;

  /** All vacation days in the period, sorted chronologically (YYYY-MM-DD[]) */
  days: string[];

  /** Number of vacation days in the period */
  dayCount: number;
}
