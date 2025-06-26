import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Nav({ handleLogout }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch friends");
        const data = await res.json();
        setFriends(data.friends || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFriends();
  }, []);

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
              Social Media App
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
            </div>
          </div>
          <div className="flex items-center space-x-4">
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