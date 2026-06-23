'use client';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">Module en cours de développement</p>
      </div>
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1B2B5E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏨</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Module Inventory</h2>
          <p className="text-gray-500 text-sm">Ce module sera disponible prochainement.</p>
        </div>
      </div>
    </div>
  );
}
