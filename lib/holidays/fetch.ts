import { parseISO } from 'date-fns';
import type { Holiday } from './types';

export async function getHolidays(year: number): Promise<Holiday[]> {
  // Layer 1: Try OpenHolidays API
  try {
    const response = await fetch(
      `https://openholidaysapi.org/PublicHolidays?countryIsoCode=BG&validFrom=${year}-01-01&validTo=${year}-12-31`,
      { next: { revalidate: 86400 } } // 24hr cache per research
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Parse dates safely for Safari using parseISO
    const holidays: Holiday[] = data.map((h: any) => ({
      name: h.name?.[0]?.text || h.name,
      date: parseISO(h.startDate).toISOString().split('T')[0], // Parse THEN serialize to YYYY-MM-DD
      type: h.type || 'Public Holiday'
    }));

    return holidays;
  } catch (error) {
    console.warn(`Failed to fetch holidays from API: ${error}`);

    // Layer 2: Static fallback
    const fallback = await import(`@/data/holidays-${year}-fallback.json`);
    return fallback.default;
  }
}
