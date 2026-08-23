import { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Find Teammates",
    body: "Discover students with complementary skills ready to collaborate.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: "Share Skills",
    body: "Showcase your expertise and find projects that need what you know.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Team Up",
    body: "Chat and coordinate to form winning teams for your next hackathon.",
  },
];

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || "light"; } catch { return "light"; }
  });
  const navigate = useNavigate();

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Login failed"); return; }
      navigate("/profile");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // swipe-up to open login
  useEffect(() => {
    let startY = 0;
    const onTouchStart = (e) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (startY - e.changedTouches[0].clientY > 50 && !showLogin) setShowLogin(true);
    };
    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchend", onTouchEnd);
    return () => { document.removeEventListener("touchstart", onTouchStart); document.removeEventListener("touchend", onTouchEnd); };
  }, [showLogin]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--canvas)", color: "var(--ink)" }}>

      {/* Top bar */}
      <header style={{
        height: 60, borderBottom: "1px solid var(--hairline)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", position: "sticky", top: 0, zIndex: 10,
        backgroundColor: "var(--canvas)",
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.3px" }}>JoinAHack</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="theme-btn" onClick={() => setTheme(t => t === "light" ? "dark" : "light")} aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowLogin(true)}>Sign in</button>
          <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 48px" }}>
        <div style={{ marginBottom: 12 }}>
          <span className="badge">Hackathon platform for students</span>
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 600,
          letterSpacing: "-1.6px", lineHeight: 1.1, marginBottom: 20,
          color: "var(--ink)",
        }}>
          Find your perfect<br />hackathon team.
        </h1>

        <p style={{ fontSize: 17, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 500, marginBottom: 36 }}>
          Connect with fellow students, match on skills, and build something amazing together. Your next hackathon team is one post away.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 72 }}>
          <button className="btn btn-primary btn-md" onClick={() => setShowLogin(true)}>
            Get started
          </button>
          <Link to="/signup" className="btn btn-secondary btn-md">
            Create account
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 32, marginBottom: 64,
          paddingBottom: 48, borderBottom: "1px solid var(--hairline)",
        }}>
          {[["1,000+", "Students"], ["200+", "Teams"], ["50+", "Hackathons"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--accent)", letterSpacing: "-0.5px" }}>{n}</div>
              <div style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {features.map((f) => (
            <div key={f.title} className="card card-sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                backgroundColor: "var(--accent-muted)", color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{f.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ textAlign: "center", marginTop: 64, color: "var(--ink-subtle)", fontSize: 12 }}>
          Swipe up or click &ldquo;Sign in&rdquo; to continue
        </div>
      </main>

      {/* Login overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 50,
        backgroundColor: "var(--canvas)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        transform: showLogin ? "translateY(0)" : "translateY(100%)",
        opacity: showLogin ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.25s ease",
        pointerEvents: showLogin ? "auto" : "none",
      }}>
        <div className="card" style={{ width: "100%", maxWidth: 400, position: "relative" }}>
          {/* Close */}
          <button
            onClick={() => setShowLogin(false)}
            className="btn btn-ghost btn-sm"
            style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, padding: 0, borderRadius: 6 }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--ink-subtle)", marginBottom: 8 }}>Welcome back</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", margin: 0 }}>Sign in to JoinAHack</h2>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" value={formData.email} onChange={handleChange} placeholder="you@example.com" required autoComplete="username" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input" value={formData.password} onChange={handleChange} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-primary btn-md btn-full" disabled={loading || !formData.email || !formData.password} style={{ marginTop: 4 }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-subtle)", marginTop: 20, marginBottom: 0 }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
