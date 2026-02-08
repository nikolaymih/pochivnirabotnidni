'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { getCalendarGrid } from '@/lib/calendar/grid';
import { getCurrentDate } from '@/lib/calendar/dates';
import type { Holiday } from '@/lib/holidays/types';
import DayTooltip from './DayTooltip';

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
  schoolHolidayDates?: string[]; // Individual dates from school holiday ranges
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
  schoolHolidayDates = [],
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
  const schoolHolidaySet = new Set(schoolHolidayDates || []);

  return (
    <div className="border border-latte rounded-lg p-3 bg-white shadow-sm max-w-[650px] max-h-[400px] overflow-visible">
      {/* Month name header */}
      <h3 className="text-lg font-semibold mb-2 text-center">
        {capitalizedMonth}
      </h3>

      {/* 7-column grid container */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Day headers - single letter abbreviations for compact view */}
        {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((dayAbbr, idx) => (
          <div key={idx} className="text-center font-medium text-coffee pb-1">
            {dayAbbr}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          const date = new Date(year, month, day);
          const dateStr = format(date, 'yyyy-MM-dd');

          // Calculate weekend (Monday-first indexing)
          const dayOfWeek = (firstDayOfWeek + index) % 7;
          const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

          // Check day type
          const isHoliday = holidayDates.has(dateStr);
          const isBridge = bridgeDates.has(dateStr);
          const isVacation = vacationSet.has(dateStr);
          const isSchoolHoliday = schoolHolidaySet.has(dateStr);
          const isToday = format(today, 'yyyy-MM-dd') === dateStr;

          // Weekend holiday transfer: check if this Monday is a substitute for a weekend holiday
          let transferredHoliday: Holiday | null = null;
          const isMonday = dayOfWeek === 0; // 0=Monday in our system

          if (isMonday && !isHoliday) {
            // Check Saturday (2 days back) and Sunday (1 day back)
            const saturdayDate = format(new Date(year, month, day - 2), 'yyyy-MM-dd');
            const sundayDate = format(new Date(year, month, day - 1), 'yyyy-MM-dd');

            const satHoliday = holidays.find(h => h.date === saturdayDate);
            const sunHoliday = holidays.find(h => h.date === sundayDate);
            transferredHoliday = sunHoliday || satHoliday || null;
          }

          const isTransferredHoliday = transferredHoliday !== null;

          // Weekend holidays now show holiday color on the weekend day itself (T10 fix)
          const isWeekendHoliday = isWeekend && holidayDates.has(dateStr);
          const showAsHoliday = isHoliday;
          const showAsTransferred = isTransferredHoliday;
          const displayAsHoliday = showAsHoliday || showAsTransferred;

          // Bridge + school holiday overlap for split-cell rendering (T9 fix)
          const isBridgeSchoolOverlap = isBridge && isSchoolHoliday && !displayAsHoliday && !isVacation;

          // Determine if day is clickable (exclude holidays and transferred holidays)
          const isClickable = !displayAsHoliday;

          // Check if this day is currently highlighted
          const isHighlighted = highlightedDate === dateStr;

          // Styling priority: Holiday > Vacation > School Holiday > Bridge > Weekend > Workday
          const dayClasses = [
            'relative', // For absolute positioning of DayTooltip
            'p-2 text-center rounded text-xs',
            'min-w-[44px] min-h-[44px]', // 44px minimum touch target (WCAG 2.5.5)
            'flex items-center justify-center', // Center content within larger touch target
            'transition-colors duration-150', // Smooth highlight flash
            isToday && 'ring-2 ring-today-ring',
            isHighlighted && 'bg-highlight',
            !isHighlighted && displayAsHoliday && 'bg-cinnamon text-white font-semibold',
            !isHighlighted && !displayAsHoliday && isVacation && 'bg-vacation-bg text-vacation',
            !isHighlighted && !displayAsHoliday && !isVacation && isSchoolHoliday && !isBridgeSchoolOverlap && 'bg-school-bg text-teal',
            !isHighlighted && !displayAsHoliday && !isVacation && !isSchoolHoliday && isBridge && !isBridgeSchoolOverlap && 'bg-bridge-bg text-bridge',
            !isHighlighted && !displayAsHoliday && !isVacation && isBridgeSchoolOverlap && 'text-espresso',
            !isHighlighted && !displayAsHoliday && !isVacation && !isSchoolHoliday && !isBridge && isWeekend && 'bg-weekend-bg text-weekend-text',
            !isHighlighted && !displayAsHoliday && !isVacation && !isSchoolHoliday && !isBridge && !isWeekend && 'hover:bg-cream',
            isClickable && 'cursor-pointer',
            isClickable && 'touch-none' // Prevent scroll/zoom on draggable cells
          ].filter(Boolean).join(' ');

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
              style={{
                ...(index === 0 ? { gridColumnStart: firstDayOfWeek + 1 } : {}),
                ...(isBridgeSchoolOverlap ? {
                  background: 'linear-gradient(135deg, var(--color-bridge-bg) 50%, var(--color-school-bg) 50%)'
                } : {})
              }}
              onPointerDown={handlePointerDownCell}
              onPointerEnter={handlePointerEnterCell}
              onPointerUp={handlePointerUpCell}
            >
              {day}
              {displayAsHoliday && (
                <DayTooltip
                  holiday={transferredHoliday || holidays.find(h => h.date === dateStr)!}
                  isSubstitute={isTransferredHoliday}
                />
              )}
              {isVacation && isSchoolHoliday && !displayAsHoliday && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-teal" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
