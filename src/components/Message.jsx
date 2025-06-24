import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Nav from "./Nav";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (optional, for direct queries)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);


// Base URL for backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
      console.error(err);
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

      // Optional: Direct Supabase query
      /*
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:senderId(id, username, firstName, lastName, profilePicture)")
        .or(`senderId.eq.${viewer?.id},receiverId.eq.${viewer?.id}`)
        .or(`senderId.eq.${friendId},receiverId.eq.${friendId}`)
        .order("createdAt", { ascending: true });
      if (error) throw error;
      setMessages(data);
      */
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send message");
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to unfriend this user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/unfriend/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to unfriend");
      }
      await fetchProfile();
      if (Number(friendIdParam) === friendId) {
        navigate("/message");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to unfriend");
    }
  };

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

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Logout failed");
      }
      navigate("/login");
    } catch (err) {
      setError(err.message || "Logout failed");
    }
  };

  // Real-time message subscription (optional)
  useEffect(() => {
    fetchProfile();
    let subscription;

    // Optional: Supabase real-time subscription
    /*
    if (friendIdParam && viewer) {
      subscription = supabase
        .channel(`messages:${viewer.id}:${friendIdParam}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `senderId=in.(${viewer.id},${friendIdParam}),receiverId=in.(${viewer.id},${friendIdParam})`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        )
        .subscribe();
    }
    */

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [friendIdParam]);

  useEffect(() => {
    fetchMessages(friendIdParam);
  }, [friendIdParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loadingFriends) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Nav handleLogout={handleLogout} handleDeleteProfile={handleDeleteProfile} />
        <p className="text-gray-500">Loading friends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav handleLogout={handleLogout} handleDeleteProfile={handleDeleteProfile} />
        <div className="text-center mt-10 text-red-500" role="alert">{error}</div>
      </div>
    );
  }

  const friend = friends.find((f) => f.friend.id === Number(friendIdParam));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Nav handleLogout={handleLogout} handleDeleteProfile={handleDeleteProfile} />

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
                    {friend.profilePicture ? (
                      <img
                        src={friend.profilePicture}
                        alt={`${friend.username}'s profile picture`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {friend.firstName[0]}
                      </div>
                    )}
                    <span>{friend.firstName} {friend.lastName} (@{friend.username})</span>
                  </Link>
                  <button
                    onClick={() => handleUnfriend(friend.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                    title={`Unfriend ${friend.username}`}
                    aria-label={`Unfriend ${friend.username}`}
                  >
                    Unfriend
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Area */}
          <div className="w-2/3 flex flex-col justify-between" aria-label="Chat area">
            <div className="p-4 border-b flex items-center space-x-2">
              {friendIdParam && friend && (
                <>
                  {friend.friend.profilePicture ? (
                    <img
                      src={friend.friend.profilePicture}
                      alt={`${friend.friend.username}'s profile picture`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {friend.friend.firstName[0]}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">
                    {friend.friend.firstName} {friend.friend.lastName} (@{friend.friend.username})
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
                const isSender = msg.senderId === viewer?.id;
                const senderName = isSender ? viewer.username : friend?.friend.username || "Unknown";
                const profilePicture = isSender
                  ? viewer.profilePicture
                  : friend?.friend.profilePicture;

                const createdAt = new Date(msg.createdAt);
                const date = createdAt.toLocaleDateString();
                const time = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"} items-start space-x-2 w-full`}
                  >
                    {!isSender && profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={`${senderName}'s profile picture`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : !isSender && !profilePicture ? (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {senderName[0]}
                      </div>
                    ) : null}
                    <div
                      className={`flex flex-col ${isSender ? "items-end" : "items-start"} max-w-[70%]`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 text-sm break-words ${
                          isSender
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
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
                    {isSender && profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={`${viewer.username}'s profile picture`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : isSender && !profilePicture ? (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {viewer.username[0]}
                      </div>
                    ) : null}
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