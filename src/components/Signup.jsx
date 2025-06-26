import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
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
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Success: navigate to login
      navigate("/login");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-animated-gradient overflow-hidden">
      <div className="floating-circle" style={{ width: 80, height: 80, top: "10%", left: "15%", animationDelay: "0s" }} />
      <div className="floating-circle" style={{ width: 50, height: 50, top: "60%", left: "25%", animationDelay: "2s" }} />
      <div className="floating-circle" style={{ width: 120, height: 120, top: "70%", left: "75%", animationDelay: "4s" }} />

      <motion.form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        role="form"
        aria-labelledby="signup-title"
      >
        <h2 id="signup-title" className="text-2xl font-bold mb-6 text-center text-gray-800">
          Sign Up
        </h2>

        <AnimatePresence>
          {error && (
            <motion.p
              key="error-msg"
              className="text-red-500 text-sm mb-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {[
          { id: "username", label: "Username" },
          { id: "email", label: "Email", type: "email" },
          { id: "firstName", label: "First Name" },
          { id: "lastName", label: "Last Name" },
          { id: "password", label: "Password", type: "password" },
        ].map(({ id, label, type = "text" }) => (
          <div className="mb-4" key={id}>
            <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
              {label}
            </label>
            <input
              id={id}
              type={type}
              name={id}
              value={formData[id]}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
              placeholder={`Enter your ${label.toLowerCase()}`}
            />
          </div>
        ))}

        <motion.button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full hover:bg-blue-600 transition disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
          disabled={loading || Object.values(formData).some((v) => !v)}
          aria-label="Sign up"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </motion.button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline" aria-label="Go to login">
            Log In
          </Link>
        </p>
      </motion.form>
    </div>
  );
}