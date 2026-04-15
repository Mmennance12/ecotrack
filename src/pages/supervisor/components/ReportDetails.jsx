import API from "../../../services/apiClient";
import toast from "react-hot-toast";
import { useState } from "react";

function ReportDetails({ report, refresh }) {
  const [loading, setLoading] = useState(false);

  if (!report) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-lg">
        Select a report to begin review
      </div>
    );
  }

  const handleAction = async (status) => {
    const confirm = window.confirm(`Are you sure you want to ${status}?`);

    if (!confirm) return;

    try {
      setLoading(true);

      await API.put(`/reports/${report._id}/status`, { status });

      toast.success(`Report ${status.replace("_", " ")}`);

      refresh();
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* 🔥 FOCUS HEADER */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          {report.wasteType}
        </h2>

        <div className="flex gap-2 mt-2">
          <span className="px-3 py-1 text-xs rounded-full bg-green-200 text-green-800">
            {report.status}
          </span>

          {report.priority && (
            <span className="px-3 py-1 text-xs rounded-full bg-red-200 text-red-800">
              {report.priority}
            </span>
          )}
        </div>
      </div>

      {/* 🔥 BODY */}
      <div className="space-y-5 text-gray-700">
        <p className="leading-relaxed">
          {report.description}
        </p>

        {report.images?.length > 0 && (
          <img
            src={`http://localhost:5000/${report.images[0]}`}
            alt="waste"
            className="w-full h-64 object-cover rounded-xl shadow-lg hover:scale-[1.02] transition"
          />
        )}

        <div className="text-sm text-gray-500">
          📍 {report.location?.address}
        </div>

        <div className="text-xs text-gray-400">
          ID: {report._id}
        </div>
      </div>

      {/* 🔥 ACTION BAR (STRONG VISUAL SEPARATION) */}
      <div className="mt-auto pt-6 border-t border-gray-200 flex gap-4">

        <button
          disabled={loading}
          onClick={() => handleAction("verified")}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium shadow-md transition-all hover:scale-105"
        >
          Verify
        </button>

        <button
          disabled={loading}
          onClick={() => handleAction("government_assigned")}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium shadow-md transition-all hover:scale-105"
        >
          Assign Gov
        </button>

        <button
          disabled={loading}
          onClick={() => handleAction("rejected")}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium shadow-md transition-all hover:scale-105"
        >
          Reject
        </button>

      </div>
    </div>
  );
}

export default ReportDetails;