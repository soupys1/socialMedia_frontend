import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        },
      });

      if (error) throw error;
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-animated-gradient overflow-hidden">
      {/* Floating circles */}
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
          disabled={Object.values(formData).some((v) => !v)}
          aria-label="Sign up"
        >
          Sign Up
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
