import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, UserPlus } from "lucide-react";
import Nav from "./Nav";
import BorderBeam from "./ui/BorderBeam";
import StatsCounter from "./ui/StatsCounter";
import RadialGlowButton from "./ui/RadialGlowButton";

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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to load"); }
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
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
        <div className="container"><div className="alert alert-error">{error}</div></div>
      </div>
    );
  }

  const isOwn = viewer?.id === user?.id;
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);

  return (
    <div className="page">
      <Nav handleLogout={handleLogout} />
      <div className="container">
        {error      && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* ── Profile header with BorderBeam ── */}
        <BorderBeam borderRadius={22} beamWidth={1.5} style={{ marginBottom: 24 }}>
          <div style={{ padding: 28 }}>
            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
              {/* Conic glow ring avatar */}
              <div style={{
                padding: 3, borderRadius: "50%",
                background: "conic-gradient(from var(--glow-angle), #9c40ff, #c060ff, #ffaa40, #ff7040, #9c40ff)",
                animation: "rotateGlow 4s linear infinite",
                flexShrink: 0,
              }}>
                {isValidPic(user?.profile_picture) ? (
                  <img src={user.profile_picture} alt={user.username} className="avatar avatar-xl" style={{ border: "3px solid var(--canvas-soft)" }} />
                ) : (
                  <div className="avatar avatar-xl" style={{ border: "3px solid var(--canvas-soft)" }}>
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 2px", color: "var(--ink)" }}>
                  {user?.first_name} {user?.last_name}
                </h1>
                <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 4, fontFamily: "var(--mono)", fontWeight: 500 }}>
                  @{user?.username}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>{user?.email}</div>

                {!isOwn && (
                  <RadialGlowButton
                    onClick={handleAddFriend}
                    disabled={addFriendLoading}
                    size="sm"
                    style={{ marginTop: 14 }}
                  >
                    <UserPlus size={13} />
                    {addFriendLoading ? "Sending…" : "Add to circle"}
                  </RadialGlowButton>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32 }}>
              <StatsCounter value={posts.length} label="Posts" />
              <StatsCounter value={totalLikes} label="Likes" />
            </div>

            {/* Upload photo — own profile */}
            {isOwn && (
              <>
                <hr className="divider" style={{ margin: "20px 0" }} />
                <form onSubmit={handleUploadProfilePicture} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 14px", borderRadius: 99,
                    border: "1px solid var(--hairline)",
                    backgroundColor: "var(--surface-1)",
                    cursor: "pointer", fontSize: 12, color: "var(--ink-muted)",
                  }}>
                    <Camera size={13} />
                    {profilePicture ? profilePicture.name : "Choose photo"}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={e => setProfilePicture(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </label>
                  {profilePicture && (
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-primary btn-sm"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? "Uploading…" : "Update"}
                    </motion.button>
                  )}
                </form>
              </>
            )}
          </div>
        </BorderBeam>

        {/* ── Posts ── */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span className="eyebrow">Posts</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>{posts.length}</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-subtle)", fontSize: 13 }}>
            No posts yet.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card"
                style={{ padding: 18 }}
              >
                {post.images?.[0]?.url && (
                  <img src={post.images[0].url} alt="Post" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--hairline)", marginBottom: 12 }} />
                )}
                <h3 style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px", margin: "0 0 5px", color: "var(--ink)" }}>{post.title}</h3>
                <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.55, margin: "0 0 10px" }}>{post.content}</p>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>
                  <span>{post.likes || 0} likes</span>
                  <span>{post.comments?.length || 0} comments</span>
                  <span style={{ marginLeft: "auto" }}>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
