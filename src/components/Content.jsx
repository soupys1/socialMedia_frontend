import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

function HeartIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

export default function Content() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [likeLoading, setLikeLoading] = useState({});
  const [commentLikeLoading, setCommentLikeLoading] = useState({});
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content`, { credentials: "include" });
      if (response.status === 401) { navigate("/login"); return; }
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.posts);
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); } }, [success]);
  useEffect(() => { if (error)   { const t = setTimeout(() => setError(null),   5000); return () => clearTimeout(t); } }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    if (selectedFile) formData.append("image", selectedFile);
    try {
      const response = await fetch(`${API_BASE_URL}/api/content`, { method: "POST", credentials: "include", body: formData });
      if (!response.ok) throw new Error("Failed to create post");
      setNewPost({ title: "", content: "" });
      setSelectedFile(null);
      fetchPosts();
      setSuccess("Post published.");
    } catch (err) { setError(err.message); }
  };

  const handleLogout = async () => {
    try { await fetch(`${API_BASE_URL}/api/logout`, { method: "POST", credentials: "include" }); } catch {}
    navigate("/login");
  };

  const handleLike = async (postId, likedByUser, likes) => {
    setLikeLoading(p => ({ ...p, [postId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${postId}/like`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Failed to toggle like");
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likedByUser: !likedByUser, likes: likedByUser ? (likes || 1) - 1 : (likes || 0) + 1 } : p));
    } catch (err) { setError(err.message); }
    finally { setLikeLoading(p => ({ ...p, [postId]: false })); }
  };

  const handleCommentLike = async (postId, commentId, likedByUser, likes) => {
    setCommentLikeLoading(p => ({ ...p, [commentId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${postId}/comment/${commentId}/like`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Failed");
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.map(c => c.id === commentId ? { ...c, likedByUser: !likedByUser, likes: likedByUser ? (likes || 1) - 1 : (likes || 0) + 1 } : c) } : p));
    } catch (err) { setError(err.message); }
    finally { setCommentLikeLoading(p => ({ ...p, [commentId]: false })); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${postId}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete post");
      fetchPosts();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${postId}/comment/${commentId}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete comment");
      fetchPosts();
    } catch (err) { setError(err.message); }
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
      <div className="container-md">
        {error   && <div className="alert alert-error">{error}<button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", padding: "2px 6px" }} onClick={() => setError(null)}>✕</button></div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Create post */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="text-heading" style={{ marginBottom: 16 }}>New post</div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="label" htmlFor="post-title">Title</label>
              <input id="post-title" className="input" type="text" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="What's your post about?" required />
            </div>
            <div>
              <label className="label" htmlFor="post-content">Content</label>
              <textarea id="post-content" className="textarea" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} placeholder="Share something with the community…" required />
            </div>
            <div>
              <label className="label" htmlFor="post-image">Image (optional)</label>
              <input id="post-image" type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} style={{ fontSize: 13, color: "var(--ink-muted)" }} />
            </div>
            <div>
              <button type="submit" className="btn btn-primary btn-sm">Publish</button>
            </div>
          </form>
        </div>

        {/* Posts feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map((post) => (
            <div key={post.id} className="card" style={{ padding: 20 }}>
              {/* Author row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                {post.author?.profile_picture?.startsWith("http") ? (
                  <img src={post.author.profile_picture} alt={post.author.username} className="avatar avatar-md" onError={e => { e.target.style.display="none"; }} />
                ) : (
                  <div className="avatar avatar-md">{post.author?.username?.[0]?.toUpperCase() || "U"}</div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{post.author?.username || "Unknown"}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
                {/* Post actions */}
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <Link to={`/edit/${post.id}`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <EditIcon /> Edit
                  </Link>
                  {user && post.author?.id === user.id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(post.id)} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <TrashIcon /> Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 6, marginTop: 0 }}>{post.title}</h3>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: post.images?.length ? 12 : 0, marginTop: 0 }}>{post.content}</p>

              {post.images?.length > 0 && (
                <img src={post.images[0].url} alt="Post" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--hairline)", marginBottom: 12 }} />
              )}

              {/* Like button */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--hairline)" }}>
                <button
                  className={`btn btn-sm ${post.likedByUser ? "btn-primary" : "btn-ghost"}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                  onClick={() => handleLike(post.id, post.likedByUser, post.likes)}
                  disabled={!!likeLoading[post.id]}
                >
                  <HeartIcon filled={post.likedByUser} />
                  {likeLoading[post.id] ? "…" : `${post.likes || 0}`}
                </button>
                <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{post.comments?.length || 0} comments</span>
              </div>

              {/* Comments */}
              <div style={{ marginTop: 16 }}>
                {post.comments?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {post.comments.map(comment => (
                      <div key={comment.id} className="card-flat" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, fontSize: 12, color: "var(--ink)" }}>{comment.author?.username || "User"}</span>
                          <span style={{ fontSize: 13, color: "var(--ink-muted)", marginLeft: 8 }}>{comment.content}</span>
                          <div style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 4 }}>{new Date(comment.created_at).toLocaleString()}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <button
                            className={`btn btn-sm ${comment.likedByUser ? "btn-primary" : "btn-ghost"}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px" }}
                            onClick={() => handleCommentLike(post.id, comment.id, comment.likedByUser, comment.likes)}
                            disabled={!!commentLikeLoading[comment.id]}
                          >
                            <HeartIcon filled={comment.likedByUser} />
                            {commentLikeLoading[comment.id] ? "…" : (comment.likes || 0)}
                          </button>
                          {user && comment.author?.id === user.id && (
                            <button className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => handleDeleteComment(post.id, comment.id)}>
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const content = new FormData(e.target).get("comment");
                    if (!content?.trim()) return;
                    try {
                      const r = await fetch(`${API_BASE_URL}/api/content/${post.id}/comment`, {
                        method: "POST", credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: content.trim() }),
                      });
                      if (!r.ok) throw new Error("Failed to add comment");
                      e.target.reset();
                      fetchPosts();
                    } catch (err) { setError(err.message); }
                  }}
                  style={{ display: "flex", gap: 8 }}
                >
                  <input type="text" name="comment" className="input" placeholder="Add a comment…" required style={{ flex: 1, padding: "7px 10px", fontSize: 13 }} />
                  <button type="submit" className="btn btn-secondary btn-sm">Post</button>
                </form>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--ink-subtle)", fontSize: 14 }}>
              No posts yet. Be the first to publish something.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
