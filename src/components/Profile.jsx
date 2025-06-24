import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from "./Nav.jsx";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (optional)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);


// Base URL for backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [unfriending, setUnfriending] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [comments, setComments] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const query = id ? `?id=${id}` : "";
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile${query}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load profile");
      }
      const data = await res.json();
      setViewer(data.viewer);
      setUser(data.profileUser);
      setPosts(data.posts || []);
      setFriends(data.friends || []);
      setIncomingRequests(data.incomingRequests || []);
      setRequestSent(false);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/${postId}`, { credentials: "include" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch comments");
      }
      const data = await res.json();
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error(`Failed to load comments for post ${postId}:`, err);
    }
  };

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
      await fetchProfile();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload profile picture. Please try again.");
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/picture`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete profile picture");
      }
      setProfilePicture(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchProfile();
    } catch (err) {
      console.error("Delete profile picture error:", err);
      setError(err.message || "Failed to delete profile picture. Please try again.");
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

  const handleFollow = async () => {
    if (!id || sending || requestSent) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send request");
      }
      await fetchProfile();
      setRequestSent(true);
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError(err.message || "Failed to send friend request");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/accept/${requestId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to accept request");
      }
      await fetchProfile();
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError(err.message || "Failed to accept request");
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to unfriend this user?")) return;
    setUnfriending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/unfriend/${friendId || id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to unfriend");
      }
      await fetchProfile();
    } catch (err) {
      console.error("Error unfriending:", err);
      setError(err.message || "Failed to unfriend");
    } finally {
      setUnfriending(false);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentContent = e.target.elements.comment.value;
    if (!commentContent.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent, postId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post comment");
      }
      e.target.reset();
      fetchComments(postId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to post comment");
    }
  };

  useEffect(() => {
    fetchProfile();
    const subscription = supabase
      .channel(`friend_requests:${id || viewer?.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `receiverId=eq.${id || viewer?.id}`,
        },
        () => fetchProfile()
      )
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [id, viewer]);

  useEffect(() => {
    posts.forEach((post) => {
      if (!comments[post.id]) {
        fetchComments(post.id);
      }
    });
    const subscription = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const postId = payload.new.postId;
          fetchComments(postId);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [posts]);

  const isSelf = viewer && user && viewer.id === user.id;
  const isFriend = friends.some(
    (f) => f.friend.id === parseInt(id) && f.friended
  );
  const hasOutgoingRequest = friends.some(
    (f) => f.friend.id === parseInt(id) && !f.friended
  );
  const hasIncomingRequest = incomingRequests.find(
    (r) => r.user.id === parseInt(id) && !r.friended
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav handleLogout={handleLogout} handleDeleteProfile={handleDeleteProfile} />
        <div className="text-center mt-10 text-red-500" role="alert">{error}</div>
      </div>
    );
  }

  if (loading || !user || !viewer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav handleLogout={handleLogout} handleDeleteProfile={handleDeleteProfile} />
        <div className="text-center mt-10 text-gray-600 animate-pulse" role="status">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav handleLogout={handleLogout} handleDeleteProfile={handleDeleteProfile} />

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg p-6 rounded-lg max-w-3xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user.username}'s profile picture`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-gray-600">
                {user.username[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {user.firstName} {user.lastName} (@{user.username})
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {isSelf && (
            <div className="mb-6">
              <form
                onSubmit={handleUploadProfilePicture}
                encType="multipart/form-data"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="mb-2"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  ref={fileInputRef}
                  aria-label="Upload profile picture"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 transition"
                    disabled={!profilePicture}
                    aria-label="Upload profile picture"
                  >
                    Upload Profile Picture
                  </button>
                  {user.profilePicture && (
                    <button
                      type="button"
                      onClick={handleDeleteProfilePicture}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                      aria-label="Remove profile picture"
                    >
                      Remove Profile Picture
                    </button>
                  )}
                </div>
              </form>
              <div className="mt-4">
                <p className="text-red-600 text-sm mb-2">
                  Warning: Deleting your account is permanent and cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteProfile}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                  aria-label="Delete account"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {!isSelf && (
            <div className="mb-6 space-y-2">
              {isFriend && (
                <>
                  <p className="text-green-500 text-sm">Connected</p>
                  <button
                    onClick={() => handleUnfriend(user.id)}
                    disabled={unfriending}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 transition"
                    aria-label={`Unfriend ${user.username}`}
                  >
                    {unfriending ? "Unfriending..." : "Unfriend"}
                  </button>
                </>
              )}
              {hasOutgoingRequest && (
                <p className="text-yellow-500 text-sm">Friend request sent</p>
              )}
              {hasIncomingRequest && (
                <button
                  onClick={() => handleAccept(hasIncomingRequest.id)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  aria-label={`Accept friend request from ${user.username}`}
                >
                  Accept Friend Request
                </button>
              )}
              {!isFriend && !hasOutgoingRequest && !hasIncomingRequest && (
                <button
                  onClick={handleFollow}
                  disabled={sending || requestSent}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 transition"
                  aria-label={`Send friend request to ${user.username}`}
                >
                  {sending ? "Sending..." : "Send Friend Request"}
                </button>
              )}
            </div>
          )}

          {isSelf && incomingRequests.length > 0 && (
            <div className="bg-yellow-50 border rounded-lg p-4 mb-6" aria-label="Incoming friend requests">
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">
                Incoming Friend Requests
              </h3>
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between bg-white p-2 rounded mb-2 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    {req.user.profilePicture ? (
                      <img
                        src={req.user.profilePicture}
                        alt={`${req.user.username}'s profile picture`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {req.user.username[0]}
                      </div>
                    )}
                    <Link
                      to={`/profile/${req.user.id}`}
                      className="text-blue-600 hover:underline"
                      aria-label={`View ${req.user.username}'s profile`}
                    >
                      {req.user.firstName} {req.user.lastName} (@{req.user.username})
                    </Link>
                  </div>
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    aria-label={`Accept friend request from ${req.user.username}`}
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6" role="tablist">
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === "posts"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              role="tab"
              aria-selected={activeTab === "posts"}
              aria-controls="posts-panel"
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === "friends"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              role="tab"
              aria-selected={activeTab === "friends"}
              aria-controls="friends-panel"
            >
              Friends
            </button>
          </div>

          <div role="tabpanel" id={activeTab === "posts" ? "posts-panel" : "friends-panel"} aria-live="polite">
            {activeTab === "posts" ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Posts</h2>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-gray-50 rounded-lg p-4 mb-2 shadow-sm border"
                    >
                      <h3 className="text-lg font-bold text-blue-600 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-2">{post.content}</p>
                      {post.images?.length > 0 && (
                        <div className="mt-2">
                          {post.images.map((img) => (
                            <img
                              key={img.id}
                              src={img.url}
                              alt="Post image"
                              className="w-full h-auto rounded-md mb-2"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-gray-500 text-sm">
                        Posted on {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 border-t pt-2">
                        <h4 className="text-sm font-semibold mb-2">Comments</h4>
                        {comments[post.id]?.length === 0 && (
                          <p className="text-gray-500 text-sm">No comments yet.</p>
                        )}
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="mb-3 flex items-start space-x-3">
                            {comment.author.profilePicture ? (
                              <img
                                src={comment.author.profilePicture}
                                alt={`${comment.author.username}'s profile picture`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                                {comment.author.username[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-sm">
                                <Link
                                  to={`/profile/${comment.author.id}`}
                                  className="text-blue-500 font-semibold hover:underline"
                                  aria-label={`View ${comment.author.username}'s profile`}
                                >
                                  @{comment.author.username}
                                </Link>{" "}
                                {comment.content}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        <form
                          onSubmit={(e) => handleCommentSubmit(e, post.id)}
                          className="mt-2"
                        >
                          <input
                            type="text"
                            name="comment"
                            placeholder="Add a comment..."
                            className="w-full px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            aria-label="Add a comment"
                          />
                          <button
                            type="submit"
                            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-600 transition"
                            aria-label="Submit comment"
                          >
                            Comment
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No posts yet.</p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Friends</h2>
                {friends.length > 0 ? (
                  friends.map((friendship) => (
                    <div
                      key={friendship.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-2 shadow-sm border"
                    >
                      <div className="flex items-center space-x-2">
                        {friendship.friend.profilePicture ? (
                          <img
                            src={friendship.friend.profilePicture}
                            alt={`${friendship.friend.username}'s profile picture`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                            {friendship.friend.username[0]}
                          </div>
                        )}
                        <Link
                          to={`/profile/${friendship.friend.id}`}
                          className="text-blue-600 hover:underline"
                          aria-label={`View ${friendship.friend.username}'s profile`}
                        >
                          {friendship.friend.firstName} {friendship.friend.lastName} (@{friendship.friend.username})
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/message/${friendship.friend.id}`)}
                          className="text-sm bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600"
                          aria-label={`Message ${friendship.friend.username}`}
                        >
                          Message
                        </button>
                        {isSelf && (
                          <button
                            onClick={() => handleUnfriend(friendship.friend.id)}
                            disabled={unfriending}
                            className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 disabled:opacity-50"
                            aria-label={`Unfriend ${friendship.friend.username}`}
                          >
                            Unfriend
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No friends yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}