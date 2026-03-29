import { useEffect, useState } from "react";
import API from "../../services/apiClient";

function RecyclerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/my-assigned");

      // 🔥 FIX: handle both response formats
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setReports(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 🔥 SAFE calculations
  const assigned = reports?.length || 0;
  const completed = reports?.filter(r => r.status === "resolved")?.length || 0;
  const pending = reports?.filter(r => r.status === "assigned")?.length || 0;

  // 🔥 SORT: urgent first
  const sortedReports = [...reports].sort((a, b) => {
    if (a.urgency === "high") return -1;
    if (b.urgency === "high") return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Track and manage your waste pickups efficiently
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat title="Assigned" value={assigned} color="green" />
        <Stat title="Completed" value={completed} color="emerald" />
        <Stat title="Pending" value={pending} color="yellow" />
      </div>

      {/* PERFORMANCE */}
      <div className="bg-white p-4 rounded-xl shadow-md text-sm text-gray-600 flex justify-between items-center">
        <span>
          {completed > 0
            ? `You’ve completed ${completed} pickups — keep it up`
            : "Start your first pickup to begin progress"}
        </span>

        <span className="text-green-600 font-medium">
          {assigned > 0 ? `${assigned} active` : ""}
        </span>
      </div>

      {/* ASSIGNED */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Assigned Pickups
        </h2>

        {reports.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No assigned pickups yet.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report) => {

              const statusColor =
                report.status === "resolved"
                  ? "bg-green-100 text-green-700"
                  : report.status === "in_progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700";

              const urgencyBadge =
                report.urgency === "high"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-500";

              return (
                <div
                  key={report._id}
                  className={`border rounded-xl p-4 flex justify-between items-center transition hover:shadow-md ${
                    report.urgency === "high"
                      ? "border-red-200 bg-red-50"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">
                      {report.wasteType}
                    </p>

                    <p className="text-sm text-gray-500">
                      📍 {report.location?.address}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${statusColor}`}>
                        {report.status}
                      </span>

                      <span className={`text-xs px-2 py-1 rounded ${urgencyBadge}`}>
                        {report.urgency || "normal"}
                      </span>
                    </div>
                  </div>

                  <span className="text-green-600 text-sm font-medium">
                    View →
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

/* STAT */
function Stat({ title, value, color }) {
  const styles = {
    green: "bg-green-100 text-green-700",
    emerald: "bg-emerald-100 text-emerald-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>

      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${styles[color]}`}>
        📊
      </div>
    </div>
  );
}

export default RecyclerDashboard;