import { NavLink } from "react-router-dom";
import { LayoutDashboard, Truck, Map } from "lucide-react";

function RecyclerSidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-green-600 to-emerald-500 text-white flex flex-col">
      
      {/* LOGO */}
      <div className="p-5 text-xl font-bold border-b border-green-500 flex items-center gap-2">
        <div className="w-4 h-4 bg-white rounded-sm"></div>
        EcoTrack
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2 text-sm">

        <NavLink
          to="/recycler/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition ${
              isActive
                ? "bg-white text-green-600 font-semibold shadow"
                : "hover:bg-green-500/70"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/recycler/available-pickups"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition ${
              isActive
                ? "bg-white text-green-600 font-semibold shadow"
                : "hover:bg-green-500/70"
            }`
          }
        >
          <Truck size={18} />
          Available Pickups
        </NavLink>

        <NavLink
          to="/recycler/assigned-pickups"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition ${
              isActive
                ? "bg-white text-green-600 font-semibold shadow"
                : "hover:bg-green-500/70"
            }`
          }
        >
          <Truck size={18} />
          Assigned Pickups
        </NavLink>

        <NavLink
          to="/recycler/map-view"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition ${
              isActive
                ? "bg-white text-green-600 font-semibold shadow"
                : "hover:bg-green-500/70"
            }`
          }
        >
          <Map size={18} />
          Map View
        </NavLink>

      </nav>

      {/* PROFILE */}
      <div className="p-4 border-t border-green-500">
        <NavLink
          to="/recycler/profile"
          className="flex items-center gap-3 bg-green-500/40 p-3 rounded-xl hover:bg-green-400 transition"
        >
          <div className="w-8 h-8 bg-white text-green-600 flex items-center justify-center rounded-full font-bold">
            U
          </div>

          <div className="text-sm">
            <p className="font-medium">Recycler</p>
            <p className="text-green-100 text-xs">Active</p>
          </div>
        </NavLink>
      </div>

    </aside>
  );
}

export default RecyclerSidebar;