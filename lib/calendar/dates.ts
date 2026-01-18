import { parseISO, format, startOfDay } from 'date-fns';

/**
 * Parse ISO date string safely for Safari compatibility.
 * NEVER use new Date(string) - Safari parses differently than Chrome.
 */
export function parseDate(isoString: string): Date {
  return parseISO(isoString);
}

/**
 * Serialize date to ISO string for storage (YYYY-MM-DD).
 * Per TECH-07: store dates as ISO strings, not timestamps.
 */
export function serializeDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get current date safely for cross-browser compatibility.
 * Uses startOfDay to normalize timezone handling per research findings.
 *
 * CRITICAL: new Date() is timezone-sensitive and causes Safari bugs.
 * startOfDay ensures consistent "today" across browsers.
 */
export function getCurrentDate(): Date {
  return startOfDay(new Date());
}
