export default function Legend() {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Legend</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded"></div>
          <span className="text-sm">Official Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border rounded"></div>
          <span className="text-sm">Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 rounded"></div>
          <span className="text-sm">Today</span>
        </div>
      </div>
    </div>
  );
}
