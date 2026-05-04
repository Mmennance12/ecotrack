import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/apiClient";
import ThemeToggle from "../../components/ThemeToggle";

function ReportIssue() {
  const navigate = useNavigate();

  const knownLocations = [
    {
      name: "queens hostel machakos",
      latitude: -1.5179,
      longitude: 37.2638,
    },
    {
      name: "katoloni",
      latitude: -1.54,
      longitude: 37.27,
    },
  ];

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

  const handleLocationSearch = async (locationText) => {
    if (!locationText || locationText.trim().length === 0) {
      setGeolocationError(null);
      setGeolocationSuccess(null);
      return;
    }

    const query = locationText.toLowerCase().trim();

    try {
      setGeolocationLoading(true);
      setGeolocationError(null);
      setGeolocationSuccess(null);

      const knownMatch = knownLocations.find((loc) =>
        query.includes(loc.name)
      );

      if (knownMatch) {
        setLocation({
          latitude: knownMatch.latitude,
          longitude: knownMatch.longitude,
          address: knownMatch.name,
        });

        setGeolocationSuccess("📍 Using known location");
        setGeolocationError(null);
        return;
      }

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

        setGeolocationSuccess(`📍 ${address}`);
        setGeolocationError(null);
      } else {
        setGeolocationError("Location not found");
        setGeolocationSuccess(null);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeolocationError("Error searching location");
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
          address: location.address,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <header className="sticky top-0 z-50 bg-white/80 border-b border-emerald-100 backdrop-blur-md dark:bg-black/90 dark:border-white/10">
        <div className="px-6 md:px-12 lg:px-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-semibold">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-700 dark:text-white/60">EcoTrack</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Citizen hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-white/70">
            <Link to="/dashboard" className="hover:text-gray-900 transition dark:hover:text-white">
              Dashboard
            </Link>
            <span className="text-gray-900 dark:text-white">Report Waste</span>
            <Link to="/my-reports" className="hover:text-gray-900 transition dark:hover:text-white">
              My Reports
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              className="hidden md:block bg-white border border-slate-300 text-slate-900 text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <ThemeToggle />
            <button
              type="button"
              className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 transition dark:border-white/10 dark:text-white/70 dark:hover:text-white"
              aria-label="Settings"
            >
              S
            </button>
            <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold dark:bg-gray-800 dark:text-white">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-12 lg:px-20 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center text-xl font-semibold">
            !
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Report Waste Issue</h1>
            <p className="text-sm text-slate-600 mt-1 dark:text-gray-400">
              Help improve your environment by reporting waste problems
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-500/10 text-green-700 border border-green-500/20 dark:text-green-300"
                : "bg-red-500/10 text-red-700 border border-red-500/20 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] space-y-6 dark:bg-gray-900 dark:border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Waste Type *</label>
                  <select
                    name="wasteType"
                    value={formData.wasteType}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors duration-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select waste type</option>
                    <option value="plastic">Plastic</option>
                    <option value="organic">Organic</option>
                    <option value="metal">Metal</option>
                    <option value="e-waste">E-Waste</option>
                    <option value="trash">Trash</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Urgency *</label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors duration-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select urgency</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe the waste problem, quantity, and any hazards..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mt-2 h-28 px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors duration-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Location *</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Machakos University, Nairobi..."
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={(event) => handleLocationSearch(event.target.value)}
                    className="w-full mt-2 px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors duration-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                  
                  {/* Geocoding feedback */}
                  <div className="mt-2 text-sm">
                    {geolocationLoading && (
                      <p className="text-blue-600 dark:text-blue-400">🔍 Searching location...</p>
                    )}
                    {geolocationSuccess && !geolocationLoading && (
                      <p className="text-green-600 dark:text-green-400">📍 {geolocationSuccess}</p>
                    )}
                    {geolocationError && (
                      <p className="text-red-600 dark:text-red-400">{geolocationError}</p>
                    )}
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 flex items-center justify-between mt-6 md:mt-7 dark:bg-gray-800">
                  <div>
                    <p className="text-xs text-emerald-700 dark:text-gray-400">Detected Location</p>
                    <p className="text-sm text-emerald-800 dark:text-white">
                      {locationLoading
                        ? "Detecting location..."
                        : location.address || "Unknown location"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="text-green-600 text-sm dark:text-green-400"
                  >
                    Refresh Location
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {locationError ? locationError : "Location ready"}
                {!geolocationError && location.latitude && location.longitude && (
                  <span className="ml-2 text-gray-500 dark:text-white/60">
                    Lat: {location.latitude} | Lng: {location.longitude}
                  </span>
                )}
              </div>

              <div>
                {!preview ? (
                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 cursor-pointer block transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm text-gray-900 dark:text-white">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">PNG, JPG up to 10MB</p>
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
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 dark:bg-gray-900 dark:border-white/10">
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
                  <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 dark:bg-gray-900 dark:border-white/10">
              <h3 className="text-lg font-semibold">Quick Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2 dark:text-gray-400">
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
