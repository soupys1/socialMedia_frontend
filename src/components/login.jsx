import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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

  const triggerLoginAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowLogin(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Touch/swipe detection
  useEffect(() => {
    let startY = 0;
    let endY = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      endY = e.changedTouches[0].clientY;
      const diff = startY - endY;
      
      // Swipe up gesture (minimum 50px)
      if (diff > 50 && !showLogin) {
        triggerLoginAnimation();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showLogin, isAnimating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Landing Page Content */}
      <div className={`transition-all duration-500 ease-in-out ${showLogin ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Hero Section */}
        <div className="relative h-screen flex flex-col items-center justify-center px-4 text-center">
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
              Connect
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
              Share your moments, connect with friends, and build meaningful relationships in our vibrant social community.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-in-delay-2">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect with Friends</h3>
                <p className="text-gray-600 text-sm">Build your network and stay connected with people who matter.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-in-delay-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Share Stories</h3>
                <p className="text-gray-600 text-sm">Share your thoughts, photos, and experiences with your community.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-in-delay-4">
                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Chat</h3>
                <p className="text-gray-600 text-sm">Message friends instantly and stay connected in real-time.</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-5">
              <button
                onClick={triggerLoginAnimation}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <span>Get Started</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <Link
                to="/signup"
                className="bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20"
              >
                Create Account
              </Link>
            </div>

            {/* Swipe Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="flex flex-col items-center text-gray-500">
                <span className="text-sm mb-2">Swipe up to login</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Login Form */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-blue-100 via-white to-blue-200 transition-all duration-500 ease-in-out z-50 ${
          showLogin 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="min-h-screen flex items-center justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-2xl rounded-3xl px-10 pt-8 pb-10 w-full max-w-md border border-blue-100 transform transition-all duration-500 ease-out relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-600 tracking-tight">Welcome Back</h2>
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
                className="shadow border border-blue-200 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
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
                className="shadow border border-blue-200 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-4 rounded-lg w-full hover:from-blue-600 hover:to-purple-600 transition-all text-lg shadow-lg transform hover:scale-105"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-center text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}