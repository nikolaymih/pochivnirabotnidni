import type { VacationData } from './types';

/** localStorage key for vacation tracking data */
export const VACATION_STORAGE_KEY = 'pochivni-vacation-data';

/** Current schema version for vacation data */
export const VACATION_SCHEMA_VERSION = 1;

/** Default annual vacation days (Bulgarian standard) */
export const DEFAULT_VACATION_DAYS = 20;

/** Default vacation data structure */
export const DEFAULT_VACATION_DATA: VacationData = {
  version: VACATION_SCHEMA_VERSION,
  totalDays: DEFAULT_VACATION_DAYS,
  vacationDates: []
};
