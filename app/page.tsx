import { getYear } from 'date-fns';
import { VacationProvider } from '@/contexts/VacationContext';
import FullYearCalendarWrapper from '@/components/FullYearCalendarWrapper';
import VacationSummary from '@/components/VacationSummary';
import Legend from '@/components/Legend';

export default async function HomePage() {
  const currentYear = getYear(new Date());

  return (
    <main className="min-h-screen">
      <VacationProvider>
        {/* Mobile: Stack vertically (summary at top, not sticky) */}
        <div className="lg:hidden">
          <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Почивни Работни Дни {currentYear}</h1>
            <p className="text-gray-600 mb-6">
              Календар с български празници и работни дни за планиране на вашата година
            </p>
            <Legend />
            <VacationSummary />
          </div>
          <div className="p-4">
            <FullYearCalendarWrapper year={currentYear} />
          </div>
        </div>

        {/* Desktop: Scrollable calendar with sticky sidebar */}
        <div className="hidden lg:flex gap-6">
          {/* Left: Scrollable full year calendar */}
          <div className="flex-1 overflow-y-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Почивни Работни Дни {currentYear}</h1>
            <p className="text-gray-600 mb-6">
              Календар с български празници и работни дни за планиране на вашата година
            </p>
            <FullYearCalendarWrapper year={currentYear} />
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
