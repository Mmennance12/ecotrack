import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/apiClient";
import SupervisorSidebar from "./components/SupervisorSidebar";

function SupervisorDashboard() {
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await API.get("/drivers");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setDrivers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDrivers();
  }, []);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((report) => report.status === "pending").length;
    const resolved = reports.filter((report) => report.status === "resolved").length;
    return { total, pending, resolved };
  }, [reports]);

  const chartData = useMemo(() => {
    const illegal = reports.filter((report) => {
      const type = String(report.wasteType || "").toLowerCase();
      const description = String(report.description || "").toLowerCase();
      return type.includes("illegal") || description.includes("illegal") || description.includes("dump");
    }).length;

    const plastic = reports.filter((report) =>
      String(report.wasteType || "").toLowerCase().includes("plastic")
    ).length;

    const ewaste = reports.filter((report) => {
      const type = String(report.wasteType || "").toLowerCase();
      return type.includes("e-waste") || type.includes("ewaste") || type.includes("electronic");
    }).length;

    return [
      { name: "Illegal Dumping", value: illegal },
      { name: "Plastic", value: plastic },
      { name: "E-Waste", value: ewaste },
    ];
  }, [reports]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-600 px-2 py-1 rounded-full";
      case "verified":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full";
      case "assigned":
        return "bg-blue-100 text-blue-700 px-2 py-1 rounded-full";
      case "rejected":
        return "bg-red-100 text-red-600 px-2 py-1 rounded-full";
      case "resolved":
        return "bg-green-100 text-green-700 px-2 py-1 rounded-full";
      default:
        return "bg-gray-100 text-gray-600 px-2 py-1 rounded-full";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SupervisorSidebar />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search reports, users..."
              className="bg-gray-100 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none w-full sm:w-64"
            />
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              aria-label="Notifications"
            >
              🔔
            </button>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
              <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                A
              </div>
              <div className="text-sm">
                <p className="text-gray-800 font-semibold">Admin</p>
                <p className="text-xs text-gray-500">Supervisor</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Total Reports" value={stats.total} tone="green" />
            <StatCard title="Pending Pickups" value={stats.pending} tone="yellow" />
            <StatCard title="Resolved Issues" value={stats.resolved} tone="emerald" />
            <StatCard title="Active Drivers" value={drivers.length} tone="blue" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 mt-6">
            <section className="xl:col-span-7 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Reports</h2>
                <p className="text-sm text-gray-500">
                  System-wide reports overview
                </p>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 text-sm font-semibold text-gray-600">
                    <div className="col-span-3">Type</div>
                    <div className="col-span-3">Location</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Action</div>
                  </div>

                  {loading ? (
                    <div className="px-6 py-6 text-sm text-gray-500">Loading reports...</div>
                  ) : reports.length === 0 ? (
                    <div className="px-6 py-6 text-sm text-gray-500">No reports available.</div>
                  ) : (
                    reports.map((report) => (
                      <div
                        key={report._id}
                        className="grid grid-cols-12 px-6 py-4 border-t border-gray-100 items-center text-sm text-gray-700"
                      >
                        <div className="col-span-3 font-medium text-gray-800 capitalize">
                          {report.wasteType || "Unknown"}
                        </div>
                        <div className="col-span-3 text-gray-600">
                          {report.location?.address || "-"}
                        </div>
                        <div className="col-span-2 text-gray-500">
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleDateString()
                            : "-"}
                        </div>
                        <div className="col-span-2">
                          <span className={`text-xs font-medium ${getStatusStyle(report.status || "pending")}`}>
                            {report.status === "resolved" ? "completed" : report.status || "pending"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <Link
                            to={`/supervisor/reports/${report._id}`}
                            className="text-green-600 font-semibold hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="xl:col-span-3 bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800">Reports by Category</h2>
              <p className="text-sm text-gray-500 mb-4">
                Overview of incident types
              </p>

              <CategoryBars data={chartData} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function CategoryBars({ data }) {
  const maxValue = Math.max(1, ...data.map((item) => item.value || 0));

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const percentage = Math.round(((item.value || 0) / maxValue) * 100);

        return (
          <div key={item.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="font-medium text-gray-700">{item.name}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ title, value, tone }) {
  const toneStyles = {
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
        <p className="text-xs text-gray-400 mt-1">Updated just now</p>
      </div>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${toneStyles[tone]}`}>
        ●
      </div>
    </div>
  );
}

export default SupervisorDashboard;