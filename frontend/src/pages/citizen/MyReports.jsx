import { useEffect, useState } from "react";
import API from "../../services/apiClient";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";

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

  const normalizeStatus = (status) => {
    if (!status) return "pending";
    return status.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  };

  const formatStatusLabel = (status) => {
    const normalizedStatus = normalizeStatus(status);
    const labelMap = {
      pending: "Pending",
      verified: "Verified",
      assigned: "Assigned",
      assigned_driver: "Assigned Driver",
      in_progress: "In Progress",
      picked_up: "Picked Up",
      recycler_claimed: "Recycler Claimed",
      completed: "Completed",
      resolved: "Resolved",
      rejected: "Rejected",
    };

    return labelMap[normalizedStatus] || normalizedStatus.replace(/_/g, " ");
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case "pending":
        return "bg-slate-100 text-slate-700 dark:bg-gray-700/50 dark:text-gray-200";
      case "verified":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "assigned":
      case "assigned_driver":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
      case "in_progress":
      case "picked_up":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
      case "recycler_claimed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "completed":
      case "resolved":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "rejected":
        return "bg-slate-200 text-slate-700 dark:bg-gray-600/30 dark:text-gray-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-gray-700/50 dark:text-gray-200";
    }
  };

  const STATUS_PROGRESS = {
    pending: 0,
    verified: 20,
    assigned: 40,
    assigned_driver: 40,
    in_progress: 70,
    picked_up: 80,
    recycler_claimed: 85,
    completed: 100,
    resolved: 100,
    rejected: 0,
  };

  const getWasteTypeAccent = (wasteType) => {
    const normalizedType = String(wasteType || "").toLowerCase();
    if (normalizedType.includes("plastic")) return "border-blue-500 dark:border-blue-400";
    if (normalizedType.includes("organic")) return "border-emerald-500 dark:border-emerald-400";
    if (normalizedType.includes("electronic") || normalizedType.includes("e-waste"))
      return "border-red-500 dark:border-red-400";
    return "border-slate-300 dark:border-gray-700";
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
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <header className="sticky top-0 z-50 bg-white/80 border-b border-emerald-100 backdrop-blur-md dark:bg-black/90 dark:border-white/10">
        <div className="px-6 md:px-12 lg:px-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-semibold">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-700 dark:text-white/60">EcoTrack</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Citizen hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-white/70">
            <Link to="/dashboard" className="hover:text-gray-900 transition dark:hover:text-white">
              Dashboard
            </Link>
            <Link to="/report-issue" className="hover:text-gray-900 transition dark:hover:text-white">
              Report Waste
            </Link>
            <span className="text-gray-900 dark:text-white">My Reports</span>
          </nav>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              className="hidden md:block bg-white border border-slate-300 text-slate-900 text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <ThemeToggle />
            <button
              type="button"
              className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 transition dark:border-white/10 dark:text-white/70 dark:hover:text-white"
              aria-label="Settings"
            >
              S
            </button>
            <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold dark:bg-gray-800 dark:text-white">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-12 lg:px-20 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">My Reports</h1>
          <p className="text-sm text-slate-600 mt-2 dark:text-gray-400">
            Track your reported waste issues and their progress.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            You haven’t submitted any reports yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              (() => {
                const normalizedStatus = normalizeStatus(report.status);
                const progressPercent =
                  report.progress ?? report.completion ?? STATUS_PROGRESS[normalizedStatus] ?? 0;
                const progressValue = Math.min(100, Math.max(0, progressPercent));

                return (
              <div
                key={report._id}
                onClick={() => navigate(`/reports/${report._id}`)}
                className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:scale-[1.01] transition-all duration-300 cursor-pointer border-l-4 ${getWasteTypeAccent(
                  report.wasteType
                )} dark:bg-gray-900 dark:border-white/10 dark:shadow-none`}
              >
                <div className="relative">
                  {report.images && report.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/${report.images[0]}`}
                      alt="report"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500 text-sm dark:bg-gray-800 dark:text-gray-400">
                      No image available
                    </div>
                  )}

                  <span
                    className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full ${getStatusStyle(
                      report.status
                    )}`}
                  >
                    {formatStatusLabel(report.status)}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="text-lg font-semibold capitalize">
                    {report.wasteType}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {report.location?.address || "Unknown location"}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${getPriorityStyle(report.priority)}`}>
                      ⚡ {report.priority}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Completion Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {progressValue}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressValue === 100
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${progressValue}%` }}
                      />
                    </div>
                  </div>

                  {/* Completion Message */}
                  {(normalizedStatus === "resolved" || normalizedStatus === "completed") && progressValue === 100 && (
                    <div className="bg-green-500/10 border border-green-500/40 rounded-lg p-2 mt-2">
                      <p className="text-xs text-green-700 font-medium dark:text-green-300">
                        ✓ The report was sorted and cleaned
                      </p>
                    </div>
                  )}
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReports;