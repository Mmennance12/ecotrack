import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import API from "../../services/apiClient";
import "leaflet/dist/leaflet.css";

// Custom icon maker function
const createCustomIcon = (status) => {
  let bgColor, icon, textColor;

  // Determine colors and icons based on status
  switch (status) {
    case "resolved":
      bgColor = "#10b981"; // Green
      icon = "✓";
      textColor = "#fff";
      break;
    case "assigned":
      bgColor = "#3b82f6"; // Blue
      icon = "→";
      textColor = "#fff";
      break;
    case "in-progress":
      bgColor = "#f59e0b"; // Amber
      icon = "⏳";
      textColor = "#fff";
      break;
    case "rejected":
      bgColor = "#6b7280"; // Gray
      icon = "✗";
      textColor = "#fff";
      break;
    default: // pending or unknown
      bgColor = "#ef4444"; // Red
      icon = "!";
      textColor = "#fff";
  }

  // Create SVG-based custom icon
  const htmlString = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: ${bgColor};
      border: 3px solid white;
      border-radius: 50%;
      font-weight: bold;
      font-size: 18px;
      color: ${textColor};
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      position: relative;
    ">
      ${icon}
    </div>
    <div style="
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid ${bgColor};
      margin-left: 10px;
      filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
    "></div>
  `;

  return new L.DivIcon({
    html: htmlString,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
    className: "custom-marker",
  });
};

function MapView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        console.log("REPORTS DATA:", res.data); // ✅ DEBUG
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ✅ Auto-fit map to reports
  useEffect(() => {
    if (!mapRef.current || reports.length === 0) return;

    const validCoords = reports
      .map((r) => [r.location?.latitude, r.location?.longitude])
      .filter(([lat, lng]) => lat != null && lng != null);

    if (validCoords.length === 0) return;

    mapRef.current.fitBounds(validCoords);
  }, [reports]);

  if (loading) {
    return <p className="text-center mt-10">Loading map...</p>;
  }

  return (
    <div className="h-[80vh] w-full rounded-lg overflow-hidden shadow">
      <MapContainer
        center={[-1.5177, 37.2634]} // fallback only
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {reports.map((report) => {
          const lat = report.location?.latitude;
          const lng = report.location?.longitude;

          if (lat == null || lng == null) return null;

          const customIcon = createCustomIcon(report.status);

          return (
            <Marker key={report._id} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="space-y-2 min-w-[250px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                        report.status === "resolved"
                          ? "bg-green-600"
                          : report.status === "assigned"
                          ? "bg-blue-600"
                          : report.status === "in-progress"
                          ? "bg-amber-600"
                          : report.status === "rejected"
                          ? "bg-gray-600"
                          : "bg-red-600"
                      }`}
                    >
                      {report.status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                  <strong className="text-lg text-gray-800">
                    {report.wasteType}
                  </strong>
                  <p className="text-sm text-gray-600">{report.location?.address}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>

                  {report.images?.length > 0 && (
                    <img
                      src={`http://localhost:5000/${report.images[0]}`}
                      alt="waste report"
                      className="w-40 rounded mt-2 border border-gray-300"
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;