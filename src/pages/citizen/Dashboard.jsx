import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/apiClient";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalReports: 0,
    pending: 0,
    resolved: 0,
  });

  const [reports, setReports] = useState([]); // ✅ NEW

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));

    const fetchData = async () => {
  try {
    const statsRes = await API.get("/reports/stats");

    setStats(statsRes.data);

    // 🔥 SAFE FETCH FOR REPORTS
    try {
      const reportsRes = await API.get("/reports");

      console.log("Reports response:", reportsRes.data);

      // ✅ Ensure it's an array before using it
      if (Array.isArray(reportsRes.data)) {
        setReports(reportsRes.data.slice(0, 5));
      } else {
        console.warn("Reports is not an array");
        setReports([]);
      }

    } catch (reportErr) {
      console.warn("Reports fetch failed:", reportErr);
      setReports([]); // fallback
    }

  } catch (err) {
    console.error("Dashboard error:", err);

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  } finally {
    setLoading(false);
  }
};

    fetchData();
  }, [navigate]);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">

      {/* HERO */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-6 shadow-md">
        <h1 className="text-2xl font-bold">
          Hi {user?.name || "User"} 👋
        </h1>

        <p className="text-sm mt-1 opacity-90">
          Let’s keep your environment clean today
        </p>

        <button
          onClick={() => navigate("/report-issue")}
          className="mt-4 bg-white text-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          + Report Waste
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Report Waste",
            desc: "Submit a new issue",
            path: "/report-issue",
          },
          {
            title: "My Reports",
            desc: "Track your reports",
            path: "/my-reports",
          },
          {
            title: "Recycling Centers",
            desc: "Find nearby centers",
            path: "/recycling-centers",
          },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => navigate(item.path)}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-2xl">📍</div>
            <h3 className="mt-2 font-semibold text-gray-800">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={stats.totalReports} color="text-blue-600" note="+2 this week" />
        <StatCard title="Pending" value={stats.pending} color="text-yellow-600" note="Waiting review" />
        <StatCard title="Resolved" value={stats.resolved} color="text-green-600" note="Good progress" />
        <StatCard title="Hotspots" value="N/A" color="text-red-600" note="No data yet" />
      </div>

      {/* 🔥 RECENT ACTIVITY (REAL DATA NOW) */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>

        {reports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-3">
              You haven’t reported anything yet 🚮
            </p>

            <button
              onClick={() => navigate("/report-issue")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Report Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report._id}
                onClick={() => navigate(`/reports/${report._id}`)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-800">
                    {report.wasteType || "Waste Report"}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      report.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">
  {report.location?.address || "Unknown location"}
</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INSIGHT */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
        <p className="text-sm text-green-800">
          💡 Did you know? Recycling plastic reduces pollution by up to 60%.
        </p>
      </div>

    </div>
  );
}

/* Stat Card */
function StatCard({ title, value, color, note }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{note}</p>
    </div>
  );
}

export default Dashboard;