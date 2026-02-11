---
phase: quick
plan: 4
type: execute
wave: 1
depends_on: []
files_modified:
  - components/DayTooltip.tsx
  - components/MonthGrid.tsx
autonomous: true

must_haves:
  truths:
    - "Vacation days show an 'i' tooltip icon with label 'Отпуска'"
    - "Bridge days show an 'i' tooltip icon with label 'Предложение за почивка'"
    - "School holiday days show an 'i' tooltip icon with label 'Неучебни дни'"
    - "Days with multiple types (e.g., vacation + school holiday) show all labels in one tooltip"
    - "Official holiday tooltips still show holiday name and date (unchanged behavior)"
    - "On mobile, tapping outside an open tooltip closes it"
  artifacts:
    - path: "components/DayTooltip.tsx"
      provides: "Generalized tooltip supporting both holiday detail and generic labels, with mobile click-away"
    - path: "components/MonthGrid.tsx"
      provides: "Tooltip rendering for all day types, not just holidays"
  key_links:
    - from: "components/MonthGrid.tsx"
      to: "components/DayTooltip.tsx"
      via: "labels prop for non-holiday days, holiday prop for holidays"
---

<objective>
Add tooltip "i" icons for vacation, bridge, and school holiday days (not just official holidays). When multiple types overlap on one day, show all labels in the tooltip. Fix mobile click-away to close open tooltips.

Purpose: Users currently only get tooltip info on official holidays. This extends the same pattern to all colored day types so users can identify what each day means at a glance.
Output: Updated DayTooltip component with generic label support and click-away dismiss. Updated MonthGrid rendering tooltips for all day types.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@components/DayTooltip.tsx
@components/MonthGrid.tsx
@lib/constants.ts
@lib/calendar/bridgeDays.ts (for BridgeDay interface with relatedHoliday field)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Refactor DayTooltip to support generic labels and mobile click-away</name>
  <files>components/DayTooltip.tsx</files>
  <action>
Refactor DayTooltip to accept two rendering modes via props:

**New interface (union-style):**
```tsx
interface DayTooltipProps {
  // Mode 1: Holiday detail (existing behavior)
  holiday?: Holiday;
  isSubstitute?: boolean;
  // Mode 2: Generic labels (new)
  labels?: string[];
}
```

When `holiday` is provided, render existing holiday content (name + formatted date). When `labels` is provided (and no holiday), render a simple list of labels as `<div>` items. Both use the same "i" icon button and same bg-espresso text-foam tooltip styling.

**Tooltip content rendering logic:**
- If `holiday` prop exists: render holiday name (with isSubstitute suffix) + formatted date (existing behavior, unchanged)
- If `labels` prop exists (and no holiday): render each label as a `<div className="font-medium text-sm">{label}</div>` inside the tooltip. No date line needed.
- If both somehow provided, holiday takes priority.

**Add mobile click-away dismiss:**
Add a `useEffect` in the component that, when `isMobileVisible` is true, attaches a `mousedown` event listener on `document`. The listener checks if the click target is outside the tooltip container ref. If so, set `isMobileVisible(false)`.

Implementation:
1. Add `useRef<HTMLDivElement>(null)` for the mobile tooltip container
2. `useEffect` with dependency on `isMobileVisible`:
   ```tsx
   useEffect(() => {
     if (!isMobileVisible) return;
     const handleClickOutside = (e: MouseEvent) => {
       if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
         setIsMobileVisible(false);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [isMobileVisible]);
   ```
3. Wrap the mobile `<div className="lg:hidden ...">` with `ref={mobileRef}`

**Keep existing behavior identical for holidays:** The "i" icon size, positioning, hover/click interactions, and tooltip styling remain the same. The aria-label should adapt: "Подробности за празника" for holidays, "Подробности за деня" for generic labels.

**Do NOT change:** Desktop hover behavior, icon styling (bg-foam/80, text-espresso, rounded-full), tooltip positioning (absolute, left-1/2, -translate-x-1/2, top-5, z-10).
  </action>
  <verify>
Run `npx tsc --noEmit` to confirm no TypeScript errors. Verify DayTooltip accepts both `holiday` and `labels` props. Check the useEffect for click-away is present.
  </verify>
  <done>
