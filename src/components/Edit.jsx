// src/components/Edit.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Edit({ post }) {
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/content/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        navigate('/content');
      } else {
        console.error('Update failed');
      }
    } catch (err) {
      console.error('Network error', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

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
