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
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="p-4">
            {/* Header: title + auth */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-espresso">{PAGE_TITLE(currentYear)}</h1>
              <AuthHeader />
            </div>
            <p className="text-coffee text-sm mb-4">{PAGE_SUBTITLE}</p>

            {/* Right sidebar content first on mobile */}
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

        {/* Desktop Layout: Three columns */}
        <div className="hidden lg:block">
          {/* Header: title + auth */}
          <div className="flex justify-between items-center p-4 pb-2">
            <div>
              <h1 className="text-3xl font-bold text-espresso">{PAGE_TITLE(currentYear)}</h1>
              <p className="text-coffee text-sm mt-1">{PAGE_SUBTITLE}</p>
            </div>
            <AuthHeader />
          </div>

          {/* Three-column layout */}
          <div className="flex gap-4 px-4">
            {/* Left Sidebar - sticky, aligned with first month */}
            <div className="w-72 flex-shrink-0">
              <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <LeftSidebar holidays={holidays} schoolHolidays={schoolHolidays} year={currentYear} />
              </div>
            </div>

            {/* Center: Year selector + Calendar */}
            <div className="flex-1 min-w-0">
              <YearSelector year={currentYear} />
              <FullYearCalendarWrapper
                year={currentYear}
                holidays={holidays}
                schoolHolidayDates={schoolHolidayDates}
              />
            </div>

            {/* Right Sidebar - sticky, aligned with first month */}
            <div className="w-72 flex-shrink-0">
              <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <Legend />
                <VacationSummary />
              </div>
            </div>
          </div>
        </div>
      </VacationProvider>
    </main>
  );
}