DayTooltip renders holiday detail when holiday prop is given, renders label list when labels prop is given, and mobile tooltips close when tapping outside.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update MonthGrid to show tooltips for all day types</name>
  <files>components/MonthGrid.tsx</files>
  <action>
Three changes in MonthGrid:

**1. Update local BridgeDay interface to include relatedHoliday:**
Change the local BridgeDay interface from:
```tsx
interface BridgeDay {
  date: string;
  reason?: string;
}
```
to:
```tsx
interface BridgeDay {
  date: string;
  reason?: string;
  relatedHoliday?: string;
  daysOff?: number;
}
```
This aligns with the real BridgeDay from `lib/calendar/bridgeDays.ts` while keeping fields optional for backward compatibility.

**2. Build tooltip labels array for non-holiday days:**
Inside the `days.map()` callback, after all the boolean flags are computed (isVacation, isBridge, isSchoolHoliday, etc.) and BEFORE the return JSX, build a labels array:

```tsx
// Build tooltip labels for non-holiday day types
const tooltipLabels: string[] = [];
if (!displayAsHoliday) {
  if (isVacation) tooltipLabels.push('Отпуска');
  if (isBridge) tooltipLabels.push('Предложение за почивка');
  if (isSchoolHoliday) tooltipLabels.push('Неучебни дни');
}
```

Note: Do NOT add tooltips for plain weekends or plain workdays. Only vacation, bridge, and school holiday days get tooltips.

**3. Update the JSX rendering to show DayTooltip for all tooltip-worthy days:**
Replace the current tooltip rendering block:
```tsx
{displayAsHoliday && (
  <DayTooltip
    holiday={transferredHoliday || holidays.find(h => h.date === dateStr)!}
    isSubstitute={isTransferredHoliday}
  />
)}
{isVacation && isSchoolHoliday && !displayAsHoliday && (
  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-teal border" />
)}
```

With:
```tsx
{displayAsHoliday && (
  <DayTooltip
    holiday={transferredHoliday || holidays.find(h => h.date === dateStr)!}
    isSubstitute={isTransferredHoliday}
  />
)}
{!displayAsHoliday && tooltipLabels.length > 0 && (
  <DayTooltip labels={tooltipLabels} />
)}
```

This removes the small teal dot (replaced by the "i" tooltip icon) and adds tooltip "i" icons for any non-holiday day that has labels (vacation, bridge, school holiday, or combinations).

**Important:** The holiday DayTooltip path remains completely unchanged - same props, same behavior. Only non-holiday days get the new `labels` prop path.
  </action>
  <verify>
Run `npx tsc --noEmit` to confirm no TypeScript errors. Run `npm run dev` and visually check:
1. Holiday days still show "i" icon with holiday name + date
2. Vacation days now show "i" icon with "Отпуска" label
3. Bridge days now show "i" icon with "Предложение за почивка" label
4. School holiday days show "i" icon with "Неучебни дни" label
5. A day that is both vacation + school holiday shows both labels in one tooltip
6. The small teal dot is gone (replaced by tooltip icon)
7. On mobile, tapping outside an open tooltip closes it
  </verify>
  <done>
All non-weekend, non-workday day types show tooltip "i" icons. Overlapping types show combined labels. The teal dot indicator is removed. Mobile click-away works.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Holiday tooltips unchanged (name + date display)
- Vacation days show "i" icon -> tooltip with "Отпуска"
- Bridge days show "i" icon -> tooltip with "Предложение за почивка"
- School holiday days show "i" icon -> tooltip with "Неучебни дни"
- Overlap days (e.g., vacation + school holiday) show multi-label tooltip
- Mobile: tap outside open tooltip closes it
- No teal dot remnants in the codebase
</verification>

<success_criteria>
All five legend day types that appear in the calendar (official holiday, vacation, bridge, school holiday) have tooltip "i" icons. Weekends and plain workdays do not. Multi-type overlap shows combined labels. Mobile click-away dismisses open tooltips.
</success_criteria>

<output>
After completion, create `.planning/quick/4-add-tooltips-for-all-legend-day-types-an/4-SUMMARY.md`
</output>
