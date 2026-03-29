function SupervisorTopbar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      
      {/* LEFT */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          EcoTrack Supervisor
        </h1>
        <p className="text-sm text-gray-500">
          Waste Management Control Panel
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            Supervisor
          </p>
          <p className="text-xs text-gray-400">
            Logged in
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
          S
        </div>

      </div>
    </div>
  );
}

export default SupervisorTopbar;