import { getYear } from 'date-fns';
import { VacationProvider } from '@/contexts/VacationContext';
import FullYearCalendarWrapper from '@/components/FullYearCalendarWrapper';
import VacationSummary from '@/components/VacationSummary';
import Legend from '@/components/Legend';
import AuthHeader from '@/components/AuthHeader';
import { getHolidays } from '@/lib/holidays/fetch';
import { getSchoolHolidays, getSchoolHolidayDates } from '@/lib/holidays/schoolHolidays';
import LeftSidebar from '@/components/LeftSidebar';
import YearSelector from '@/components/YearSelector';
import { PAGE_TITLE, PAGE_DESCRIPTION } from '@/lib/constants';
import StickyBottomSidebar from '@/components/StickyBottomSidebar';

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentYear = params.year ? parseInt(params.year, 10) : getYear(new Date());

  const [prevYearHolidays, currentYearHolidays, nextYearHolidays, schoolHolidays] = await Promise.all([
    getHolidays(currentYear - 1),
    getHolidays(currentYear),
    getHolidays(currentYear + 1),
    getSchoolHolidays(currentYear),
  ]);

  const holidays = [...prevYearHolidays, ...currentYearHolidays, ...nextYearHolidays];

  const schoolHolidayDatesSet = getSchoolHolidayDates(schoolHolidays);
  const schoolHolidayDates = Array.from(schoolHolidayDatesSet);

  return (
    <main className="min-h-screen">
      <VacationProvider>
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Header: auth button only */}
          <div className="flex justify-end p-4 mb-5">
            <AuthHeader />
          </div>

          {/* Content: constrained to calendar width */}
          <div className="max-w-[650px] mx-auto px-4">
            {/* Right sidebar content first on mobile */}
            <Legend />
            <VacationSummary year={currentYear} />

            {/* Left sidebar content */}
            <div className="mt-4">
              <LeftSidebar holidays={holidays} schoolHolidays={schoolHolidays} year={currentYear} />
            </div>

            {/* Title + Year selector + Calendar */}
            <div className="mt-4">
              <h1 className="text-xl font-bold text-espresso max-w-[650px]">{PAGE_TITLE(currentYear)}</h1>
              <p className="text-coffee text-sm mt-1 mb-5 max-w-[650px]">{PAGE_DESCRIPTION}</p>
              <YearSelector year={currentYear} />
              <FullYearCalendarWrapper
                year={currentYear}
                holidays={holidays}
                schoolHolidayDates={schoolHolidayDates}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout: Three columns */}
        <div className="hidden lg:block">
          {/* Header: auth button right-aligned */}
          <div className="flex justify-end p-4 mb-[50px] max-w-[1400px] mx-auto">
            <AuthHeader />
          </div>

          {/* Three-column layout - centered */}
          <div className="flex gap-6 px-4 mx-auto max-w-[1400px]">
            {/* Left Sidebar */}
            <div className="w-72 flex-shrink-0">
              <StickyBottomSidebar>
                <LeftSidebar holidays={holidays} schoolHolidays={schoolHolidays} year={currentYear} />
              </StickyBottomSidebar>
            </div>

            {/* Center: Title + Year selector + Calendar */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-espresso max-w-[650px]">{PAGE_TITLE(currentYear)}</h1>
              <p className="text-coffee text-sm mt-1 mb-6 max-w-[650px]">{PAGE_DESCRIPTION}</p>
              <YearSelector year={currentYear} />
              <FullYearCalendarWrapper
                year={currentYear}
                holidays={holidays}
                schoolHolidayDates={schoolHolidayDates}
              />
            </div>

            {/* Right Sidebar */}
            <div className="w-72 flex-shrink-0">
              <div className="sticky top-4">
                <Legend />
                <VacationSummary year={currentYear} />
              </div>
            </div>
          </div>
        </div>
      </VacationProvider>
    </main>
  );
}
