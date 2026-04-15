import { useEffect, useState } from "react";
import API from "../../services/apiClient";

function RecyclerProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data.data);
        setForm(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 🔥 PROFILE COMPLETION
  const fields = ["name", "email", "facilityName", "recyclerType", "operatingArea", "phone"];
  const completed = fields.filter(f => user?.[f]).length;
  const completion = Math.round((completed / fields.length) * 100);

  // 🔥 TOAST
  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Name required";
    if (!/\S+@\S+\.\S+/.test(form.email || "")) {
      newErrors.email = "Valid email required";
    }
    if (form.phone && !/^\d{10,15}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10–15 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await API.put("/auth/me", form);
      setUser(res.data.data);
      setEditing(false);
      showToast("Profile updated successfully");
    } catch {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">

      {/* 🔥 TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div className={`px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}>
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.text}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
          <p className="text-sm text-gray-500">Manage your account details</p>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* PROFILE HEADER */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-5 hover:shadow-lg transition">
        <div className="w-16 h-16 bg-green-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
          {user?.name?.charAt(0) || "U"}
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>

          {/* 🔥 COMPLETION BAR */}
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Profile {completion}% complete
            </p>
          </div>
        </div>
      </div>

      {/* SECTION */}
      <Section title="Personal Info">
        <Field {...props("name", "Name")} error={errors.name} />
        <Field {...props("email", "Email")} error={errors.email} />
        <Field {...props("phone", "Phone")} error={errors.phone} />
      </Section>

      <Section title="Facility Info">
        <Field {...props("facilityName", "Facility Name")} />
        <Field {...props("recyclerType", "Recycler Type")} />
        <Field {...props("operatingArea", "Operating Area")} />
      </Section>

      {/* SAVE */}
      {editing && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );

  function props(name, label) {
    return {
      label,
      name,
      value: form[name],
      editing,
      onChange: handleChange,
    };
  }
}

/* SECTION */
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 hover:shadow-lg transition">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/* FIELD */
function Field({ label, name, value, editing, onChange, error }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>

      {editing ? (
        <input
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`mt-1 w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 transition ${
            error ? "border-red-500" : ""
          }`}
        />
      ) : (
        <p className="text-sm font-medium text-gray-800 mt-1">
          {value || "Not provided"}
        </p>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default RecyclerProfile;