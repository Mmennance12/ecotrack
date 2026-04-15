import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../services/apiClient";

const FILTERS = ["All", "Available", "Assigned", "In Progress", "Completed"];

const STATUS_LABELS = {
  verified: "Available",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Completed",
};

const STATUS_BADGES = {
  verified: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
};

const URGENCY_BADGES = {
  high: "bg-red-100 text-red-600",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-green-100 text-green-600",
};

const STATUS_DOT = {
  verified: "#22c55e",
  assigned: "#3b82f6",
  in_progress: "#f97316",
  resolved: "#16a34a",
};

function RecyclerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);

  const isActive = (path) => location.pathname === path;
  const isPickupsActive =
    location.pathname === "/recycler/pickups" ||
    location.pathname.startsWith("/recycler/pickup/");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];

        const usable = data.filter((report) =>
          ["verified", "assigned", "in_progress", "resolved"].includes(
            report.status
          )
        );
        setReports(usable);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.wasteType?.toLowerCase().includes(search.toLowerCase()) ||
        report.location?.address?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "All") return true;
      if (activeFilter === "Available") return report.status === "verified";
      if (activeFilter === "Assigned") return report.status === "assigned";
      if (activeFilter === "In Progress") return report.status === "in_progress";
      if (activeFilter === "Completed") return report.status === "resolved";

      return true;
    });
  }, [reports, activeFilter, search]);

  const mapCenter = [-1.5177, 37.2634];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAssign = async (reportId) => {
    try {
      setActionId(reportId);
      await API.put(`/reports/${reportId}/assign`);

      setReports((prev) =>
        prev.map((report) =>
          report._id === reportId
            ? { ...report, status: "assigned" }
            : report
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-semibold">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500">EcoTrack</p>
              <p className="text-base font-semibold text-gray-800">Recycler Hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              to="/recycler/dashboard"
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                isActive("/recycler/dashboard")
                  ? "bg-green-500 text-white font-semibold"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-100"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/recycler/pickups"
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                isPickupsActive
                  ? "bg-green-500 text-white font-semibold"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-100"
              }`}
            >
              Pickups
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search pickups..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="hidden md:block bg-gray-100 text-gray-800 text-sm rounded-full px-4 py-2 outline-none"
          />
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
            R
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2 rounded-full hover:border-gray-400 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="min-h-screen bg-green-50 px-0 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <section className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm h-[calc(100vh-120px)] overflow-y-auto">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">All Pickups</h2>
                <p className="text-sm text-gray-500">
                  Verified and assigned waste ready for collection
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition ${
                      activeFilter === filter
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="text-sm text-gray-500">Loading pickups...</p>
              ) : filteredReports.length === 0 ? (
                <p className="text-sm text-gray-500">No pickups found.</p>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => {
                    const urgency = report.priority || report.urgency || "medium";
                    const status = report.status;

                    return (
                      <div
                        key={report._id}
                        onClick={() => navigate(`/recycler/pickup/${report._id}`)}
                        className="bg-green-50 border border-green-100 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            navigate(`/recycler/pickup/${report._id}`);
                          }
                        }}
                      >
                        <div>
                          <p className="font-semibold text-gray-800 capitalize">
                            {report.wasteType || "Waste"}
                          </p>
                          <p className="text-sm text-gray-500">
                            📍 {report.location?.address || "Machakos"}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                STATUS_BADGES[status] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {STATUS_LABELS[status] || "Available"}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                URGENCY_BADGES[urgency] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {urgency}
                            </span>
                          </div>
                        </div>

                        {status === "verified" ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAssign(report._id);
                            }}
                            disabled={actionId === report._id}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-60"
                          >
                            {actionId === report._id ? "Assigning..." : "Assign to me"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/recycler/pickup/${report._id}`);
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm h-[calc(100vh-120px)] overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={12}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredReports.map((report) => {
                  const lat = report.location?.latitude;
                  const lng = report.location?.longitude;
                  if (!lat || !lng) return null;

                  const dotColor = STATUS_DOT[report.status] || "#22c55e";

                  return (
                    <CircleMarker
                      key={report._id}
                      center={[lat, lng]}
                      radius={7}
                      pathOptions={{ color: dotColor, fillColor: dotColor, fillOpacity: 0.9 }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-800 capitalize">
                            {report.wasteType || "Waste"}
                          </p>
                          <p className="text-gray-500">
                            {report.location?.address || "Machakos"}
                          </p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default RecyclerDashboard;