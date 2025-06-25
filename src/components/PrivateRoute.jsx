import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (same as in your Login component)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://your-supabase-url.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY || "your-supabase-anon-key"
);

export default function PrivateRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          setAuthenticated(false);
        } else {
          console.log("🔐 PrivateRoute auth check:", session ? "✅ Authenticated" : "❌ Not authenticated");
          setAuthenticated(!!session);
        }
      } catch (err) {
        console.error("PrivateRoute error:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth state changed:", event, session ? "✅ Authenticated" : "❌ Not authenticated");
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  console.log("🚪 PrivateRoute decision:", authenticated ? "Allow access" : "Redirect to login");
  
  return authenticated ? children : <Navigate to="/login" replace />;
}