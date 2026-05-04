import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm transition-colors duration-300 dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-green-600">EcoTrack</h1>

      <div className="flex items-center gap-4">
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg border border-green-500 text-green-600 hover:bg-green-50 transition dark:border-green-400 dark:text-green-300 dark:hover:bg-green-500/10"
        >
          Sign In
        </Link>

        <Link
          to="/register"
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
        >
          Register
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;