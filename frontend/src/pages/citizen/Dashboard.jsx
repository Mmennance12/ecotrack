import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../services/apiClient";

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
        time: "20 hr ago",
        status: report.status === "resolved" ? "RESOLVED" : "LIVE",
        type,
        image: report.images?.[0]
          ? `http://localhost:5000/${report.images[0]}`
          : null,
      };
    });
  }, [reports]);

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
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900/95 border-b border-white/10">
        <div className="px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-semibold tracking-tight">EcoTrack</div>
          <nav className="flex items-center gap-6 text-sm font-medium text-white/80">
            <span className="text-white">Dashboard</span>
            <Link to="/report-issue" className="hover:text-white transition">
              Report Waste
            </Link>
            <Link to="/my-reports" className="hover:text-white transition">
              My Reports
            </Link>
          </nav>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
            className="text-sm font-semibold px-4 py-2 rounded-full border border-white/20 hover:border-white/50 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-72px)]">
        <section className="w-full lg:w-[30%] bg-gray-900 p-4 lg:p-6 overflow-y-auto">
          <div className="mb-4">
            <p className="text-green-400 uppercase text-xs tracking-widest">
              Live Map Panel
            </p>
            <h2 className="text-xl font-semibold text-white mt-1">
              Current Reports
            </h2>
          </div>

          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-gray-800 text-white rounded-full px-4 py-2 outline-none mb-4"
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
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
            <span>Report List</span>
            <span>{filteredReports.length} items</span>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <p className="text-gray-400 text-sm">No reports found</p>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className="bg-gray-800 rounded-xl p-3 flex gap-3 items-center hover:bg-gray-700 transition cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-md bg-gray-700 overflow-hidden flex items-center justify-center text-xs text-white/60">
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
                    <p className="text-sm font-semibold text-white">
                      {report.title || "E-Waste"}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {report.location || "Katoloni, Machakos"}
                    </p>
                    <p className="text-xs text-white/40 mt-1">{report.time}</p>
                  </div>
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                    {report.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="w-full lg:w-[70%] bg-black relative">
          <div className="absolute top-4 left-4 right-4 z-[400]">
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full bg-gray-800/90 text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="absolute top-4 right-4 z-[400] mt-12">
            <div className="bg-gray-900/90 text-xs text-white/80 rounded-lg px-3 py-2 space-y-1">
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
              zoom={13}
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
                    radius={8}
                    pathOptions={{
                      color: isResolved ? "#22c55e" : "#ef4444",
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
        className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 z-50"
      >
        + Report Waste
      </button>
    </div>
  );
}

export default Dashboard;