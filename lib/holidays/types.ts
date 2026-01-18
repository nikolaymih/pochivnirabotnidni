export interface Holiday {
  name: string;
  date: string; // ISO date string (YYYY-MM-DD) per TECH-07
  type: HolidayType;
}

export type HolidayType = 'Public Holiday' | 'National Holiday' | 'Observance';
