import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../services/apiClient";

function PickupDetails() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const status = pickup?.status || "verified";
  const priority = pickup?.priority || "medium";

  const isActive = (path) => location.pathname === path;

  const statusBadge = useMemo(() => {
    if (status === "assigned") return "bg-blue-100 text-blue-700";
    if (status === "in_progress") return "bg-orange-100 text-orange-700";
    if (status === "resolved") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  }, [status]);

  const priorityBadge = useMemo(() => {
    if (priority === "high") return "bg-red-100 text-red-600";
    if (priority === "low") return "bg-green-100 text-green-600";
    return "bg-yellow-100 text-yellow-600";
  }, [priority]);

  const statusLabel = useMemo(() => {
    if (status === "assigned") return "Assigned";
    if (status === "in_progress") return "In Progress";
    if (status === "resolved") return "Completed";
    return "Available";
  }, [status]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-500">Loading pickup...</p>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-500">Pickup not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-semibold">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500">EcoTrack</p>
              <p className="text-base font-semibold text-gray-800">Recycler Hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              to="/recycler/dashboard"
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                isActive("/recycler/dashboard")
                  ? "bg-green-500 text-white font-semibold"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-100"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/recycler/pickups"
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                isActive("/recycler/pickups")
                  ? "bg-green-500 text-white font-semibold"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-100"
              }`}
            >
              Pickups
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search pickups..."
            className="hidden md:block bg-gray-100 text-gray-800 text-sm rounded-full px-4 py-2 outline-none"
          />
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
            R
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2 rounded-full hover:border-gray-400 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="min-h-screen bg-green-50 px-6 md:px-12 lg:px-20 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 capitalize">
              {pickup.wasteType || "Waste"} Waste
            </h1>
            <p className="text-sm text-gray-500">
              📍 {pickup.location?.address || "Machakos"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge}`}>
              {statusLabel}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityBadge}`}>
              {priority}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mt-6">
          <section className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Incident Details</h2>

              <div className="flex items-start gap-3 py-3 border-b">
                <span className="text-lg">🍃</span>
                <div>
                  <p className="text-sm text-gray-500">Waste Type</p>
                  <p className="text-gray-800 font-medium capitalize">
                    {pickup.wasteType || "Waste"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3 border-b">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-800 font-medium">
                    {pickup.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3 border-b">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-800 font-medium">
                    {pickup.location?.address || "Machakos"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3">
                <span className="text-lg">🗓️</span>
                <div>
                  <p className="text-sm text-gray-500">Date Reported</p>
                  <p className="text-gray-800 font-medium">
                    {pickup.createdAt
                      ? new Date(pickup.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-800">Actions</h2>

              {status === "verified" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleAssign}
                  className="bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-60"
                >
                  {actionLoading ? "Assigning..." : "Assign to Me"}
                </button>
              )}

              {status === "assigned" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleStart}
                  className="bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-60"
                >
                  {actionLoading ? "Starting..." : "Start Pickup"}
                </button>
              )}

              {status === "in_progress" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleComplete}
                  className="bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-60"
                >
                  {actionLoading ? "Completing..." : "Complete Pickup"}
                </button>
              )}

              {status === "resolved" && (
                <button
                  type="button"
                  onClick={() => navigate("/recycler/pickups")}
                  className="bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition"
                >
                  View Pickups
                </button>
              )}

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-medium text-gray-800">{statusLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Priority</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {priority}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Instructions</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Head to the pickup location, collect the waste, and update status during the process.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PickupDetails;