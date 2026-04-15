import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import API from "../../services/apiClient";
import "leaflet/dist/leaflet.css";

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

          return (
            <Marker key={report._id} position={[lat, lng]}>
              <Popup>
                <div className="space-y-1">
                  <strong>{report.wasteType}</strong>
                  <p>{report.location?.address}</p>
                  <p>Status: {report.status}</p>

                  {report.images?.length > 0 && (
                    <img
                      src={`http://localhost:5000/${report.images[0]}`}
                      alt="report"
                      className="w-32 rounded mt-2"
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