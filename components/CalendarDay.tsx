import type { Holiday } from '@/lib/holidays/types';
import DayTooltip from './DayTooltip';

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  holiday?: Holiday;
  gridColumnStart?: number;
  isVacation?: boolean;
  onPointerDown?: () => void;
  onPointerMove?: () => void;
  onPointerUp?: () => void;
}

export default function CalendarDay({
  day,
  isToday,
  isWeekend,
  holiday,
  gridColumnStart,
  isVacation,
  onPointerDown,
  onPointerMove,
  onPointerUp
}: CalendarDayProps) {
  return (
    <div
      style={gridColumnStart ? { gridColumnStart } : undefined}
      className={`
        relative p-3 text-center border rounded min-h-[3rem]
        cursor-pointer select-none
        ${isVacation && !holiday ? 'bg-vacation-bg' : ''}
        ${holiday ? 'bg-cinnamon text-white' : ''}
        ${isWeekend && !holiday ? 'bg-cream' : ''}
        ${isToday ? 'ring-2 ring-today-ring' : ''}
      `}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <span className="font-medium">{day}</span>
      {holiday && <DayTooltip holiday={holiday} />}
    </div>
  );
}
