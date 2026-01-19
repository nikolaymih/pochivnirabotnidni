'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VacationData } from '@/lib/vacation/types';
import { VACATION_STORAGE_KEY, DEFAULT_VACATION_DATA } from '@/lib/vacation/storage';

export default function VacationSummary() {
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);
  const [vacationData, setVacationData] = useLocalStorage<VacationData>(
    VACATION_STORAGE_KEY,
    DEFAULT_VACATION_DATA
  );

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
    if (editValue > 0) {
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
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
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
