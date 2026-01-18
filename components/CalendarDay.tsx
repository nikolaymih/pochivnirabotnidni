import type { Holiday } from '@/lib/holidays/types';
import DayTooltip from './DayTooltip';

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  holiday?: Holiday;
  gridColumnStart?: number;
}

export default function CalendarDay({
  day,
  isToday,
  isWeekend,
  holiday,
  gridColumnStart
}: CalendarDayProps) {
  return (
    <div
      style={gridColumnStart ? { gridColumnStart } : undefined}
      className={`
        relative p-3 text-center border rounded min-h-[3rem]
        ${holiday ? 'bg-red-500 text-white' : ''}
        ${isWeekend && !holiday ? 'bg-gray-100' : ''}
        ${isToday ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <span className="font-medium">{day}</span>
      {holiday && <DayTooltip holiday={holiday} />}
    </div>
  );
}
