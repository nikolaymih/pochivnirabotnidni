'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { VacationData } from '@/lib/vacation/types';
import { VACATION_STORAGE_KEY, DEFAULT_VACATION_DATA } from '@/lib/vacation/storage';
import { fetchVacationData, upsertVacationData } from '@/lib/vacation/sync';
import { migrateLocalStorageToSupabase, MigrationResult } from '@/lib/vacation/migration';
import { calculateRollover, RolloverResult } from '@/lib/vacation/rollover';
import { useDebouncedCallback } from 'use-debounce';
import { getYear } from 'date-fns';
import MigrationReview from '@/components/MigrationReview';

const getMigrationDoneKey = (userId: string) => `pochivni-migration-done-${userId}`;

interface VacationContextType {
  vacationData: VacationData;
  setVacationData: (data: VacationData) => void;
  rollover: RolloverResult | null;
  isAuthenticated: boolean;
}

const VacationContext = createContext<VacationContextType | null>(null);

interface VacationProviderProps {
  children: ReactNode;
  year?: number; // Optional: defaults to current calendar year
}

export function VacationProvider({ children, year }: VacationProviderProps) {
  // === localStorage data (always present, for anonymous AND as fallback) ===
  const [localStorageData, setLocalStorageData] = useLocalStorage<VacationData>(
    VACATION_STORAGE_KEY,
    DEFAULT_VACATION_DATA
  );

  // === Auth state ===
  const { user, isLoading: authLoading } = useAuth();
  const currentYear = getYear(new Date());
  const displayYear = year ?? currentYear; // Use provided year or current
  const isCurrentYear = displayYear === currentYear;

  // === Cloud state (only populated when authenticated) ===
  const [cloudData, setCloudData] = useState<VacationData | null>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(true);

  // === Migration state ===
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [migrationComplete, setMigrationComplete] = useState<boolean>(false);

  // === Rollover state ===
  const [rollover, setRollover] = useState<RolloverResult | null>(null);

  // Track previous user ID so we can clear migration flag on sign-out
  const prevUserIdRef = useRef<string | null>(null);

  // === Derived state ===
  const isAuthenticated = !!user;
  const activeData = isAuthenticated && cloudData ? cloudData : localStorageData;

  // Load cloud data when user signs in, clear when signs out
  useEffect(() => {
    if (!user) {
      // Clear migration-done flag so next sign-in triggers migration comparison
      if (prevUserIdRef.current && typeof window !== 'undefined') {
        window.localStorage.removeItem(getMigrationDoneKey(prevUserIdRef.current));
      }
      prevUserIdRef.current = null;
      setCloudData(null);
      setIsLoadingCloud(false);
      setMigrationComplete(false);
      setRollover(null);
      return;
    }
    prevUserIdRef.current = user.id;
    setIsLoadingCloud(true);
    fetchVacationData(user.id, displayYear)
      .then(data => {
        setCloudData(data);
      })
      .catch(() => {
        setCloudData(null); // Fall back to localStorage
      })
      .finally(() => {
        setIsLoadingCloud(false);
      });
  }, [user, displayYear]);

  // Run migration after cloud data loads (only once per sign-in session)
  useEffect(() => {
    if (!user || isLoadingCloud || migrationComplete || !isCurrentYear) return;
    // Skip migration if already done for this user (persists across session restores)
    if (typeof window !== 'undefined' && window.localStorage.getItem(getMigrationDoneKey(user.id)) === 'true') {
      setMigrationComplete(true);
      return;
    }
    migrateLocalStorageToSupabase(user.id, currentYear)
      .then(result => {
        if (result.status === 'migrated') {
          // Data was auto-migrated, refresh cloud data
          fetchVacationData(user.id, currentYear)
            .then(d => setCloudData(d))
            .catch(err => console.error('Failed to refresh after migration:', err));
        } else if (result.status === 'conflict') {
          // Show conflict review modal
          setMigrationResult(result);
        } else if (result.status === 'error') {
          console.error('Migration error:', result.message);
        }
        // 'no-local-data' and 'no-conflict' need no action
        setMigrationComplete(true);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(getMigrationDoneKey(user.id), 'true');
        }
      })
      .catch(err => {
        console.error('Migration unexpected error:', err);
        setMigrationComplete(true);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(getMigrationDoneKey(user.id), 'true');
        }
      });
  }, [user, isLoadingCloud, migrationComplete, currentYear, isCurrentYear]);

  // Calculate rollover after cloud data loads
  useEffect(() => {
    if (!user || isLoadingCloud) return;
    calculateRollover(user.id, displayYear)
      .then(result => setRollover(result))
      .catch(err => console.error('Rollover check failed:', err));
  }, [user, isLoadingCloud, displayYear]);

  // Debounced sync: saves to Supabase with leading edge (immediate first save)
  // and trailing edge (final state after burst). Fixes quick-refresh data loss.
  const debouncedSave = useDebouncedCallback(
    (data: VacationData) => {
      if (!user || !isCurrentYear) return;
      upsertVacationData(user.id, displayYear, data)
        .catch(err => console.error('Sync to Supabase failed:', err));
    },
    1500,
    { leading: true, trailing: true, maxWait: 3000 }
  );

  // Flush pending save on page unload (covers refresh, tab close, navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBeforeUnload = () => {
      debouncedSave.flush();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [debouncedSave]);

  // Update the correct data source based on auth state
  const setVacationData = useCallback((data: VacationData) => {
    if (isAuthenticated) {
      setCloudData(data);
      debouncedSave(data);
    }
    // Always update localStorage too (fallback and for anonymous users)
    setLocalStorageData(data);
  }, [isAuthenticated, setLocalStorageData, debouncedSave]);

  // Handle user accepting a migration resolution
  const handleMigrationAccept = useCallback((data: VacationData) => {
    setCloudData(data);
    setLocalStorageData(data);
    if (user) {
      upsertVacationData(user.id, currentYear, data)
        .catch(err => console.error('Failed to save migration result:', err));
    }
    setMigrationResult(null);
  }, [user, currentYear, setLocalStorageData]);

  const handleMigrationCancel = useCallback(() => {
    // Keep cloud data as-is, dismiss the modal
    setMigrationResult(null);
  }, []);

  return (
    <>
      {migrationResult?.status === 'conflict' && (
        <MigrationReview
          localData={migrationResult.localData}
          cloudData={migrationResult.cloudData}
          onAccept={handleMigrationAccept}
          onCancel={handleMigrationCancel}
        />
      )}
      <VacationContext.Provider value={{ vacationData: activeData, setVacationData, rollover, isAuthenticated }}>
        {children}
      </VacationContext.Provider>
    </>
  );
}

export function useVacation() {
  const context = useContext(VacationContext);
  if (!context) {
    throw new Error('useVacation must be used within a VacationProvider');
  }
  return context;
}
