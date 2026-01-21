import { startOfMonth, getDay, getDaysInMonth, format } from 'date-fns';
import { bg } from 'date-fns/locale';

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

/**
 * Format month and year for display in Bulgarian
 * @param year - Full year (e.g. 2026)
 * @param month - Month index 0-11
 * @returns Formatted string like "Януари 2026"
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  const monthName = format(date, 'MMMM', { locale: bg });
  // Capitalize first letter (Bulgarian localization)
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalizedMonth} ${year}`;
}
