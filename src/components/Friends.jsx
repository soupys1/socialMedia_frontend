import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Friends({ showMessagesList }) {
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load friends");
        const data = await res.json();
        setFriends(data.friends || []);
        setIncomingRequests(data.incomingRequests || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!showMessagesList) {
      // Only fetch all users for friend search if not in messages mode
      const fetchAllUsers = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setAllUsers(data.users || []);
          }
        } catch {}
      };
      fetchAllUsers();
    }
  }, [showMessagesList]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSendRequest = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send friend request");
      }
      // Remove the user from allUsers to show request was sent
      setAllUsers(prev => prev.filter(user => user.id !== userId));
      setError(""); // Clear any previous errors
      setSuccess("Friend request sent successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/accept/${requestId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to accept friend request");
      }
      // Remove the request from incomingRequests and add to friends
      const acceptedRequest = incomingRequests.find(req => req.id === requestId);
      if (acceptedRequest) {
        setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
        setFriends(prev => [...prev, { id: Date.now(), friend: acceptedRequest.user }]);
      }
      setError(""); // Clear any previous errors
      setSuccess("Friend request accepted successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div><Nav /><div className="text-center mt-10 text-gray-600">Loading friends...</div></div>;
  }

  if (showMessagesList) {
    return (
      <div>
        <Nav />
        <div className="max-w-2xl mx-auto py-8">
          <h2 className="text-2xl font-bold mb-4">Your Friends (Messages)</h2>
          {friends.length === 0 && <p className="text-gray-500">No friends yet.</p>}
          <ul className="space-y-4">
            {friends.map((f) => (
              <li key={f.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
                <div className="flex items-center space-x-3">
                  {f.friend?.profile_picture && f.friend.profile_picture.startsWith("http") ? (
                    <img src={f.friend.profile_picture} alt={f.friend.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-gray-600">
                      {f.friend?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold">{f.friend?.username}</span>
                </div>
                <Link to={`/message/${f.friend?.id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Message</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        {friends.length === 0 && <p className="text-gray-500">No friends yet.</p>}
        <ul className="space-y-4 mb-8">
          {friends.map((f) => (
            <li key={f.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div className="flex items-center space-x-3">
                {f.friend?.profile_picture && f.friend.profile_picture.startsWith("http") ? (
                  <img src={f.friend.profile_picture} alt={f.friend.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-gray-600">
                    {f.friend?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-semibold">{f.friend?.username}</span>
              </div>
              <Link to={`/message/${f.friend?.id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Message</Link>
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-4">Incoming Friend Requests</h2>
        {incomingRequests.length === 0 && <p className="text-gray-500">No incoming requests.</p>}
        <ul className="space-y-4 mb-8">
          {incomingRequests.map((req) => (
            <li key={req.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div className="flex items-center space-x-3">
                {req.user?.profile_picture && req.user.profile_picture.startsWith("http") ? (
                  <img src={req.user.profile_picture} alt={req.user.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-gray-600">
                    {req.user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-semibold">{req.user?.username}</span>
              </div>
              <button onClick={() => handleAcceptRequest(req.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Accept</button>
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-4">Find Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-4"
        />
        <ul className="space-y-4">
          {allUsers.filter(u => u.username?.toLowerCase().includes(search.toLowerCase())).map(u => (
            <li key={u.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div className="flex items-center space-x-3">
                {u.profile_picture && u.profile_picture.startsWith("http") ? (
                  <img src={u.profile_picture} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-gray-600">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-semibold">{u.username}</span>
              </div>
              <button onClick={() => handleSendRequest(u.id)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Add Friend</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 