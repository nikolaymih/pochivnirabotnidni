export default function Legend() {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Легенда</h3>
      <div className="space-y-2">
        {/* 1. Official Holiday */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cinnamon rounded"></div>
          <span className="text-sm">Официален празник</span>
        </div>
        {/* 2. Personal Vacation */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-vacation-bg border border-latte rounded"></div>
          <span className="text-sm">Отпуска</span>
        </div>
        {/* 3. Bridge Day Suggestion */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-bridge-bg border border-latte rounded"></div>
          <span className="text-sm">Предложение за почивка</span>
        </div>
        {/* 4. School Holidays */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-school-bg border border-teal rounded"></div>
          <span className="text-sm">Неучебни дни / Ученически ваканции</span>
        </div>
        {/* 5. Weekend */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cream border border-latte rounded"></div>
          <span className="text-sm">Уикенд</span>
        </div>
        {/* 6. Today */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-caramel rounded"></div>
          <span className="text-sm">Текущ ден</span>
        </div>
      </div>
    </div>
  );
}
