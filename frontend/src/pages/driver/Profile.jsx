function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const name = user?.name || "Driver";
  const email = user?.email || "-";
  const role = user?.role || "driver";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-semibold">
              {initials || "DR"}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">EcoTrack Driver</p>
              <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Active On Shift
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Contact</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{email}</p>
              <p className="text-xs text-slate-500">Phone: {user?.phone || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Role</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {String(role).replace(/_/g, " ")}
              </p>
              <p className="text-xs text-slate-500">ID: {user?.id || user?._id || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Vehicle</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {user?.vehicleType || user?.vehicle?.type || "Not assigned"}
              </p>
              <p className="text-xs text-slate-500">
                Plate: {user?.plateNumber || user?.vehicle?.plateNumber || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Coverage</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Machakos County</p>
              <p className="text-xs text-slate-500">Status: Available</p>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Driver Metrics</p>
            <h2 className="text-xl font-semibold">Weekly Snapshot</h2>
            <p className="text-sm text-slate-300">
              Keep your profile current to receive more assignments and faster pickups.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {[
              { label: "Assignments", value: user?.assignments || "12" },
              { label: "Completed", value: user?.completed || "9" },
              { label: "Rating", value: user?.rating || "4.8" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="text-lg font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition"
            >
              Edit Profile
            </button>
            <button
              type="button"
              className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 transition"
            >
              Update Availability
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Profile;
