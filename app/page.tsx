import { getYear } from 'date-fns';
import { VacationProvider } from '@/contexts/VacationContext';
import FullYearCalendarWrapper from '@/components/FullYearCalendarWrapper';
import VacationSummary from '@/components/VacationSummary';
import Legend from '@/components/Legend';
import AuthHeader from '@/components/AuthHeader';
import { getHolidays } from '@/lib/holidays/fetch';
import { getSchoolHolidays, getSchoolHolidayDates } from '@/lib/holidays/schoolHolidays';
import { PAGE_TITLE, PAGE_SUBTITLE, PAGE_DESCRIPTION } from '@/lib/constants';
import LeftSidebar from '@/components/LeftSidebar';
import YearSelector from '@/components/YearSelector';

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentYear = params.year ? parseInt(params.year, 10) : getYear(new Date());

  // Fetch holidays for current year and adjacent years to handle year-spanning weeks
  const [prevYearHolidays, currentYearHolidays, nextYearHolidays, schoolHolidays] = await Promise.all([
    getHolidays(currentYear - 1),
    getHolidays(currentYear),
    getHolidays(currentYear + 1),
    getSchoolHolidays(currentYear),
  ]);

  // Merge all holidays into a single array
  const holidays = [...prevYearHolidays, ...currentYearHolidays, ...nextYearHolidays];

  // Generate individual school holiday dates for calendar display
  const schoolHolidayDatesSet = getSchoolHolidayDates(schoolHolidays);
  const schoolHolidayDates = Array.from(schoolHolidayDatesSet);

  return (
    <main className="min-h-screen">
      <VacationProvider>
        {/* Mobile: Stack vertically (summary at top, not sticky) */}
        <div className="lg:hidden">
          <div className="p-4">
            {/* Header with title and auth */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-espresso">{PAGE_TITLE(currentYear)}</h1>
              <AuthHeader />
            </div>
            <p className="text-coffee mb-6">
              {PAGE_DESCRIPTION}
            </p>
            <Legend />
            <VacationSummary />

            {/* Left sidebar content */}
            <div className="mt-4">
              <LeftSidebar holidays={holidays} schoolHolidays={schoolHolidays} year={currentYear} />
            </div>
          </div>

          {/* Year selector + Calendar */}
          <div className="p-4">
            <YearSelector year={currentYear} />
            <FullYearCalendarWrapper
              year={currentYear}
              holidays={holidays}
              schoolHolidayDates={schoolHolidayDates}
            />
          </div>
        </div>

        {/* Desktop: Scrollable calendar with sticky sidebar */}
        <div className="hidden lg:flex gap-6">
          {/* Left: Scrollable full year calendar */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Header with title and auth */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-espresso mb-2">{PAGE_TITLE(currentYear)}</h1>
                <p className="text-coffee">
                  {PAGE_DESCRIPTION}
                </p>
              </div>
              <AuthHeader />
            </div>
            <YearSelector year={currentYear} />
            <FullYearCalendarWrapper
              year={currentYear}
              holidays={holidays}
              schoolHolidayDates={schoolHolidayDates}
            />
          </div>

          {/* Right: Sticky sidebar */}
          <div className="w-80 sticky top-0 h-screen overflow-y-auto p-4">
            <LeftSidebar holidays={holidays} schoolHolidays={schoolHolidays} year={currentYear} />
            <Legend />
            <VacationSummary />
          </div>
        </div>
      </VacationProvider>
    </main>
  );
}
