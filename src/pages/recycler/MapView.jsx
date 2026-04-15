function RecyclerMapView() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Pickup Map
        </h1>
        <p className="text-sm text-gray-500">
          Visual view of assigned pickup locations.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap">
        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option>All waste types</option>
        </select>

        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option>All statuses</option>
        </select>
      </div>

      {/* Map placeholder */}
      <div className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">
          Pickup map coming soon
        </span>
      </div>

    </div>
  );
}

export default RecyclerMapView;
