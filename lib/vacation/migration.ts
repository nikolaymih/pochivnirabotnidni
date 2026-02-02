/**
 * localStorage to Supabase Migration
 *
 * Handles one-time migration of vacation data from localStorage to Supabase
 * when a user signs in for the first time. Detects conflicts between local
 * and cloud data and provides merge options.
 */
import { VacationData } from '@/lib/vacation/types';
import { fetchVacationData, upsertVacationData } from './sync';
import { VACATION_STORAGE_KEY, DEFAULT_VACATION_DATA } from './storage';

export type MigrationResult =
  | { status: 'no-local-data' }
  | { status: 'migrated' }
  | { status: 'no-conflict' }
  | { status: 'conflict'; localData: VacationData; cloudData: VacationData; mergedDates: string[] }
  | { status: 'error'; message: string };

/**
 * Migrate localStorage vacation data to Supabase
 *
 * Compares localStorage and Supabase data. If they differ, returns conflict
 * result for user to review. If no conflict, auto-migrates to Supabase.
 *
 * @param userId - Supabase user ID
 * @param year - Calendar year (e.g., 2026)
 * @returns Migration result indicating next steps
 */
export async function migrateLocalStorageToSupabase(userId: string, year: number): Promise<MigrationResult> {
  try {
    // Read localStorage data
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(VACATION_STORAGE_KEY) : null;
    if (!raw) {
      return { status: 'no-local-data' };
    }

    const localData: VacationData = JSON.parse(raw);
    if (localData.vacationDates.length === 0) {
      return { status: 'no-local-data' };
    }

    // Fetch cloud data
    const cloudData = await fetchVacationData(userId, year);

    // No cloud data - auto-migrate localStorage to Supabase
    if (!cloudData) {
      await upsertVacationData(userId, year, localData);
      return { status: 'migrated' };
    }

    // Compare vacation dates using Set
    const localDatesSet = new Set(localData.vacationDates);
    const cloudDatesSet = new Set(cloudData.vacationDates);

    const datesEqual =
      localDatesSet.size === cloudDatesSet.size &&
      [...localDatesSet].every((date) => cloudDatesSet.has(date));

    const totalDaysEqual = localData.totalDays === cloudData.totalDays;

    // No conflict - data is identical
    if (datesEqual && totalDaysEqual) {
      return { status: 'no-conflict' };
    }

    // Conflict detected - compute merged dates
    const mergedDates = [...new Set([...localData.vacationDates, ...cloudData.vacationDates])].sort();

    return {
      status: 'conflict',
      localData,
      cloudData,
      mergedDates,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown migration error';
    return { status: 'error', message };
  }
}
