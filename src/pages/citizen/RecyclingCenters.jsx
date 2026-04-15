function RecyclingCenters() {
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Recycling Centers
        </h1>
        <p className="text-sm text-gray-500">
          Find nearby recycling and waste collection centers available in your area.
        </p>
      </div>

      {/* Search (UI only for now) */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search by location or center name..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Centers list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Empty state */}
        <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
          No recycling centers available at the moment.
        </div>

      </div>

    </div>
  );
}

export default RecyclingCenters;
