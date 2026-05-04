import { useEffect, useState } from "react";
import API from "../../services/apiClient";

const mapApiStatusToLabel = (status) => {
  if (status === "completed") return "Completed";
  if (status === "picked_up") return "Picked Up";
  if (status === "in_progress") return "On the Way";
  return "Assigned";
};

const formatDuration = (minutes) => {
  if (minutes == null) return "--";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "--";
  return new Date(dateValue).toLocaleDateString();
};

const formatTime = (dateValue) => {
  if (!dateValue) return "--";
  return new Date(dateValue).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function History() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/reports/driver/assigned");
        const completed = res.data
          .filter((report) => report.status === "completed")
          .map((report) => {
            const createdAt = report.createdAt
              ? new Date(report.createdAt)
              : null;
            const resolvedAt = report.resolvedAt
              ? new Date(report.resolvedAt)
              : report.updatedAt
              ? new Date(report.updatedAt)
              : null;
            const durationMinutes =
              createdAt && resolvedAt
                ? Math.max(
                    0,
                    Math.round((resolvedAt.getTime() - createdAt.getTime()) / 60000)
                  )
                : null;

            return {
              id: report._id,
              location: report.location?.address
                ? report.location.address
                : report.location
                ? `${report.location.latitude}, ${report.location.longitude}`
                : "Unknown location",
              wasteType: report.wasteType || "Unspecified",
              completedAt: resolvedAt || createdAt,
              durationMinutes,
              status: mapApiStatusToLabel(report.status),
            };
          });
        setCompletedTasks(completed);
        setSelectedTaskId(completed[0]?.id || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load task history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const totalTimeMinutes = completedTasks.reduce(
    (sum, task) => sum + (task.durationMinutes || 0),
    0
  );
  const totalDistanceKm = 0;
  const totalWasteKg = 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-emerald-50 to-transparent" />
        <div className="relative">
          <h1 className="text-2xl font-semibold text-gray-900">Task History</h1>
          <p className="text-sm text-gray-500">
            View your completed and past tasks.
          </p>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          className="text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
        >
          <p className="text-xs text-gray-500">Completed Tasks</p>
          <p className="text-2xl font-semibold text-gray-900">
            {completedTasks.length}
          </p>
        </button>
        <button
          type="button"
          className="text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
        >
          <p className="text-xs text-gray-500">Total Time Worked</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatDuration(totalTimeMinutes)}
          </p>
        </button>
        <button
          type="button"
          className="text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
        >
          <p className="text-xs text-gray-500">Distance Traveled</p>
          <p className="text-2xl font-semibold text-gray-900">
            {totalDistanceKm} km
          </p>
          <p className="text-xs text-gray-400">Tracking coming soon</p>
        </button>
        <button
          type="button"
          className="text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
        >
          <p className="text-xs text-gray-500">Waste Collected</p>
          <p className="text-2xl font-semibold text-gray-900">
            {totalWasteKg} kg
          </p>
          <p className="text-xs text-gray-400">Tracking coming soon</p>
        </button>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Completed Tasks
          </h2>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-gray-500">
            Loading history...
          </div>
        ) : completedTasks.length === 0 ? (
          <div className="px-6 py-10 text-sm text-gray-500">
            No completed tasks yet.
          </div>
        ) : (
          <div>
            <div className="hidden md:grid grid-cols-12 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <div className="col-span-2">Task ID</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-2">Waste Type</div>
              <div className="col-span-2">Completed On</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-1">Status</div>
            </div>

            <div className="divide-y divide-gray-100">
              {completedTasks.map((task) => {
                const isSelected = task.id === selectedTaskId;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`w-full text-left grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-4 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 ${
                      isSelected ? "bg-green-50" : "bg-white"
                    }`}
                  >
                    <div className="md:col-span-2 text-sm font-semibold text-gray-900">
                      {task.id}
                    </div>
                    <div className="md:col-span-3 text-sm text-gray-700">
                      <div className="font-medium text-gray-800">
                        {task.location}
                      </div>
                      <div className="text-xs text-gray-400">Reported location</div>
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-700 capitalize">
                      {task.wasteType}
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-700">
                      <div>{formatDate(task.completedAt)}</div>
                      <div className="text-xs text-gray-400">
                        {formatTime(task.completedAt)}
                      </div>
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-700">
                      {formatDuration(task.durationMinutes)}
                    </div>
                    <div className="md:col-span-1">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {task.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 text-center text-xs text-gray-400">
              You have reached the end. Great job!
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default History;
