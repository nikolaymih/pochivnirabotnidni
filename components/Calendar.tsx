import { format, isSameDay } from 'date-fns';
import { bg } from 'date-fns/locale';
import { getCalendarGrid } from '@/lib/calendar/grid';
import { parseDate, getCurrentDate } from '@/lib/calendar/dates';
import type { Holiday } from '@/lib/holidays/types';
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

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">
        {(() => {
          const monthYear = format(firstDay, 'MMMM yyyy', { locale: bg });
          return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        })()}
      </h2>

      {/* Grid: 7 columns for Mon-Sun */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers - Monday first per context decision */}
        {['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'].map(day => (
          <div key={day} className="text-center font-medium text-sm py-2">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          const date = new Date(year, month, day);
          const holiday = holidays.find(h => isSameDay(parseDate(h.date), date));

          // Calculate if weekend: indices 5,6 in Monday-first week = Sat,Sun
          const dayOfWeek = (firstDayOfWeek + index) % 7;
          const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
          const isToday = isSameDay(date, today);

          return (
            <CalendarDay
              key={day}
              day={day}
              isToday={isToday}
              isWeekend={isWeekend}
              holiday={holiday}
              gridColumnStart={index === 0 ? firstDayOfWeek + 1 : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
