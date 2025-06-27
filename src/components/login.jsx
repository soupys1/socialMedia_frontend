import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login...");
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookies!
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log("Login response status:", response.status);
      const data = await response.json();
      console.log("Login response data:", data);

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      console.log("Login successful, navigating to profile...");
      // Success: navigate to profile
      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl px-10 pt-8 pb-10 w-full max-w-md border border-blue-100"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-600 tracking-tight">Sign In</h2>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center" role="alert">
            {error}
          </p>
        )}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow border border-blue-200 rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-8">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow border border-blue-200 rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full hover:bg-blue-600 transition text-lg shadow-md"
          disabled={loading || !formData.email || !formData.password}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}