import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Nav() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
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

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  const firstFriendId = friends.length > 0 ? friends[0].friend.id : null;

  const handleMessageClick = () => {
    if (firstFriendId) {
      navigate(`/message/${firstFriendId}`);
    } else {
      alert("No friends found to message.");
    }
  };

  return (
    <nav className="bg-white shadow-md py-6 px-10 flex justify-between items-center">
      {/* Brand Logo */}
      <h1
        className="text-3xl font-extrabold text-blue-600 tracking-wide cursor-pointer"
        onClick={() => navigate("/content")}
      >
        joinAHack
      </h1>

      {/* Navigation Links */}
      <div className="flex items-center gap-6 text-base font-medium">
        <button
          onClick={() => navigate("/profile")}
          className="text-blue-500 hover:underline"
        >
          Profile
        </button>
        <button
          onClick={handleMessageClick}
          className={`${
            firstFriendId
              ? "text-blue-500 hover:underline cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
          }`}
          disabled={!firstFriendId}
        >
          Message
        </button>
        <button
          onClick={() => navigate("/content")}
          className="text-blue-500 hover:underline"
        >
          Home
        </button>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
