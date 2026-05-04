import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { loginUser } from "../services/authService";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      if (!data.token || !data.user) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      switch (data.user.role) {
        case "driver":
          navigate("/driver-dashboard");
          break;
        case "citizen":
          navigate("/dashboard");
          break;
        case "recycler":
          navigate("/recycler-dashboard");
          break;
        case "supervisor":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/dashboard");
      }

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-white">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6')",
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-6">

        <div className="bg-white/90 text-slate-900 backdrop-blur-xl shadow-2xl rounded-3xl p-10 dark:bg-gray-900/90 dark:text-white">

          {/* Branding */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-600">EcoTrack</h1>
            <p className="text-slate-500 text-sm mt-1 dark:text-gray-300">
              Smarter waste reporting system
            </p>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-6 text-slate-900 dark:text-white">
            Welcome Back
          </h2>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 px-4 py-2 rounded-lg dark:text-red-300 dark:bg-red-500/10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-700 dark:text-gray-300 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold shadow-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-gray-700"></div>
            <span className="mx-4 text-slate-400 text-sm dark:text-gray-400">OR</span>
            <div className="flex-grow border-t border-slate-200 dark:border-gray-700"></div>
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition dark:border-gray-700 dark:hover:bg-gray-800/60">
            <FcGoogle size={20} />
            Continue with Google
          </button>

          {/* Register */}
          <p className="text-center text-sm text-slate-500 mt-6 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;