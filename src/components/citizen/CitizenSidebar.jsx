import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkClass =
    "block px-4 py-2 rounded-md text-sm transition hover:bg-green-600";

  const activeClass = "bg-green-800";

  return (
    <aside className="w-64 bg-green-700 text-white flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-green-600">
        <span className="text-xl font-semibold">EcoTrack</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/dashboard" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Dashboard
        </NavLink>

        <NavLink to="/report-issue" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Report Issue
        </NavLink>

        <NavLink to="/my-reports" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          My Reports
        </NavLink>

        <NavLink to="/recycling-centers" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Recycling Centers
        </NavLink>

        <NavLink to="/map-view" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Map View
        </NavLink>
      </nav>

      <div className="px-4 py-4 border-t border-green-600">
        <NavLink to="/profile" className={linkClass}>
          Profile
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
