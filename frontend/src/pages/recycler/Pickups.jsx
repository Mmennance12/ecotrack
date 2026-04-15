import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../../services/apiClient";

const FILTERS = ["All", "Available", "Assigned", "In Progress", "Completed"];

const STATUS_BADGES = {
  verified: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
};

const URGENCY_BADGES = {
  high: "bg-red-100 text-red-600",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-green-100 text-green-600",
};

function Pickups() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchPickups = async () => {
    try {
      const res = await API.get("/reports");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      const merged = data.filter((report) =>
        ["verified", "assigned", "in_progress", "resolved"].includes(
          report.status
        )
      );
      setPickups(merged);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setPickups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const isActive = (path) => location.pathname === path;

  const filteredPickups = useMemo(() => {
    const statusMap = {
      Available: "verified",
      Assigned: "assigned",
      "In Progress": "in_progress",
      Completed: "resolved",
    };

    return pickups.filter((pickup) => {
      const matchesSearch =
        pickup.wasteType?.toLowerCase().includes(search.toLowerCase()) ||
        pickup.location?.address?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "All") return true;
      return pickup.status === statusMap[activeFilter];
    });
  }, [pickups, activeFilter, search]);

  const sortedPickups = useMemo(() => {
    return [...filteredPickups].sort((a, b) => {
      const priorityRank = { high: 0, medium: 1, low: 2 };
      return (
        (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3)
      );
    });
  }, [filteredPickups]);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAssign = async (event, id) => {
    event.preventDefault();
    setActionLoading(id);

    try {
      await API.put(`/reports/${id}/assign`);
      showToast("Pickup assigned");
      fetchPickups();
    } catch (err) {
      console.error("Assign error:", err);
      showToast("Error assigning pickup", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (event, id) => {
    event.preventDefault();
    setActionLoading(id);

    try {
      await API.put(`/reports/${id}/start`);
      showToast("Pickup started");
      fetchPickups();
    } catch (err) {
      console.error("Start error:", err);
      showToast("Error starting pickup", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.text}
          </div>
        </div>
      )}

        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Pickups</h1>
          <p className="text-sm text-gray-500">
            View and manage all waste pickups
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mt-4">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1 rounded-full text-sm cursor-pointer transition ${
                activeFilter === filter
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-600 mt-8">Loading pickups...</p>
        ) : sortedPickups.length === 0 ? (
          <p className="text-gray-500 mt-8">No pickups available.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="hidden md:grid grid-cols-12 px-4 py-3 bg-green-100 text-sm font-semibold text-gray-700">
              <div className="col-span-3">Waste Type</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div>
              {sortedPickups.map((pickup) => {
                const urgency = pickup.priority || "medium";
                const status = pickup.status;
                const isLoading = actionLoading === pickup._id;
                const statusLabel =
                  status === "verified"
                    ? "Available"
                    : status === "resolved"
                    ? "Completed"
                    : status.replace("_", " ");

                return (
                  <div
                    key={pickup._id}
                    className="grid grid-cols-1 md:grid-cols-12 px-4 py-4 border-t items-center hover:bg-green-50 transition cursor-pointer gap-3"
                    onClick={() => navigate(`/recycler/pickup/${pickup._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        navigate(`/recycler/pickup/${pickup._id}`);
                      }
                    }}
                  >
                    <div className="md:col-span-3 font-semibold text-gray-800">
                      {pickup.wasteType || "Waste"}
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-600">
                      📍 {pickup.location?.address || "Machakos"}
                    </div>
                    <div className="md:col-span-3 text-sm text-gray-500 truncate">
                      {pickup.description || "No description provided."}
                    </div>
                    <div className="md:col-span-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          STATUS_BADGES[status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="md:col-span-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          URGENCY_BADGES[urgency] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {urgency}
                      </span>
                    </div>
                    <div className="md:col-span-1 md:text-right">
                      {status === "verified" && (
                        <button
                          type="button"
                          onClick={(event) => handleAssign(event, pickup._id)}
                          disabled={isLoading}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                          {isLoading ? "Assigning..." : "Assign"}
                        </button>
                      )}

                      {status === "assigned" && (
                        <button
                          type="button"
                          onClick={(event) => handleStart(event, pickup._id)}
                          disabled={isLoading}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                          {isLoading ? "Starting..." : "Start"}
                        </button>
                      )}

                      {status === "in_progress" && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/recycler/pickup/${pickup._id}`);
                          }}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                        >
                          Continue
                        </button>
                      )}

                      {status === "resolved" && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/recycler/pickup/${pickup._id}`);
                          }}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Pickups;
