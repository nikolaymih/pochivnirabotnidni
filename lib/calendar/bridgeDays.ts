import { parseISO, getISODay, addDays, subDays, format } from 'date-fns';
import type { Holiday } from '@/lib/holidays/types';

export interface BridgeDay {
  date: string; // ISO format yyyy-MM-dd
  reason: 'holiday-after' | 'holiday-before' | 'cluster-connector';
  relatedHoliday: string; // Holiday name or cluster description
  daysOff: number; // Total consecutive days (3, 4, 5, or more)
}

/**
 * Detect bridge days based on Bulgarian holiday patterns.
 *
 * Bridge day rules:
 * - Tuesday holiday → Monday before is 4-day weekend bridge (Sat-Sun-Mon-Tue)
 * - Thursday holiday → Friday after is 4-day weekend bridge (Thu-Fri-Sat-Sun)
 * - Monday holiday → Friday before is 3-day weekend bridge (Fri-Sat-Sun-Mon)
 * - Friday holiday → Monday after is 3-day weekend bridge (Fri-Sat-Sun-Mon)
 * - Wednesday holidays alone don't create bridges but may be part of clusters
 * - Holiday clusters (within 3 days) suggest connecting workdays
 *
 * @param holidays - Array of Holiday objects
 * @param year - Target year for bridge detection
 * @returns Array of BridgeDay objects with suggested vacation days
 */
export function detectBridgeDays(holidays: Holiday[], year: number): BridgeDay[] {
  const bridges: BridgeDay[] = [];
  const bridgeDatesSet = new Set<string>(); // Prevent duplicates

  // Filter holidays to target year only
  const yearHolidays = holidays.filter(holiday => {
    const holidayDate = parseISO(holiday.date);
    return holidayDate.getFullYear() === year;
  });

  // Create a Set of holiday dates for quick lookup
  const holidayDatesSet = new Set(yearHolidays.map(h => h.date));

  // Helper to check if a date is already a holiday
  const isHoliday = (dateStr: string): boolean => holidayDatesSet.has(dateStr);

  // Helper to add a bridge day
  const addBridge = (
    date: Date,
    reason: BridgeDay['reason'],
    relatedHoliday: string,
    daysOff: number
  ) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Don't suggest bridge if date is already a holiday
    if (isHoliday(dateStr)) {
      return;
    }

    // Prevent duplicates
    if (bridgeDatesSet.has(dateStr)) {
      return;
    }

    bridges.push({
      date: dateStr,
      reason,
      relatedHoliday,
      daysOff,
    });
    bridgeDatesSet.add(dateStr);
  };

  // Process each holiday
  for (const holiday of yearHolidays) {
    const holidayDate = parseISO(holiday.date);
    const dayOfWeek = getISODay(holidayDate); // 1=Monday, 7=Sunday

    switch (dayOfWeek) {
      case 1: // Monday
        // Friday before creates 4-day weekend (Fri-Sat-Sun-Mon)
        const fridayBefore = subDays(holidayDate, 3);
        addBridge(fridayBefore, 'holiday-after', holiday.name, 4);
        break;

      case 2: // Tuesday
        // Monday before creates 4-day weekend (Sat-Sun-Mon-Tue)
        const mondayBefore = subDays(holidayDate, 1);
        addBridge(mondayBefore, 'holiday-after', holiday.name, 4);
        break;

      case 4: // Thursday
        // Friday after creates 4-day weekend (Thu-Fri-Sat-Sun)
        const fridayAfter = addDays(holidayDate, 1);
        addBridge(fridayAfter, 'holiday-before', holiday.name, 4);
        break;

      case 5: // Friday
        // Monday after creates 4-day weekend (Fri-Sat-Sun-Mon)
        const mondayAfter = addDays(holidayDate, 3);
        addBridge(mondayAfter, 'holiday-before', holiday.name, 4);
        break;

      // case 3: Wednesday - no simple bridge
      // case 6: Saturday - already weekend
      // case 7: Sunday - already weekend
      default:
        // No bridge for Wednesday or weekend holidays
        break;
    }
  }

  // Detect holiday clusters (holidays within 3 days of each other)
  for (let i = 0; i < yearHolidays.length - 1; i++) {
    const holiday1 = parseISO(yearHolidays[i].date);

    for (let j = i + 1; j < yearHolidays.length; j++) {
      const holiday2 = parseISO(yearHolidays[j].date);
      const daysDiff = Math.abs(
        Math.floor((holiday2.getTime() - holiday1.getTime()) / (1000 * 60 * 60 * 24))
      );

      // If holidays are 2-3 days apart, suggest connecting workdays
      if (daysDiff >= 2 && daysDiff <= 3) {
        const startDate = holiday1 < holiday2 ? holiday1 : holiday2;
        const endDate = holiday1 < holiday2 ? holiday2 : holiday1;

        // Suggest all workdays between the holidays
        let currentDate = addDays(startDate, 1);
        while (currentDate < endDate) {
          const currentDayOfWeek = getISODay(currentDate);

          // Only suggest if it's a workday (Monday-Friday)
          if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
            const totalDaysOff = daysDiff + 2; // holidays + connector days + weekends
            addBridge(
              currentDate,
              'cluster-connector',
              `${yearHolidays[i].name} and ${yearHolidays[j].name}`,
              totalDaysOff
            );
          }

          currentDate = addDays(currentDate, 1);
        }
      }
    }
  }

  return bridges;
}

/**
 * Check if a specific date is a bridge day.
 *
 * @param dateStr - ISO date string (yyyy-MM-dd)
 * @param bridgeDays - Array of detected bridge days
 * @returns true if date is a bridge day, false otherwise
 */
export function isBridgeDay(dateStr: string, bridgeDays: BridgeDay[]): boolean {
  return bridgeDays.some(b => b.date === dateStr);
}
