import { useEffect, useState } from "react";
import API from "../../services/apiClient";
import toast from "react-hot-toast";

import StatusTabs from "./components/StatusTabs";
import ReportList from "./components/ReportList";
import ReportDetails from "./components/ReportDetails";
import SupervisorTopbar from "./components/SupervisorTopbar";

function SupervisorDashboard() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Reports
  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await API.get("/reports");
      setReports(res.data);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 🔥 Filter Reports
  useEffect(() => {
    const filtered = reports.filter((r) => r.status === activeTab);
    setFilteredReports(filtered);

    // 🔥 Auto-select first report (IMPORTANT UX)
    if (filtered.length > 0) {
      setSelectedReport(filtered[0]);
    } else {
      setSelectedReport(null);
    }

  }, [reports, activeTab]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300">

      {/* 🔥 TOP BAR */}
      <SupervisorTopbar />

      {/* 🔥 MAIN CONTENT */}
      <div className="flex flex-1 p-6 gap-6 overflow-hidden">

        {/* ================= LEFT PANEL ================= */}
        <div className="w-[32%] backdrop-blur-lg bg-white/70 border border-white/40 rounded-2xl shadow-xl p-4 flex flex-col">

          <StatusTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="mt-4 overflow-y-auto pr-2 flex-1">

            {/* 🔥 LOADING */}
            {loading && (
              <div className="flex justify-center items-center h-full text-gray-500">
                Loading reports...
              </div>
            )}

            {/* 🔥 EMPTY STATE */}
            {!loading && filteredReports.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                No {activeTab} reports
              </div>
            )}

            {/* 🔥 REPORT LIST */}
            {!loading && filteredReports.length > 0 && (
              <ReportList
                reports={filteredReports}
                onSelect={setSelectedReport}
                selected={selectedReport}
              />
            )}

          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="flex-1 backdrop-blur-lg bg-white/70 border border-white/40 rounded-2xl shadow-xl p-6 flex flex-col transition-all duration-300">

          {/* 🔥 LOADING STATE */}
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading...
            </div>
          ) : (
            <ReportDetails
              report={selectedReport}
              refresh={fetchReports}
            />
          )}

        </div>

      </div>
    </div>
  );
}

export default SupervisorDashboard;