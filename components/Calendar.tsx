'use client';

import { useState } from 'react';
import { format, isSameDay, parseISO, eachDayOfInterval } from 'date-fns';
import { bg } from 'date-fns/locale';
import { getCalendarGrid } from '@/lib/calendar/grid';
import { parseDate, getCurrentDate } from '@/lib/calendar/dates';
import type { Holiday } from '@/lib/holidays/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VACATION_STORAGE_KEY, DEFAULT_VACATION_DATA } from '@/lib/vacation/storage';
import type { VacationData } from '@/lib/vacation/types';
import CalendarDay from './CalendarDay';

interface CalendarProps {
  year: number;
  month: number; // 0-11
  holidays: Holiday[];
}

export default function Calendar({ year, month, holidays }: CalendarProps) {
  const { firstDayOfWeek, days } = getCalendarGrid(year, month);
  const firstDay = new Date(year, month, 1);
  const today = getCurrentDate(); // Safari-safe current date

  // Vacation state with localStorage persistence
  const [vacationData, setVacationData] = useLocalStorage<VacationData>(
    VACATION_STORAGE_KEY,
    DEFAULT_VACATION_DATA
  );

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [currentHover, setCurrentHover] = useState<string | null>(null);

  /**
   * Get all dates in a range (inclusive)
   * Handles bidirectional drags (start > end or end > start)
   */
  const getDateRange = (start: string, end: string): string[] => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const [rangeStart, rangeEnd] = startDate <= endDate
      ? [startDate, endDate]
      : [endDate, startDate];

    return eachDayOfInterval({ start: rangeStart, end: rangeEnd })
      .map(date => format(date, 'yyyy-MM-dd'));
  };

  /**
   * Toggle vacation state for a single date
   * Uses Set for uniqueness (prevents duplicates per VAC-08)
   */
  const toggleVacationDate = (dateStr: string) => {
    const vacationSet = new Set(vacationData.vacationDates);
    if (vacationSet.has(dateStr)) {
      vacationSet.delete(dateStr);
    } else {
      vacationSet.add(dateStr);
    }
    setVacationData({
      ...vacationData,
      vacationDates: Array.from(vacationSet)
    });
  };

  /**
   * Handle pointer down - start drag and toggle clicked date
   */
  const handlePointerDown = (dateStr: string) => {
    setIsDragging(true);
    setDragStart(dateStr);
    setCurrentHover(dateStr);
    toggleVacationDate(dateStr);
  };

  /**
   * Handle pointer move - track current hover position
   */
  const handlePointerMove = (dateStr: string) => {
    if (!isDragging || !dragStart) return;
    setCurrentHover(dateStr);
  };

  /**
   * Handle pointer up - complete drag selection
   */
  const handlePointerUp = () => {
    if (!isDragging || !dragStart || !currentHover) {
      setIsDragging(false);
      setDragStart(null);
      setCurrentHover(null);
      return;
    }

    // Only apply range if dragged across multiple days
    const range = getDateRange(dragStart, currentHover);
    if (range.length > 1) {
      const vacationSet = new Set(vacationData.vacationDates);
      range.forEach(date => vacationSet.add(date));
      setVacationData({
        ...vacationData,
        vacationDates: Array.from(vacationSet)
      });
    }

    setIsDragging(false);
    setDragStart(null);
    setCurrentHover(null);
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">
        {(() => {
          const monthYear = format(firstDay, 'MMMM yyyy', { locale: bg });
          return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        })()}
      </h2>

      {/* Grid: 7 columns for Mon-Sun */}
      <div className="grid grid-cols-7 gap-1" onPointerUp={handlePointerUp}>
        {/* Day headers - Monday first per context decision */}
        {['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'].map(day => (
          <div key={day} className="text-center font-medium text-sm py-2">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          const date = new Date(year, month, day);
          const dateStr = format(date, 'yyyy-MM-dd');
          const holiday = holidays.find(h => isSameDay(parseDate(h.date), date));

          // Calculate if weekend: indices 5,6 in Monday-first week = Sat,Sun
          const dayOfWeek = (firstDayOfWeek + index) % 7;
          const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
          const isToday = isSameDay(date, today);
          const isVacation = vacationData.vacationDates.includes(dateStr);

          return (
            <CalendarDay
              key={day}
              day={day}
              isToday={isToday}
              isWeekend={isWeekend}
              holiday={holiday}
              gridColumnStart={index === 0 ? firstDayOfWeek + 1 : undefined}
              isVacation={isVacation}
              onPointerDown={() => handlePointerDown(dateStr)}
              onPointerMove={() => handlePointerMove(dateStr)}
              onPointerUp={handlePointerUp}
            />
          );
        })}
      </div>
    </div>
  );
}
