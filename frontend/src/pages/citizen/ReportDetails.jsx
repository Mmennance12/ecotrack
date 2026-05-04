import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/apiClient";
import ThemeToggle from "../../components/ThemeToggle";

const STATUS_PROGRESS = {
  pending: 0,
  assigned_driver: 40,
  picked_up: 70,
  recycler_claimed: 85,
  completed: 100,
  verified: 40,
  assigned: 60,
  in_progress: 80,
  resolved: 100,
  rejected: 0,
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Report Submitted" },
  { key: "assigned_driver", label: "Assigned to Driver" },
  { key: "picked_up", label: "Picked Up" },
  { key: "recycler_claimed", label: "Recycler Claimed" },
  { key: "completed", label: "Completed" },
];

const STATUS_TIMELINE_ALIAS = {
  verified: "pending",
  assigned: "assigned_driver",
  in_progress: "picked_up",
  resolved: "completed",
  rejected: "pending",
};

function DriverStatusCard({ driver }) {
  const status = driver?.status;
  const statusLabel =
    status === "available" ? "Active" : status === "busy" ? "Busy" : "Unknown";
  const statusClass =
    status === "available"
      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
      : status === "busy"
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200"
      : "bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200";

  return (
    <div className="bg-blue-50 border border-blue-200/70 rounded-2xl p-5 h-full dark:bg-blue-500/10 dark:border-blue-500/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-blue-700/80 dark:text-blue-200/80">🚛 Assigned to Driver</p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            A driver is on the way to handle this report
          </h3>
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blue-700/90 dark:text-blue-100/90">
        <p>
          <span className="text-blue-700 dark:text-blue-200">Driver Name:</span> {driver?.name || "Not available"}
        </p>
        <p>
          <span className="text-blue-700 dark:text-blue-200">Phone Number:</span> {driver?.phone || "Not available"}
        </p>
        <p>
          <span className="text-blue-700 dark:text-blue-200">Vehicle Number:</span> {driver?.plateNumber || "Not available"}
        </p>
        <p>
          <span className="text-blue-700 dark:text-blue-200">Vehicle Type:</span> {driver?.vehicleType || "Not available"}
        </p>
        <p>
          <span className="text-blue-700 dark:text-blue-200">Estimated Arrival:</span> {driver?.estimatedArrival || "Not available"}
        </p>
        <p>
          <span className="text-blue-700 dark:text-blue-200">Current Location:</span> {driver?.currentLocation || "Not available"}
        </p>
      </div>
      <button
        type="button"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 transition"
      >
        View Tracking
      </button>
    </div>
  );
}

function RecyclerStatusCard({ recycler }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200/70 rounded-2xl p-5 h-full dark:bg-emerald-500/10 dark:border-emerald-500/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-emerald-700/80 dark:text-emerald-200/80">♻️ Handled by Recycler</p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            This report has been claimed by a recycler
          </h3>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full dark:bg-emerald-500/20 dark:text-emerald-200">
          Responsible Party
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm text-emerald-700/90 dark:text-emerald-100/90">
        <p>
          <span className="text-emerald-700 dark:text-emerald-200">Recycler Name:</span> {recycler?.name || "Not available"}
        </p>
        <p>
          <span className="text-emerald-700 dark:text-emerald-200">Company:</span> {recycler?.company || "Not available"}
        </p>
        <p>
          <span className="text-emerald-700 dark:text-emerald-200">Contact:</span> {recycler?.contact || "Not available"}
        </p>
      </div>
    </div>
  );
}

function CompletedStatusCard() {
  return (
    <div className="bg-green-50 border border-green-200/70 rounded-2xl p-5 h-full dark:bg-green-500/10 dark:border-green-500/30">
      <p className="text-sm text-green-700/80 dark:text-green-200/80">✓ Completed</p>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        The report was sorted and cleaned
      </h3>
      <p className="text-sm text-green-700 mt-3 dark:text-green-400">
        Thank you for helping keep our environment clean!
      </p>
    </div>
  );
}

function UnassignedStatusCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 h-full dark:bg-gray-800/60 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-300">Awaiting Assignment</p>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        This report has not yet been assigned
      </h3>
      <p className="text-sm text-gray-500 mt-3 dark:text-gray-400">
        We will notify you as soon as a driver or recycler takes responsibility.
      </p>
    </div>
  );
}

