# Quick Task 5 Summary: Show tooltip only for holidays and multi-type overlap days

## What Changed

1. **MonthGrid.tsx**: Changed tooltip rendering condition from `tooltipLabels.length > 0` to `tooltipLabels.length > 1`. Now tooltips only appear on days with 2+ overlapping legend types (e.g., school holiday + bridge, vacation + school holiday).

2. **DayTooltip.tsx**: Added "- " prefix to each label when there are multiple labels in the tooltip for clarity (e.g., "- Отпуска" / "- Неучебни дни").

## Result

- Official holidays: tooltip with holiday name + date (unchanged)
- Single-type days (just vacation, just bridge, just school holiday): NO tooltip icon
- Multi-type overlap days: tooltip with "- " prefixed labels
- Significantly reduces visual clutter from too many "i" icons
