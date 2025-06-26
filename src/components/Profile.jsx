import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Nav from "./Nav";

// Use environment variable or fallback to Render backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";
console.log("API_BASE_URL:", API_BASE_URL);

export default function Profile() {
  const { id } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Helper to check for valid profile picture URL
  const isValidProfilePic = (pic) => typeof pic === 'string' && pic.startsWith("http");

  // Fetch profile data
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const query = id ? `?id=${id}` : "";
      const fetchUrl = `${API_BASE_URL}/api/profile${query}`;
      console.log("Profile fetch URL:", fetchUrl);
      try {
        const res = await fetch(fetchUrl, { credentials: "include" });
        console.log("Profile response status:", res.status);
        if (res.status === 401) {
          setError("You are not authorized. Please log in again.");
          navigate("/login");
          return;
        }
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load profile");
        }
        const data = await res.json();
        if (isMounted) {
          setViewer(data.viewer);
          setUser(data.profileUser);
          setPosts(data.posts || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Could not load profile.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [id, location.pathname]);

  // Upload profile picture
  const handleUploadProfilePicture = async (e) => {
    e.preventDefault();
    if (!profilePicture) {
      setError("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/picture`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload profile picture");
      }
      setProfilePicture(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refetch profile
      setLoading(true);
      setTimeout(() => window.location.reload(), 500); // Quick fix to refresh
    } catch (err) {
      setError(err.message || "Failed to upload profile picture.");
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  // Debug log for profile picture
  const profilePic = user && user.profile_picture;
  const validPic = isValidProfilePic(profilePic);
  console.log("user.profile_picture:", profilePic, "isValid:", validPic);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav handleLogout={handleLogout} />
        <div className="text-center mt-10 text-red-500" role="alert">{error}</div>
        <div className="text-center mt-2 text-gray-500">URL: {location.pathname}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav handleLogout={handleLogout} />
        <div className="text-center mt-10 text-gray-600 animate-pulse" role="status">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user || !viewer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav handleLogout={handleLogout} />
        <div className="text-center mt-10 text-red-500" role="alert">
          Could not load user data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav handleLogout={handleLogout} />
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg p-6 rounded-lg max-w-3xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            {validPic ? (
              <img
                src={profilePic}
                alt={`${user.username}'s profile picture`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-gray-600">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {user.first_name} {user.last_name} (@{user.username})
              </h1>
              <p className="text-gray-600">{user.email}</p>
              {viewer.id !== user.id && (
                <button
                  onClick={async () => {
                    await fetch(`${API_BASE_URL}/api/profile/${user.id}`, {
                      method: "POST",
                      credentials: "include",
                    });
                    alert("Friend request sent!");
                    window.location.reload();
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-2"
                >
                  Add Friend
                </button>
              )}
            </div>
          </div>
          <form onSubmit={handleUploadProfilePicture} className="mb-6">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={e => setProfilePicture(e.target.files[0])}
              className="mb-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Upload Profile Picture
            </button>
          </form>
          <h2 className="text-xl font-semibold mb-4">Posts</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm border">
                <h3 className="text-lg font-bold text-blue-600 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-2">{post.content}</p>
                {post.images?.length > 0 && post.images[0].url && (
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full h-auto rounded-md"
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}