'use client';

import { detectBridgeDays } from '@/lib/calendar/bridgeDays';
import MonthGrid from './MonthGrid';
import type { Holiday } from '@/lib/holidays/types';

interface FullYearCalendarProps {
  year: number;
  holidays: Holiday[]; // Passed from server-side fetch in parent
  vacationDates?: string[]; // Passed from client wrapper component
  schoolHolidayDates?: string[]; // Individual dates from school holiday ranges
  onToggleDate?: (dateStr: string) => void; // Click handler for toggling vacation dates
  onPointerDown?: (dateStr: string) => void; // Pointer down handler for drag selection
  onPointerEnter?: (dateStr: string) => void; // Pointer enter handler for drag selection
  onPointerUp?: () => void; // Pointer up handler to end drag selection
}

export default function FullYearCalendar({
  year,
  holidays,
  vacationDates = [],
  schoolHolidayDates,
  onToggleDate,
  onPointerDown,
  onPointerEnter,
  onPointerUp
}: FullYearCalendarProps) {
  // Calculate bridge days once for all 12 months (performance optimization)
  const bridgeDays = detectBridgeDays(holidays, year);

  return (
    <div className="mx-auto py-6">
      {/* Single-column vertical scroll layout */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 12 }, (_, monthIndex) => {
          // Filter holidays for this month AND year (not just month)
          const monthHolidays = holidays.filter(h => {
            const holidayDate = new Date(h.date);
            return holidayDate.getFullYear() === year && holidayDate.getMonth() === monthIndex;
          });

          // Filter bridge days for this month AND year
          const monthBridges = bridgeDays.filter(b => {
            const bridgeDate = new Date(b.date);
            return bridgeDate.getFullYear() === year && bridgeDate.getMonth() === monthIndex;
          });

          // Filter out bridge days where user already has vacation marked
          // Vacation takes priority (blue) over bridge suggestions (yellow)
          const visibleBridges = monthBridges.filter(bridge =>
            !vacationDates.includes(bridge.date)
          );

          return (
            <MonthGrid
              key={monthIndex}
              year={year}
              month={monthIndex}
              holidays={monthHolidays}
              bridgeDays={visibleBridges}
              vacationDates={vacationDates}
              schoolHolidayDates={schoolHolidayDates}
              onToggleDate={onToggleDate}
              onPointerDown={onPointerDown}
              onPointerEnter={onPointerEnter}
              onPointerUp={onPointerUp}
              compact={true}
            />
          );
        })}
      </div>
    </div>
  );
}
