'use client';
import './page.css';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});

  // 🔐 Get CSRF cookie on first load
  useEffect(() => {
    fetch('http://localhost:8000/api/csrf/', {
      credentials: 'include',
    });
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/posts/', {
          credentials: 'include',
        });
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchPosts();
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const res = await fetch('http://localhost:8000/api/posts/create/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Create post error:', errorText);
        throw new Error('Failed to create post');
      }

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setContent('');
      setImage(null);
    } catch (err) {
      console.error('Post error:', err);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${id}/like/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Like error for post ${id}:`, errorText);
        return;
      }

      const updated = await res.json();
      setPosts(posts.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = async (id) => {
    const text = commentTexts[id];
    if (!text?.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/posts/${id}/comment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Comment error for post ${id}:`, errorText);
        return;
      }

      const updated = await res.json();
      setPosts(posts.map((p) => (p.id === id ? updated : p)));
      setCommentTexts({ ...commentTexts, [id]: '' });
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    const diff = (new Date() - d) / 1000;
    if (isNaN(diff)) return '';
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="container">
      <Head>
        <title>Posts</title>
      </Head>
      <h1>Posts</h1>

      <div className="postForm">
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            required
            rows="3"
          />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <button className="btn" type="submit">Post</button>
        </form>
      </div>

      {posts.map((post) => (
        <div className="post" key={post.id} id={`post${post.id}`}>
          <strong>{post.user?.username || 'Anonymous'}</strong>
<small style={{ marginLeft: '8px' }}>{formatTime(post.created_at)}</small>

          <p>{post.content}</p>
          {post.image && <img src={post.image} className="postImage" alt="post" />}

          <div className="likeShare">
            <button className="btn" onClick={() => handleLike(post.id)}>
              {post.is_liked ? '❤️' : '🤍'} Like ({post.likes_count})
            </button>
            <button
              className="btn"
              onClick={() =>
                navigator.clipboard.writeText(`${window.location.href}#post${post.id}`)
              }
            >
              🔗 Share
            </button>
          </div>

          <div className="comments">
            <h4>Comments</h4>
            {(post.comments || []).map((comment) => (
              <p key={`comment-${post.id}-${comment.id}`}>
                <strong>{comment.user?.username || 'Anonymous'}</strong>: {comment.text}
              </p>
            ))}

            <div className="commentBox">
              <textarea
                value={commentTexts[post.id] || ''}
                onChange={(e) =>
                  setCommentTexts({ ...commentTexts, [post.id]: e.target.value })
                }
                placeholder="Write a comment..."
                rows="2"
              />
              <button className="btn" onClick={() => handleComment(post.id)}>Comment</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
