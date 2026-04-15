import { useEffect, useMemo, useState } from "react";
import API from "../../services/apiClient";
import SupervisorSidebar from "./components/SupervisorSidebar";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await API.get("/drivers");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setDrivers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || driver.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, filterStatus]);

  const getStatusStyle = (status) => {
    const styles = {
      available: "bg-green-100 text-green-700",
      busy: "bg-yellow-100 text-yellow-700",
      offline: "bg-gray-200 text-gray-600",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const getAvatarInitial = (name) => {
    return name?.charAt(0).toUpperCase() || "D";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SupervisorSidebar />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Drivers</h1>
          <p className="text-sm text-gray-500">All registered drivers</p>
        </header>

        <main className="px-6 py-6">
          {/* Search & Filter */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Search driver name, phone, or plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Drivers List */}
          {loading ? (
            <div className="text-sm text-gray-500">Loading drivers...</div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-sm text-gray-500">
              {drivers.length === 0
                ? "No drivers available."
                : "No drivers match your search."}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver._id}
                  className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition"
                >
                  {/* Left: Avatar + Name + Phone */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                      {getAvatarInitial(driver.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {driver.name || "Unnamed Driver"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {driver.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  {/* Vehicle (hidden on small screens) */}
                  <div className="hidden md:block text-sm text-gray-600 min-w-[150px] ml-4">
                    {driver.vehicleType} • {driver.plateNumber || "-"}
                  </div>

                  {/* Location (hidden on small screens) */}
                  <div className="hidden lg:block text-sm text-gray-600 min-w-[120px] ml-4">
                    {driver.area || "Unassigned"}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 sm:mt-0 ml-4 flex items-center gap-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(driver.status)}`}
                    >
                      {driver.status || "available"}
                    </span>

                    {/* Action Button */}
                    <button className="text-green-600 text-sm font-semibold hover:text-green-700 transition">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Drivers;
