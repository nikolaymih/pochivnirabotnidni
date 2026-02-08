'use client';

import { useState, useEffect } from 'react';
import { getYear } from 'date-fns';
import { useVacation } from '@/contexts/VacationContext';

interface VacationSummaryProps {
  year?: number;
}

export default function VacationSummary({ year }: VacationSummaryProps) {
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);
  const { vacationData, setVacationData, rollover, isAuthenticated } = useVacation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isCurrentYear = !year || year === getYear(new Date());
  const usedDays = vacationData.vacationDates.length;
  const rolloverDays = rollover?.rolloverDays || 0;
  const effectiveTotal = vacationData.totalDays + rolloverDays;
  const remainingDays = effectiveTotal - usedDays;
  const percentageUsed = effectiveTotal > 0
    ? Math.round((usedDays / effectiveTotal) * 100)
    : 0;

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
      <h2 className="text-lg font-semibold text-espresso mb-3">Лична Почивка</h2>

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

      {/* Rollover Days (Only for authenticated users with rollover) */}
      {isAuthenticated && rollover && rolloverDays > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-mocha">🔄 Прехвърлени от {new Date().getFullYear() - 1}:</span>
          <span className="font-semibold text-mocha">{rolloverDays}</span>
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
    </div>
  );
}
