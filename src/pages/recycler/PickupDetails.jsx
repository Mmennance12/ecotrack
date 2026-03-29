import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/apiClient";

function PickupDetails() {
  const { id } = useParams();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPickup = async () => {
    try {
      // 🔥 FIX: fetch SINGLE report (not my-assigned)
      const res = await API.get(`/reports/${id}`);
      setPickup(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickup();
  }, [id]);

  // 🔥 NEW: ASSIGN FUNCTION
  const handleAssign = async () => {
    try {
      setActionLoading(true);
      await API.put(`/reports/${id}/assign`);
      await fetchPickup(); // refresh after assign
    } catch (err) {
      console.error("Assign error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setActionLoading(true);
      await API.put(`/reports/${id}/start`);
      await fetchPickup();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      await API.put(`/reports/${id}/resolve`);
      await fetchPickup();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!pickup) return <p className="p-6">Pickup not found.</p>;

  const status = pickup.status || "verified";

  const statusConfig = {
    verified: { color: "bg-gray-100 text-gray-700", label: "Available 📦" },
    assigned: { color: "bg-yellow-100 text-yellow-700", label: "Assigned ⏳" },
    "in-progress": { color: "bg-blue-100 text-blue-700", label: "In Progress 🚛" },
    resolved: { color: "bg-green-100 text-green-700", label: "Completed ✔" },
  };

  const currentStatus = statusConfig[status] || statusConfig["verified"];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Incident Case #{pickup._id?.slice(-6)}
          </h1>
          <p className="text-sm text-gray-500">
            {pickup.location?.address}
          </p>
        </div>

        <span className={`px-4 py-2 rounded-full text-sm font-medium ${currentStatus.color}`}>
          {currentStatus.label}
        </span>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* DETAILS */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow space-y-4">
          <p><strong>Waste Type:</strong> {pickup.wasteType}</p>
          <p><strong>Description:</strong> {pickup.description}</p>
          <p><strong>Location:</strong> {pickup.location?.address}</p>
          <p><strong>Priority:</strong> {pickup.priority}</p>
        </div>

        {/* ACTIONS */}
        <div className="bg-gray-50 p-6 rounded-xl shadow space-y-4">
          <h2 className="font-semibold">Actions</h2>

          {/* 🔥 NEW: ASSIGN BUTTON */}
          {status === "verified" && (
            <button
              disabled={actionLoading}
              onClick={handleAssign}
              className="w-full py-2 bg-green-600 text-white rounded"
            >
              Assign to Me
            </button>
          )}

          {status === "assigned" && (
            <button
              disabled={actionLoading}
              onClick={handleStart}
              className="w-full py-2 bg-blue-600 text-white rounded"
            >
              Start
            </button>
          )}

          {status === "in-progress" && (
            <button
              disabled={actionLoading}
              onClick={handleComplete}
              className="w-full py-2 bg-green-600 text-white rounded"
            >
              Complete
            </button>
          )}

          {status === "resolved" && (
            <p className="text-green-600">Completed</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default PickupDetails;