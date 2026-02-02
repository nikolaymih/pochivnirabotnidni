/**
 * Supabase Sync Utilities
 *
 * Read and write vacation data to Supabase for authenticated users.
 * Silent failure mode: errors return null/false and log to console.
 */
import { createClient } from '@/lib/supabase/client';
import { VacationData } from '@/lib/vacation/types';

/**
 * Fetch vacation data from Supabase for a specific user and year
 *
 * @param userId - Supabase user ID
 * @param year - Calendar year (e.g., 2026)
 * @returns VacationData if found, null if not found or on error
 */
export async function fetchVacationData(userId: string, year: number): Promise<VacationData | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('vacation_data')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .single();

    if (error) {
      // PGRST116 = no rows returned, which is expected for new users
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Failed to fetch vacation data:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Map database row to VacationData interface
    return {
      version: 1,
      totalDays: data.total_days,
      vacationDates: data.vacation_dates, // PostgreSQL TEXT[] maps directly to string[]
    };
  } catch (error) {
    console.error('Unexpected error fetching vacation data:', error);
    return null;
  }
}

/**
 * Upsert vacation data to Supabase (insert or update)
 *
 * @param userId - Supabase user ID
 * @param year - Calendar year (e.g., 2026)
 * @param data - Vacation data to save
 * @returns true on success, false on error
 */
export async function upsertVacationData(userId: string, year: number, data: VacationData): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('vacation_data')
      .upsert(
        {
          user_id: userId,
          year: year,
          total_days: data.totalDays,
          vacation_dates: data.vacationDates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,year' }
      );

    if (error) {
      console.error('Failed to upsert vacation data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error upserting vacation data:', error);
    return false;
  }
}
