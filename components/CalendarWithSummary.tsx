'use client';

import { VacationProvider } from '@/contexts/VacationContext';
import Calendar from './Calendar';
import Legend from './Legend';
import VacationSummary from './VacationSummary';
import type { Holiday } from '@/lib/holidays/types';

interface CalendarWithSummaryProps {
  year: number;
  month: number;
  holidays: Holiday[];
}

export default function CalendarWithSummary({ year, month, holidays }: CalendarWithSummaryProps) {
  return (
    <VacationProvider>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Calendar year={year} month={month} holidays={holidays} />
        </div>
        <div className="lg:col-span-1">
          <Legend />
          <VacationSummary />
        </div>
      </div>
    </VacationProvider>
  );
}
