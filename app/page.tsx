import type { Metadata } from 'next';
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
import { PAGE_TITLE, META_TITLE, META_DESCRIPTION, PAGE_DESCRIPTION, PAGE_DESCRIPTION_EXTENDED, PAGE_DESCRIPTION_HISTORY } from '@/lib/constants';
import StickyBottomSidebar from '@/components/StickyBottomSidebar';

const BASE_URL = 'https://kolkoshtepochivam.com';

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year, 10) : getYear(new Date());
  const defaultYear = getYear(new Date());
  const isDefaultYear = year === defaultYear;

  const title = META_TITLE(year);
  const description = META_DESCRIPTION(year);
  const canonicalUrl = isDefaultYear ? BASE_URL : `${BASE_URL}/?year=${year}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
  };
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
      <VacationProvider year={currentYear}>
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Header: logo left, auth button right */}
          <div className="flex justify-between items-center p-4 mb-5">
            <img src="/klogo.png" alt="Почивни Работни Дни" className="h-10 w-auto" />
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
              <p className="text-espresso text-sm mt-1 max-w-[650px]">{PAGE_DESCRIPTION}</p>
              <p className="text-espresso text-sm mt-2 max-w-[650px]">{PAGE_DESCRIPTION_EXTENDED}</p>
              <p className="text-espresso text-sm mt-2 mb-5 max-w-[650px]">{PAGE_DESCRIPTION_HISTORY}</p>
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
          {/* Header: logo left, auth button right */}
          <div className="flex justify-between items-center p-4 mb-[35px] max-w-[1400px] mx-auto">
            <img src="/klogo.png" alt="Почивни Работни Дни" className="h-12 w-auto" />
            <AuthHeader />
          </div>

          {/* Three-column layout - centered */}
          <div className="flex gap-[70px] px-4 mx-auto max-w-[1400px] justify-center">
            {/* Left Sidebar */}
            <div className="w-72 flex-shrink-0">
              <StickyBottomSidebar>
                <LeftSidebar holidays={holidays} schoolHolidays={schoolHolidays} year={currentYear} />
              </StickyBottomSidebar>
            </div>

            {/* Center: Title + Year selector + Calendar */}
            <div className="w-[650px] min-w-0">
              <h1 className="text-2xl font-bold text-espresso max-w-[650px]">{PAGE_TITLE(currentYear)}</h1>
              <p className="text-espresso text-sm mt-1 max-w-[650px]">{PAGE_DESCRIPTION}</p>
              <p className="text-espresso text-sm mt-2 max-w-[650px]">{PAGE_DESCRIPTION_EXTENDED}</p>
              <p className="text-espresso text-sm mt-2 mb-6 max-w-[650px]">{PAGE_DESCRIPTION_HISTORY}</p>
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
