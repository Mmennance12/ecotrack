import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../services/apiClient";
import ThemeToggle from "../../components/ThemeToggle";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [reports, setReports] = useState([]); // ✅ NEW

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const reportsRes = await API.get("/reports");

        if (Array.isArray(reportsRes.data)) {
          setReports(reportsRes.data);
        } else {
          console.warn("Reports is not an array");
          setReports([]);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Helper function to format time difference
  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "Recently";
    
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // Format as date for older reports
    return created.toLocaleDateString();
  };

  const normalizeStatus = (status) => {
    if (!status) return "pending";
    return status.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  };

  const formatStatusLabel = (status) => {
    const normalizedStatus = normalizeStatus(status);
    const labelMap = {
      pending: "PENDING",
      assigned: "ASSIGNED",
      assigned_driver: "ASSIGNED",
      in_progress: "IN PROGRESS",
      picked_up: "PICKED UP",
      recycler_claimed: "RECYCLER CLAIMED",
      completed: "COMPLETED",
      resolved: "RESOLVED",
      rejected: "REJECTED",
    };

    return labelMap[normalizedStatus] || normalizedStatus.replace(/_/g, " ").toUpperCase();
  };

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = normalizeStatus(status);

    switch (normalizedStatus) {
      case "resolved":
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "assigned":
      case "assigned_driver":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
      case "in_progress":
      case "picked_up":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
      case "recycler_claimed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "rejected":
        return "bg-slate-200 text-slate-700 dark:bg-gray-600/30 dark:text-gray-200";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-gray-700/40 dark:text-gray-200";
    }
  };

  const reportsData = useMemo(() => {
    return reports.map((report, index) => {
      const wasteType = report.wasteType || "E-Waste";
      const normalizedType = wasteType.toLowerCase();
      let type = "trash";

      if (normalizedType.includes("plastic")) {
        type = "plastic";
      } else if (normalizedType.includes("electronic") || normalizedType.includes("e-waste")) {
        type = "electronic";
      } else if (normalizedType.includes("organic")) {
        type = "organic";
      }

      return {
        id: report._id || index,
        title: wasteType,
        location: report.location?.address || "Katoloni, Machakos",
        time: getTimeAgo(report.createdAt),
        status: formatStatusLabel(report.status),
        statusKey: normalizeStatus(report.status),
        type,
        image: report.images?.[0]
          ? `http://localhost:5000/${report.images[0]}`
          : null,
      };
    });
  }, [reports]);

  const getWasteTypeAccent = (type) => {
    switch (type) {
      case "plastic":
        return "border-blue-500 dark:border-blue-400";
      case "organic":
        return "border-emerald-500 dark:border-emerald-400";
      case "electronic":
        return "border-red-500 dark:border-red-400";
      default:
        return "border-slate-300 dark:border-gray-700";
    }
  };

  const filteredReports = useMemo(() => {
    return reportsData.filter((report) => {
      const matchesFilter = filter === "all" || report.type === filter;
      const matchesSearch =
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.location.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, search, reportsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-black dark:text-white">
      <header className="bg-white/80 border-b border-emerald-100 backdrop-blur-md dark:bg-gray-900/95 dark:border-white/10">
        <div className="px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xl font-semibold tracking-tight text-emerald-700">EcoTrack</div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-900/70">Citizen Hub</div>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-white/80">
            <span className="text-gray-900 dark:text-white">Dashboard</span>
            <Link to="/report-issue" className="hover:text-gray-900 transition dark:hover:text-white">
              Report Waste
            </Link>
            <Link to="/my-reports" className="hover:text-gray-900 transition dark:hover:text-white">
              My Reports
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="hidden md:block bg-white/90 border border-slate-300 text-slate-900 text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300 dark:bg-gray-800/90 dark:border-gray-700 dark:text-white"
            />
            <ThemeToggle />
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="text-sm font-semibold px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:border-slate-400 transition dark:border-white/20 dark:text-white/90 dark:hover:border-white/50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-72px)]">
        <section className="w-full lg:w-[30%] bg-white p-4 lg:p-6 overflow-y-auto transition-colors duration-300 dark:bg-gray-900">
          <div className="mb-4">
            <p className="text-emerald-600 uppercase text-xs tracking-widest dark:text-green-400">
              Live Map Panel
            </p>
            <h2 className="text-xl font-semibold text-slate-900 mt-1 dark:text-white">
              Current Reports
            </h2>
          </div>

          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-full px-4 py-2 outline-none mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: "All", value: "all" },
              { label: "Trash", value: "trash" },
              { label: "Plastic", value: "plastic" },
              { label: "Electronic", value: "electronic" },
              { label: "Organic", value: "organic" },
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                type="button"
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-1 rounded-full text-xs transition ${
                  filter === filterOption.value
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm text-slate-600 mb-2 dark:text-gray-400">
            <span>Report List</span>
            <span>{filteredReports.length} items</span>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <p className="text-slate-600 text-sm dark:text-gray-400">No reports found</p>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className={`bg-white border border-slate-200 rounded-xl p-3 flex gap-3 items-center shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:scale-[1.01] hover:bg-slate-50 transition-all cursor-pointer border-l-4 ${getWasteTypeAccent(
                    report.type
                  )} dark:bg-gray-800 dark:border-gray-700 dark:shadow-none dark:hover:bg-gray-700`}
                >
                  <div className="h-12 w-12 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center text-xs text-slate-500 dark:bg-gray-700 dark:text-white/60">
                    {report.image ? (
                      <img
                        src={report.image}
                        alt={report.title || "Report"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "IMG"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {report.title || "E-Waste"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 dark:text-white/60">
                      {report.location || "Katoloni, Machakos"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 dark:text-white/40">{report.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(report.statusKey)}`}>
                    {report.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="w-full lg:w-[70%] bg-slate-100 relative transition-colors duration-300 dark:bg-black">
          <div className="absolute top-4 left-4 right-4 z-[400]">
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full bg-white/90 border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800/90 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="absolute top-4 right-4 z-[400] mt-12">
            <div className="bg-white/90 border border-slate-200 text-xs text-slate-600 rounded-lg px-3 py-2 space-y-1 dark:bg-gray-900/90 dark:border-gray-700 dark:text-white/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Clogged</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>Resolved</span>
              </div>
            </div>
          </div>

          <div className="h-[70vh] lg:h-full">
            <MapContainer
              center={[-1.5177, 37.2634]}
              zoom={15}
              minZoom={13}
              maxZoom={18}
              maxBounds={[
                [-1.565, 37.215],
                [-1.485, 37.325],
              ]}
              maxBoundsViscosity={1.0}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {reports.map((report) => {
                const lat = report.location?.latitude;
                const lng = report.location?.longitude;

                if (lat == null || lng == null) return null;

                const isResolved = report.status === "resolved";

                return (
                  <CircleMarker
                    key={report._id}
                    center={[lat, lng]}
                    radius={11}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 2,
                      fillColor: isResolved ? "#22c55e" : "#ef4444",
                      fillOpacity: 0.9,
                    }}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <strong>{report.wasteType || "Waste Report"}</strong>
                        <p>{report.location?.address || "Machakos"}</p>
                        <p>Status: {isResolved ? "Resolved" : "Clogged"}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </section>
      </main>

      <button
        onClick={() => navigate("/report-issue")}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-300 z-50"
      >
        + Report Waste
      </button>
    </div>
  );
}

export default Dashboard;