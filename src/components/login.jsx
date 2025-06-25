import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Supabase client (optional, for resend/reset functionality)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://your-supabase-url.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY || "your-supabase-anon-key"
);

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
      console.log("🔄 Starting login process via backend...");

      const response = await fetch("https://socialmedia-backend-klnf.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Required for cookies
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Login error:", { message: data.error, status: response.status });
        setError(data.error || "Login failed");
      } else {
        console.log("✅ Login success:", data);
        // No need for supabase.auth.getSession() here; rely on the backend token
        setTimeout(() => {
          console.log("🔄 Attempting navigation to /profile...");
          navigate("/profile");
          console.log("✅ Navigation called successfully");
        }, 100);
      }
    } catch (err) {
      console.error("💥 Unexpected login error:", err.message);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
      });
      if (error) throw error;
      setError("Confirmation email resent. Please check your inbox.");
    } catch (err) {
      console.error("Resend error:", err.message);
      setError("Failed to resend confirmation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: "https://social-media-frontend-c79j.vercel.app/reset-password",
      });
      if (error) throw error;
      setError("Password reset email sent. Please check your inbox.");
    } catch (err) {
      console.error("Reset error:", err.message);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const testNavigation = () => {
    console.log("🧪 Testing manual navigation to /profile...");
    navigate("/profile");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-animated-gradient overflow-hidden">
      <div className="floating-circle" style={{ width: 80, height: 80, top: "10%", left: "15%", animationDelay: "0s" }} />
      <div className="floating-circle" style={{ width: 50, height: 50, top: "60%", left: "25%", animationDelay: "2s" }} />
      <div className="floating-circle" style={{ width: 120, height: 120, top: "70%", left: "75%", animationDelay: "4s" }} />

      <motion.form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        role="form"
        aria-labelledby="login-title"
      >
        <h2 id="login-title" className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <button
          type="button"
          onClick={testNavigation}
          className="mb-4 bg-gray-500 text-white font-bold py-1 px-2 rounded text-xs w-full"
        >
          🧪 Test Navigation to Profile
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error-msg"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-500 text-sm mb-2" role="alert">
                {error}
              </p>
              {error.includes("confirm") && (
                <motion.button
                  onClick={resendConfirmation}
                  className="text-blue-500 text-sm hover:underline mt-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  aria-label="Resend confirmation email"
                >
                  {loading ? "Sending..." : "Resend Confirmation"}
                </motion.button>
              )}
              {error.includes("Login failed") && (
                <motion.button
                  onClick={resetPassword}
                  className="text-blue-500 text-sm hover:underline mt-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  aria-label="Reset password"
                >
                  {loading ? "Sending..." : "Forgot Password?"}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {["email", "password"].map((field) => (
          <div className="mb-4" key={field}>
            <label htmlFor={field} className="block text-gray-700 text-sm font-bold mb-2">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={field}
              name={field}
              type={field === "password" ? "password" : "email"}
              value={formData[field]}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
              required
              autoComplete={field === "email" ? "username" : "current-password"}
              aria-required="true"
            />
          </div>
        ))}

        <motion.button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full hover:bg-blue-600 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
          disabled={loading || Object.values(formData).some((v) => !v)}
          aria-label="Login"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.form>
    </div>
  );
}