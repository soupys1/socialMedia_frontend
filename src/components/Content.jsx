import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

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
      const response = await fetch(`${API_BASE_URL}/api/content`, {
        credentials: "include",
      });
      if (response.status === 401) {
        navigate("/login");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data.posts);
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/content`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setNewPost({ title: "", content: "" });
      setSelectedFile(null);
      fetchPosts();
      setSuccess("Post created successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error('Logout failed:', response.status);
      }
      
      // Always navigate to login, even if logout request fails
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if there's an error
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav handleLogout={handleLogout} />
        <div className="text-center mt-10 text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav handleLogout={handleLogout} />
        <div className="text-center mt-10 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <Nav handleLogout={handleLogout} />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow" role="alert">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right font-bold text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 shadow" role="alert">
            {success}
            <button 
              onClick={() => setSuccess(null)} 
              className="float-right font-bold text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-extrabold mb-6 text-blue-600">Create New Post</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Title
              </label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="shadow border border-blue-200 rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Content
              </label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="shadow border border-blue-200 rounded-lg w-full py-2 px-4 text-gray-700 h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="shadow border border-blue-200 rounded-lg w-full py-2 px-4 text-gray-700"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition text-lg shadow-md"
            >
              Create Post
            </button>
          </form>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <div className="flex items-center mb-4">
                {post.author?.profile_picture && post.author.profile_picture.startsWith('http') ? (
                  <img
                    src={post.author.profile_picture}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-full object-cover bg-gray-300 mr-4 border border-blue-200 shadow-sm"
                    style={{ minWidth: 48, minHeight: 48 }}
                    onError={e => { e.target.onerror = null; e.target.src = ''; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4 text-xl font-bold text-blue-600 border border-blue-200 shadow-sm" style={{ minWidth: 48, minHeight: 48 }}>{post.author?.username?.[0]?.toUpperCase() || 'U'}</div>
                )}
                <div>
                  <h3 className="font-semibold text-lg text-blue-700">{post.author?.username || "Unknown"}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">{post.title}</h2>
              <p className="text-gray-700 mb-4">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <img
                  src={post.images[0].url}
                  alt="Post"
                  className="w-full h-auto rounded-md mb-4 border border-blue-100"
                />
              )}
              <div className="flex justify-between items-center mt-2 mb-2">
                <Link
                  to={`/edit/${post.id}`}
                  className="text-blue-500 hover:underline font-semibold"
                >
                  Edit
                </Link>
                <button
                  onClick={async () => {
                    setLikeLoading(prev => ({ ...prev, [post.id]: true }));
                    try {
                      const response = await fetch(`${API_BASE_URL}/api/content/${post.id}/like`, {
                        method: "POST",
                        credentials: "include",
                      });
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to toggle like");
                      }
                      setPosts(prevPosts => prevPosts.map(p =>
                        p.id === post.id
                          ? {
                              ...p,
                              likedByUser: !p.likedByUser,
                              likes: p.likedByUser ? (p.likes || 1) - 1 : (p.likes || 0) + 1
                            }
                          : p
                      ));
                      setError("");
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setLikeLoading(prev => ({ ...prev, [post.id]: false }));
                    }
                  }}
                  className={`ml-4 px-3 py-1 rounded-lg text-sm font-semibold transition shadow-sm border ${post.likedByUser ? "bg-blue-100 text-blue-600 border-blue-400" : "text-blue-500 hover:bg-blue-100 border-blue-200"}`}
                  disabled={!!likeLoading[post.id]}
                >
                  {likeLoading[post.id] ? "..." : post.likedByUser ? `Unlike (${post.likes || 0})` : `Like (${post.likes || 0})`}
                </button>
                {user && post.author?.id === user.id && (
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this post?")) {
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/content/${post.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          });
                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Failed to delete post");
                          }
                          fetchPosts();
                        } catch (err) {
                          setError(err.message);
                        }
                      }
                    }}
                    className="text-red-500 hover:underline ml-4 font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
              {/* Comments Section */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-blue-600">Comments</h4>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-center justify-between bg-blue-50 rounded p-3 mb-2 border border-blue-100">
                      <div>
                        <span className="font-bold text-blue-700">{comment.author?.username || 'User'}:</span> {comment.content}
                        <span className="text-xs text-gray-400 ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            setCommentLikeLoading(prev => ({ ...prev, [comment.id]: true }));
                            try {
                              const response = await fetch(`${API_BASE_URL}/api/content/${post.id}/comment/${comment.id}/like`, {
                                method: "POST",
                                credentials: "include",
                              });
                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || "Failed to toggle like");
                              }
                              setPosts(prevPosts => prevPosts.map(p =>
                                p.id === post.id
                                  ? {
                                      ...p,
                                      comments: p.comments.map(c =>
                                        c.id === comment.id
                                          ? {
                                              ...c,
                                              likedByUser: !c.likedByUser,
                                              likes: c.likedByUser ? (c.likes || 1) - 1 : (c.likes || 0) + 1
                                            }
                                          : c
                                      )
                                    }
                                  : p
                              ));
                              setError("");
                            } catch (err) {
                              setError(err.message);
                            } finally {
                              setCommentLikeLoading(prev => ({ ...prev, [comment.id]: false }));
                            }
                          }}
                          className={`text-xs px-2 py-1 rounded-lg font-semibold transition shadow-sm border ${comment.likedByUser ? "bg-blue-100 text-blue-600 border-blue-400" : "text-blue-400 hover:bg-blue-100 border-blue-200"}`}
                          disabled={!!commentLikeLoading[comment.id]}
                        >
                          {commentLikeLoading[comment.id] ? "..." : comment.likedByUser ? `Unlike (${comment.likes || 0})` : `Like (${comment.likes || 0})`}
                        </button>
                        {user && comment.author?.id === user.id && (
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this comment?")) {
                                try {
                                  const response = await fetch(`${API_BASE_URL}/api/content/${post.id}/comment/${comment.id}`, {
                                    method: "DELETE",
                                    credentials: "include",
                                  });
                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || "Failed to delete comment");
                                  }
                                  fetchPosts();
                                } catch (err) {
                                  setError(err.message);
                                }
                              }
                            }}
                            className="text-red-400 hover:underline text-xs font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No comments yet.</p>
                )}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const content = formData.get('comment');
                    if (!content.trim()) return;

                    try {
                      const response = await fetch(`${API_BASE_URL}/api/content/${post.id}/comment`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: content.trim() }),
                      });
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to add comment");
                      }
                      e.target.reset();
                      fetchPosts();
                    } catch (err) {
                      setError(err.message);
                    }
                  }}
                  className="mt-3"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="comment"
                      placeholder="Add a comment..."
                      className="flex-1 border border-blue-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition font-semibold shadow"
                    >
                      Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}