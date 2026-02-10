'use client';

import { useState, useEffect } from 'react';
import { getYear } from 'date-fns';
import { useVacation } from '@/contexts/VacationContext';
import FullYearCalendar from './FullYearCalendar';
import type { Holiday } from '@/lib/holidays/types';

/**
 * Client wrapper component that bridges VacationContext (client state) to FullYearCalendar.
 * This is the standard Next.js App Router pattern for Server/Client boundaries.
 *
 * The wrapper:
 * - Accepts holidays fetched server-side from parent
 * - Reads vacation state from VacationContext (client-side React context)
 * - Passes both to FullYearCalendar for rendering
 * - Manages drag selection state for touch-optimized vacation date selection
 */
interface FullYearCalendarWrapperProps {
  year: number;
  holidays: Holiday[];
  schoolHolidayDates?: string[];
}

export default function FullYearCalendarWrapper({ year, holidays, schoolHolidayDates }: FullYearCalendarWrapperProps) {
  const { vacationData, setVacationData, rollover } = useVacation();

  // Calculate effective total (base + rollover) for max validation
  const rolloverDays = rollover?.rolloverDays || 0;
  const effectiveTotal = vacationData.totalDays + rolloverDays;

  const isCurrentYear = year === getYear(new Date());

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');
  const [dragStartDate, setDragStartDate] = useState<string | null>(null);

  // Document-level pointerup listener to catch pointer-up outside calendar
  useEffect(() => {
    const handleDocumentPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStartDate(null);
      }
    };

    document.addEventListener('pointerup', handleDocumentPointerUp);

    return () => {
      document.removeEventListener('pointerup', handleDocumentPointerUp);
    };
  }, [isDragging]);

  // Toggle vacation date - add if not present, remove if present
  const toggleVacationDate = (dateStr: string) => {
    const currentDates = vacationData.vacationDates;
    const isSelected = currentDates.includes(dateStr);

    // Don't add if already at max vacation days
    if (!isSelected && currentDates.length >= effectiveTotal) return;

    setVacationData({
      ...vacationData,
      vacationDates: isSelected
        ? currentDates.filter(d => d !== dateStr)
        : [...currentDates, dateStr]
    });
  };

  // Handle pointer down - start drag, determine mode, toggle immediately
  const handlePointerDown = (dateStr: string) => {
    const currentDates = vacationData.vacationDates;
    const isCurrentlySelected = currentDates.includes(dateStr);

    // Determine drag mode based on first cell's state
    const mode = isCurrentlySelected ? 'remove' : 'add';
    setDragMode(mode);
    setIsDragging(true);
    setDragStartDate(dateStr);

    // Toggle immediately for instant feedback
    toggleVacationDate(dateStr);
  };

  // Handle pointer enter during drag - apply drag mode
  const handlePointerEnter = (dateStr: string) => {
    if (!isDragging) return;

    const currentDates = vacationData.vacationDates;
    const vacationSet = new Set(currentDates);

    // Apply drag mode: add if mode=add and not present, remove if mode=remove and present
    if (dragMode === 'add' && !vacationSet.has(dateStr) && currentDates.length < effectiveTotal) {
      setVacationData({
        ...vacationData,
        vacationDates: [...currentDates, dateStr]
      });
    } else if (dragMode === 'remove' && vacationSet.has(dateStr)) {
      setVacationData({
        ...vacationData,
        vacationDates: currentDates.filter(d => d !== dateStr)
      });
    }
  };

  // Handle pointer up - end drag
  const handlePointerUp = () => {
    setIsDragging(false);
    setDragStartDate(null);
  };

  return (
    <FullYearCalendar
      year={year}
      holidays={holidays}
      vacationDates={vacationData.vacationDates}
      schoolHolidayDates={schoolHolidayDates}
      onToggleDate={isCurrentYear ? toggleVacationDate : undefined}
      onPointerDown={isCurrentYear ? handlePointerDown : undefined}
      onPointerEnter={isCurrentYear ? handlePointerEnter : undefined}
      onPointerUp={isCurrentYear ? handlePointerUp : undefined}
    />
  );
}
