import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../services/apiClient"; // ✅ ADD THIS

function EditProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: state?.name || "",
    email: state?.email || "",
    phone: state?.phone || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ ADD THIS FUNCTION
  const handleSave = async () => {
    try {
      const res = await API.put("/auth/me", formData);

      console.log("UPDATED USER:", res.data);

      alert("Profile updated successfully");

      navigate("/profile"); // go back to profile
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold">Edit Profile</h2>

      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            placeholder="e.g. 0712345678"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Account Type</label>
          <input
            type="text"
            value={state?.role || "citizen"}
            disabled
            className="w-full border p-2 rounded mt-1 bg-gray-100"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave} // ✅ CONNECTED
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Save Changes
        </button>

        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 px-6 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditProfile;