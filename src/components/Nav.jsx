import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useLayoutEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

/* dock icons */
function IconFeed() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function IconCircle() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconThreads() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconYou() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

const NAV_LINKS = [
  { to: "/content",  label: "Feed",     Icon: IconFeed },
  { to: "/friends",  label: "Friends",  Icon: IconCircle },
  { to: "/messages", label: "Messages", Icon: IconThreads },
  { to: "/profile",  label: "You",      Icon: IconYou },
];

export default function Nav({ handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewer, setViewer] = useState(null);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || "dark"; } catch { return "dark"; }
  });

  /* spotlight within pill */
  const spotX = useMotionValue(50);
  const springX = useSpring(spotX, { stiffness: 200, damping: 35, mass: 0.4 });
  const pillBg = useTransform(
    springX,
    (x) => `radial-gradient(180px circle at ${x}% 50%, rgba(156,64,255,0.14) 0%, transparent 70%)`
  );

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spotX.set(((e.clientX - rect.left) / rect.width) * 100);
  };
  const handleMouseLeave = () => spotX.set(50);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    async function fetchViewer() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
        if (!res.ok) { if (res.status === 401) navigate("/login"); return; }
        const data = await res.json();
        setViewer(data.profileUser || null);
      } catch {}
    }
    fetchViewer();
  }, [navigate]);

  const isActive = (to) =>
    location.pathname === to || (to !== "/content" && location.pathname.startsWith(to));

  return (
    <>
      {/* ── Floating pill ── */}
      <div className="nav-wrap">
        <motion.div
          className="nav-pill"
          style={{ background: pillBg }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo */}
          <Link to="/content" className="nav-pill-logo">JoinAHack</Link>

          {/* Links — hidden on mobile */}
          <div className="nav-pill-links" style={{ display: "flex", flex: 1, justifyContent: "center", gap: 2 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-pill-link${isActive(to) ? " active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 4 }}>
            <button
              className="theme-btn"
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {viewer && (
              <Link to="/profile" style={{ textDecoration: "none" }}>
                {viewer.profile_picture?.startsWith("http") ? (
                  <img src={viewer.profile_picture} alt={viewer.username} className="avatar avatar-sm" onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="avatar avatar-sm" style={{ fontSize: 11 }}>
                    {viewer.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </Link>
            )}

            {handleLogout && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                style={{ fontSize: 11, padding: "4px 10px", color: "var(--ink-subtle)" }}
              >
                Out
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Mobile bottom dock ── */}
      <div className="dock">
        {NAV_LINKS.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <motion.div key={to} whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.92 }}>
              <Link
                to={to}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "8px 14px",
                  borderRadius: 99,
                  textDecoration: "none",
                  color: active ? "var(--accent)" : "var(--ink-subtle)",
                  backgroundColor: active ? "var(--accent-muted)" : "transparent",
                  transition: "color 0.12s",
                }}
                title={label}
              >
                <Icon />
                <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 500 }}>{label}</span>
              </Link>
            </motion.div>
          );
        })}

        <div style={{ width: 1, height: 28, background: "var(--hairline)", margin: "0 4px" }} />

        <motion.button
          whileHover={{ scale: 1.18 }}
          className="theme-btn"
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          style={{ border: "none", background: "transparent" }}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </motion.button>
      </div>
    </>
  );
}
