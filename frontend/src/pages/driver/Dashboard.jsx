import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import API from "../../services/apiClient";

const STATUS_FLOW = ["Assigned", "On the Way", "Picked Up", "Completed"];

const toTitleCase = (value) => {
  if (!value) return "N/A";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const mapApiStatusToLabel = (status) => {
  if (status === "assigned_driver") return "Assigned";
  if (status === "in_progress") return "On the Way";
  if (status === "picked_up") return "Picked Up";
  if (status === "completed") return "Completed";
  return "Assigned";
};

const mapLabelToApiStatus = (label) => {
  if (label === "Assigned") return "assigned_driver";
  if (label === "On the Way") return "in_progress";
  if (label === "Picked Up") return "picked_up";
  if (label === "Completed") return "completed";
  return "assigned_driver";
};

const buildImageUrl = (path) => {
  if (!path) return null;
  return `http://localhost:5000/${path}`;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getStatusDotIcon = (status) => {
  const dotColor =
    status === "Completed"
      ? "#16a34a"
      : status === "Picked Up"
      ? "#f97316"
      : status === "On the Way"
      ? "#3b82f6"
      : "#64748b";

  const html = `
    <div style="
      width: 14px;
      height: 14px;
      background: ${dotColor};
      border: 2px solid #ffffff;
      border-radius: 9999px;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12);
    "></div>
  `;

  return new L.DivIcon({
    html,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });
};

const isValidCoordinate = (value) => typeof value === "number" && !Number.isNaN(value);

const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const getCoordinates = (location) => {
  if (!location) return null;

  const lat = toNumber(location.latitude);
  const lng = toNumber(location.longitude);
  if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
    return { lat, lng };
  }

  if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    const coordLng = toNumber(location.coordinates[0]);
    const coordLat = toNumber(location.coordinates[1]);

    if (isValidCoordinate(coordLat) && isValidCoordinate(coordLng)) {
      return { lat: coordLat, lng: coordLng };
    }
  }

  return null;
};

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Active") return task.status !== "Completed";
    return task.status === "Completed";
  });

  const fetchDriverTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/reports/driver/assigned");
      const mappedTasks = res.data.map((report) => {
        const locationAddress = report.location?.address
          ? report.location.address
          : report.location
          ? `${report.location.latitude}, ${report.location.longitude}`
          : "Unknown location";

        const primaryImage = Array.isArray(report.images)
          ? report.images[0]
          : null;

        const coordinates = getCoordinates(report.location);

        return {
          id: report._id,
          priority: toTitleCase(report.priority),
          location: locationAddress,
          wasteType: report.wasteType || "Unknown",
          time: report.createdAt
            ? new Date(report.createdAt).toLocaleString()
            : "Unknown time",
          status: mapApiStatusToLabel(report.status),
          description: report.description || "No description provided",
          reportedBy: report.createdBy?.name || "Resident",
          dateTime: report.createdAt
            ? new Date(report.createdAt).toLocaleString()
            : "Unknown",
          imageUrl: buildImageUrl(primaryImage),
          coordinates,
        };
      });

      setTasks(mappedTasks);
      setSelectedTaskId((prev) => {
        if (prev && mappedTasks.some((task) => task.id === prev)) return prev;
        return mappedTasks[0]?.id || null;
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load assigned tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverTasks();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !selectedTask?.coordinates) return;
    const { lat, lng } = selectedTask.coordinates;
    mapRef.current.setView([lat, lng], 15, { animate: true });
  }, [selectedTask]);

  const stats = useMemo(() => {
    const assigned = tasks.filter((task) => task.status === "Assigned").length;
    const inProgress = tasks.filter(
      (task) => task.status === "On the Way" || task.status === "Picked Up"
    ).length;
    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    return { assigned, inProgress, completed };
  }, [tasks]);

  const getPriorityClasses = (priority) => {
    if (priority === "High") return "bg-red-100 text-red-600";
    if (priority === "Medium") return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  const getStatusClasses = (status) => {
    if (status === "Assigned") return "bg-gray-100 text-gray-700";
    if (status === "On the Way") return "bg-blue-100 text-blue-700";
    if (status === "Picked Up") return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusButtonClasses = (status) => {
    if (status === "Assigned") return "bg-gray-200 text-gray-800";
    if (status === "On the Way") return "bg-blue-500 text-white";
    if (status === "Picked Up") return "bg-orange-500 text-white";
    return "bg-green-600 text-white";
  };

  const canMoveToStatus = (currentStatus, targetStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const targetIndex = STATUS_FLOW.indexOf(targetStatus);
    return targetIndex === currentIndex + 1;
  };

  const handleStatusUpdate = (targetStatus) => {
    if (!selectedTask) return;
    if (!canMoveToStatus(selectedTask.status, targetStatus)) return;
    const apiStatus = mapLabelToApiStatus(targetStatus);

    API.patch(`/reports/driver/${selectedTask.id}/status`, {
      status: apiStatus,
    })
      .then(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === selectedTask.id
              ? { ...task, status: targetStatus }
              : task
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to update task status.");
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user?.name || "Driver"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Assigned</p>
          <p className="text-lg font-semibold text-gray-800">
            {stats.assigned}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-lg font-semibold text-gray-800">
            {stats.inProgress}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-lg font-semibold text-gray-800">
            {stats.completed}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      <div className="flex h-full min-w-0 gap-6">
        <section className="w-1/3 bg-white p-4 border border-gray-200 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Assigned Tasks
            </h2>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
            >
              <option>All</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="overflow-y-auto pr-2">
            {loading ? (
              <p className="text-sm text-gray-500">Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No assigned tasks.</p>
            ) : (
              filteredTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`w-full text-left bg-gray-50 p-3 rounded-xl shadow-sm mb-3 hover:shadow-md transition cursor-pointer border ${
                    task.id === selectedTaskId
                      ? "border-green-500 ring-1 ring-green-200"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      {task.id}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityClasses(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {task.location}
                    </p>
                    <p className="text-xs text-gray-500">{task.wasteType}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{task.time}</span>
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${getStatusClasses(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Task Details
            </h2>
            <span className="text-sm text-gray-500">
              {selectedTask?.id || "No task selected"}
            </span>
          </div>

          {!loading && selectedTask ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  {selectedTask.imageUrl ? (
                    <img
                      src={selectedTask.imageUrl}
                      alt="Reported waste"
                      className="h-64 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        No waste image provided
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  {selectedTask.coordinates ? (
                    <div className="h-64 w-full">
                      <MapContainer
                        center={[selectedTask.coordinates.lat, selectedTask.coordinates.lng]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={false}
                        ref={mapRef}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                          position={[
                            selectedTask.coordinates.lat,
                            selectedTask.coordinates.lng,
                          ]}
                          icon={getStatusDotIcon(selectedTask.status)}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-semibold text-gray-800">
                                Reported Waste
                              </p>
                              <p className="text-gray-600">
                                {selectedTask.wasteType}
                              </p>
                              <p className="text-gray-500">
                                {selectedTask.location}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                      <div className="w-10 h-10 rounded-full border-4 border-green-500 mb-3" />
                      <span className="text-sm">Map unavailable</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTask.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Waste Type</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTask.wasteType}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Description</p>
                    <p className="text-gray-700">
                      {selectedTask.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Reported By</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTask.reportedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date/Time</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTask.dateTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500">Priority</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedTask.priority}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedTask.status}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-xs text-gray-500">Estimated Time</p>
                  <p className="text-sm font-semibold text-gray-800">
                    45 min
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-700">
                  Keep access clear for maintenance crew.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {STATUS_FLOW.map((status) => {
                  const isCurrent = status === selectedTask.status;
                  const isEnabled = canMoveToStatus(
                    selectedTask.status,
                    status
                  );

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusUpdate(status)}
                      disabled={!isEnabled}
                      className={`px-4 py-2 rounded-lg font-medium hover:opacity-90 transition ${getStatusButtonClasses(
                        status
                      )} ${
                        isCurrent
                          ? "ring-2 ring-offset-2 ring-green-400"
                          : ""
                      } ${
                        !isEnabled
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : loading ? (
            <div className="text-gray-500">Loading task details...</div>
          ) : (
            <div className="text-gray-500">Select a task to view details.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
