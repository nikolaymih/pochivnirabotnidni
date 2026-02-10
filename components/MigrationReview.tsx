'use client';

import { VacationData } from '@/lib/vacation/types';

interface MigrationReviewProps {
  localData: VacationData;
  cloudData: VacationData;
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
  onAccept,
  onCancel,
}: MigrationReviewProps) {
  const handleKeepCloud = () => {
    onAccept(cloudData);
  };

  const handleKeepLocal = () => {
    onAccept(localData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Конфликт в данните</h2>

        <p className="text-coffee mb-6">
          Намерени са различни данни на това устройство и в облака. Изберете кои да запазите.
        </p>

        <div className="space-y-3 mb-6">
          <div className="py-2 px-3 bg-cream rounded">
            <div className="flex justify-between items-center">
              <span className="text-coffee">На това устройство:</span>
              <span className="font-semibold">{localData.vacationDates.length} избрани дни</span>
            </div>
            {localData.totalDays !== cloudData.totalDays && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-cappuccino">Квота:</span>
                <span className="text-xs font-semibold text-cappuccino">{localData.totalDays} дни</span>
              </div>
            )}
          </div>

          <div className="py-2 px-3 bg-cream rounded">
            <div className="flex justify-between items-center">
              <span className="text-coffee">В облака:</span>
              <span className="font-semibold">{cloudData.vacationDates.length} избрани дни</span>
            </div>
            {localData.totalDays !== cloudData.totalDays && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-cappuccino">Квота:</span>
                <span className="text-xs font-semibold text-cappuccino">{cloudData.totalDays} дни</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleKeepCloud}
            className="border border-latte text-coffee px-4 py-2 rounded hover:bg-cream"
          >
            Запази облачните
          </button>

          <button
            onClick={handleKeepLocal}
            className="bg-caramel text-white px-4 py-2 rounded hover:bg-cinnamon"
          >
            Запази локалните
          </button>
        </div>
      </div>
    </div>
  );
}
