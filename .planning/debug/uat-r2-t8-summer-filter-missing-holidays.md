---
status: diagnosed
trigger: "UAT R2 T8: Лятна ваканция filter applied too broadly, some school holidays missing from calendar"
created: 2026-02-08T00:00:00Z
updated: 2026-02-08T00:00:00Z
---

## Current Focus

hypothesis: Лятна ваканция filter is in getSchoolHolidays() which feeds BOTH sidebar and calendar. Dec 29-31 missing because Коледна ваканция crosses year boundary. May 24 is NOT a school holiday — it's a public holiday already in the holidays data.
test: Trace data flow from getSchoolHolidays -> page.tsx -> sidebar + calendar
expecting: Confirm filter removes data before sidebar receives it
next_action: Return diagnosis

## Symptoms

expected: 1) Лятна ваканция appears in sidebar "Ученически ваканции" card. 2) Лятна ваканция does NOT appear highlighted on calendar. 3) Dec 29-31 and May 24 show as school holidays on calendar.
actual: 1) Лятна ваканция missing from sidebar entirely. 2) Dec 29-31 not highlighted as school holidays. 3) May 24 not highlighted as school holiday.
errors: No runtime errors — logic/data issue.
reproduction: Load app for year 2026, check sidebar card and calendar dates.
started: Since 05.2-08 commit (added Лятна ваканция filter in getSchoolHolidays).

## Eliminated

(none — direct diagnosis)

## Evidence

- timestamp: 2026-02-08
  checked: schoolHolidays.ts line 70
  found: `const filtered = deduplicated.filter(h => !h.name.includes('Лятна ваканция'))` — filter is in getSchoolHolidays() which returns data used by BOTH sidebar and calendar
  implication: Filter removes Лятна ваканция from the array before page.tsx receives it, so LeftSidebar never sees it

- timestamp: 2026-02-08
  checked: app/page.tsx lines 20-30
  found: `schoolHolidays` from getSchoolHolidays() is passed to both LeftSidebar (line 50, 77) and getSchoolHolidayDates() (line 29). Single source, single filter point.
  implication: Both sidebar and calendar dates derive from the same filtered array — moving the filter to getSchoolHolidayDates() fixes the sidebar while still excluding summer from calendar

- timestamp: 2026-02-08
  checked: school-holidays-2026-fallback.json
  found: Коледна ваканция has startDate 2025-12-24 to endDate 2026-01-04. The API query uses validFrom=2026-01-01&validTo=2026-12-31.
  implication: The API may not return the Коледна ваканция entry because its startDate (2025-12-24) is BEFORE the validFrom (2026-01-01). Dec 24-31 of 2025 are part of the PREVIOUS year's query. The fallback JSON has it because it was manually created, but the API query window clips it.

- timestamp: 2026-02-08
  checked: school-holidays-2026-fallback.json for Dec 2026
  found: No "Коледна ваканция" entry for Dec 2026 exists in the fallback. The 2025-12-24 to 2026-01-04 entry covers the END of 2025 / START of 2026 Коледна ваканция, but there is no entry for December 2026's Коледна ваканция (which would be ~2026-12-24 to 2027-01-04).
  implication: Dec 29-31 2026 are missing because the 2026 Коледна ваканция data is simply not present — it would need to come from the API or a future fallback update. The existing fallback entry (2025-12-24 to 2026-01-04) covers Jan 2026 start only.

- timestamp: 2026-02-08
  checked: holidays-2026-fallback.json for May 24
  found: May 24 is "Education and Culture Day" (type: "National Holiday") — it is a PUBLIC holiday, NOT a school holiday. It already appears in the holidays array with cinnamon color.
  implication: May 24 does not need to be in school holidays — it's already highlighted as a public holiday. This is NOT a bug. If the user sees it missing from "school" highlighting, that's because it's rendered as a public holiday instead (higher priority in MonthGrid styling, line 142).

- timestamp: 2026-02-08
  checked: MonthGrid.tsx line 133-148 (styling priority)
  found: Priority order is Holiday > Vacation > School Holiday > Bridge > Weekend > Workday. Public holidays override school holiday styling.
  implication: Even if May 24 were in schoolHolidayDates, it would render as cinnamon (public holiday) not teal (school holiday). This is correct behavior.

## Resolution

root_cause: |
  TWO distinct issues:

  ISSUE 1 (Primary - Лятна ваканция filter scope):
  The Лятна ваканция exclusion filter is on line 70 of schoolHolidays.ts inside getSchoolHolidays().
  This function returns the SchoolHoliday[] array that feeds BOTH:
    - LeftSidebar (sidebar display) via schoolHolidays prop
    - getSchoolHolidayDates() (calendar highlighting) via schoolHolidayDates
  Because the filter removes Лятна ваканция BEFORE the data reaches either consumer,
  the sidebar card loses it AND the calendar loses it. The intent was only to exclude
  it from calendar highlighting.

  ISSUE 2 (Data gap - Dec 29-31):
  The school-holidays-2026-fallback.json contains Коледна ваканция for 2025-12-24 to 2026-01-04
  (covering the START of 2026). But there is NO entry for Dec 2026's Коледна ваканция
  (~2026-12-24 to 2027-01-03). This is a data completeness issue — the fallback JSON
  needs a second Коледна ваканция entry for end-of-2026. The API query
  (validFrom=2026-01-01&validTo=2026-12-31) may also miss this if the API returns it
  only under the 2027 year bracket.

  NON-ISSUE (May 24):
  May 24 is "Education and Culture Day" — a public/national holiday, not a school holiday.
  It is already in holidays-2026-fallback.json and renders with cinnamon (holiday) color.
  MonthGrid's priority system correctly shows it as a public holiday. It does NOT need
  to be in school holidays data.

fix: Not applied (read-only diagnosis)
verification: N/A
files_changed: []
