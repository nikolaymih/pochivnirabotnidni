'use client';

import { useVacation } from '@/contexts/VacationContext';
import FullYearCalendar from './FullYearCalendar';

/**
 * Client wrapper component that bridges VacationContext (client state) to FullYearCalendar (Server Component).
 * This is the standard Next.js App Router pattern for Server/Client boundaries.
 *
 * The wrapper:
 * - Reads vacation state from VacationContext (client-side React context)
 * - Converts state to props (vacationDates string[])
 * - Passes props to FullYearCalendar Server Component
 */
export default function FullYearCalendarWrapper({ year }: { year: number }) {
  const { vacationData } = useVacation();
  return <FullYearCalendar year={year} vacationDates={vacationData.vacationDates} />;
}
