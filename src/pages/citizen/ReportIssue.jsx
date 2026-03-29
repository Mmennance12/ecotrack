import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/apiClient";

function ReportIssue() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    wasteType: "",
    description: "",
    location: "",
    urgency: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Getting location...");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("Location detected ✅");
      },
      () => {
        setCoords({
          latitude: -1.5177,
          longitude: 37.2634,
        });
        setLocationStatus("Using fallback: Machakos");
      }
    );
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage(null);

    if (
      !formData.wasteType ||
      !formData.description ||
      !formData.location ||
      !formData.urgency
    ) {
      setMessage({ type: "error", text: "Fill all required fields." });
      return;
    }

    if (!coords) {
      setMessage({ type: "error", text: "Location not ready." });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("wasteType", formData.wasteType);
      data.append("description", formData.description);

      data.append(
        "location",
        JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: formData.location,
        })
      );

      data.append("priority", formData.urgency);

      if (formData.image) data.append("image", formData.image);

      await API.post("/reports", data);

      setMessage({ type: "success", text: "Report submitted successfully!" });

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: "Submission failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center py-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Report Waste Issue
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Help improve your environment
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm transition ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100"
        >

          {/* WASTE TYPE */}
          <div className="group">
            <label className="text-sm font-medium">Waste Type *</label>
            <select
              name="wasteType"
              value={formData.wasteType}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition"
            >
              <option value="">Select waste type</option>
              <option value="plastic">Plastic</option>
              <option value="organic">Organic</option>
              <option value="metal">Metal</option>
              <option value="e-waste">E-Waste</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Describe the issue..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 transition"
          />

          {/* LOCATION */}
          <input
            type="text"
            name="location"
            placeholder="Location description"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition"
          />

          <div className="text-xs text-gray-500">
            📍 {locationStatus}
          </div>

          {/* URGENCY */}
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="">Select urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* IMAGE */}
          <div>
            {!preview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-green-500 transition hover:scale-[1.01]">
                <span className="text-gray-500 text-sm">
                  Click to upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative group">
                <img
                  src={preview}
                  alt="preview"
                  className="rounded-xl w-full h-52 object-cover transition group-hover:scale-[1.01]"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full hover:bg-black"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold transition-all hover:bg-green-700 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportIssue;