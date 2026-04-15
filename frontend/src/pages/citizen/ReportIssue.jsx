import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);
  const [geolocationSuccess, setGeolocationSuccess] = useState(null);

  const forwardGeocode = async (locationText) => {
    if (!locationText || locationText.trim().length === 0) {
      setGeolocationError(null);
      setGeolocationSuccess(null);
      return;
    }

    try {
      setGeolocationLoading(true);
      setGeolocationError(null);
      setGeolocationSuccess(null);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const address = result.display_name;

        setLocation({
          latitude: lat,
          longitude: lon,
          address: address,
        });

        setGeolocationSuccess(address);
        setGeolocationError(null);
      } else {
        setGeolocationError("Location not found. Please check the name.");
        setGeolocationSuccess(null);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeolocationError("Error searching location. Please try again.");
      setGeolocationSuccess(null);
    } finally {
      setGeolocationLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      setLocation((prev) => ({
        ...prev,
        address: data.display_name || "Unknown location",
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported");
      setLocation({
        latitude: -1.5177,
        longitude: 37.2634,
        address: "Machakos (fallback)",
      });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setLocation({
          latitude,
          longitude,
          address: "Detecting location...",
        });
        setLocationError(null);
        reverseGeocode(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        const deniedMessage =
          error?.code === error.PERMISSION_DENIED
            ? "Location access denied. Using default location (Machakos)."
            : "Unable to retrieve location";
        setLocationError(deniedMessage);
        setLocation({
          latitude: -1.5177,
          longitude: 37.2634,
          address: "Machakos (fallback)",
        });
        setLocationLoading(false);
      }
    );
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If location field changed, geocode it
    if (name === "location") {
      forwardGeocode(value);
    }
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

    if (!location.latitude || !location.longitude) {
      setMessage({ type: "error", text: "Location not detected" });
      return;
    }

    if (!formData.wasteType || !formData.description || !formData.urgency) {
      setMessage({ type: "error", text: "Fill all required fields." });
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
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || formData.location,
        })
      );

      data.append("priority", formData.urgency);

      if (formData.image) data.append("image", formData.image);

      await API.post("/reports", data);

      setMessage({
        type: "success",
        text: "Report submitted successfully!",
      });

      setLoading(false);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setMessage({
        type: "error",
        text: err?.message || "Submission failed. Please try again.",
      });
      setLoading(false);
    }
  }

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
            <span className="text-white">Report Waste</span>
            <Link to="/my-reports" className="hover:text-white transition">
              My Reports
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              className="hidden md:block bg-gray-800 text-white text-sm rounded-full px-4 py-2 outline-none"
            />
            <button
              type="button"
              className="h-9 w-9 rounded-full border border-white/10 text-white/70 hover:text-white transition"
              aria-label="Settings"
            >
              S
            </button>
            <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-12 lg:px-20 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-xl font-semibold">
            !
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Report Waste Issue</h1>
            <p className="text-sm text-gray-400 mt-1">
              Help improve your environment by reporting waste problems
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-500/10 text-green-300 border border-green-500/20"
                : "bg-red-500/10 text-red-300 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-900 rounded-2xl p-6 shadow-lg space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Waste Type *</label>
                  <select
                    name="wasteType"
                    value={formData.wasteType}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select waste type</option>
                    <option value="plastic">Plastic</option>
                    <option value="organic">Organic</option>
                    <option value="metal">Metal</option>
                    <option value="e-waste">E-Waste</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300">Urgency *</label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select urgency</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300">Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe the waste problem, quantity, and any hazards..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mt-2 h-28 px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Location *</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Machakos University, Nairobi..."
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  
                  {/* Geocoding feedback */}
                  <div className="mt-2 text-sm">
                    {geolocationLoading && (
                      <p className="text-blue-400">🔍 Searching location...</p>
                    )}
                    {geolocationSuccess && !geolocationLoading && (
                      <p className="text-green-400">📍 {geolocationSuccess}</p>
                    )}
                    {geolocationError && (
                      <p className="text-red-400">{geolocationError}</p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between mt-6 md:mt-7">
                  <div>
                    <p className="text-xs text-gray-400">Detected Location</p>
                    <p className="text-sm text-white">
                      {locationLoading
                        ? "Detecting location..."
                        : location.address || "Unknown location"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="text-green-400 text-sm"
                  >
                    Refresh Location
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                {locationError ? locationError : "Location ready"}
                {location.latitude && location.longitude && (
                  <span className="ml-2 text-white/60">
                    Lat: {location.latitude} | Lng: {location.longitude}
                  </span>
                )}
              </div>

              <div>
                {!preview ? (
                  <label className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center bg-gray-800 cursor-pointer block">
                    <p className="text-sm text-white">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
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
                      className="rounded-xl w-full h-52 object-cover"
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

              <button
                type="submit"
                disabled={loading || locationLoading || !location.latitude}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">How it works</h3>
              {[
                {
                  title: "Submit Report",
                  description: "Share details and evidence of the waste issue.",
                },
                {
                  title: "Review & Verification",
                  description: "Authorities review the report for accuracy.",
                },
                {
                  title: "Assignment",
                  description: "Nearby teams are assigned to resolve it.",
                },
                {
                  title: "Resolution",
                  description: "Waste is cleared and the case is closed.",
                },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-semibold">Quick Tips</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>Take a clear photo</li>
                <li>Include exact location</li>
                <li>Describe type and size</li>
                <li>Reports help keep Machakos clean</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