function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await API.get(`/reports/my`);
        const found = res.data.find((item) => item._id === id);
        setReport(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        <p className="text-red-600 dark:text-red-400">Report not found</p>
      </div>
    );
  }

  const rawStatus = report.status || "pending";
  const statusKey = STATUS_TIMELINE_ALIAS[rawStatus] || rawStatus;
  const progressPercent = report.progress ?? STATUS_PROGRESS[statusKey] ?? 0;
  const createdAt = report.createdAt ? new Date(report.createdAt) : null;
  const beforeImage = report.images?.[0]
    ? `http://localhost:5000/${report.images[0]}`
    : null;
  const afterImage = report.images?.[1]
    ? `http://localhost:5000/${report.images[1]}`
    : null;
  const hasAssigned = Boolean(report.assignedTo);
  const assignedDriver = report.assignedDriver || report.driver || null;
  const driver = assignedDriver
    ? {
        name: assignedDriver.name || null,
        phone: assignedDriver.phone || null,
        plateNumber:
          assignedDriver.plateNumber || assignedDriver.vehicle?.plateNumber || null,
        vehicleType:
          assignedDriver.vehicleType || assignedDriver.vehicle?.type || null,
        estimatedArrival: assignedDriver.estimatedArrival || null,
        currentLocation:
          assignedDriver.currentLocation?.address || assignedDriver.currentLocation || null,
        status: assignedDriver.status || null,
      }
    : report.assignedTo
    ? { name: report.assignedTo }
    : null;
  const recycler = report.recycler || report.claimedBy || null;
  const isRecyclerFlow = statusKey === "recycler_claimed" || (statusKey === "completed" && recycler);
  const isDriverFlow =
    (statusKey === "assigned_driver" || statusKey === "picked_up") && !isRecyclerFlow;
  const isCompleted = progressPercent >= 100 || statusKey === "completed" || statusKey === "resolved";
  const timelineStatusKey = STATUS_PROGRESS[statusKey] !== undefined ? statusKey : "pending";
  const currentStepIndex = Math.max(
    0,
    TIMELINE_STEPS.findIndex((step) => step.key === timelineStatusKey)
  );

  const messages = [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <header className="sticky top-0 z-50 bg-white/90 border-b border-gray-200 backdrop-blur dark:bg-black/90 dark:border-white/10">
        <div className="px-6 md:px-12 lg:px-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-semibold">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-white/60">EcoTrack</p>
              <p className="text-base font-semibold">Citizen hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-white/70">
            <Link to="/dashboard" className="hover:text-gray-900 transition dark:hover:text-white">
              Dashboard
            </Link>
            <Link to="/report-issue" className="hover:text-gray-900 transition dark:hover:text-white">
              Report Waste
            </Link>
            <span className="text-gray-900 dark:text-white">My Reports</span>
          </nav>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              className="hidden md:block bg-white border border-gray-300 text-gray-900 text-sm rounded-full px-4 py-2 outline-none transition-colors duration-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <ThemeToggle />
            <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold dark:bg-gray-800 dark:text-white">
              U
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50 text-gray-900 px-6 md:px-12 lg:px-20 py-10 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold">
            {report.wasteType
              ? `${formatTitle(report.wasteType)} Report`
              : "Waste Report"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            📍 {report.location?.address || "Katoloni"}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {createdAt ? `Reported on ${formatReportDate(createdAt)}` : ""}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {report.description || "No description provided."}
          </p>
        </div>

        <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-lg mb-8 dark:bg-gray-900 dark:border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{progressPercent}% Complete</p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2 dark:bg-gray-800">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 dark:text-gray-400">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div>
              {isCompleted ? (
                <CompletedStatusCard />
              ) : isDriverFlow ? (
                <DriverStatusCard driver={driver} />
              ) : isRecyclerFlow ? (
                <RecyclerStatusCard recycler={recycler} />
              ) : (
                <UnassignedStatusCard />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-lg mb-8 dark:bg-gray-900 dark:border-white/10">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track each stage of this report from submission to completion.
          </p>
          <div className="mt-6 grid gap-4">
            {TIMELINE_STEPS.map((step, index) => {
              const isComplete = index <= currentStepIndex;
              return (
                <div
                  key={step.key}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`h-3 w-3 rounded-full ${
                      isComplete ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isComplete ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  <div
                    className={`h-px flex-1 ${
                      isComplete ? "bg-green-500/60" : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold mb-2">Before</p>
            {beforeImage ? (
              <img
                src={beforeImage}
                alt="Before cleanup"
                className="rounded-lg object-cover h-48 w-full"
              />
            ) : (
              <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                No image uploaded
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">After</p>
            {afterImage ? (
              <img
                src={afterImage}
                alt="After cleanup"
                className="rounded-lg object-cover h-48 w-full"
              />
            ) : (
              <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Awaiting cleanup proof
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-lg mt-8 dark:bg-gray-900 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold">Follow Up / Communication</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask for updates or get responses from the assigned authority
            </p>
          </div>

          {!hasAssigned && (
            <p className="text-sm text-gray-600 mt-4 dark:text-gray-400">
              Communication will be available once the report is assigned
            </p>
          )}

          <div className="space-y-3 mt-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No messages yet. Start a conversation.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={`${message.sender}-${message.time}-${message.text}`}
                  className={`flex ${
                    message.sender === "citizen" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`rounded-xl px-4 py-2 text-sm ${
                        message.sender === "citizen"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {message.text}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{message.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Type your message..."
              className="bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 w-full outline-none transition-colors duration-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              type="button"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatReportDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTitle(value) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default ReportDetails;