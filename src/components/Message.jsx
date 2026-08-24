import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
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
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !friendIdParam) return;
    const text = messageText;
    setMessageText("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/message/${friendIdParam}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error("Failed to send");
      fetchMessages(friendIdParam);
    } catch (err) {
      setError(err.message);
      setMessageText(text);
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

      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "0 16px 24px" }}>
        <div style={{
          width: "100%", maxWidth: 960,
          display: "flex",
          height: "calc(100vh - 96px)",
          border: "1px solid var(--hairline)",
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: "var(--canvas-soft)",
        }}>

          {/* ── Sidebar ── */}
          <div style={{
            width: 220, flexShrink: 0,
            borderRight: "1px solid var(--hairline)",
            display: "flex", flexDirection: "column",
            backgroundColor: "var(--canvas)",
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <span className="eyebrow">Messages</span>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {friends.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>
                  No threads yet.
                </div>
              ) : (
                friends.map(({ friend }) => {
                  const isActive = String(friend.id) === String(friendIdParam);
                  return (
                    <Link
                      key={friend.id}
                      to={`/message/${friend.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", textDecoration: "none",
                        backgroundColor: isActive ? "rgba(156,64,255,0.1)" : "transparent",
                        borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                        transition: "background-color 0.12s",
                      }}
                    >
                      <div style={{ padding: isActive ? 1.5 : 0, borderRadius: "50%", background: isActive ? "linear-gradient(135deg, #9c40ff, #ffaa40)" : "transparent", flexShrink: 0 }}>
                        <Avatar src={friend.profile_picture} name={friend.username} size="sm" />
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontWeight: isActive ? 600 : 400, fontSize: 13, color: isActive ? "var(--ink)" : "var(--ink-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {friend.username}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ink-subtle)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>
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
            {/* Header */}
            <div style={{
              height: 56, borderBottom: "1px solid var(--hairline)",
              display: "flex", alignItems: "center", padding: "0 20px", gap: 12,
              flexShrink: 0, backgroundColor: "var(--canvas)",
            }}>
              {activeFriend ? (
                <>
                  <div style={{ padding: 2, borderRadius: "50%", background: "linear-gradient(135deg, #9c40ff, #ffaa40)" }}>
                    <Avatar src={activeFriend.friend.profile_picture} name={activeFriend.friend.username} size="sm" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{activeFriend.friend.username}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>
                      {activeFriend.friend.first_name} {activeFriend.friend.last_name}
                    </div>
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 13, color: "var(--ink-subtle)" }}>Select a conversation</span>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
              {error && <div className="alert alert-error">{error}</div>}
              {loadingMessages && (
                <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                  <div className="spinner" />
                </div>
              )}
              {!loadingMessages && !friendIdParam && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)", fontSize: 13 }}>
                  Pick a friend to start a thread.
                </div>
              )}
              {!loadingMessages && friendIdParam && messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)", fontSize: 13 }}>
                  No messages yet. Say hello!
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <AnimatePresence initial={false}>
                  {messages.map(msg => {
                    const isSender = msg.sender_id === viewer?.id;
                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: "flex", justifyContent: isSender ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}
                      >
                        {!isSender && (
                          <Avatar src={msg.senderProfilePic?.startsWith("http") ? msg.senderProfilePic : null} name={msg.senderName} size="sm" />
                        )}
                        <div style={{ maxWidth: "66%", display: "flex", flexDirection: "column", alignItems: isSender ? "flex-end" : "flex-start", gap: 3 }}>
                          <div
                            className={isSender ? "bubble-sent" : "bubble-recv"}
                            style={{ padding: "9px 14px", fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}
                          >
                            {msg.content}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--ink-subtle)", fontFamily: "var(--mono)" }}>{time}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            {friendIdParam && (
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid var(--hairline)",
                  display: "flex", gap: 8,
                  backgroundColor: "var(--canvas)",
                  flexShrink: 0,
                }}
              >
                <input
                  type="text"
                  className="input"
                  placeholder="Type a message…"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  style={{ flex: 1, borderRadius: 99 }}
                  aria-label="Message"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.9 }}
                  disabled={!messageText.trim()}
                  style={{
                    width: 38, height: 38, flexShrink: 0,
                    borderRadius: "50%", border: "none",
                    background: messageText.trim() ? "var(--accent)" : "var(--surface-2)",
                    color: messageText.trim() ? "#fff" : "var(--ink-subtle)",
                    cursor: messageText.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  aria-label="Send"
                >
                  <Send size={15} />
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
