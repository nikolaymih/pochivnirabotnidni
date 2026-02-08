'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { parseDate } from '@/lib/calendar/dates';
import type { Holiday } from '@/lib/holidays/types';

interface DayTooltipProps {
  holiday: Holiday;
  isSubstitute?: boolean;
}

export default function DayTooltip({ holiday, isSubstitute = false }: DayTooltipProps) {
  const [isDesktopVisible, setIsDesktopVisible] = useState(false);
  const [isMobileVisible, setIsMobileVisible] = useState(false);

  const displayName = isSubstitute
    ? `${holiday.name} (почивен ден)`
    : holiday.name;

  const tooltipContent = (
    <div className="absolute right-0 top-5 z-10 w-48 p-3 bg-espresso text-foam text-sm rounded shadow-lg">
      <div className="font-bold mb-1">{displayName}</div>
      <div className="text-xs opacity-80 mb-1">
        {format(parseDate(holiday.date), 'd MMMM yyyy', { locale: bg })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: hover icon (hidden on mobile) */}
      <div className="hidden lg:block absolute top-0 right-0">
        <button
          onMouseEnter={() => setIsDesktopVisible(true)}
          onMouseLeave={() => setIsDesktopVisible(false)}
          className="text-xs bg-foam/80 text-espresso rounded-full w-4 h-4 flex items-center justify-center font-bold hover:bg-cream transition-colors"
          aria-label="Подробности за празника"
          type="button"
        >
          i
        </button>
        {isDesktopVisible && tooltipContent}
      </div>

      {/* Mobile: click-toggle icon (hidden on desktop) */}
      <div className="lg:hidden absolute top-0 right-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsMobileVisible(!isMobileVisible);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          className="text-[10px] bg-foam/80 text-espresso rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold"
          aria-label="Подробности за празника"
          type="button"
        >
          i
        </button>
        {isMobileVisible && tooltipContent}
      </div>
    </>
  );
}
