---
phase: quick
plan: 8
type: execute
---

<objective>
Two fixes: (1) Change modal text from "За да запазите" to "За да не загубите". (2) Fix profile dropdown hover background overflowing rounded corners.
</objective>

<tasks>
<task type="auto">
  <name>Update modal text and fix dropdown overflow</name>
  <files>components/FullYearCalendarWrapper.tsx, components/UserMenu.tsx</files>
  <action>
  1. Change "запазите" to "не загубите" in login prompt modal text
  2. Add overflow-hidden to dropdown container, remove py-1 to prevent hover bg overflow
  </action>
</task>
</tasks>
