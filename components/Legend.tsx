export default function Legend() {
  return (
    <div className="border border-latte rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold mb-3">Легенда</h3>
      <div className="space-y-2">
        {/* 1. Official Holiday */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 min-w-6 min-h-6 shrink-0 bg-cinnamon border border-cinnamon rounded"></div>
          <span className="text-sm">Официален празник</span>
        </div>
        {/* 2. Personal Vacation */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 min-w-6 min-h-6 shrink-0 bg-vacation-bg rounded"></div>
          <span className="text-sm">Отпуска</span>
        </div>
        {/* 3. Bridge Day Suggestion */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 min-w-6 min-h-6 shrink-0 border-2 border-vacation bg-transparent rounded"></div>
          <span className="text-sm">Предложение за почивка</span>
        </div>
        {/* 4. School Holidays */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 min-w-6 min-h-6 shrink-0 bg-school-bg rounded"></div>
          <span className="text-sm">Неучебни дни / Ученически ваканции</span>
        </div>
        {/* 5. Weekend */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 min-w-6 min-h-6 shrink-0 bg-cream rounded"></div>
          <span className="text-sm">Уикенд</span>
        </div>
      </div>
    </div>
  );
}
