import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.error("Login error:", error.message);
      setError(error.message || "Login failed");
    } else {
      console.log("Login success:", data);
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-animated-gradient overflow-hidden">
      {/* Floating Background Circles */}
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
          disabled={Object.values(formData).some((v) => !v)}
          aria-label="Login"
        >
          Login
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
