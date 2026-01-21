import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { getCalendarGrid } from '@/lib/calendar/grid';
import { getCurrentDate } from '@/lib/calendar/dates';
import type { Holiday } from '@/lib/holidays/types';

// Bridge day type - will be fully implemented in Plan 03-01
interface BridgeDay {
  date: string; // ISO date string (YYYY-MM-DD)
  reason?: string;
}

interface MonthGridProps {
  year: number;
  month: number; // 0-11 (JavaScript month indexing)
  holidays: Holiday[];
  bridgeDays?: BridgeDay[];
  vacationDates?: string[]; // From parent, ultimately from VacationContext via client wrapper
  compact?: boolean; // Default true for 12-month view
}

export default function MonthGrid({
  year,
  month,
  holidays,
  bridgeDays = [],
  vacationDates = [],
  compact = true
}: MonthGridProps) {
  const { firstDayOfWeek, days } = getCalendarGrid(year, month);
  const today = getCurrentDate();

  // Month header - Bulgarian localized and capitalized
  const monthName = format(new Date(year, month, 1), 'MMMM', { locale: bg });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Create lookup sets for O(1) performance
  const holidayDates = new Set(holidays.map(h => h.date));
  const bridgeDates = new Set(bridgeDays.map(b => b.date));
  const vacationSet = new Set(vacationDates);

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
      {/* Month name header */}
      <h3 className="text-lg font-semibold mb-2 text-center">
        {capitalizedMonth}
      </h3>

      {/* 7-column grid container */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Day headers - single letter abbreviations for compact view */}
        {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((dayAbbr, idx) => (
          <div key={idx} className="text-center font-medium text-gray-600 pb-1">
            {dayAbbr}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          const date = new Date(year, month, day);
          const dateStr = format(date, 'yyyy-MM-dd');

          // Check day type
          const isHoliday = holidayDates.has(dateStr);
          const isBridge = bridgeDates.has(dateStr);
          const isVacation = vacationSet.has(dateStr);
          const isToday = format(today, 'yyyy-MM-dd') === dateStr;

          // Calculate weekend (Monday-first indexing)
          const dayOfWeek = (firstDayOfWeek + index) % 7;
          const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

          // Styling priority: Holiday > Bridge > Vacation > Weekend > Workday
          const dayClasses = [
            'p-2 text-center rounded text-xs',
            isToday && 'ring-2 ring-blue-500',
            isHoliday && 'bg-red-100 text-red-900 font-semibold',
            !isHoliday && isBridge && 'bg-yellow-100 text-yellow-900',
            !isHoliday && !isBridge && isVacation && 'bg-blue-100 text-blue-900',
            !isHoliday && !isBridge && !isVacation && isWeekend && 'bg-gray-50 text-gray-500',
            !isHoliday && !isBridge && !isVacation && !isWeekend && 'hover:bg-gray-100 cursor-pointer'
          ].filter(Boolean).join(' ');

          return (
            <div
              key={day}
              className={dayClasses}
              style={index === 0 ? { gridColumnStart: firstDayOfWeek + 1 } : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
