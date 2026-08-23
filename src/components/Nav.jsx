import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useLayoutEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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

export default function Nav({ handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewer, setViewer] = useState(null);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || "light"; } catch { return "light"; }
  });

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    async function fetchViewer() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) navigate("/login");
          return;
        }
        const data = await res.json();
        setViewer(data.profileUser || null);
      } catch {}
    }
    fetchViewer();
  }, [navigate]);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `nav-link${isActive(path) ? " text-[var(--ink)] bg-[var(--surface-1)]" : ""}`;

  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/content" className="nav-logo">JoinAHack</Link>

        {/* Links */}
        <div className="nav-links">
          <Link to="/content"  className={navLinkClass("/content")}>Feed</Link>
          <Link to="/profile"  className={navLinkClass("/profile")}>Profile</Link>
          <Link to="/friends"  className={navLinkClass("/friends")}>Friends</Link>
          <Link to="/messages" className={navLinkClass("/messages")}>Messages</Link>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {/* Theme toggle */}
          <button
            className="theme-btn"
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Avatar */}
          {viewer && (
            viewer.profile_picture?.startsWith("http") ? (
              <img
                src={viewer.profile_picture}
                alt={viewer.username}
                className="avatar avatar-md"
                onError={e => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="avatar avatar-md" style={{ fontSize: 13 }}>
                {viewer.username?.[0]?.toUpperCase() || "U"}
              </div>
            )
          )}

          {/* Logout */}
          {handleLogout && (
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
