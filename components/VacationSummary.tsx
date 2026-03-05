'use client';

import { useState, useEffect, useMemo } from 'react';
import { getYear, parseISO, format } from 'date-fns';
import { groupVacationPeriods } from '@/lib/vacation/periods';
import type { VacationPeriod } from '@/lib/vacation/types';
import { useVacation } from '@/contexts/VacationContext';

interface VacationSummaryProps {
  year?: number;
  holidayDates?: string[];
}

export default function VacationSummary({ year, holidayDates }: VacationSummaryProps) {
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);
  const { vacationData, setVacationData, rollover, isAuthenticated } = useVacation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isCurrentYear = !year || year === getYear(new Date());
  const usedDays = vacationData.vacationDates.length;
  const rolloverDays = rollover?.totalRollover || 0;
  const effectiveTotal = vacationData.totalDays + rolloverDays;
  const remainingDays = effectiveTotal - usedDays;
  const percentageUsed = effectiveTotal > 0
    ? Math.round((usedDays / effectiveTotal) * 100)
    : 0;

  const [pendingDelete, setPendingDelete] = useState<VacationPeriod | null>(null);

  const displayYear = year || getYear(new Date());

  const periods = useMemo(
    () => groupVacationPeriods(vacationData.vacationDates, holidayDates || [], displayYear),
    [vacationData.vacationDates, holidayDates, displayYear]
  );

  const formatPeriod = (period: VacationPeriod): string => {
    const start = format(parseISO(period.startDate), 'dd.MM');
    const end = format(parseISO(period.endDate), 'dd.MM');
    if (period.dayCount === 1) {
      return `${start} (1 ден)`;
    }
    return `${start} – ${end} (${period.dayCount} дни)`;
  };

  const handleDeletePeriod = (period: VacationPeriod) => {
    const datesToRemove = new Set(period.days);
    setVacationData({
      ...vacationData,
      vacationDates: vacationData.vacationDates.filter(d => !datesToRemove.has(d))
    });
    setPendingDelete(null);
  };

  const handleEdit = () => {
    setEditValue(vacationData.totalDays);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Cannot set total days below used days or below 1
    if (editValue >= usedDays && editValue > 0) {
      setVacationData({
        ...vacationData,
        totalDays: editValue
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(vacationData.totalDays);
    setIsEditing(false);
  };

  if (!isClient) {
    return <div className="mt-6 p-4 bg-white rounded-lg border border-latte">Зареждане...</div>;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg border border-latte space-y-3">
      <h2 className="text-lg font-semibold text-espresso mb-3">Отпуска</h2>

      {/* Total Days (Editable) */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-coffee">📅 Общо дни за отпуск:</span>
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 ${
                  editValue < usedDays
                    ? 'border-error focus:ring-error'
                    : 'border-caramel focus:ring-caramel'
                }`}
                min={Math.max(1, usedDays)}
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={editValue < usedDays || editValue < 1}
                className={`px-2 py-1 text-white text-xs rounded ${
                  editValue < usedDays || editValue < 1
                    ? 'bg-oat-milk cursor-not-allowed'
                    : 'bg-caramel hover:bg-cinnamon'
                }`}
                aria-label="Запази"
              >
                ✓
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 bg-cappuccino text-white text-xs rounded hover:bg-coffee"
                aria-label="Отказ"
              >
                ✕
              </button>
            </div>
            {editValue < usedDays && (
              <span className="text-xs text-error">
                Мин. {usedDays} (използвани дни)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isAuthenticated && rollover && rolloverDays > 0 ? (
              <span className="font-semibold text-espresso">
                {vacationData.totalDays} + {rolloverDays} = {effectiveTotal}
              </span>
            ) : (
              <span className="font-semibold text-espresso">{vacationData.totalDays}</span>
            )}
            {isCurrentYear && (
              <button
                onClick={handleEdit}
                className="text-coffee hover:text-dark-roast text-sm bg-cream/50 rounded px-1 py-0.5 border border-latte/50"
                aria-label="Редактирай годишна почивка"
              >
                ✏️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Carryover Breakdown (Only for authenticated users with buckets) */}
      {isAuthenticated && rollover && rollover.buckets && rollover.buckets.length > 0 && (
        <div className="border-t border-latte pt-2 mt-2 space-y-1">
          <span className="text-xs text-cappuccino font-semibold">Детайли на прехвърлените дни:</span>

          {/* Current year allocation */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-coffee">Текуща година ({year || new Date().getFullYear()}):</span>
            <span className="text-sm font-semibold text-espresso">{vacationData.totalDays}</span>
          </div>

          {/* Carryover buckets */}
          {rollover.buckets.map(bucket => (
            <div key={bucket.year} className="flex items-center justify-between">
              <span className={`text-xs ${bucket.isExpired ? 'text-oat-milk line-through' : 'text-mocha'}`}>
                Прехвърлени от {bucket.year} {bucket.isExpired ? '(изтекли)' : `(важи до ${bucket.expiresAt.slice(0, 4)})`}:
              </span>
              <span className={`text-sm font-semibold ${bucket.isExpired ? 'text-oat-milk line-through' : 'text-mocha'}`}>
                {bucket.rolloverDays}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Used Days */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-coffee">✔️ Използвани дни:</span>
        <span className="font-semibold text-espresso">{usedDays}</span>
      </div>

      {/* Remaining Days */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-coffee">⏳ Остават дни:</span>
        <span className={`font-semibold ${remainingDays < 0 ? 'text-error' : 'text-success'}`}>
          {remainingDays}
        </span>
      </div>

      {/* Percentage Used */}
      <div className="pt-2 border-t border-latte">
        <span className="text-sm text-cappuccino">{percentageUsed}% използвани</span>
      </div>

      {/* Vacation Periods */}
      {periods.length > 0 && (
        <div className="border-t border-latte pt-2 mt-2">
          <span className="font-semibold mb-1 block">
            Периоди
          </span>
          <div className="mt-1 space-y-1">
            {periods.map(period => (
              <div key={period.startDate}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-coffee">
                    {formatPeriod(period)}
                  </span>
                  {isCurrentYear && (
                    <button
                      onClick={() => setPendingDelete(
                        pendingDelete?.startDate === period.startDate ? null : period
                      )}
                      className="text-cappuccino hover:text-error text-sm px-1 leading-none"
                      aria-label={`Изтрий период ${formatPeriod(period)}`}
                    >
                      &times;
                    </button>
                  )}
                </div>
                {/* Inline confirmation */}
                {pendingDelete?.startDate === period.startDate && (
                  <div className="mt-1 p-2 bg-foam rounded border border-latte text-xs">
                    <p className="text-coffee mb-2">
                      Изтриване на {formatPeriod(period)}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeletePeriod(period)}
                        className="px-2 py-1 bg-error text-white rounded text-xs hover:bg-error/90"
                      >
                        Изтрий
                      </button>
                      <button
                        onClick={() => setPendingDelete(null)}
                        className="px-2 py-1 bg-cappuccino text-white rounded text-xs hover:bg-coffee"
                      >
                        Отказ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
