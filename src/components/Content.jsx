import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Pencil } from "lucide-react";
import Nav from "./Nav";
import GlowBorderCard from "./ui/GlowBorderCard";
import RadialGlowButton from "./ui/RadialGlowButton";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

function Avatar({ src, name, size = "md" }) {
  if (src?.startsWith("http")) {
    return <img src={src} alt={name} className={`avatar avatar-${size}`} onError={e => { e.target.style.display = "none"; }} />;
  }
  return <div className={`avatar avatar-${size}`}>{name?.[0]?.toUpperCase() || "?"}</div>;
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
  const [activeTab, setActiveTab] = useState("all");
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
      await fetch(`${API_BASE_URL}/api/content/${postId}/like`, { method: "POST", credentials: "include" });
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, likedByUser: !likedByUser, likes: likedByUser ? (likes || 1) - 1 : (likes || 0) + 1 }
        : p
      ));
    } catch (err) { setError(err.message); }
    finally { setLikeLoading(p => ({ ...p, [postId]: false })); }
  };

  const handleCommentLike = async (postId, commentId, likedByUser, likes) => {
    setCommentLikeLoading(p => ({ ...p, [commentId]: true }));
    try {
      await fetch(`${API_BASE_URL}/api/content/${postId}/comment/${commentId}/like`, { method: "POST", credentials: "include" });
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, comments: p.comments.map(c => c.id === commentId
            ? { ...c, likedByUser: !likedByUser, likes: likedByUser ? (likes || 1) - 1 : (likes || 0) + 1 }
            : c) }
        : p
      ));
    } catch (err) { setError(err.message); }
    finally { setCommentLikeLoading(p => ({ ...p, [commentId]: false })); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/content/${postId}`, { method: "DELETE", credentials: "include" });
      fetchPosts();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/content/${postId}/comment/${commentId}`, { method: "DELETE", credentials: "include" });
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

  /* unique authors for story row */
  const storyAuthors = [...new Map(posts.map(p => [p.author?.id, p.author])).values()].filter(Boolean).slice(0, 10);
  const featuredPost = posts[0] || null;
  const feedPosts = posts.slice(1);
  const filteredPosts = activeTab === "popular"
    ? [...feedPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    : feedPosts;

  return (
    <div className="page">
      <Nav handleLogout={handleLogout} />
      <div className="container-lg">

        {/* ── Alerts ── */}
        <AnimatePresence>
          {error && (
            <motion.div className="alert alert-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div className="alert alert-success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Story row ── */}
        {storyAuthors.length > 0 && (
          <div className="stories-row">
            {storyAuthors.map(author => (
              <Link key={author.id} to={`/profile/${author.id}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
                <div style={{
                  padding: 2, borderRadius: "50%",
                  background: "linear-gradient(135deg, #9c40ff, #ffaa40)",
                }}>
                  <Avatar src={author.profile_picture} name={author.username} size="lg" />
                </div>
                <span style={{ fontSize: 10, color: "var(--ink-subtle)", fontFamily: "var(--mono)", maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {author.username}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* ── Bento top ── */}
        <div className="bento-top">
          {/* Featured post */}
          {featuredPost ? (
            <GlowBorderCard preset="aurora" animationDuration={5} borderWidth={1.5} style={{ height: "100%" }}>
              <PostCard
                post={featuredPost}
                user={user}
                likeLoading={likeLoading}
                commentLikeLoading={commentLikeLoading}
                onLike={handleLike}
                onCommentLike={handleCommentLike}
                onDelete={handleDeletePost}
                onDeleteComment={handleDeleteComment}
                featured
              />
            </GlowBorderCard>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20, border: "1px dashed var(--hairline)", color: "var(--ink-subtle)", fontSize: 13, padding: 40 }}>
              No posts yet — be the first.
            </div>
          )}

          {/* Composer */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>New post</div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div>
                <label className="label" htmlFor="post-title">Title</label>
                <input id="post-title" className="input" type="text" value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What's your post about?" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label" htmlFor="post-content">Content</label>
                <textarea id="post-content" className="textarea" style={{ minHeight: 100 }}
                  value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share something with the community…" required />
              </div>
              <div>
                <label className="label" htmlFor="post-image">Image</label>
                <input id="post-image" type="file" accept="image/*"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  style={{ fontSize: 12, color: "var(--ink-subtle)", width: "100%" }} />
              </div>
              <RadialGlowButton type="submit" disabled={!newPost.title || !newPost.content} style={{ marginTop: 4 }}>
                Publish
              </RadialGlowButton>
            </form>
          </div>
        </div>

        {/* ── Tab filter ── */}
        <div className="tab-bar">
          <button className={`tab-btn${activeTab === "all" ? " active" : ""}`} onClick={() => setActiveTab("all")}>All</button>
          <button className={`tab-btn${activeTab === "popular" ? " active" : ""}`} onClick={() => setActiveTab("popular")}>Popular</button>
        </div>

        {/* ── Posts grid ── */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--ink-subtle)", fontSize: 14 }}>
            Nothing here yet.
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                likeLoading={likeLoading}
                commentLikeLoading={commentLikeLoading}
                onLike={handleLike}
                onCommentLike={handleCommentLike}
                onDelete={handleDeletePost}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, user, likeLoading, commentLikeLoading, onLike, onCommentLike, onDelete, onDeleteComment, featured }) {
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState(null);
  const isOwn = user && post.author?.id === user.id;

  return (
    <div className="card" style={{ padding: featured ? 22 : 18, display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Link to={`/profile/${post.author?.id}`} style={{ textDecoration: "none" }}>
          {post.author?.profile_picture?.startsWith("http") ? (
            <img src={post.author.profile_picture} alt={post.author.username} className="avatar avatar-sm" onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div className="avatar avatar-sm">{post.author?.username?.[0]?.toUpperCase() || "U"}</div>
          )}
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{post.author?.username || "Unknown"}</div>
          <div style={{ fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {isOwn && (
            <>
              <Link to={`/edit/${post.id}`} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} title="Edit">
                <Pencil size={12} />
              </Link>
              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", color: "var(--error)" }} onClick={() => onDelete(post.id)} title="Delete">
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 style={{ fontSize: featured ? 17 : 15, fontWeight: 700, letterSpacing: "-0.3px", margin: "0 0 6px", color: "var(--ink)" }}>{post.title}</h3>
      <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, margin: "0 0 10px" }}>{post.content}</p>

      {post.images?.length > 0 && (
        <img src={post.images[0].url} alt="Post" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--hairline)", marginBottom: 12 }} />
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--hairline)" }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="btn btn-ghost btn-sm"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
            color: post.likedByUser ? "var(--accent)" : "var(--ink-subtle)",
          }}
          onClick={() => onLike(post.id, post.likedByUser, post.likes)}
          disabled={!!likeLoading[post.id]}
        >
          <Heart size={13} fill={post.likedByUser ? "currentColor" : "none"} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{likeLoading[post.id] ? "…" : post.likes || 0}</span>
        </motion.button>

        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px 10px", fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}
          onClick={() => setShowComments(s => !s)}
        >
          {post.comments?.length || 0} comments
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {post.comments?.map(comment => (
                <div key={comment.id} className="card-flat" style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: "var(--ink)" }}>{comment.author?.username}</span>
                      <span style={{ fontSize: 12, color: "var(--ink-muted)", marginLeft: 8 }}>{comment.content}</span>
                      <div style={{ fontSize: 10, color: "var(--ink-subtle)", marginTop: 3, fontFamily: "var(--mono)" }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "3px 7px", color: comment.likedByUser ? "var(--accent)" : "var(--ink-subtle)", display: "inline-flex", alignItems: "center", gap: 4 }}
                        onClick={() => onCommentLike(post.id, comment.id, comment.likedByUser, comment.likes)}
                        disabled={!!commentLikeLoading[comment.id]}
                      >
                        <Heart size={11} fill={comment.likedByUser ? "currentColor" : "none"} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{comment.likes || 0}</span>
                      </button>
                      {user && comment.author?.id === user.id && (
                        <button className="btn btn-ghost btn-sm" style={{ padding: "3px 7px", color: "var(--error)" }} onClick={() => onDeleteComment(post.id, comment.id)}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add comment */}
              {error && <div className="alert alert-error" style={{ padding: "6px 10px", fontSize: 12 }}>{error}</div>}
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
                    if (!r.ok) throw new Error("Failed");
                    e.target.reset();
                    // refresh inline
                    const res = await fetch(`${API_BASE_URL}/api/content`, { credentials: "include" });
                    if (res.ok) { const d = await res.json(); /* will be picked up by parent on next fetch */ }
                  } catch (err) { setError(err.message); }
                }}
                style={{ display: "flex", gap: 6 }}
              >
                <input type="text" name="comment" className="input" placeholder="Add a comment…" required
                  style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} />
                <button type="submit" className="btn btn-secondary btn-sm">Post</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
