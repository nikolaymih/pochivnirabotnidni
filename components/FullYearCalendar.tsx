import { getHolidays } from '@/lib/holidays/fetch';
import { detectBridgeDays } from '@/lib/calendar/bridgeDays';
import MonthGrid from './MonthGrid';

interface FullYearCalendarProps {
  year: number;
  vacationDates?: string[]; // Passed from client wrapper component
}

export default async function FullYearCalendar({ year, vacationDates = [] }: FullYearCalendarProps) {
  // Fetch holidays server-side for entire year
  const holidays = await getHolidays(year);

  // Calculate bridge days once for all 12 months (performance optimization)
  const bridgeDays = detectBridgeDays(holidays, year);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Year header */}
      <h1 className="text-3xl font-bold mb-6">{year}</h1>

      {/* Single-column vertical scroll layout */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 12 }, (_, monthIndex) => {
          // Filter holidays for this month
          const monthHolidays = holidays.filter(h => {
            const holidayDate = new Date(h.date);
            return holidayDate.getMonth() === monthIndex;
          });

          // Filter bridge days for this month
          const monthBridges = bridgeDays.filter(b => {
            const bridgeDate = new Date(b.date);
            return bridgeDate.getMonth() === monthIndex;
          });

          // Filter out bridge days where user already has vacation marked
          // Vacation takes priority (blue) over bridge suggestions (yellow)
          const visibleBridges = monthBridges.filter(bridge =>
            !vacationDates.includes(bridge.date)
          );

          return (
            <MonthGrid
              key={monthIndex}
              year={year}
              month={monthIndex}
              holidays={monthHolidays}
              bridgeDays={visibleBridges}
              vacationDates={vacationDates}
              compact={true}
            />
          );
        })}
      </div>
    </div>
  );
}
