import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = "https://socialmedia-backend-k1nf.onrender.com";

export default function Content() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content`, {
        credentials: "include",
      });
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
      setUser(data.user || null);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      let url = `${API_BASE_URL}/api/content`;
      let method = editingId ? "PUT" : "POST";
      if (editingId) url += `/${editingId}`;

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save post");
      }
      setTitle("");
      setContent("");
      setImage(null);
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchContent();
    } catch (err) {
      setError(err.message || "Failed to save post");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setImage(null);
    setError("");
  };

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav handleLogout={handleLogout} />
      <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Post" : "Create a Post"}</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            className="w-full mb-4 px-4 py-2 border rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="What's on your mind?"
            className="w-full mb-4 px-4 py-2 border rounded-md"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            className="w-full mb-4"
            onChange={(e) => setImage(e.target.files[0])}
            ref={fileInputRef}
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
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
        {!loading && posts.map((post) => (
          <div key={post.id} className="bg-white rounded shadow-md p-4 mb-6">
            <div className="mb-2">
              <h3 className="font-bold text-lg">{post.title}</h3>
              <p className="text-gray-600 whitespace-pre-line">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <img src={post.images[0].url} alt="Post" className="w-full h-auto mt-4 rounded-md" />
              )}
            </div>
            {user && user.id === post.author_id && (
              <div className="flex space-x-4">
                <button onClick={() => handleEdit(post)} className="text-blue-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:underline">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}