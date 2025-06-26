import { useState } from "react";

// Mock Supabase client for demonstration
const mockSupabase = {
  auth: {
    signInWithPassword: async (credentials) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      if (credentials.email === "test@example.com" && credentials.password === "password123") {
        return {
          data: {
            user: { id: "123", email: credentials.email },
            session: { access_token: "mock-token" }
          },
          error: null
        };
      }
      
      // Mock failed login
      return {
        data: null,
        error: { message: "Invalid login credentials" }
      };
    },
    getSession: async () => ({
      data: { session: { access_token: "mock-token" } }
    }),
    resend: async ({ type, email }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { error: null };
    },
    resetPasswordForEmail: async (email, options) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { error: null };
    }
  }
};

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (error) setError("");
    if (networkError) setNetworkError(false);
  };

  const checkNetworkConnection = async () => {
    try {
      // Try to fetch a simple endpoint to test connectivity
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNetworkError(false);
    setLoading(true);

    try {
      console.log("🔄 Starting login process...");
      
      // Check network connectivity first
      const isOnline = await checkNetworkConnection();
      if (!isOnline) {
        setNetworkError(true);
        setError("Network connection failed. Please check your internet connection.");
        return;
      }

      // Validate environment variables (in real app)
      console.log("🔍 Checking Supabase configuration...");
      
      const { data, error: authError } = await mockSupabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error("❌ Login error:", { message: authError.message, details: authError });
        
        // Handle specific error types
        switch (authError.message) {
          case "Email not confirmed":
            setError("Please confirm your email. Check your inbox or resend the confirmation.");
            break;
          case "Invalid login credentials":
            setError("Invalid email or password. Please try again.");
            break;
          case "Too many requests":
            setError("Too many login attempts. Please wait a few minutes and try again.");
            break;
          default:
            setError(authError.message || "Login failed. Please try again.");
        }
      } else {
        console.log("✅ Login success:", { user: data.user, session: data.session });
        
        // Verify session
        const { data: { session } } = await mockSupabase.auth.getSession();
        console.log("📋 Current session after login:", session);
        
        // Simulate successful navigation
        setError("");
        setTimeout(() => {
          console.log("✅ Login successful! Redirecting to profile...");
          alert("Login successful! In a real app, you would be redirected to the profile page.");
        }, 100);
      }
    } catch (err) {
      console.error("💥 Unexpected login error:", err);
      
      // Handle different types of network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setNetworkError(true);
        setError("Network error: Unable to connect to the server. Please check your connection and try again.");
      } else if (err.message.includes('CORS')) {
        setError("CORS error: Please contact support if this persists.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const testNavigation = () => {
    console.log("🧪 Testing manual navigation to /profile...");
    alert("In a real app with React Router, this would navigate to /profile");
  };

  const resendConfirmation = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await mockSupabase.auth.resend({
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
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const { error } = await mockSupabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: "https://your-app.com/reset-password",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm shadow-xl rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

        {/* Network Status Indicator */}
        {networkError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-sm">Network connection issue detected</span>
            </div>
          </div>
        )}

        {/* Debug Info Panel */}
        <div className="mb-6 p-3 bg-gray-100 rounded text-xs">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Test credentials: test@example.com / password123</p>
          <p>Network Status: {networkError ? "❌ Offline" : "✅ Online"}</p>
          <button
            type="button"
            onClick={testNavigation}
            className="mt-2 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
          >
            🧪 Test Navigation
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="text-sm">{error}</p>
            {error.includes("confirm") && (
              <button
                onClick={resendConfirmation}
                className="text-blue-600 text-sm hover:underline mt-2 block"
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Confirmation"}
              </button>
            )}
            {(error.includes("Invalid") || error.includes("failed")) && (
              <button
                onClick={resetPassword}
                className="text-blue-600 text-sm hover:underline mt-2 block"
                disabled={loading || !formData.email}
              >
                {loading ? "Sending..." : "Forgot Password?"}
              </button>
            )}
          </div>
        )}

        <div onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full mt-6 bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <button className="text-blue-600 hover:underline">
            Sign up
          </button>
        </p>

        {/* Troubleshooting Tips */}
        <details className="mt-6 text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">Troubleshooting Tips</summary>
          <div className="mt-2 space-y-1">
            <p>• Check your internet connection</p>
            <p>• Verify Supabase URL and API key</p>
            <p>• Check browser console for detailed errors</p>
            <p>• Ensure CORS is configured in Supabase</p>
          </div>
        </details>
      </div>
    </div>
  );
}