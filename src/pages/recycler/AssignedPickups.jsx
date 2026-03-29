import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/apiClient";

function AssignedPickups() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchReports = async () => {
  try {
    const res = await API.get("/reports/my-assigned");

    // 🔥 FIX: handle both formats
    const data = Array.isArray(res.data)
      ? res.data
      : res.data.data || [];

    setPickups(data);

  } catch (err) {
    console.error("FETCH ERROR:", err);
    setPickups([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchReports();
  }, []);

  // 🔥 TOAST FUNCTION
  const showToast = (text, type = "success") => {
    setToast({ text, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // 🔥 START
  const handleStart = async (e, id) => {
    e.preventDefault();
    setActionLoading(id);

    try {
      await API.put(`/reports/${id}/start`);
      showToast("Pickup started");
      fetchReports();
    } catch (err) {
      console.error("Start error:", err);
      showToast("Error starting pickup", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔥 COMPLETE
  const handleComplete = async (e, id) => {
    e.preventDefault();
    setActionLoading(id);

    try {
      await API.put(`/reports/${id}/resolve`);
      showToast("Pickup completed");
      fetchReports();
    } catch (err) {
      console.error("Complete error:", err);
      showToast("Error completing pickup", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading assigned pickups...</p>;
  }

  return (
    <div className="space-y-6">

      {/* 🔥 PROFESSIONAL TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span>
              {toast.type === "success" ? "✅" : "❌"}
            </span>
            {toast.text}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Assigned Pickups
        </h1>
        <p className="text-sm text-gray-500">
          Manage and complete your assigned waste collections.
        </p>
      </div>

      {/* CONTENT */}
      {pickups.length === 0 ? (
        <p className="text-gray-500">No assigned pickups.</p>
      ) : (
        <div className="space-y-4">
          {pickups.map((pickup) => {

            const statusStyles =
              pickup.status === "resolved"
                ? "bg-green-100 text-green-700"
                : pickup.status === "in-progress"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700";

            const isLoading = actionLoading === pickup._id;

            return (
              <Link
                key={pickup._id}
                to={`/recycler/pickup/${pickup._id}`}
                className="block bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition border"
              >
                <div className="flex justify-between items-start">

                  {/* LEFT */}
                  <div className="space-y-1">
                    <h2 className="font-semibold text-lg text-gray-800 capitalize">
                      {pickup.wasteType}
                    </h2>

                    <p className="text-sm text-gray-600">
                      {pickup.description}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      📍 {pickup.location?.address}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles}`}
                  >
                    {pickup.status}
                  </span>
                </div>

                {/* FOOTER */}
                <div className="mt-4 flex justify-between items-center">

                  <span className="text-xs text-gray-400">
                    {pickup.createdAt
                      ? new Date(pickup.createdAt).toLocaleDateString()
                      : ""}
                  </span>

                  <div className="flex gap-2">

                    {pickup.status === "assigned" && (
                      <button
                        onClick={(e) => handleStart(e, pickup._id)}
                        disabled={isLoading}
                        className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {isLoading ? "Starting..." : "Start"}
                      </button>
                    )}

                    {pickup.status === "in-progress" && (
                      <button
                        onClick={(e) => handleComplete(e, pickup._id)}
                        disabled={isLoading}
                        className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {isLoading ? "Completing..." : "Complete"}
                      </button>
                    )}

                    <span className="text-green-600 text-xs font-medium ml-2">
                      View →
                    </span>

                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AssignedPickups;