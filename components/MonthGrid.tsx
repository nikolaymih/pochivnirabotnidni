'use client';

import { useState, useRef, useEffect } from 'react';
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
  onToggleDate?: (dateStr: string) => void; // Click handler for toggling vacation dates
  onPointerDown?: (dateStr: string) => void; // Pointer down handler for drag selection
  onPointerEnter?: (dateStr: string) => void; // Pointer enter handler for drag selection
  onPointerUp?: () => void; // Pointer up handler to end drag selection
  compact?: boolean; // Default true for 12-month view
}

export default function MonthGrid({
  year,
  month,
  holidays,
  bridgeDays = [],
  vacationDates = [],
  onToggleDate,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
  compact = true
}: MonthGridProps) {
  const { firstDayOfWeek, days } = getCalendarGrid(year, month);
  const today = getCurrentDate();

  // Highlight flash state for visual feedback on tap
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup highlight timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  // Month header - Bulgarian localized and capitalized
  const monthName = format(new Date(year, month, 1), 'MMMM', { locale: bg });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Create lookup sets for O(1) performance
  const holidayDates = new Set(holidays.map(h => h.date));
  const bridgeDates = new Set(bridgeDays.map(b => b.date));
  const vacationSet = new Set(vacationDates);

  // Debug December specifically
  if (month === 11) {
    console.log(`[MonthGrid December ${year}] Received ${holidays.length} holidays:`, holidays);
    console.log(`[MonthGrid December ${year}] Holiday dates set:`, Array.from(holidayDates));
  }

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

          // Determine if day is clickable (workdays, weekends, bridge days - but not holidays)
          const isClickable = !isHoliday;

          // Check if this day is currently highlighted
          const isHighlighted = highlightedDate === dateStr;

          // Styling priority: Holiday > Bridge > Vacation > Weekend > Workday
          const dayClasses = [
            'p-2 text-center rounded text-xs',
            'min-w-[44px] min-h-[44px]', // 44px minimum touch target (WCAG 2.5.5)
            'flex items-center justify-center', // Center content within larger touch target
            'transition-colors duration-150', // Smooth highlight flash
            isToday && 'ring-2 ring-blue-500',
            isHighlighted && 'bg-gray-200', // Highlight flash on tap
            !isHighlighted && isHoliday && 'bg-red-100 text-red-900 font-semibold',
            !isHighlighted && !isHoliday && isBridge && 'bg-yellow-100 text-yellow-900',
            !isHighlighted && !isHoliday && !isBridge && isVacation && 'bg-blue-100 text-blue-900',
            !isHighlighted && !isHoliday && !isBridge && !isVacation && isWeekend && 'bg-gray-50 text-gray-500',
            !isHighlighted && !isHoliday && !isBridge && !isVacation && !isWeekend && 'hover:bg-gray-100',
            isClickable && 'cursor-pointer',
            isClickable && 'touch-none' // Prevent scroll/zoom on draggable cells
          ].filter(Boolean).join(' ');

          const handleClick = () => {
            if (isClickable && onToggleDate) {
              onToggleDate(dateStr);
            }
          };

          const handlePointerDownCell = () => {
            if (!isClickable) return;

            // Set highlight flash
            if (highlightTimerRef.current) {
              clearTimeout(highlightTimerRef.current);
            }
            setHighlightedDate(dateStr);
            highlightTimerRef.current = setTimeout(() => {
              setHighlightedDate(null);
            }, 150);

            // Call parent handler for drag selection
            if (onPointerDown) {
              onPointerDown(dateStr);
            }
          };

          const handlePointerEnterCell = () => {
            if (isClickable && onPointerEnter) {
              onPointerEnter(dateStr);
            }
          };

          const handlePointerUpCell = () => {
            if (onPointerUp) {
              onPointerUp();
            }
          };

          return (
            <div
              key={day}
              className={dayClasses}
              style={index === 0 ? { gridColumnStart: firstDayOfWeek + 1 } : undefined}
              onClick={handleClick}
              onPointerDown={handlePointerDownCell}
              onPointerEnter={handlePointerEnterCell}
              onPointerUp={handlePointerUpCell}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
