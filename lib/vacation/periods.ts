import { parseISO, addDays, format, getISODay } from 'date-fns';
import { VacationPeriod } from './types';

/**
 * Check if every day between dateA (exclusive) and dateB (exclusive) is
 * a non-working day: weekend (Sat=6, Sun=7), holiday, or vacation day.
 *
 * If dateA and dateB are consecutive calendar days, returns true (no gap).
 */
function isContiguous(
  dateA: string,
  dateB: string,
  holidaySet: Set<string>,
  vacationSet: Set<string>
): boolean {
  let current = addDays(parseISO(dateA), 1);
  const end = parseISO(dateB);

  while (format(current, 'yyyy-MM-dd') !== format(end, 'yyyy-MM-dd')) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const dayOfWeek = getISODay(current); // 1=Mon ... 6=Sat, 7=Sun

    const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;
    const isHoliday = holidaySet.has(dateStr);
    const isVacation = vacationSet.has(dateStr);

    if (!isWeekend && !isHoliday && !isVacation) {
      // Working day gap found
      return false;
    }

    current = addDays(current, 1);
  }

  return true;
}

/**
 * Groups vacation dates into periods, bridging weekends and holidays.
 *
 * Rules:
 * - Filters vacationDates to the requested year
 * - Two vacation days are in the same period if every day between them is
 *   a weekend day, a holiday, or another vacation day
 * - A working day gap breaks periods into separate groups
 * - Returns periods in reverse chronological order (most recent first)
 *
 * @param vacationDates - Array of vacation dates in YYYY-MM-DD format
 * @param holidayDates - Array of holiday dates in YYYY-MM-DD format
 * @param year - Year to filter dates for (e.g., 2026)
 * @returns Periods in reverse chronological order (most recent first)
 */
export function groupVacationPeriods(
  vacationDates: string[],
  holidayDates: string[],
  year: number
): VacationPeriod[] {
  // Filter to requested year and sort chronologically
  const yearPrefix = `${year}-`;
  const filtered = vacationDates
    .filter((d) => d.startsWith(yearPrefix))
    .sort();

  if (filtered.length === 0) {
    return [];
  }

  const holidaySet = new Set(holidayDates);
  const vacationSet = new Set(filtered);

  // Group into periods
  const periods: VacationPeriod[] = [];
  let currentGroup: string[] = [filtered[0]];

  for (let i = 1; i < filtered.length; i++) {
    const prevDate = filtered[i - 1];
    const currDate = filtered[i];

    if (isContiguous(prevDate, currDate, holidaySet, vacationSet)) {
      currentGroup.push(currDate);
    } else {
      // Working day gap -- close current period, start new one
      periods.push({
        startDate: currentGroup[0],
        endDate: currentGroup[currentGroup.length - 1],
        days: [...currentGroup],
        dayCount: currentGroup.length,
      });
      currentGroup = [currDate];
    }
  }

  // Close final period
  periods.push({
    startDate: currentGroup[0],
    endDate: currentGroup[currentGroup.length - 1],
    days: [...currentGroup],
    dayCount: currentGroup.length,
  });

  // Reverse for most-recent-first order
  return periods.reverse();
}
