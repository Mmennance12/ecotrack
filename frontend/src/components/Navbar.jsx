import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-green-600">EcoTrack</h1>

      <div className="space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg border border-green-500 text-green-600 hover:bg-green-50 transition"
        >
          Sign In
        </Link>

        <Link
          to="/register"
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
        >
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;