import type { Holiday } from './types';
import { fetchWithRetry } from '@/lib/offline/retry';

export async function getHolidays(year: number): Promise<Holiday[]> {
  // Layer 1: Try OpenHolidays API
  try {
    const apiUrl = `https://openholidaysapi.org/PublicHolidays?countryIsoCode=BG&validFrom=${year}-01-01&validTo=${year}-12-31`;
    console.log(`[Holidays] Fetching from API for ${year}:`, apiUrl);

    const response = await fetchWithRetry(
      apiUrl,
      { next: { revalidate: 86400 } } // 24hr cache per research
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    console.log(`[Holidays] Raw API response for ${year}:`, JSON.stringify(data, null, 2));

    // Use startDate directly (already in YYYY-MM-DD format)
    // Don't use toISOString() as it converts to UTC and can shift dates due to timezone
    const holidays: Holiday[] = data.map((h: any) => ({
      name: h.name?.[0]?.text || h.name,
      date: h.startDate, // Already in correct YYYY-MM-DD format from API
      type: h.type || 'Public Holiday'
    }));

    console.log(`[Holidays] ✓ Processed ${holidays.length} holidays from API for ${year}`);
    console.log('[Holidays] Processed holidays:');
    holidays.forEach(h => {
      console.log(`  - ${h.date}: ${h.name} (${h.type})`);
    });

    // Check specifically for Dec 31
    const dec31 = holidays.find(h => h.date === `${year}-12-31`);
    if (dec31) {
      console.log(`[Holidays] ⚠️  December 31, ${year} IS a holiday: ${dec31.name}`);
    } else {
      console.log(`[Holidays] ✓ December 31, ${year} is NOT a holiday (normal workday)`);
    }

    return holidays;
  } catch (error) {
    console.warn(`[Holidays] ✗ API failed for ${year}: ${error}`);
    console.warn(`[Holidays] → Using fallback JSON for ${year}`);

    // Layer 2: Static fallback
    try {
      const fallback = await import(`@/data/holidays-${year}-fallback.json`);
      console.log(`[Holidays] ✓ Loaded ${fallback.default.length} holidays from fallback JSON for ${year}`);
      return fallback.default;
    } catch (fallbackError) {
      console.error(`[Holidays] ✗ Fallback JSON also failed for ${year}:`, fallbackError);
      return [];
    }
  }
}
