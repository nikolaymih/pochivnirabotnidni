---
phase: quick
plan: 10
type: execute
---

<objective>
Fix favicon not changing (default Next.js favicon.ico overrides metadata icons) and increase logo size in header.
</objective>

<tasks>
<task type="auto">
  <name>Remove favicon.ico and increase logo size</name>
  <files>app/favicon.ico, app/page.tsx</files>
  <action>
  1. git rm app/favicon.ico — Next.js convention file overrides metadata icons
  2. Desktop logo: h-10 → h-16 (64px)
  3. Mobile logo: h-8 → h-14 (56px)
  </action>
</task>
</tasks>
