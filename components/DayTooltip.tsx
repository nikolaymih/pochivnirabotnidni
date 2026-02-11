'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { parseDate } from '@/lib/calendar/dates';
import type { Holiday } from '@/lib/holidays/types';

interface DayTooltipProps {
  // Mode 1: Holiday detail (existing behavior)
  holiday?: Holiday;
  isSubstitute?: boolean;
  // Mode 2: Generic labels (new)
  labels?: string[];
}

export default function DayTooltip({ holiday, isSubstitute = false, labels }: DayTooltipProps) {
  const [isDesktopVisible, setIsDesktopVisible] = useState(false);
  const [isMobileVisible, setIsMobileVisible] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  // Mobile click-away dismiss
  useEffect(() => {
    if (!isMobileVisible) return;

    const handleClickOutside = (e: PointerEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setIsMobileVisible(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isMobileVisible]);

  // Determine content based on mode
  let tooltipContent: React.ReactElement;
  let ariaLabel: string;

  if (holiday) {
    // Mode 1: Holiday detail
    const displayName = isSubstitute
      ? `${holiday.name} (почивен ден)`
      : holiday.name;

    tooltipContent = (
      <div className="absolute left-1/2 -translate-x-1/2 top-5 z-10 w-48 p-3 bg-espresso text-foam text-sm rounded shadow-lg">
        <div className="font-bold mb-1">{displayName}</div>
        <div className="text-xs opacity-80 mb-1">
          {format(parseDate(holiday.date), 'd MMMM yyyy', { locale: bg })}
        </div>
      </div>
    );
    ariaLabel = "Подробности за празника";
  } else if (labels && labels.length > 0) {
    // Mode 2: Generic labels
    tooltipContent = (
      <div className="absolute left-1/2 -translate-x-1/2 top-5 z-10 w-48 p-3 bg-espresso text-foam text-sm rounded shadow-lg">
        {labels.map((label, index) => (
          <div key={index} className="font-medium text-sm">{labels.length > 1 ? `- ${label}` : label}</div>
        ))}
      </div>
    );
    ariaLabel = "Подробности за деня";
  } else {
    // Fallback: no content
    return null;
  }

  return (
    <>
      {/* Desktop: hover icon (hidden on mobile) */}
      <div className="hidden lg:block absolute top-0 right-0">
        <button
          onMouseEnter={() => setIsDesktopVisible(true)}
          onMouseLeave={() => setIsDesktopVisible(false)}
          className="text-xs bg-foam/80 text-espresso rounded-full w-4 h-4 flex items-center justify-center font-bold hover:bg-cream transition-colors"
          aria-label={ariaLabel}
          type="button"
        >
          i
        </button>
        {isDesktopVisible && tooltipContent}
      </div>

      {/* Mobile: click-toggle icon (hidden on desktop) */}
      <div ref={mobileRef} className="lg:hidden absolute top-0 right-0">
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
          aria-label={ariaLabel}
          type="button"
        >
          i
        </button>
        {isMobileVisible && tooltipContent}
      </div>
    </>
  );
}
