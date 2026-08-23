import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

function Avatar({ src, name, size = "md" }) {
  if (src?.startsWith("http")) {
    return <img src={src} alt={name} className={`avatar avatar-${size}`} onError={e => { e.target.style.display = "none"; }} />;
  }
  return <div className={`avatar avatar-${size}`}>{name?.[0]?.toUpperCase() || "?"}</div>;
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
      if (!res.ok) throw new Error("Failed to load friends");
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to send request"); }
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setSuccess("Friend request sent.");
    } catch (err) { setError(err.message); }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/accept/${requestId}`, { method: "POST", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to accept"); }
      await fetchFriends();
      setSuccess("Friend request accepted.");
    } catch (err) { setError(err.message); }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/deny/${requestId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to deny"); }
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

  /* ── Messages list mode ── */
  if (showMessagesList) {
    return (
      <div className="page">
        <Nav handleLogout={handleLogout} />
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 16 }}>Messages</div>
          {friends.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-subtle)", fontSize: 14 }}>
              Add friends to start messaging.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {friends.map(f => (
                <div key={f.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar src={f.friend?.profile_picture} name={f.friend?.username} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{f.friend?.username}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{f.friend?.first_name} {f.friend?.last_name}</div>
                    </div>
                  </div>
                  <Link to={`/message/${f.friend?.id}`} className="btn btn-primary btn-sm">Message</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Full friends page ── */
  const filteredUsers = allUsers.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <Nav handleLogout={handleLogout} />
      <div className="container">
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Friends */}
        <section style={{ marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Friends · {friends.length}</div>
          {friends.length === 0 ? (
            <div style={{ color: "var(--ink-subtle)", fontSize: 14 }}>No friends yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {friends.map(f => (
                <div key={f.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar src={f.friend?.profile_picture} name={f.friend?.username} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{f.friend?.username}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{f.friend?.first_name} {f.friend?.last_name}</div>
                    </div>
                  </div>
                  <Link to={`/message/${f.friend?.id}`} className="btn btn-secondary btn-sm">Message</Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Incoming requests */}
        {incomingRequests.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Requests · {incomingRequests.length}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {incomingRequests.map(req => (
                <div key={req.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar src={req.user?.profile_picture} name={req.user?.username} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{req.user?.username}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{req.user?.first_name} {req.user?.last_name}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDenyRequest(req.id)}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Find users */}
        <section>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Find people</div>
          <input
            type="text"
            className="input"
            placeholder="Search by username or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          {filteredUsers.length === 0 ? (
            <div style={{ color: "var(--ink-subtle)", fontSize: 14 }}>{search ? "No users found." : "Loading users…"}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredUsers.map(u => (
                <div key={u.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar src={u.profile_picture} name={u.username} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{u.first_name} {u.last_name}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSendRequest(u.id)}>Add</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
