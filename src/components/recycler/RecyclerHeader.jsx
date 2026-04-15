function RecyclerHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-green-600 rounded"></div>
        <h1 className="text-lg font-semibold text-gray-800">
          EcoTrack
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        
        <span className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
          🔔
        </span>

        <div className="w-8 h-8 bg-green-600 text-white flex items-center justify-center rounded-full font-bold">
          U
        </div>

        <button className="text-sm text-red-500 hover:underline">
          Logout
        </button>

      </div>
    </header>
  );
}

export default RecyclerHeader;