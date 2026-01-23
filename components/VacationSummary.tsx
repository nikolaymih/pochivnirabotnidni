'use client';

import { useState, useEffect } from 'react';
import { useVacation } from '@/contexts/VacationContext';

export default function VacationSummary() {
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);
  const { vacationData, setVacationData } = useVacation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const usedDays = vacationData.vacationDates.length;
  const remainingDays = vacationData.totalDays - usedDays;
  const percentageUsed = vacationData.totalDays > 0
    ? Math.round((usedDays / vacationData.totalDays) * 100)
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
    return <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">Зареждане...</div>;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Лична Почивка</h2>

      {/* Total Days (Editable) */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">📅 Общо дни за отпуск:</span>
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 ${
                  editValue < usedDays
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-blue-400 focus:ring-blue-500'
                }`}
                min={Math.max(1, usedDays)}
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={editValue < usedDays || editValue < 1}
                className={`px-2 py-1 text-white text-xs rounded ${
                  editValue < usedDays || editValue < 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                aria-label="Запази"
              >
                ✓
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                aria-label="Отказ"
              >
                ✕
              </button>
            </div>
            {editValue < usedDays && (
              <span className="text-xs text-red-500">
                Мин. {usedDays} (използвани дни)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{vacationData.totalDays}</span>
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800 text-sm"
              aria-label="Редактирай годишна почивка"
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* Used Days */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">✔️ Използвани дни:</span>
        <span className="font-semibold text-gray-800">{usedDays}</span>
      </div>

      {/* Remaining Days */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">⏳ Остават дни:</span>
        <span className={`font-semibold ${remainingDays < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {remainingDays}
        </span>
      </div>

      {/* Percentage Used */}
      <div className="pt-2 border-t border-gray-200">
        <span className="text-sm text-gray-500">{percentageUsed}% използвани</span>
      </div>
    </div>
  );
}
