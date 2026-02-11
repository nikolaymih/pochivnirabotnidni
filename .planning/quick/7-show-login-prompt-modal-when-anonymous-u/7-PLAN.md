---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/FullYearCalendarWrapper.tsx
autonomous: true

must_haves:
  truths:
    - "Anonymous user sees a dismissible modal when they first add a vacation day"
    - "Modal shows only once per session (useRef, not localStorage)"
    - "The vacation date is still added — modal is informational, not blocking"
    - "Authenticated users never see the modal"
    - "Modal can be dismissed by clicking the button or the overlay background"
  artifacts:
    - path: "components/FullYearCalendarWrapper.tsx"
      provides: "Login prompt modal and trigger logic"
      contains: "showLoginPrompt"
  key_links:
    - from: "handlePointerDown"
      to: "showLoginPrompt state"
      via: "isAuthenticated check + hasShownLoginPrompt ref"
      pattern: "!isAuthenticated.*hasShownLoginPrompt"
---

<objective>
Show a dismissible informational modal when an anonymous user first adds a vacation day,
prompting them to log in to persist their data. The modal appears once per session,
does not block the vacation date from being added, and never appears for authenticated users.

Purpose: Encourage anonymous users to sign in for data persistence without interrupting their workflow.
Output: Updated FullYearCalendarWrapper.tsx with inline modal and trigger logic.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@components/FullYearCalendarWrapper.tsx
@components/MigrationReview.tsx (modal pattern reference)
@contexts/VacationContext.tsx (isAuthenticated available via useVacation)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add login prompt modal to FullYearCalendarWrapper</name>
  <files>components/FullYearCalendarWrapper.tsx</files>
  <action>
  Modify FullYearCalendarWrapper.tsx:

  1. **Add useRef import** — add `useRef` to the existing React import:
     `import { useState, useEffect, useRef } from 'react';`

  2. **Destructure isAuthenticated** — update the useVacation() destructuring:
     `const { vacationData, setVacationData, rollover, isAuthenticated } = useVacation();`

  3. **Add state and ref** — after existing state declarations:
     ```tsx
     const [showLoginPrompt, setShowLoginPrompt] = useState(false);
     const hasShownLoginPrompt = useRef(false);
     ```

  4. **Add trigger logic in handlePointerDown** — at the START of handlePointerDown (before existing logic), add:
     ```tsx
     // Show login prompt once per session for anonymous users adding vacation
     const isAdding = !vacationData.vacationDates.includes(dateStr);
     if (!isAuthenticated && !hasShownLoginPrompt.current && isAdding) {
       hasShownLoginPrompt.current = true;
       setShowLoginPrompt(true);
     }
     ```
     Important: This goes BEFORE the existing mode/drag logic. The vacation date must still be added (don't return early).

  5. **Render inline modal** — inside the return statement, wrap the existing FullYearCalendar in a fragment and add the modal AFTER it:
     ```tsx
     return (
       <>
         <FullYearCalendar ... />
         {showLoginPrompt && (
           <div
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
             onClick={() => setShowLoginPrompt(false)}
           >
             <div
               className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
               onClick={(e) => e.stopPropagation()}
             >
               <p className="text-espresso text-base mb-6">
                 За да запазите добавената отпуска, при следващи посещения, моля влезте във вашия профил.
               </p>
               <div className="flex justify-end">
                 <button
                   onClick={() => setShowLoginPrompt(false)}
                   className="bg-caramel text-white px-4 py-2 rounded hover:bg-cinnamon"
                 >
                   Разбрах
                 </button>
               </div>
             </div>
           </div>
         )}
       </>
     );
     ```

  Key details:
  - Uses Coffee theme tokens: bg-caramel, text-white, hover:bg-cinnamon, text-espresso
  - Overlay click dismisses (onClick on outer div)
  - e.stopPropagation() on inner div prevents dismiss when clicking modal content
  - useRef (not localStorage) for session-only tracking — page refresh resets the flag
  - No heading in modal — just the informational text and dismiss button (simple prompt)
  - Modal is purely informational — the vacation date is always added regardless
  </action>
  <verify>
  1. `npx tsc --noEmit` passes without errors
  2. `npm run build` succeeds
  3. Manual check: Open app not logged in, click a day — modal appears, day is marked as vacation
  4. Manual check: Dismiss modal, click another day — modal does NOT appear again
  5. Manual check: Log in, click a day — modal never appears
  </verify>
  <done>
  - Anonymous user sees Bulgarian login prompt modal on first vacation day addition
  - Modal dismisses via "Разбрах" button or overlay click
  - Modal shows only once per session (useRef tracking)
  - Vacation day is still added when modal appears (non-blocking)
  - Authenticated users never see the modal
  - All styling uses Coffee theme tokens
  </done>
</task>

</tasks>

<verification>
- TypeScript compilation passes (`npx tsc --noEmit`)
- Build succeeds (`npm run build`)
- No Coffee theme violations (no raw Tailwind colors like bg-blue-*, bg-gray-*, etc.)
</verification>

<success_criteria>
Anonymous users see an informational modal once per session when first adding a vacation day.
The modal uses Coffee theme styling and is dismissible. Authenticated users are unaffected.
</success_criteria>

<output>
After completion, create `.planning/quick/7-show-login-prompt-modal-when-anonymous-u/7-SUMMARY.md`
</output>
