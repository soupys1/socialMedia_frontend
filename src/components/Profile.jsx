import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

const isValidPic = (p) => typeof p === "string" && p.startsWith("http");

export default function Profile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const query = id ? `?id=${id}` : "";
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile${query}`, { credentials: "include" });
      if (res.status === 401) { navigate("/login"); return; }
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to load profile"); }
      const data = await res.json();
      setViewer(data.viewer);
      setUser(data.profileUser);
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchProfile().then(() => { if (!mounted) return; });
    return () => { mounted = false; };
  }, [id, location.pathname]);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); }
  }, [successMsg]);

  const handleUploadProfilePicture = async (e) => {
    e.preventDefault();
    if (!profilePicture) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/picture`, { method: "POST", credentials: "include", body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Upload failed"); }
      setProfilePicture(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMsg("Profile picture updated.");
      fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setAddFriendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/${user.id}`, { method: "POST", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to send friend request"); }
      setSuccessMsg("Friend request sent!");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddFriendLoading(false);
    }
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

  if (error && !user) {
    return (
      <div className="page">
        <Nav handleLogout={handleLogout} />
        <div className="container">
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  const isOwn = viewer?.id === user?.id;

  return (
    <div className="page">
      <Nav handleLogout={handleLogout} />
      <div className="container">
        {error     && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* Profile card */}
        <div className="card" style={{ marginBottom: 24 }}>
          {/* Avatar + info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            {isValidPic(user?.profile_picture) ? (
              <img src={user.profile_picture} alt={user.username} className="avatar avatar-xl" />
            ) : (
              <div className="avatar avatar-xl" style={{ fontSize: 26 }}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.4px", margin: "0 0 2px" }}>
                {user?.first_name} {user?.last_name}
              </h1>
              <div style={{ fontSize: 13, color: "var(--ink-subtle)", marginBottom: 8 }}>@{user?.username}</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{user?.email}</div>

              {!isOwn && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={handleAddFriend}
                  disabled={addFriendLoading}
                >
                  {addFriendLoading ? "Sending…" : "Add friend"}
                </button>
              )}
            </div>
          </div>

          {/* Upload picture (own profile only) */}
          {isOwn && (
            <>
              <hr className="divider" />
              <form onSubmit={handleUploadProfilePicture} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => setProfilePicture(e.target.files[0])}
                  style={{ fontSize: 13, color: "var(--ink-muted)", flex: 1, minWidth: 0 }}
                />
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  disabled={!profilePicture || uploadLoading}
                >
                  {uploadLoading ? "Uploading…" : "Update photo"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Posts */}
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="eyebrow">Posts · {posts.length}</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-subtle)", fontSize: 14 }}>
            No posts yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map(post => (
              <div key={post.id} className="card" style={{ padding: 18 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.2px", margin: "0 0 6px" }}>{post.title}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6, margin: "0 0 10px" }}>{post.content}</p>
                {post.images?.[0]?.url && (
                  <img src={post.images[0].url} alt="Post" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--hairline)" }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, fontSize: 12, color: "var(--ink-subtle)" }}>
                  <span>{post.likes || 0} likes</span>
                  <span>{post.comments?.length || 0} comments</span>
                  <span style={{ marginLeft: "auto" }}>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
