import { format, parseISO } from 'date-fns';
import { bg } from 'date-fns/locale';
import type { Holiday } from '@/lib/holidays/types';
import type { SchoolHoliday } from '@/lib/holidays/types';

interface LeftSidebarProps {
  holidays: Holiday[];
  schoolHolidays: SchoolHoliday[];
  year: number;
}

export default function LeftSidebar({ holidays, schoolHolidays, year }: LeftSidebarProps) {
  // Filter holidays for the current year only
  const yearHolidays = holidays
    .filter(h => h.date.startsWith(`${year}-`))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Filter school holidays for the current year
  const yearSchoolHolidays = schoolHolidays
    .filter(sh => sh.startDate.startsWith(`${year}-`) || sh.endDate.startsWith(`${year}-`))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <>
      {/* Card 1: Official Holidays */}
      <div className="p-4 bg-white rounded-lg border border-latte shadow-sm">
        <h3 className="font-semibold text-espresso mb-3">Официални празници</h3>
        <ul className="space-y-2">
          {yearHolidays.map((holiday) => {
            const date = parseISO(holiday.date);
            const formattedDate = format(date, 'd MMMM', { locale: bg });
            const parts = formattedDate.split(' ');
            const capitalizedDate = parts.length >= 2
              ? `${parts[0]} ${parts[1].charAt(0).toUpperCase()}${parts[1].slice(1)}`
              : formattedDate;

            return (
              <li key={`${holiday.date}-${holiday.name}`} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-cinnamon mt-1.5 flex-shrink-0" />
                <span className="text-coffee">
                  <span className="font-medium text-espresso">{capitalizedDate} {year}</span>
                  {' – '}
                  {holiday.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Card 2: School Vacations */}
      {yearSchoolHolidays.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-latte shadow-sm">
          <h3 className="font-semibold text-espresso mb-3">Ученически ваканции</h3>
          <ul className="space-y-2">
            {yearSchoolHolidays.map((schoolHoliday, index) => {
              const startDate = parseISO(schoolHoliday.startDate);
              const endDate = parseISO(schoolHoliday.endDate);

              const startFormatted = format(startDate, 'd MMMM', { locale: bg });
              const endFormatted = format(endDate, 'd MMMM', { locale: bg });

              const capitalizeMonth = (str: string) => {
                const parts = str.split(' ');
                return parts.length >= 2
                  ? `${parts[0]} ${parts[1].charAt(0).toUpperCase()}${parts[1].slice(1)}`
                  : str;
              };

              const displayName = schoolHoliday.gradeLevel
                ? `${schoolHoliday.name} (${schoolHoliday.gradeLevel})`
                : schoolHoliday.name;

              return (
                <li key={`${schoolHoliday.startDate}-${index}`} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-teal mt-1.5 flex-shrink-0" />
                  <span className="text-coffee">
                    <span className="font-medium text-espresso">
                      {capitalizeMonth(startFormatted)} – {capitalizeMonth(endFormatted)}
                    </span>
                    {' – '}
                    {displayName}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
