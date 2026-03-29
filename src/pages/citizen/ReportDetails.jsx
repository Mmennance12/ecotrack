import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/apiClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await API.get(`/reports/my`);
        const found = res.data.find((r) => r._id === id);
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
    return <p className="text-gray-500">Loading report...</p>;
  }

  if (!report) {
    return <p className="text-red-500">Report not found</p>;
  }

  const lat = report.location?.latitude;
  const lng = report.location?.longitude;

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        Report Details
      </h1>

      {/* Image */}
      {report.images?.length > 0 && (
        <img
          src={`http://localhost:5000/${report.images[0]}`}
          alt="report"
          className="w-full max-w-lg rounded-lg border"
        />
      )}

      {/* Info */}
      <div className="space-y-2 text-gray-700">
        <p><strong>Type:</strong> {report.wasteType}</p>
        <p><strong>Description:</strong> {report.description}</p>
        <p><strong>Address:</strong> {report.location?.address}</p>

        <p><strong>Latitude:</strong> {lat}</p>
        <p><strong>Longitude:</strong> {lng}</p>

        <p><strong>Priority:</strong> {report.priority}</p>
        <p><strong>Status:</strong> {report.status}</p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(report.createdAt).toLocaleString()}
        </p>
      </div>

      {/* 🔥 VIEW ON GOOGLE MAP */}
      {lat && lng && (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          View on Google Maps
        </a>
      )}

      {/* 🔥 EMBEDDED MAP */}
      {lat && lng && (
        <div className="h-64 w-full rounded-lg overflow-hidden shadow">
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>
                {report.wasteType} <br />
                {report.location?.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

    </div>
  );
}

export default ReportDetails;