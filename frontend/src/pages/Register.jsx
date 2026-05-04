import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import { registerUser } from "../services/api";

const Register = () => {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("citizen");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {

      const data = await registerUser({
        name,
        email,
        password,
        role
      });

      alert("Registration successful! Please login.");
      navigate("/login");

    } catch (err) {
      setError(err.message || "Registration failed");
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
              Create your account
            </p>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-6 text-slate-900 dark:text-white">
            Sign Up
          </h2>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 px-4 py-2 rounded-lg dark:text-red-300 dark:bg-red-500/10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 dark:bg-gray-800 dark:border-gray-700">
              <FaUser className="text-slate-400 mr-2 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-gray-400"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 dark:bg-gray-800 dark:border-gray-700">
              <FaEnvelope className="text-slate-400 mr-2 dark:text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-gray-400"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 dark:bg-gray-800 dark:border-gray-700">
              <FaPhone className="text-slate-400 mr-2 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Phone number"
                className="w-full py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-gray-400"
                value={phone}
                onChange={(e)=>setPhone(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 dark:bg-gray-800 dark:border-gray-700">
              <FaLock className="text-slate-400 mr-2 dark:text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-gray-400"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 dark:bg-gray-800 dark:border-gray-700">
              <FaLock className="text-slate-400 mr-2 dark:text-gray-400" />
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-gray-400"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="bg-white border border-slate-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 dark:bg-gray-800 dark:border-gray-700">
              <select
                className="w-full py-3 bg-transparent outline-none text-slate-900 dark:text-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="citizen">Register as Citizen</option>
                <option value="recycler">Register as Recycler</option>
                <option value="driver">Register as Driver</option>
              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? "Creating account..." : "Register"}
            </button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-gray-700"></div>
            <span className="mx-3 text-slate-400 text-sm dark:text-gray-400">OR</span>
            <div className="flex-grow border-t border-slate-200 dark:border-gray-700"></div>
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition dark:border-gray-700 dark:hover:bg-gray-800/60">
            <FcGoogle size={20}/>
            Continue with Google
          </button>

          {/* Login */}
          <p className="text-center text-sm text-slate-500 mt-6 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-600 hover:underline font-medium"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;