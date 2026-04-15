import { useEffect, useState } from "react";
import API from "../../services/apiClient";
import { Link, useNavigate } from "react-router-dom";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports/my");
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300";
      case "verified":
        return "bg-green-500/20 text-green-300";
      case "assigned":
        return "bg-orange-500/20 text-orange-300";
      case "in_progress":
        return "bg-purple-500/20 text-purple-300";
      case "resolved":
        return "bg-emerald-500/20 text-emerald-300";
      default:
        return "bg-gray-700/50 text-gray-200";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 bg-black/90 border-b border-white/10">
        <div className="px-6 md:px-12 lg:px-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-semibold">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-white/60">EcoTrack</p>
              <p className="text-base font-semibold">Citizen hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-white/70">
            <Link to="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <Link to="/report-issue" className="hover:text-white transition">
              Report Waste
            </Link>
            <span className="text-white">My Reports</span>
          </nav>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              className="hidden md:block bg-gray-800 text-white text-sm rounded-full px-4 py-2 outline-none"
            />
            <button
              type="button"
              className="h-9 w-9 rounded-full border border-white/10 text-white/70 hover:text-white transition"
              aria-label="Settings"
            >
              S
            </button>
            <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-12 lg:px-20 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">My Reports</h1>
          <p className="text-sm text-gray-300 mt-2">
            Track your reported waste issues and their progress.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            You haven’t submitted any reports yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report._id}
                onClick={() => navigate(`/reports/${report._id}`)}
                className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="relative">
                  {report.images && report.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/${report.images[0]}`}
                      alt="report"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                      No image available
                    </div>
                  )}

                  <span
                    className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full ${getStatusStyle(
                      report.status
                    )}`}
                  >
                    {report.status.replace("_", " ")}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold capitalize">
                    {report.wasteType}
                  </h3>
                  <p className="text-sm text-gray-400">
                    📍 {report.location?.address || "Unknown location"}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${getPriorityStyle(report.priority)}`}>
                      ⚡ {report.priority}
                    </span>
                    <span className="text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReports;