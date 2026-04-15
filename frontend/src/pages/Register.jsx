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
    <div className="min-h-screen relative flex items-center justify-center">

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

        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-10">

          {/* Branding */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-600">EcoTrack</h1>
            <p className="text-gray-500 text-sm mt-1">
              Create your account
            </p>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Sign Up
          </h2>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full py-3 bg-transparent outline-none"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full py-3 bg-transparent outline-none"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaPhone className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Phone number"
                className="w-full py-3 bg-transparent outline-none"
                value={phone}
                onChange={(e)=>setPhone(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Password"
                className="w-full py-3 bg-transparent outline-none"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full py-3 bg-transparent outline-none"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-500">
              <select
                className="w-full py-3 bg-transparent outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="citizen">Register as Citizen</option>
                <option value="recycler">Register as Recycler</option>
              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? "Creating account..." : "Register"}
            </button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-3 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition">
            <FcGoogle size={20}/>
            Continue with Google
          </button>

          {/* Login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:underline font-medium"
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