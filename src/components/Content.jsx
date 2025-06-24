import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";
import { createClient } from "@supabase/supabase-js"; // Optional: for direct Supabase queries

// Initialize Supabase client (optional, if bypassing backend for some queries)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);


// Base URL for backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Content() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch posts + user info
  const fetchContent = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/content`, { credentials: "include" });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch posts");
      }
      const data = await res.json();
      setPosts(data.posts || []);
      setUser(data.user);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/${postId}`, { credentials: "include" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch comments");
      }
      const data = await res.json();
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error(`Failed to load comments for post ${postId}:`, err);
      setError(err.message || "Failed to load comments");
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    posts.forEach((post) => {
      if (!comments[post.id]) {
        fetchComments(post.id);
      }
    });
  }, [posts]);

  // Logout user
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Logout failed");
    }
  };

  // Delete user profile
  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete profile");
      }
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete profile");
    }
  };

  // Create or update post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    const endpoint = editingId ? `${API_BASE_URL}/api/content/${editingId}` : `${API_BASE_URL}/api/content`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        body: method === "POST" ? formData : JSON.stringify({ title, content }),
        headers: method === "PUT" ? { "Content-Type": "application/json" } : {},
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setImage(null);
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchContent();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save post");
      }
    } catch (err) {
      setError(err.message || "Network error");
    }
  };

  // Start editing a post
  const handleEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setImage(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Delete failed");
      }
      fetchContent();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  // Submit a comment on a post
  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentContent = e.target.elements.comment.value;
    if (!commentContent.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent, postId }),
      });
      if (res.ok) {
        e.target.reset();
        fetchComments(postId);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post comment");
      }
    } catch (err) {
      setError(err.message || "Failed to post comment");
    }
  };

  // Toggle post like
  const togglePostLike = async (postId) => {
    if (likeLoading[`post-${postId}`]) return;
    setLikeLoading((l) => ({ ...l, [`post-${postId}`]: true }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/content/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to toggle like");
      }

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const liked = !post.likedByUser;
            return {
              ...post,
              likedByUser: liked,
              likes: liked ? post.likes + 1 : post.likes - 1,
            };
          }
          return post;
        })
      );
    } catch (err) {
      setError(err.message || "Error toggling post like");
    } finally {
      setLikeLoading((l) => ({ ...l, [`post-${postId}`]: false }));
    }
  };

  // Toggle comment like
  const toggleCommentLike = async (commentId, postId) => {
    if (likeLoading[`comment-${commentId}`]) return;
    setLikeLoading((l) => ({ ...l, [`comment-${commentId}`]: true }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to toggle comment like");
      }

      setComments((prev) => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likedByUser: !comment.likedByUser,
              };
            }
            return comment;
          }),
        };
      });
    } catch (err) {
      setError(err.message || "Error toggling comment like");
    } finally {
      setLikeLoading((l) => ({ ...l, [`comment-${commentId}`]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav handleLogout={handleLogout} handleDeleteProfile={handleDeleteProfile} />

      <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Post" : "Create a Post"}</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Title"
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="What's happening?"
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          {!editingId && (
            <input
              type="file"
              accept="image/*"
              className="w-full mb-4"
              onChange={(e) => setImage(e.target.files[0])}
              ref={fileInputRef}
            />
          )}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
              disabled={loading}
            >
              {editingId ? "Update" : "Post"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                  setImage(null);
                  setError("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="max-w-2xl mx-auto mt-6 p-4">
        {loading && <p className="text-center text-gray-500">Loading posts...</p>}
        {!loading && posts.length === 0 && <p className="text-center text-gray-500">No posts yet.</p>}
        {!loading &&
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow-md rounded-lg p-6 mb-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {post.author.profilePicture ? (
                    <img
                      src={post.author.profilePicture}
                      alt={`${post.author.username}'s profile`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {post.author.username[0]}
                    </div>
                  )}
                  <h2 className="text-blue-500 font-semibold">
                    <Link to={`/profile/${post.author.id}`}>@{post.author.username}</Link>
                  </h2>
                </div>
                {user && user.id === post.author.id && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold mb-2">{post.title}</h3>
              <p className="text-gray-700 mb-4 whitespace-pre-line">{post.content}</p>
              {post.images?.length > 0 && (
                <div className="mt-2">
                  {post.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="Post image"
                      className="w-full h-auto rounded-md mb-2"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-3 mt-3">
                <button
                  onClick={() => togglePostLike(post.id)}
                  disabled={likeLoading[`post-${post.id}`]}
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                    post.likedByUser ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
                  } hover:bg-red-600 hover:text-white`}
                  aria-label={post.likedByUser ? "Unlike post" : "Like post"}
                >
                  {post.likedByUser ? "♥" : "♡"} Like
                </button>
                <span>{post.likes} {post.likes === 1 ? "like" : "likes"}</span>
              </div>

              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Comments</h4>
                {comments[post.id]?.length === 0 && (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
                {comments[post.id]?.map((comment) => (
                  <div
                    key={comment.id}
                    className="mb-3 flex items-start space-x-3"
                  >
                    {comment.author.profilePicture ? (
                      <img
                        src={comment.author.profilePicture}
                        alt={`${comment.author.username}'s profile`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {comment.author.username[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm flex items-center space-x-2">
                        <Link
                          to={`/profile/${comment.author.id}`}
                          className="text-blue-500 font-semibold hover:underline"
                        >
                          @{comment.author.username}
                        </Link>
                        <span>{comment.content}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                      <button
                        onClick={() => toggleCommentLike(comment.id, post.id)}
                        disabled={likeLoading[`comment-${comment.id}`]}
                        className={`mt-1 px-2 py-0.5 rounded text-xs font-semibold transition ${
                          comment.likedByUser ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"
                        } hover:bg-red-600 hover:text-white`}
                        aria-label={comment.likedByUser ? "Unlike comment" : "Like comment"}
                      >
                        {comment.likedByUser ? "♥" : "♡"} Like
                      </button>
                    </div>
                  </div>
                ))}
                <form
                  onSubmit={(e) => handleCommentSubmit(e, post.id)}
                  className="mt-2"
                >
                  <input
                    type="text"
                    name="comment"
                    placeholder="Add a comment..."
                    className="w-full px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-600 transition"
                  >
                    Comment
                  </button>
                </form>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}