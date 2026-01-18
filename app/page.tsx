import { getYear } from 'date-fns';
import { getHolidays } from '@/lib/holidays/fetch';
import Calendar from '@/components/Calendar';
import Legend from '@/components/Legend';

export default async function HomePage() {
  const currentDate = new Date();
  const year = getYear(currentDate);
  const month = currentDate.getMonth(); // 0-11

  // Fetch holidays server-side (defaults to 2026 for Phase 1 scope)
  const holidays = await getHolidays(2026);

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Pochivni Rabotni Dni 2026</h1>
      <p className="text-gray-600 mb-8">
        Bulgarian holidays and workdays calendar for planning your year
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Calendar year={2026} month={month} holidays={holidays} />
        </div>
        <div className="lg:col-span-1">
          <Legend />
        </div>
      </div>
    </main>
  );
}
