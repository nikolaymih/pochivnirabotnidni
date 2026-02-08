'use client';

import { useRouter } from 'next/navigation';

interface YearSelectorProps {
  year: number;
}

export default function YearSelector({ year }: YearSelectorProps) {
  const router = useRouter();
  const minYear = 2020;
  const maxYear = 2030;

  const handleYearChange = (newYear: number) => {
    const currentYear = new Date().getFullYear();
    if (newYear === currentYear) {
      router.push('/');
    } else {
      router.push(`/?year=${newYear}`);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <button
        onClick={() => handleYearChange(year - 1)}
        disabled={year <= minYear}
        className="px-3 py-1 text-lg font-semibold text-coffee hover:text-espresso disabled:text-oat-milk cursor-pointer disabled:cursor-not-allowed transition-colors"
        aria-label="Предишна година"
      >
        &larr;
      </button>
      <h2 className="text-2xl font-bold text-espresso">{year}</h2>
      <button
        onClick={() => handleYearChange(year + 1)}
        disabled={year >= maxYear}
        className="px-3 py-1 text-lg font-semibold text-coffee hover:text-espresso disabled:text-oat-milk cursor-pointer disabled:cursor-not-allowed transition-colors"
        aria-label="Следваща година"
      >
        &rarr;
      </button>
    </div>
  );
}
