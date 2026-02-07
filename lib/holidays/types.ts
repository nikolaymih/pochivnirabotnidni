export interface Holiday {
  name: string;
  date: string; // ISO date string (YYYY-MM-DD) per TECH-07
  type: HolidayType;
}

export type HolidayType = 'Public Holiday' | 'National Holiday' | 'Observance';

export interface SchoolHoliday {
  name: string;           // Bulgarian name (e.g., "Коледна ваканция")
  startDate: string;      // ISO date string YYYY-MM-DD
  endDate: string;        // ISO date string YYYY-MM-DD
  type: 'School';
  gradeLevel?: string;    // Optional grade info (e.g., "I-XI клас")
}
