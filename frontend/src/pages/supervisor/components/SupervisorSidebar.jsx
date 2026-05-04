import { Link, useLocation } from "react-router-dom";

function SupervisorSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const navItem =
    "px-4 py-2 rounded-lg text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 transition block";

  return (
    <aside className="w-64 h-screen bg-[#B9F6CA] border-r border-emerald-100 p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-800">EcoTrack</h1>
        <p className="text-sm text-gray-500">Supervisor</p>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        <Link
          to="/supervisor/dashboard"
          className={
            isActive("/supervisor/dashboard")
              ? "bg-white/80 text-emerald-800 font-semibold " + navItem
              : navItem
          }
        >
          Dashboard
        </Link>
        <Link
          to="/supervisor/reports"
          className={
            isActive("/supervisor/reports")
              ? "bg-white/80 text-emerald-800 font-semibold " + navItem
              : navItem
          }
        >
          Reports
        </Link>
        <Link
          to="/supervisor/drivers"
          className={
            isActive("/supervisor/drivers")
              ? "bg-white/80 text-emerald-800 font-semibold " + navItem
              : navItem
          }
        >
          Drivers
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#2E7D32] text-white flex items-center justify-center font-semibold">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Admin</p>
            <p className="text-xs text-gray-500">Supervisor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SupervisorSidebar;
