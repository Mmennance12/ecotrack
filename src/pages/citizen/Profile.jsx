import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/apiClient";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("PROFILE ERROR:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">

      {/* 🔥 PROFILE HERO */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-2xl shadow-md flex items-center gap-5">

        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-xl font-semibold capitalize">
            {user?.name}
          </h2>
          <p className="text-sm opacity-90">
            {user?.email}
          </p>
          <p className="text-xs opacity-75 mt-1">
            Citizen Account
          </p>
        </div>

      </section>

      {/* 📊 STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-sm text-gray-500">Reports Submitted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">0</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-sm text-gray-500">Resolved Reports</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">0</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-sm text-gray-500">Active Issues</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">0</p>
        </div>

      </section>

      {/* ⚙️ PREFERENCES */}
      <section className="bg-white p-5 rounded-xl shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-2">
          Preferences
        </h3>
        <p className="text-sm text-gray-500">
          Notification and location preferences will be managed here.
        </p>
      </section>

      {/* 🔘 ACTIONS */}
      <section className="bg-white p-5 rounded-xl shadow-sm border flex gap-3">

        <button
          onClick={() => navigate("/edit-profile", { state: user })}
          className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition active:scale-[0.98]"
        >
          Edit Profile
        </button>

        <button
          className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition active:scale-[0.98]"
        >
          Logout
        </button>

      </section>

    </div>
  );
}

export default Profile;