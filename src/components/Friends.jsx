import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, X, MessageSquare } from "lucide-react";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

const TOPICS = ["React", "Python", "ML / AI", "Design", "Web3", "Mobile", "Hackathon", "Open Source", "Rust", "DevOps", "iOS", "Cloud"];

function Avatar({ src, name, size = "md" }) {
  if (src?.startsWith("http")) {
    return <img src={src} alt={name} className={`avatar avatar-${size}`} onError={e => { e.target.style.display = "none"; }} />;
  }
  return <div className={`avatar avatar-${size}`}>{name?.[0]?.toUpperCase() || "?"}</div>;
}

function TopicCell({ label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        backgroundColor: hovered ? "rgba(156,64,255,0.14)" : "rgba(255,255,255,0.03)",
        borderColor: hovered ? "rgba(156,64,255,0.45)" : "var(--hairline)",
        color: hovered ? "var(--accent)" : "var(--ink-subtle)",
      }}
      transition={{ duration: 0.15 }}
      style={{
        borderRadius: 12, border: "1px solid",
        padding: "10px 14px",
        cursor: "default",
        fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500,
        textAlign: "center",
        userSelect: "none",
      }}
    >
      {label}
    </motion.div>
  );
}

export default function Friends({ showMessagesList }) {
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchFriends = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setFriends(data.friends || []);
      setIncomingRequests(data.incomingRequests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFriends(); }, []);

  useEffect(() => {
    if (showMessagesList) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, { credentials: "include" });
        if (res.ok) { const data = await res.json(); setAllUsers(data.users || []); }
      } catch {}
    })();
  }, [showMessagesList]);

  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); } }, [success]);
  useEffect(() => { if (error)   { const t = setTimeout(() => setError(""),   5000); return () => clearTimeout(t); } }, [error]);

  const handleSendRequest = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, { method: "POST", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setSuccess("Friend request sent.");
    } catch (err) { setError(err.message); }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/accept/${requestId}`, { method: "POST", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      await fetchFriends();
      setSuccess("Request accepted.");
    } catch (err) { setError(err.message); }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/deny/${requestId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
      setSuccess("Request declined.");
    } catch (err) { setError(err.message); }
  };

  const handleLogout = async () => {
    try { await fetch(`${API_BASE_URL}/api/logout`, { method: "POST", credentials: "include" }); } catch {}
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="page">
        <Nav handleLogout={handleLogout} />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  /* ── Message list mode ── */
  if (showMessagesList) {
    return (
      <div className="page">
        <Nav handleLogout={handleLogout} />
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 20 }}>Messages</div>
          {friends.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-subtle)", fontSize: 14 }}>
              Add friends to start messaging.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {friends.map(f => (
                <Link
                  key={f.id}
                  to={`/message/${f.friend?.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(156,64,255,0.06)" }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 18px", borderRadius: 16,
                      border: "1px solid var(--hairline)",
                      backgroundColor: "var(--canvas-soft)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ padding: 2, borderRadius: "50%", background: "linear-gradient(135deg, #9c40ff, #ffaa40)" }}>
                        <Avatar src={f.friend?.profile_picture} name={f.friend?.username} size="md" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{f.friend?.username}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>
                          {f.friend?.first_name} {f.friend?.last_name}
                        </div>
                      </div>
                    </div>
                    <MessageSquare size={16} color="var(--ink-subtle)" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Circle page ── */
  const filteredUsers = allUsers.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <Nav handleLogout={handleLogout} />
      <div className="container-md">
        <AnimatePresence>
          {error   && <motion.div className="alert alert-error"   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{error}</motion.div>}
          {success && <motion.div className="alert alert-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{success}</motion.div>}
        </AnimatePresence>

        {/* ── Topic grid ── */}
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Explore topics</div>
          <div className="topic-grid">
            {TOPICS.map(t => <TopicCell key={t} label={t} />)}
          </div>
        </div>

        {/* ── Incoming requests ── */}
        {incomingRequests.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Requests · {incomingRequests.length}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {incomingRequests.map(req => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 16, border: "1px solid var(--hairline)", backgroundColor: "var(--canvas-soft)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ padding: 2, borderRadius: "50%", background: "linear-gradient(135deg, #9c40ff, #ffaa40)" }}>
                      <Avatar src={req.user?.profile_picture} name={req.user?.username} size="md" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{req.user?.username}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>
                        {req.user?.first_name} {req.user?.last_name}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <motion.button whileTap={{ scale: 0.92 }} className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(req.id)}>
                      <Check size={13} /> Accept
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.92 }} className="btn btn-danger btn-sm" onClick={() => handleDenyRequest(req.id)}>
                      <X size={13} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Your circle ── */}
        {friends.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Your circle · {friends.length}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {friends.map(f => (
                <Link key={f.id} to={`/profile/${f.friend?.id}`} style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 14px 8px 8px",
                      borderRadius: 99, border: "1px solid var(--hairline)",
                      backgroundColor: "var(--canvas-soft)", cursor: "pointer",
                    }}
                  >
                    <div style={{ padding: 1.5, borderRadius: "50%", background: "linear-gradient(135deg, #9c40ff, #ffaa40)" }}>
                      <Avatar src={f.friend?.profile_picture} name={f.friend?.username} size="sm" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{f.friend?.username}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Find people ── */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Find people</div>
          <input
            type="text"
            className="input"
            placeholder="Search by username or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 14 }}
          />
          {filteredUsers.length === 0 ? (
            <div style={{ color: "var(--ink-subtle)", fontSize: 13 }}>
              {search ? "No users found." : "Loading…"}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {filteredUsers.map(u => (
                <motion.div
                  key={u.id}
                  whileHover={{ borderColor: "rgba(156,64,255,0.3)" }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 16, border: "1px solid var(--hairline)", backgroundColor: "var(--canvas-soft)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar src={u.profile_picture} name={u.username} size="sm" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{u.username}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>
                        {u.first_name} {u.last_name}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSendRequest(u.id)}
                    style={{ padding: "4px 10px" }}
                  >
                    <UserPlus size={12} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
