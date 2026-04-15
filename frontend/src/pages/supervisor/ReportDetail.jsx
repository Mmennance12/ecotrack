import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/apiClient";
import SupervisorSidebar from "./components/SupervisorSidebar";
import DriverSelectModal from "./components/DriverSelectModal";

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/reports/${id}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to verify this report?"
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await API.put(`/reports/${id}/status`, { status: "verified" });
      toast.success("Report verified successfully");
      fetchReport();
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this report?"
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await API.put(`/reports/${id}/status`, {
        status: "rejected",
        reason: comment || "No reason provided",
      });
      toast.success("Report rejected");
      navigate("/supervisor/reports");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject report");
    } finally {
      setActionLoading(false);
    }
  };

  // Haversine formula for distance calculation
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
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

  const handleAssignDriver = async (driverId) => {
    try {
      setActionLoading(true);

      // Step 1: If report is pending, verify it first
      if (report.status === "pending") {
        await API.put(`/reports/${id}/status`, {
          status: "verified",
        });
      }

      // Step 2: Assign the driver
      await API.patch(`/reports/${id}/assign-driver`, {
        driverId,
      });
      toast.success("Driver assigned successfully");
      setShowDriverModal(false);
      fetchReport();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign driver");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SupervisorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SupervisorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Report not found</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    if (!priority) return "bg-gray-100 text-gray-700";
    const priorityLower = priority.toLowerCase();
    if (priorityLower === "high") return "bg-red-100 text-red-700";
    if (priorityLower === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower === "pending") return "bg-gray-200 text-gray-700";
    if (statusLower === "verified") return "bg-purple-100 text-purple-700";
    if (statusLower === "assigned") return "bg-blue-100 text-blue-700";
    if (statusLower === "rejected") return "bg-red-100 text-red-700";
    if (statusLower === "resolved") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SupervisorSidebar />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => navigate("/supervisor/reports")}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            ← Back to Reports
          </button>
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {report.wasteType || "Report"}
            </h1>
            <div className="flex gap-2">
              {report.priority && (
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}
                >
                  {report.priority}
                </span>
              )}
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}
              >
                {report.status || "Pending"}
              </span>
            </div>
          </div>
        </header>

        <main className="px-6 py-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              disabled={actionLoading || report.status === "verified"}
              onClick={handleVerify}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {actionLoading ? "Processing..." : "✓ Verify"}
            </button>

            <button
              disabled={actionLoading || report.status === "assigned"}
              onClick={() => setShowDriverModal(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {actionLoading ? "Processing..." : "🚛 Assign to Driver"}
            </button>

            <button
              disabled={actionLoading || report.status === "rejected"}
              onClick={handleReject}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {actionLoading ? "Processing..." : "✕ Reject"}
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Details */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Details
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {report.wasteType || "Unknown Type"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {report.location?.address || "Unknown Location"}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {report.description || "No description provided"}
                  </p>
                </div>

                {report.reporter && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Reported By
                    </h3>
                    <p className="text-gray-700">
                      {report.reporter.name || "Anonymous"}
                    </p>
                    {report.reporter.phone && (
                      <p className="text-sm text-gray-500">
                        {report.reporter.phone}
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-400">
                    Report ID: {report._id}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created:{" "}
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Comment Input */}
                {report.status === "pending" && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Add Comment (for rejection)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Image + History */}
            <div className="space-y-6">
              {/* Image */}
              {report.images && report.images.length > 0 ? (
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Image</h3>
                  <img
                    src={`http://localhost:5000/${report.images[0]}`}
                    alt="Report"
                    className="rounded-lg w-full h-48 object-cover hover:scale-105 transition"
                  />
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Image</h3>
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    No image
                  </div>
                </div>
              )}

              {/* History */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">History</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✔</span>
                    <span>Report submitted</span>
                  </div>
                  {report.status === "verified" && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <span>Report verified</span>
                    </div>
                  )}
                  {report.status === "assigned" && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚛</span>
                      <span>Driver assigned</span>
                    </div>
                  )}
                  {report.status === "rejected" && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✕</span>
                      <span>Report rejected</span>
                    </div>
                  )}
                  {report.status === "resolved" && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <span>Report resolved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Driver Selection Modal */}
      {showDriverModal && (
        <DriverSelectModal
          reportLocation={report?.location}
          onAssign={handleAssignDriver}
          onClose={() => setShowDriverModal(false)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}

export default ReportDetail;
