'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VacationData } from '@/lib/vacation/types';
import { VACATION_STORAGE_KEY, DEFAULT_VACATION_DATA } from '@/lib/vacation/storage';

interface VacationContextType {
  vacationData: VacationData;
  setVacationData: (data: VacationData) => void;
}

const VacationContext = createContext<VacationContextType | null>(null);

export function VacationProvider({ children }: { children: ReactNode }) {
  const [vacationData, setVacationData] = useLocalStorage<VacationData>(
    VACATION_STORAGE_KEY,
    DEFAULT_VACATION_DATA
  );

  return (
    <VacationContext.Provider value={{ vacationData, setVacationData }}>
      {children}
    </VacationContext.Provider>
  );
}

export function useVacation() {
  const context = useContext(VacationContext);
  if (!context) {
    throw new Error('useVacation must be used within a VacationProvider');
  }
  return context;
}
