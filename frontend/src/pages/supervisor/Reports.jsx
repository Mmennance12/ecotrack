import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/apiClient";
import SupervisorSidebar from "./components/SupervisorSidebar";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const stats = useMemo(() => {
    return {
      resolved: reports.filter((r) => r.status === "resolved").length,
      assigned: reports.filter((r) => r.status === "assigned").length,
      in_progress: reports.filter((r) => r.status === "in_progress").length,
      rejected: reports.filter((r) => r.status === "rejected").length,
      pending: reports.filter((r) => r.status === "pending").length,
    };
  }, [reports]);

  const getStatusStyle = (status) => {
    const styles = {
      resolved: "bg-green-100 text-green-700",
      assigned: "bg-blue-100 text-blue-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
      pending: "bg-gray-100 text-gray-700",
      verified: "bg-purple-100 text-purple-700",
      government_assigned: "bg-indigo-100 text-indigo-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getWasteTypeColor = (wasteType) => {
    const wasteTypeStr = String(wasteType || "").toLowerCase();
    if (wasteTypeStr.includes("plastic")) return "bg-blue-500";
    if (
      wasteTypeStr.includes("e-waste") ||
      wasteTypeStr.includes("electronic")
    )
      return "bg-purple-500";
    if (wasteTypeStr.includes("illegal") || wasteTypeStr.includes("dump"))
      return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SupervisorSidebar />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">All submitted reports</p>
        </header>

        <main className="px-6 py-6">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                Resolved
              </p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {stats.resolved}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                Assigned
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {stats.assigned}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide">
                In Progress
              </p>
              <p className="text-2xl font-bold text-yellow-700 mt-2">
                {stats.in_progress}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">
                Rejected
              </p>
              <p className="text-2xl font-bold text-red-700 mt-2">
                {stats.rejected}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-700 mt-2">
                {stats.pending}
              </p>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Reports Overview
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4">Type</th>
                    <th className="text-left px-6 py-4">Location</th>
                    <th className="text-left px-6 py-4">Date</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-right px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        className="px-6 py-6 text-gray-500 text-center"
                        colSpan={5}
                      >
                        Loading reports...
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td
                        className="px-6 py-6 text-gray-500 text-center"
                        colSpan={5}
                      >
                        No reports available.
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr
                        key={report._id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                      >
                        {/* Type with Color Indicator */}
                        <td className="px-6 py-4 font-medium text-gray-800">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-3 h-3 rounded-full ${getWasteTypeColor(report.wasteType)}`}
                            ></span>
                            <span className="capitalize">
                              {report.wasteType || "Unknown"}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 text-gray-600">
                          {report.location?.address || "-"}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-gray-500">
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(report.status)}`}
                          >
                            {report.status === "resolved"
                              ? "Resolved"
                              : report.status === "government_assigned"
                              ? "Gov Assigned"
                              : report.status || "Pending"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/supervisor/reports/${report._id}`}
                            className="px-3 py-1 text-sm bg-green-50 text-green-600 font-semibold rounded-md hover:bg-green-100 transition"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Reports;
