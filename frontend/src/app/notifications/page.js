"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import './page.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/notifications/", {
          withCredentials: true,
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const respondToRequest = async (requestId, accepted) => {
  const csrfToken = getCookie('csrftoken');
  try {
    const res = await axios.post(
      `http://localhost:8000/api/friends/respond/${requestId}/`,
      { action: accepted ? "accept" : "cancel" },
      {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
      }
    );

    alert(res.data.message); // ✅ Shows "Friend request accepted."

    setNotifications((prev) =>
      prev.filter((n) => n.request_id !== requestId)
    );
  } catch (err) {
    console.error("Failed to respond to request", err);
  }
};


  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="notification-card">
            <p>{n.message}</p>

            {n.type === 'friend_request' && n.request_id && (
              <div className="friend-request-actions">
                <button
                  onClick={() => respondToRequest(n.request_id, true)}
                  className="accept-btn"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToRequest(n.request_id, false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
