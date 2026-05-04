import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block p-2 rounded-lg transition ${
    isActive ? "bg-green-700 text-white" : "text-white hover:bg-green-700"
  }`;

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-green-900 text-white p-4 flex flex-col">
      <div className="text-2xl font-bold text-green-300">EcoTrack Driver</div>

      <nav className="mt-8 space-y-2 text-sm">
        <NavLink to="/driver" className={linkClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/driver/history" className={linkClass}>
          History
        </NavLink>
        <NavLink to="/driver/profile" className={linkClass}>
          Profile
        </NavLink>
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="block w-full text-left p-2 text-white hover:bg-red-600 rounded-lg transition"
        >
          Logout
        </button>
      </nav>

      <div className="mt-auto bg-green-800/60 rounded-xl p-4 text-sm">
        <div className="w-10 h-10 rounded-lg bg-green-700 mb-3 flex items-center justify-center">
          <span className="text-lg">T</span>
        </div>
        <p className="text-green-100">Keep the city clean</p>
      </div>
    </aside>
  );
}

export default Sidebar;
