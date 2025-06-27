// src/components/Edit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Edit() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/content`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const targetPost = data.posts.find(p => p.id === parseInt(id));
        
        if (!targetPost) {
          setError('Post not found');
          setLoading(false);
          return;
        }

        // Check if the current user owns this post
        if (targetPost.author.id !== data.user.id) {
          setError('You can only edit your own posts');
          setLoading(false);
          return;
        }

        setPost(targetPost);
        setTitle(targetPost.title);
        setContent(targetPost.content);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      navigate('/content');
    } catch (err) {
      setError(err.message);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
        <header className="bg-blue-500 text-white w-full flex justify-between items-center px-6 py-4 text-xl font-semibold">
          <div>MiniBlog</div>
          <button
            onClick={handleLogout}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </header>
        <div className="text-center mt-10 text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
        <header className="bg-blue-500 text-white w-full flex justify-between items-center px-6 py-4 text-xl font-semibold">
          <div>MiniBlog</div>
          <button
            onClick={handleLogout}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </header>
        <div className="text-center mt-10 text-red-500">{error}</div>
        <button
          onClick={() => navigate('/content')}
          className="text-blue-500 hover:underline mt-4 text-sm"
        >
          ← Back to posts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <header className="bg-blue-500 text-white w-full flex justify-between items-center px-6 py-4 text-xl font-semibold">
        <div>MiniBlog</div>
        <button
          onClick={handleLogout}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </header>

      {/* Form */}
      <div className="w-full max-w-lg mt-10 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Edit Your Post
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <label className="block text-gray-700 font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block text-gray-700 font-bold mb-2">
            What's happening?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            required
            className="w-full border rounded px-3 py-2 mb-4"
          ></textarea>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Update Post
          </button>
        </form>

        <button
          onClick={() => navigate('/content')}
          className="text-blue-500 hover:underline mt-4 text-sm"
        >
          ← Back to posts
        </button>
      </div>
    </div>
  );
}
