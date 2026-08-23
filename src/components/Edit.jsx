import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Edit() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const handleLogout = async () => {
    try { await fetch(`${API_BASE_URL}/api/logout`, { method: "POST", credentials: "include" }); } catch {}
    navigate("/login");
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/content/${id}`, { credentials: "include" });
        if (!response.ok) {
          if (response.status === 401) { navigate("/login"); return; }
          const d = await response.json();
          throw new Error(d.error || "Failed to fetch post");
        }
        const data = await response.json();
        const post = data.post;
        const currentUser = data.user;
        if (!post) { setError("Post not found"); return; }
        if (post.author?.id !== currentUser?.id) { setError("You can only edit your own posts"); return; }
        setTitle(post.title);
        setContent(post.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || "Failed to update post"); }
      navigate("/content");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="page">
      <Nav handleLogout={handleLogout} />
      <div className="container">
        {/* Back link */}
        <Link
          to="/content"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-subtle)", textDecoration: "none", marginBottom: 20 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to feed
        </Link>

        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Editing post</div>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.4px", margin: 0 }}>Edit your post</h1>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label" htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                type="text"
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="edit-content">Content</label>
              <textarea
                id="edit-content"
                className="textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={5}
                required
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/content")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
