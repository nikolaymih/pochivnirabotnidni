export default function Legend() {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Легенда</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cinnamon rounded"></div>
          <span className="text-sm">Официален празник</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cream border border-latte rounded"></div>
          <span className="text-sm">Уикенд</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-caramel rounded"></div>
          <span className="text-sm">Днес</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-vacation-bg border border-latte rounded"></div>
          <span className="text-sm">Лична почивка</span>
        </div>
      </div>
    </div>
  );
}
