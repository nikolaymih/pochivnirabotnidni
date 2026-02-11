---
phase: quick
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - components/MonthGrid.tsx
  - components/DayTooltip.tsx
autonomous: true
---

<objective>
Reduce tooltip clutter: only show "i" tooltip icon for official holidays and days with 2+ overlapping legend types (e.g., school holiday + bridge, vacation + school holiday). Single-type days no longer show tooltip icons. Also add "- " prefix for multi-label tooltip items.
</objective>

<tasks>
<task type="auto">
  <name>Task 1: Change tooltip threshold to 2+ labels and add dash prefix</name>
  <files>components/MonthGrid.tsx, components/DayTooltip.tsx</files>
  <action>
  1. In MonthGrid.tsx line 214: change `tooltipLabels.length > 0` to `tooltipLabels.length > 1`
  2. In DayTooltip.tsx: prefix each label with "- " when labels.length > 1
  </action>
</task>
</tasks>
