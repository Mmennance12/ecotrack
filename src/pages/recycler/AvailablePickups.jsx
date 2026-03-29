import { useEffect, useState } from "react";
import API from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

function AvailablePickups() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports/verified");

        // 🔥 FIX: handle both response formats
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        setReports(data);

      } catch (err) {
        console.error("FETCH ERROR:", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading pickups...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Available Pickups
        </h1>
        <p className="text-sm text-gray-500">
          Choose and assign pickups based on urgency and location.
        </p>
      </div>

      {/* EMPTY STATE */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
          No pickups available
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {reports.map((report) => {

            const urgencyColor =
              report?.priority === "high"
                ? "bg-red-100 text-red-600"
                : report?.priority === "medium"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600";

            return (
              <div
                key={report._id}
                className="bg-white rounded-xl shadow-md p-5 border hover:shadow-xl hover:-translate-y-1 transition flex flex-col justify-between"
              >
                {/* TOP */}
                <div className="space-y-2">

                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 capitalize">
                      {report?.wasteType || "Unknown"}
                    </h2>

                    <span className={`text-xs px-2 py-1 rounded ${urgencyColor}`}>
                      {report?.priority || "N/A"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    📍 {report?.location?.address || "No location"}
                  </p>

                  <p className="text-xs text-gray-400">
                    {report?.createdAt
                      ? new Date(report.createdAt).toLocaleString()
                      : "No date"}
                  </p>
                </div>

                {/* ACTION */}
                <button
                  onClick={() =>
                    navigate(`/recycler/pickup/${report._id}`)
                  }
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow"
                >
                  View & Assign
                </button>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}

export default AvailablePickups;