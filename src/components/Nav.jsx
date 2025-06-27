import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Nav({ handleLogout }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    async function fetchFriendsAndViewer() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch friends");
        }
        const data = await res.json();
        setFriends(data.friends || []);
        setViewer(data.viewer || null);
      } catch (err) {
        console.error("Error fetching friends:", err);
        // Don't set loading to false on error to allow retry
      } finally {
        setLoading(false);
      }
    }
    fetchFriendsAndViewer();
  }, [navigate]);

  const firstFriendId = friends.length > 0 ? friends[0].friend.id : null;

  const handleMessageClick = () => {
    if (firstFriendId) {
      navigate(`/message/${firstFriendId}`);
    } else {
      alert("No friends found to message.");
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/content" className="text-xl font-bold text-blue-600">
              JoinAHack
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/content"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Home
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Profile
              </Link>
              <Link
                to="/friends"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Friends
              </Link>
              <Link
                to="/messages"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Messages
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {viewer && viewer.profile_picture && viewer.profile_picture.startsWith('http') ? (
              <img
                src={viewer.profile_picture}
                alt={viewer.username}
                className="w-9 h-9 rounded-full object-cover border border-blue-200 shadow-sm"
                style={{ minWidth: 36, minHeight: 36 }}
                onError={e => { e.target.onerror = null; e.target.src = ''; }}
              />
            ) : viewer ? (
              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-blue-700 border border-blue-200 shadow-sm" style={{ minWidth: 36, minHeight: 36 }}>{viewer.username?.[0]?.toUpperCase() || 'U'}</div>
            ) : null}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}