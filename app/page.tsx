import { getYear } from 'date-fns';
import { VacationProvider } from '@/contexts/VacationContext';
import FullYearCalendarWrapper from '@/components/FullYearCalendarWrapper';
import VacationSummary from '@/components/VacationSummary';
import Legend from '@/components/Legend';
import AuthHeader from '@/components/AuthHeader';
import { getHolidays } from '@/lib/holidays/fetch';

export default async function HomePage() {
  const currentYear = getYear(new Date());

  // Fetch holidays for current year and adjacent years to handle year-spanning weeks
  const [prevYearHolidays, currentYearHolidays, nextYearHolidays] = await Promise.all([
    getHolidays(currentYear - 1),
    getHolidays(currentYear),
    getHolidays(currentYear + 1),
  ]);

  // Merge all holidays into a single array
  const holidays = [...prevYearHolidays, ...currentYearHolidays, ...nextYearHolidays];

  return (
    <main className="min-h-screen">
      <VacationProvider>
        {/* Mobile: Stack vertically (summary at top, not sticky) */}
        <div className="lg:hidden">
          <div className="p-4">
            {/* Header with title and auth */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">Почивни Работни Дни {currentYear}</h1>
              <AuthHeader />
            </div>
            <p className="text-coffee mb-6">
              Календар с български празници и работни дни за планиране на вашата година
            </p>
            <Legend />
            <VacationSummary />
          </div>
          <div className="p-4">
            <FullYearCalendarWrapper year={currentYear} holidays={holidays} />
          </div>
        </div>

        {/* Desktop: Scrollable calendar with sticky sidebar */}
        <div className="hidden lg:flex gap-6">
          {/* Left: Scrollable full year calendar */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Header with title and auth */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Почивни Работни Дни {currentYear}</h1>
                <p className="text-coffee">
                  Календар с български празници и работни дни за планиране на вашата година
                </p>
              </div>
              <AuthHeader />
            </div>
            <FullYearCalendarWrapper year={currentYear} holidays={holidays} />
          </div>

          {/* Right: Sticky sidebar */}
          <div className="w-80 sticky top-0 h-screen overflow-y-auto p-4">
            <Legend />
            <VacationSummary />
          </div>
        </div>
      </VacationProvider>
    </main>
  );
}
