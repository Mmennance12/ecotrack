import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/apiClient";

const STATUS_PROGRESS = {
  pending: 20,
  verified: 40,
  assigned: 60,
  in_progress: 80,
  resolved: 100,
  rejected: 0,
};

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
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">Report not found</p>
      </div>
    );
  }

  const statusKey = report.status || "pending";
  const progressPercent = STATUS_PROGRESS[statusKey] ?? 0;
  const createdAt = report.createdAt ? new Date(report.createdAt) : null;
  const beforeImage = report.images?.[0]
    ? `http://localhost:5000/${report.images[0]}`
    : null;
  const afterImage = report.images?.[1]
    ? `http://localhost:5000/${report.images[1]}`
    : null;
  const hasAssigned = Boolean(report.assignedTo);

  const messages = [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 bg-black/90 border-b border-white/10">
        <div className="px-6 md:px-12 lg:px-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-semibold">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-white/60">EcoTrack</p>
              <p className="text-base font-semibold">Citizen hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-white/70">
            <Link to="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <Link to="/report-issue" className="hover:text-white transition">
              Report Waste
            </Link>
            <span className="text-white">My Reports</span>
          </nav>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              className="hidden md:block bg-gray-800 text-white text-sm rounded-full px-4 py-2 outline-none"
            />
            <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-950 text-white px-6 md:px-12 lg:px-20 py-10">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold">
            {report.wasteType
              ? `${formatTitle(report.wasteType)} Report`
              : "Waste Report"}
          </h1>
          <p className="text-gray-400">
            📍 {report.location?.address || "Katoloni"}
          </p>
          <p className="text-gray-400">
            {createdAt ? `Reported on ${formatReportDate(createdAt)}` : ""}
          </p>
          <p className="text-gray-400">
            {report.description || "No description provided."}
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg mb-8">
          <p className="text-sm text-gray-300">{progressPercent}% Complete</p>
          <div className="w-full bg-gray-800 h-2 rounded-full mt-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0%</span>
            <span>100%</span>
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
              <div className="bg-gray-800 h-48 rounded-lg flex items-center justify-center text-gray-400">
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
              <div className="bg-gray-800 h-48 rounded-lg flex items-center justify-center text-gray-400">
                Awaiting cleanup proof
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg mt-8">
          <div>
            <h2 className="text-lg font-semibold">Follow Up / Communication</h2>
            <p className="text-sm text-gray-400">
              Ask for updates or get responses from the assigned authority
            </p>
          </div>

          {!hasAssigned && (
            <p className="text-sm text-gray-400 mt-4">
              Communication will be available once the report is assigned
            </p>
          )}

          <div className="space-y-3 mt-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">
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
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {message.text}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{message.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Type your message..."
              className="bg-gray-800 text-white rounded-lg px-4 py-2 w-full outline-none"
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