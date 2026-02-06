import { parseISO, getISODay, addDays, subDays, format } from 'date-fns';
import type { Holiday } from '@/lib/holidays/types';

export interface BridgeDay {
  date: string; // ISO format yyyy-MM-dd
  reason: 'holiday-after' | 'holiday-before' | 'cluster-connector' | 'full-week';
  relatedHoliday: string; // Holiday name or cluster description
  daysOff: number; // Total consecutive days (3, 4, 5, or more)
}

/**
 * Detect bridge days using full-week algorithm.
 *
 * Full-week bridge day rules:
 * - For each weekday holiday (Mon-Fri), suggest ALL other workdays in that work week
 * - Skip weekend holidays (Sat/Sun) - no suggestions for those
 * - Multiple holidays in same week are handled without duplicates
 * - Each suggestion uses reason: 'full-week' and daysOff: 5
 *
 * @param holidays - Array of Holiday objects
 * @param year - Target year for bridge detection
 * @returns Array of BridgeDay objects with suggested vacation days
 */
export function detectBridgeDays(holidays: Holiday[], year: number): BridgeDay[] {
  const suggestions: BridgeDay[] = [];
  const suggestionsSet = new Set<string>(); // Prevent duplicates

  // Consider holidays from adjacent years to handle year-spanning weeks
  // A work week can span from late December (year-1) to early January (year)
  // or from late December (year) to early January (year+1)
  const relevantHolidays = holidays.filter(holiday => {
    const holidayDate = parseISO(holiday.date);
    const holidayYear = holidayDate.getFullYear();
    return holidayYear >= year - 1 && holidayYear <= year + 1;
  });

  // Create a Set of holiday dates for O(1) lookup
  const holidayDatesSet = new Set(relevantHolidays.map(h => h.date));

  // Process each holiday
  for (const holiday of relevantHolidays) {
    const holidayDate = parseISO(holiday.date);
    const dayOfWeek = getISODay(holidayDate); // 1=Monday, 7=Sunday

    // Skip weekend holidays (Saturday=6, Sunday=7)
    if (dayOfWeek === 6 || dayOfWeek === 7) {
      continue;
    }

    // Find Monday of this work week
    // dayOfWeek: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
    // Offset to Monday: 0 for Mon, 1 for Tue, 2 for Wed, 3 for Thu, 4 for Fri
    const daysFromMonday = dayOfWeek - 1;
    const monday = subDays(holidayDate, daysFromMonday);

    // Generate all 5 workdays (Mon-Fri) in this week
    for (let i = 0; i < 5; i++) {
      const workday = addDays(monday, i);
      const workdayStr = format(workday, 'yyyy-MM-dd');

      // Skip if it's the holiday itself
      if (workdayStr === holiday.date) {
        continue;
      }

      // Skip if already a holiday (don't suggest official holidays)
      if (holidayDatesSet.has(workdayStr)) {
        continue;
      }

      // Skip if already in suggestions (prevent duplicates)
      if (suggestionsSet.has(workdayStr)) {
        continue;
      }

      // Add to suggestions
      suggestions.push({
        date: workdayStr,
        reason: 'full-week',
        relatedHoliday: holiday.name,
        daysOff: 5,
      });
      suggestionsSet.add(workdayStr);
    }
  }

  // Filter suggestions to only include dates in the target year
  return suggestions.filter(suggestion => {
    const suggestionDate = parseISO(suggestion.date);
    return suggestionDate.getFullYear() === year;
  });
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
