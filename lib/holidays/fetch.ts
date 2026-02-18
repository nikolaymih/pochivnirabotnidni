import type { Holiday } from './types';
import { fetchWithRetry } from '@/lib/offline/retry';

export async function getHolidays(year: number): Promise<Holiday[]> {
  // Layer 1: Try OpenHolidays API
  try {
    const apiUrl = `https://openholidaysapi.org/PublicHolidays?countryIsoCode=BG&validFrom=${year}-01-01&validTo=${year}-12-31`;

    const response = await fetchWithRetry(
      apiUrl,
      { next: { revalidate: 86400 } } // 24hr cache per research
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Use startDate directly (already in YYYY-MM-DD format)
    // Don't use toISOString() as it converts to UTC and can shift dates due to timezone
    const holidays: Holiday[] = data.map((h: any) => ({
      name: h.name?.[0]?.text || h.name,
      date: h.startDate, // Already in correct YYYY-MM-DD format from API
      type: h.type || 'Public Holiday'
    }));

    return holidays;
  } catch (error) {
    console.warn(`[Holidays] API failed for ${year}: ${error}`);

    // Layer 2: Static fallback
    try {
      const fallback = await import(`@/data/holidays-${year}-fallback.json`);
      return fallback.default;
    } catch (fallbackError) {
      console.error(`[Holidays] Fallback JSON also failed for ${year}:`, fallbackError);
      return [];
    }
  }
}
