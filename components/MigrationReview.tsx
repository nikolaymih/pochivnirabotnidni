'use client';

import { VacationData } from '@/lib/vacation/types';

interface MigrationReviewProps {
  localData: VacationData;
  cloudData: VacationData;
  mergedDates: string[];
  onAccept: (data: VacationData) => void;
  onCancel: () => void;
}

/**
 * Migration Conflict Resolution Modal
 *
 * Fixed-position modal overlay that blocks the entire page until the user
 * resolves the conflict between localStorage and Supabase data.
 */
export default function MigrationReview({
  localData,
  cloudData,
  mergedDates,
  onAccept,
  onCancel,
}: MigrationReviewProps) {
  const handleMerge = () => {
    onAccept({
      version: 1,
      totalDays: cloudData.totalDays,
      vacationDates: mergedDates,
    });
  };

  const handleKeepCloud = () => {
    onAccept(cloudData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Обединяване на данни</h2>

        <p className="text-gray-700 mb-6">
          Намерени са данни и на това устройство, и в облака.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
            <span className="text-gray-600">На това устройство:</span>
            <span className="font-semibold">{localData.vacationDates.length} дни</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
            <span className="text-gray-600">В облака:</span>
            <span className="font-semibold">{cloudData.vacationDates.length} дни</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
            <span className="text-gray-600">Обединени:</span>
            <span className="font-semibold text-blue-600">{mergedDates.length} дни</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleKeepCloud}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Запази облачните
          </button>

          <button
            onClick={handleMerge}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Обедини
          </button>
        </div>
      </div>
    </div>
  );
}
