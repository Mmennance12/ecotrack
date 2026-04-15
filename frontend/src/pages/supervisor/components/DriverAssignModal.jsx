import { useEffect, useMemo, useState } from "react";
import API from "../../../services/apiClient";

function DriverSelectModal({ reportLocation, onAssign, onClose, isLoading }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/drivers");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (x) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Sort drivers: available first, then by distance
  const sortedDrivers = useMemo(() => {
    if (!reportLocation?.coordinates) return drivers;

    const [reportLon, reportLat] = reportLocation.coordinates;

    const driversWithDistance = drivers.map((driver) => {
      let distance = null;

      try {
        if (
          driver.location?.coordinates &&
          Array.isArray(driver.location.coordinates) &&
          driver.location.coordinates.length === 2
        ) {
          const [driverLon, driverLat] = driver.location.coordinates;

          if (
            typeof reportLat === "number" &&
            typeof reportLon === "number" &&
            typeof driverLat === "number" &&
            typeof driverLon === "number"
          ) {
            distance = getDistance(reportLat, reportLon, driverLat, driverLon);
          }
        }
      } catch (err) {
        console.error("Distance calculation error:", err);
      }

      return { ...driver, distance: distance ?? null };
    });

    return driversWithDistance.sort((a, b) => {
      if (a.status === "available" && b.status !== "available") return -1;
      if (b.status === "available" && a.status !== "available") return 1;

      if (typeof a.distance === "number" && typeof b.distance === "number") {
        return a.distance - b.distance;
      }

      if (typeof a.distance === "number") return -1;
      if (typeof b.distance === "number") return 1;

      return 0;
    });
  }, [drivers, reportLocation]);

  // Filter by search term
  const filteredDrivers = useMemo(() => {
    if (!searchTerm) return sortedDrivers;

    return sortedDrivers.filter(
      (driver) =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.area?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedDrivers, searchTerm]);

  const handleAssign = () => {
    if (!selectedDriver) return;
    onAssign(selectedDriver._id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Driver to Assign
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 px-6 py-4 shrink-0">
          <input
            type="text"
            placeholder="Search by name, phone, plate, or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Driver List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading drivers...</p>
          ) : filteredDrivers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? "No drivers match your search." : "No drivers available."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver._id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedDriver?._id === driver._id
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Avatar + Name + Details */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {driver.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {driver.vehicleType} • {driver.plateNumber}
                        </p>
                        {driver.phone && (
                          <p className="text-xs text-gray-500 truncate">
                            {driver.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Middle: Distance */}
                    {typeof driver.distance === "number" && driver.distance !== null ? (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-blue-600">
                          {driver.distance.toFixed(1)} km
                        </p>
                        <p className="text-xs text-gray-500">
                          {driver.area || "N/A"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="text-xs text-gray-400">Unknown</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          driver.status === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {driver.status === "available" ? "Available" : "Busy"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-4 shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedDriver || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Assigning..." : "Assign Selected Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverSelectModal;
