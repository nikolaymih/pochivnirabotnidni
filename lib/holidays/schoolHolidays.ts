import type { SchoolHoliday } from './types';
import { fetchWithRetry } from '@/lib/offline/retry';
import { eachDayOfInterval, parseISO, format, getISODay } from 'date-fns';

export async function getSchoolHolidays(year: number): Promise<SchoolHoliday[]> {
  // Layer 1: Try OpenHolidays API
  try {
    const apiUrl = `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=BG&validFrom=${year}-01-01&validTo=${year}-12-31`;

    const response = await fetchWithRetry(
      apiUrl,
      { next: { revalidate: 86400 } } // 24hr cache per research
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Use startDate and endDate directly (already in YYYY-MM-DD format)
    // Don't use toISOString() as it converts to UTC and can shift dates due to timezone
    const schoolHolidays: SchoolHoliday[] = data.map((h: any) => ({
      name: h.name?.find((n: any) => n.language === "BG")?.text || h.name?.[0]?.text || h.name,
      startDate: h.startDate, // Already in correct YYYY-MM-DD format from API
      endDate: h.endDate,     // Already in correct YYYY-MM-DD format from API
      type: 'School' as const,
      gradeLevel: h.comment?.find((c: any) => c.language === "BG")?.text
    }));

    // Deduplicate overlapping entries with same name
    const merged = new Map<string, SchoolHoliday>();

    for (const holiday of schoolHolidays) {
      const existing = merged.get(holiday.name);

      if (existing) {
        // Check if dates overlap or are adjacent
        const existingStart = new Date(existing.startDate);
        const existingEnd = new Date(existing.endDate);
        const newStart = new Date(holiday.startDate);
        const newEnd = new Date(holiday.endDate);

        // If overlapping, merge by taking earliest start and latest end
        if (newStart <= existingEnd && newEnd >= existingStart) {
          merged.set(holiday.name, {
            ...existing,
            startDate: newStart < existingStart ? holiday.startDate : existing.startDate,
            endDate: newEnd > existingEnd ? holiday.endDate : existing.endDate,
            gradeLevel: existing.gradeLevel && holiday.gradeLevel
              ? `${existing.gradeLevel}, ${holiday.gradeLevel}`
              : existing.gradeLevel || holiday.gradeLevel
          });
          continue;
        }
      }

      // No existing or no overlap - add as separate entry
      // For same-name non-overlapping periods, append to map with unique key
      const key = existing ? `${holiday.name}_${holiday.startDate}` : holiday.name;
      merged.set(key, holiday);
    }

    const deduplicated = Array.from(merged.values());

    return deduplicated;
  } catch (error) {
    console.warn(`[SchoolHolidays] API failed for ${year}: ${error}`);

    // Layer 2: Static fallback
    try {
      const fallback = await import(`@/data/school-holidays-${year}-fallback.json`);
      return fallback.default;
    } catch (fallbackError) {
      console.error(`[SchoolHolidays] Fallback JSON also failed for ${year}:`, fallbackError);
      return [];
    }
  }
}

/**
 * Generate individual dates from school holiday date ranges for calendar display
 *
 * @param schoolHolidays Array of school holiday periods
 * @returns Set of individual dates in YYYY-MM-DD format for O(1) lookup
 */
export function getSchoolHolidayDates(schoolHolidays: SchoolHoliday[]): Set<string> {
  const dates = new Set<string>();

  // Exclude Лятна ваканция from calendar highlighting only
  const calendarHolidays = schoolHolidays.filter(h => !h.name.includes('Лятна ваканция'));

  for (const holiday of calendarHolidays) {
    // Parse dates using parseISO (Safari-safe per TECH-07)
    const start = parseISO(holiday.startDate);
    const end = parseISO(holiday.endDate);

    // Generate all dates in the range
    const daysInRange = eachDayOfInterval({ start, end });

    // Format each weekday date as YYYY-MM-DD and add to set (skip weekends)
    for (const day of daysInRange) {
      const isoDay = getISODay(day); // 1=Monday, 7=Sunday
      if (isoDay <= 5) { // Only weekdays (Mon-Fri)
        dates.add(format(day, 'yyyy-MM-dd'));
      }
    }
  }

  return dates;
}
