'use client';
import './page.css';
import { useEffect, useState } from 'react';
import { getCSRFToken } from '@/utils/csrf';

export default function BlockUsers() {
  const [username, setUsername] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/blocked-users/', {
        credentials: 'include',
      });
      const data = await res.json();
      setBlockedUsers(data);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
  };

  const handleBlock = async () => {
    if (!username.trim()) return alert('Please enter a username');

    const csrfToken = await getCSRFToken();

    const res = await fetch('http://localhost:8000/api/block-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    alert(data.message);
    setUsername('');
    fetchBlockedUsers(); // refresh list
  };

  const handleUnblock = async (username) => {
    const csrfToken = await getCSRFToken();

    const res = await fetch('http://localhost:8000/api/unblock-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    alert(data.message);
    fetchBlockedUsers(); // refresh list
  };

  return (
    <div className="block-container">
      <h2>Block a User</h2>
      <div className="block-input-group">
        <input
          className="block-input"
          placeholder="Username to block"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="block-button" onClick={handleBlock}>
          Block User
        </button>
      </div>

      <div className="blocked-list">
        <h3>Blocked Users</h3>
        {blockedUsers.length > 0 ? (
          <ul>
            {blockedUsers.map((user) => (
              <li key={user.id} className="blocked-user">
                <span>{user.username}</span>
                <button
                  className="unblock-button"
                  onClick={() => handleUnblock(user.username)}
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users blocked.</p>
        )}
      </div>
    </div>
  );
}
