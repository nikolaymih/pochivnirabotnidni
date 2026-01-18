import { startOfMonth, getDay, getDaysInMonth } from 'date-fns';

export interface CalendarGrid {
  firstDayOfWeek: number; // 0-6, Monday=0, Sunday=6
  daysInMonth: number;
  days: number[];
}

/**
 * Calculate calendar grid for a given month.
 * Uses Monday-first week (ISO 8601, Bulgarian standard).
 *
 * @param year - Full year (e.g., 2026)
 * @param month - Month index 0-11 (0=January)
 * @returns Grid data for rendering
 */
export function getCalendarGrid(year: number, month: number): CalendarGrid {
  const firstDay = startOfMonth(new Date(year, month, 1));
  const daysInMonth = getDaysInMonth(firstDay);

  // getDay() returns 0=Sunday, 6=Saturday
  // Convert to Monday-first: 0=Monday, 6=Sunday
  let firstDayOfWeek = getDay(firstDay);
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return {
    firstDayOfWeek,
    daysInMonth,
    days
  };
}
