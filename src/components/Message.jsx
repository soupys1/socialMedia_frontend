import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

function Avatar({ src, name, size = "md" }) {
  if (src?.startsWith("http")) {
    return <img src={src} alt={name} className={`avatar avatar-${size}`} onError={e => { e.target.style.display = "none"; }} />;
  }
  return <div className={`avatar avatar-${size}`}>{name?.[0]?.toUpperCase() || "?"}</div>;
}

export default function Message() {
  const { id: friendIdParam } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState(null);
  const [viewer, setViewer] = useState(null);

  const fetchProfile = async () => {
    setLoadingFriends(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: "include" });
      if (res.status === 401) { navigate("/login"); return; }
      if (!res.ok) throw new Error("Failed to load profile");
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
    if (!friendId) { setMessages([]); return; }
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/message/${friendId}`, { credentials: "include" });
      if (res.status === 401) { navigate("/login"); return; }
      if (!res.ok) throw new Error("Failed to load messages");
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
    try {
      const res = await fetch(`${API_BASE_URL}/api/message/${friendIdParam}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setMessageText("");
      fetchMessages(friendIdParam);
    } catch (err) {
      setError(err.message || "Failed to send message");
    }
  };

  const handleLogout = async () => {
    try { await fetch(`${API_BASE_URL}/api/logout`, { method: "POST", credentials: "include" }); } catch {}
    navigate("/login");
  };

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { fetchMessages(friendIdParam); }, [friendIdParam]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (loadingFriends) {
    return (
      <div className="page">
        <Nav handleLogout={handleLogout} />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const activeFriend = friends.find(f => String(f.friend.id) === String(friendIdParam));

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column" }}>
      <Nav handleLogout={handleLogout} />

      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{
          width: "100%", maxWidth: 960,
          display: "flex", height: "calc(100vh - 108px)",
          backgroundColor: "var(--canvas)",
          border: "1px solid var(--hairline)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "var(--shadow-md)",
        }}>

          {/* ── Sidebar ── */}
          <div style={{
            width: 240, flexShrink: 0,
            borderRight: "1px solid var(--hairline)",
            display: "flex", flexDirection: "column",
            backgroundColor: "var(--canvas-soft)",
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <span className="eyebrow">Messages</span>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {friends.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: "var(--ink-subtle)" }}>No friends yet.</div>
              ) : (
                friends.map(({ friend }) => {
                  const isActive = String(friend.id) === String(friendIdParam);
                  return (
                    <Link
                      key={friend.id}
                      to={`/message/${friend.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", textDecoration: "none",
                        backgroundColor: isActive ? "var(--accent-muted)" : "transparent",
                        borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                        transition: "background-color 0.12s",
                      }}
                    >
                      <Avatar src={friend.profile_picture} name={friend.username} size="sm" />
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontWeight: isActive ? 600 : 400, fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {friend.username}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>
                          {friend.first_name} {friend.last_name}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Chat area ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Chat header */}
            <div style={{ height: 56, borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", padding: "0 20px", gap: 10, flexShrink: 0 }}>
              {activeFriend ? (
                <>
                  <Avatar src={activeFriend.friend.profile_picture} name={activeFriend.friend.username} size="sm" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{activeFriend.friend.username}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-subtle)" }}>{activeFriend.friend.first_name} {activeFriend.friend.last_name}</div>
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 14, color: "var(--ink-subtle)" }}>Select a conversation</span>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
              {error && <div className="alert alert-error">{error}</div>}
              {loadingMessages && (
                <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><div className="spinner" /></div>
              )}
              {!loadingMessages && !friendIdParam && (
                <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-subtle)", fontSize: 14 }}>
                  Select a friend to start chatting.
                </div>
              )}
              {!loadingMessages && friendIdParam && messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-subtle)", fontSize: 14 }}>
                  No messages yet. Say hello!
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map(msg => {
                  const isSender = msg.sender_id === viewer?.id;
                  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: isSender ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                      {!isSender && (
                        <Avatar
                          src={msg.senderProfilePic?.startsWith("http") ? msg.senderProfilePic : null}
                          name={msg.senderName}
                          size="sm"
                        />
                      )}
                      <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: isSender ? "flex-end" : "flex-start", gap: 4 }}>
                        <div
                          className={isSender ? "bubble-sent" : "bubble-recv"}
                          style={{ padding: "8px 12px", fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}
                        >
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-subtle)" }}>{time}</div>
                      </div>
                      {isSender && (
                        <Avatar
                          src={msg.senderProfilePic?.startsWith("http") ? msg.senderProfilePic : null}
                          name={msg.senderName}
                          size="sm"
                        />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            {friendIdParam && (
              <form
                onSubmit={handleSendMessage}
                style={{ padding: "12px 16px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 8, backgroundColor: "var(--canvas)", flexShrink: 0 }}
              >
                <input
                  type="text"
                  className="input"
                  placeholder="Type a message…"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  style={{ flex: 1 }}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!messageText.trim()}
                  aria-label="Send"
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
