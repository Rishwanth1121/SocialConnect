"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (typeof document !== 'undefined' && document.cookie) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/notifications/", {
          withCredentials: true,
        });
        setNotifications(res.data);

        // Mark all notifications as read
        const csrfToken = getCookie('csrftoken');
        await axios.post(
          "http://localhost:8000/api/notifications/mark_read/",
          {},
          {
            headers: {
              'X-CSRFToken': csrfToken,
            },
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "2rem" }}>
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} style={{
            padding: "1rem",
            borderBottom: "1px solid #ddd"
          }}>
            <p>{n.message}</p>
            <small style={{ color: "#666" }}>{new Date(n.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}
