# Fast Lane Log

Append-only log of small changes made outside full GSD phases.
Full phases must review and decide: absorb / reapply / ignore.

---
Date: 2026-02-10
Related Phase: 04 (Authentication & Cross-Device Sync)
Scope: Fix React reconciler error when pressing "Обедини" in migration conflict modal
Files touched: contexts/VacationContext.tsx
Why Fast Lane (1 sentence): React DevTools throws "children should not have changed" because MigrationReview conditional rendering inside Context.Provider changes children array in same batch as value prop update.
Impact: Moved MigrationReview outside VacationContext.Provider — it's a fixed-position overlay that doesn't consume VacationContext, so it doesn't need to be inside the Provider. Provider children are now stable across renders.
Risk: low
Decision in next full phase:
---

---
Date: 2026-02-10
Related Phase: 04 (Authentication & Cross-Device Sync)
Scope: Fix stale data in migration conflict modal (useLocalStorage write-on-mount + missing totalDays display)
Files touched: hooks/useLocalStorage.ts, components/MigrationReview.tsx
Why Fast Lane (1 sentence): useLocalStorage write effect fires on mount with DEFAULT_VACATION_DATA before real data hydrates (both effects run same cycle, ref is synchronous but setState is async), and modal only showed vacationDates.length hiding totalDays conflicts.
Impact: (1) Added writeSuppressed ref to skip first write effect invocation — prevents overwriting localStorage with empty defaults on mount. (2) MigrationReview now shows "квота" (totalDays) when it differs between local and cloud, and labels changed from "дни" to "избрани дни" for clarity.
Risk: low
Decision in next full phase:
---
