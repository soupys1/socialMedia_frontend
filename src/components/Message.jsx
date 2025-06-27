import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Message() {
  const { id: friendIdParam } = useParams();
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState(null);
  const [viewer, setViewer] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const fetchProfile = async () => {
    setLoadingFriends(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load profile");
      }
      const data = await res.json();
      setFriends(data.friends || []);
      setViewer(data.viewer);
    } catch (err) {
      setError(err.message || "Failed to load friends");
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchMessages = async (friendId) => {
    if (!friendId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/message/${friendId}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load messages");
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !friendIdParam) return;
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/message/${friendIdParam}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send message");
      }
      setMessageText("");
      fetchMessages(friendIdParam);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.message || "Failed to send message");
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

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages(friendIdParam);
    // eslint-disable-next-line
  }, [friendIdParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loadingFriends) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Nav handleLogout={handleLogout} />
        <p className="text-gray-500">Loading friends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav handleLogout={handleLogout} />
        <div className="text-center mt-10 text-red-500" role="alert">{error}</div>
      </div>
    );
  }

  const friend = friends.find((f) => f.friend.id === Number(friendIdParam));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Nav handleLogout={handleLogout} />
      <div className="flex-grow flex justify-center items-start py-4 px-2">
        <div className="w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow flex overflow-hidden">
          {/* Friends List */}
          <div className="w-1/3 border-r overflow-y-auto" aria-label="Friends list">
            <h2 className="p-4 text-xl font-semibold border-b">Friends</h2>
            {friends.length === 0 && (
              <p className="p-4 text-gray-500">No friends found.</p>
            )}
            <ul>
              {friends.map(({ friend }) => (
                <li key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-100">
                  <Link
                    to={`/message/${friend.id}`}
                    className={`flex items-center space-x-2 w-full text-left focus:outline-none ${
                      friend.id === Number(friendIdParam) ? "bg-blue-100 font-semibold" : ""
                    }`}
                    aria-current={friend.id === Number(friendIdParam) ? "true" : "false"}
                  >
                    <span>{friend.first_name} {friend.last_name} (@{friend.username})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Chat Area */}
          <div className="w-2/3 flex flex-col justify-between" aria-label="Chat area">
            <div className="p-4 border-b flex items-center space-x-3 bg-blue-50">
              {friendIdParam && friend && (
                <>
                  {friend.friend.profile_picture && friend.friend.profile_picture.startsWith('http') ? (
                    <img
                      src={friend.friend.profile_picture}
                      alt={friend.friend.username}
                      className="w-12 h-12 rounded-full object-cover border border-blue-200 shadow-sm"
                      style={{ minWidth: 48, minHeight: 48 }}
                      onError={e => { e.target.onerror = null; e.target.src = ''; }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-blue-700 border border-blue-200 shadow-sm" style={{ minWidth: 48, minHeight: 48 }}>{friend.friend.username?.[0]?.toUpperCase() || 'U'}</div>
                  )}
                  <h3 className="text-lg font-semibold">
                    {friend.friend.first_name} {friend.friend.last_name} (@{friend.friend.username})
                  </h3>
                </>
              )}
            </div>
            <div className="p-4 overflow-y-auto flex-grow space-y-4" aria-live="polite">
              {loadingMessages && <p className="text-center text-gray-500">Loading messages...</p>}
              {!loadingMessages && !friendIdParam && (
                <p className="text-center text-gray-500">Select a friend to start chatting.</p>
              )}
              {!loadingMessages && friendIdParam && messages.length === 0 && (
                <p className="text-center text-gray-500">No messages yet.</p>
              )}
              {messages.map((msg) => {
                const isSender = msg.sender_id === viewer?.id;
                const avatarUrl = msg.senderProfilePic && msg.senderProfilePic.startsWith('http') ? msg.senderProfilePic : null;
                const avatarInitial = msg.senderName ? msg.senderName[0].toUpperCase() : 'U';
                const senderName = msg.senderName || 'Unknown';
                const createdAt = new Date(msg.created_at);
                const date = createdAt.toLocaleDateString();
                const time = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"} items-end space-x-2 w-full mb-2`}
                  >
                    {/* Avatar (always sender) */}
                    {!isSender && (
                      avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={senderName}
                          className="w-8 h-8 rounded-full object-cover bg-gray-300"
                          style={{ minWidth: 32, minHeight: 32 }}
                          onError={e => { e.target.onerror = null; e.target.src = ''; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-base font-bold text-blue-700" style={{ minWidth: 32, minHeight: 32 }}>{avatarInitial}</div>
                      )
                    )}
                    <div
                      className={`flex flex-col ${isSender ? "items-end" : "items-start"} max-w-[70%]`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 text-sm break-words shadow-md ${
                          isSender
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                        role="log"
                      >
                        {msg.content}
                      </div>
                      <div
                        className={`text-xs text-gray-500 mt-1 ${isSender ? "text-right" : "text-left"}`}
                      >
                        {senderName} • {date} • {time}
                      </div>
                    </div>
                    {isSender && (
                      avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={senderName}
                          className="w-8 h-8 rounded-full object-cover bg-gray-300"
                          style={{ minWidth: 32, minHeight: 32 }}
                          onError={e => { e.target.onerror = null; e.target.src = ''; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-base font-bold text-blue-700" style={{ minWidth: 32, minHeight: 32 }}>{avatarInitial}</div>
                      )
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            {friendIdParam && (
              <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-grow border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                  disabled={!messageText.trim()}
                  aria-label="Send message"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}