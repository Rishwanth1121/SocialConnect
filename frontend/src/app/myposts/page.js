"use client";
import './page.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function MyPosts() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const res = await axios.get("http://localhost:8000/api/posts/", {
          withCredentials: true,
        });
        const userRes = await axios.get("http://localhost:8000/api/user/", {
          withCredentials: true,
        });
        const filtered = res.data.filter(post => post.user.username === userRes.data.username);
        setMyPosts(filtered);
      } catch (err) {
        console.error("⚠️ Error loading posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyPosts();
  }, []);

  const toggleDropdown = (postId) => {
    setOpenDropdownId(openDropdownId === postId ? null : postId);
  };

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/posts/${postId}/delete/`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
        }
      });
      setMyPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error("❌ Failed to delete post:", err);
    }
  };

  const handleEdit = (postId) => {
    window.location.href = `/edit-post/${postId}`;
  };

  if (loading) return <div>Loading your posts...</div>;

  return (
    <div className="container">
      <h2>My Posts</h2>
      {myPosts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        myPosts.map(post => (
          <div key={post.id} className="post" style={{ position: 'relative' }}>
            {/* Header with user and dropdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p><strong>{post.user.username}</strong></p>
              <div style={{ position: 'relative' }}>
                <button onClick={() => toggleDropdown(post.id)} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
                  &#x22EE;
                </button>
                {openDropdownId === post.id && (
                  <div style={{
                    position: 'absolute',
                    top: '1.8rem',
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    zIndex: 10
                  }}>
                    <button onClick={() => handleEdit(post.id)} style={dropdownBtnStyle}>Edit</button>
                    <button onClick={() => handleDelete(post.id)} style={{ ...dropdownBtnStyle, color: 'red' }}>Delete</button>
                  </div>
                )}
              </div>
            </div>

            <p>{post.content}</p>
            {post.image && <img src={post.image} alt="Post" className="postImage" />}
            <p><small>Posted on {new Date(post.created_at).toLocaleString()}</small></p>

            <p><strong>{post.likes_count}</strong> likes</p>

            <div className="comments">
              <h4>Comments:</h4>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment, idx) => (
                  <div key={idx} style={{ paddingLeft: '1rem' }}>
                    <strong>{comment.user.username}:</strong> {comment.text}
                  </div>
                ))
              ) : (
                <p style={{ paddingLeft: '1rem' }}>No comments yet.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const dropdownBtnStyle = {
  display: 'block',
  padding: '0.5rem 1rem',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};