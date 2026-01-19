import { getYear } from 'date-fns';
import { getHolidays } from '@/lib/holidays/fetch';
import Calendar from '@/components/Calendar';
import Legend from '@/components/Legend';

export default async function HomePage() {
  const currentDate = new Date();
  const year = getYear(currentDate);
  const month = currentDate.getMonth(); // 0-11

  // Fetch holidays server-side
  const holidays = await getHolidays(year);

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Почивни Работни Дни {year}</h1>
      <p className="text-gray-600 mb-8">
        Календар с български празници и работни дни за планиране на вашата година
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Calendar year={year} month={month} holidays={holidays} />
        </div>
        <div className="lg:col-span-1">
          <Legend />
        </div>
      </div>
    </main>
  );
}
