'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { parseDate } from '@/lib/calendar/dates';
import type { Holiday } from '@/lib/holidays/types';

interface DayTooltipProps {
  holiday: Holiday;
}

export default function DayTooltip({ holiday }: DayTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="absolute top-1 right-1">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="text-xs bg-foam text-espresso rounded-full w-5 h-5 flex items-center justify-center font-bold hover:bg-cream transition-colors"
        aria-label="Подробности за празника"
        type="button"
      >
        i
      </button>

      {isVisible && (
        <div className="absolute right-0 top-7 z-10 w-48 p-3 bg-espresso text-foam text-sm rounded shadow-lg">
          <div className="font-bold mb-1">{holiday.name}</div>
          <div className="text-xs opacity-80 mb-1">
            {format(parseDate(holiday.date), 'MMM d, yyyy', { locale: bg })}
          </div>
          <div className="text-xs opacity-80">{holiday.type}</div>
        </div>
      )}
    </div>
  );
}
