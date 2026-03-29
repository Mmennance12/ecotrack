import { useEffect, useState } from "react";
import API from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

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
        return "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200";
      case "verified":
        return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
      case "assigned":
        return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
      case "in_progress":
        return "bg-purple-100 text-purple-700 ring-1 ring-purple-200";
      case "resolved":
        return "bg-green-100 text-green-700 ring-1 ring-green-200";
      default:
        return "bg-gray-100 text-gray-700";
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
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          My Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your reported waste issues and their progress.
        </p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          🚮 You haven’t submitted any reports yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {reports.map((report) => (
            <div
              key={report._id}
              onClick={() => navigate(`/reports/${report._id}`)}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
            >

              {/* IMAGE */}
              <div className="relative overflow-hidden">
                {report.images && report.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000/${report.images[0]}`}
                    alt="report"
                    className="w-full h-44 object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No image available
                  </div>
                )}

                {/* STATUS BADGE (FLOATING) */}
                <span
                  className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-medium backdrop-blur ${getStatusStyle(
                    report.status
                  )}`}
                >
                  {report.status.replace("_", " ")}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-2">

                {/* TITLE */}
                <h3 className="font-semibold text-gray-800 capitalize text-lg">
                  {report.wasteType}
                </h3>

                {/* LOCATION */}
                <p className="text-sm text-gray-500">
                  📍 {report.location?.address || "Unknown location"}
                </p>

                {/* FOOTER */}
                <div className="flex justify-between items-center pt-2 text-xs">

                  {/* PRIORITY */}
                  <span className={`font-medium ${getPriorityStyle(report.priority)}`}>
                    ⚡ {report.priority}
                  </span>

                  {/* DATE */}
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
  );
}

export default MyReports;